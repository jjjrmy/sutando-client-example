import { defu } from 'defu'
import { createAuthClient } from 'better-auth/client'
import type {
    InferSessionFromClient,
    InferUserFromClient,
    ClientOptions,
} from 'better-auth/client'
import { phoneNumberClient } from 'better-auth/client/plugins'
import type { RouteLocationRaw } from 'vue-router'


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
            phoneNumberClient()
        ]
    })

    const options = defu(useRuntimeConfig().public.auth as Partial<RuntimeAuthConfig>, {
        redirectUserTo: '/',
        redirectGuestTo: '/',
    })
    const session = useState<InferSessionFromClient<ClientOptions> | null>('auth:session', () => null)
    const user = useState<InferUserFromClient<ClientOptions> | null>('auth:user', () => null)
    const sessionFetching = import.meta.server ? ref(false) : useState('auth:sessionFetching', () => false)

    const fetchSession = async () => {
        if (sessionFetching.value) {
            console.log('already fetching session')
            return
        }
        sessionFetching.value = true
        const { data } = await client.getSession({
            fetchOptions: {
                ...(config.public.apiBaseUrl !== undefined && config.public.apiBaseUrl !== "" ? { baseURL: `${config.public.apiBaseUrl}/api/auth` } : {}),
                headers,
            },
        })
        session.value = data?.session || null
        user.value = data?.user || null
        sessionFetching.value = false
        return data
    }

    if (import.meta.client) {
        client.$store.listen('$sessionSignal', async (signal) => {
            if (!signal) return
            await fetchSession()
        })
    }

    return {
        session,
        user,
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