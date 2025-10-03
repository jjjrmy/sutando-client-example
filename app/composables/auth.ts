import { defu } from 'defu'
import { createAuthClient } from 'better-auth/client'
import type {
    InferSessionFromClient,
    InferUserFromClient,
    ClientOptions,
} from 'better-auth/client'
import { phoneNumberClient } from 'better-auth/client/plugins'
import type { RouteLocationRaw } from 'vue-router'
import { stripeClient } from "@better-auth/stripe/client"
import { make } from "sutando"
import User from '~/models/User'


interface RuntimeAuthConfig {
    redirectUserTo: RouteLocationRaw | string
    redirectGuestTo: RouteLocationRaw | string
}

export function useAuth() {
    const url = useRequestURL()
    const config = useRuntimeConfig()
    const headers = import.meta.server ? useRequestHeaders() : undefined

    const client = createAuthClient({
        baseURL: url.origin,
        fetchOptions: {
            ...(config.public.apiBaseUrl !== undefined && config.public.apiBaseUrl !== "" ? { baseURL: `${config.public.apiBaseUrl}/api/auth` } : {}),
            headers,
            ...(config.public.isMobile ? {
                auth: {
                    type: "Bearer",
                    token: () => localStorage.getItem("bearer_token") || "" // get the token from localStorage
                },
                onSuccess: (ctx) => {
                    const authToken = ctx.response.headers.get("set-auth-token") // get the token from the response headers
                    // Store the token securely (e.g., in localStorage)
                    if (authToken) {
                        localStorage.setItem("bearer_token", authToken);
                    }
                }
            } : {}),
        },
        plugins: [
            phoneNumberClient(),
            stripeClient({
                subscription: true //if you want to enable subscription management
            })
        ]
    })

    const options = defu(useRuntimeConfig().public.auth as Partial<RuntimeAuthConfig>, {
        redirectUserTo: '/',
        redirectGuestTo: '/',
    })
    const session = useState<InferSessionFromClient<ClientOptions> | null>('auth:session', () => null)
    const user = useState<InferUserFromClient<ClientOptions> | null>('auth:user', () => null)

    // Use a promise to ensure only one fetch happens per navigation
    const sessionFetchPromise = useState<Promise<any> | null>('auth:sessionFetchPromise', () => null)

    const fetchSession = async (force: boolean = false) => {
        // If we're on the server, always fetch fresh
        if (import.meta.server) {
            const { data } = await client.getSession({
                fetchOptions: {
                    ...(config.public.apiBaseUrl !== undefined && config.public.apiBaseUrl !== "" ? { baseURL: `${config.public.apiBaseUrl}/api/auth` } : {}),
                    headers,
                },
            })
            session.value = data?.session || null
            user.value = data?.user || null
            return data
        }

        // If forcing a new fetch, clear any existing promise
        if (force && sessionFetchPromise.value) {
            sessionFetchPromise.value = null
        }

        // If there's already a fetch in progress, return the existing promise
        if (sessionFetchPromise.value) {
            return sessionFetchPromise.value
        }

        // Create a new fetch promise
        sessionFetchPromise.value = client.getSession({
            fetchOptions: {
                ...(config.public.apiBaseUrl !== undefined && config.public.apiBaseUrl !== "" ? { baseURL: `${config.public.apiBaseUrl}/api/auth` } : {}),
                headers,
            },
        }).then(({ data }) => {
            session.value = data?.session || null
            user.value = data?.user || null
            // Don't clear the promise here - let it persist for the current navigation
            return data
        }).catch((error) => {
            sessionFetchPromise.value = null // Clear the promise on error
            throw error
        })

        return sessionFetchPromise.value
    }


    if (import.meta.client) {
        client.$store.listen('$sessionSignal', async (signal) => {
            if (!signal) return
            // Force refresh when session signal changes
            await fetchSession(true)
        })
    }

    return {
        session,
        user,
        userModel: computed(() => user.value ? make(User, user.value) : null),
        loggedIn: computed(() => !!session.value),
        signIn: client.signIn,
        signUp: client.signUp,
        async signOut({ redirectTo }: { redirectTo?: RouteLocationRaw } = {}) {
            const res = await client.signOut()
            session.value = null
            user.value = null
            if (redirectTo) {
                await navigateTo(redirectTo)
            }
            return res
        },
        options,
        fetchSession,
        client,
    }
}