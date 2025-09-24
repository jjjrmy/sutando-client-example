type SubscriptionOptions = false | {
    /**
     * Required subscription plan(s) - can be a single plan or array of plans
     */
    plan?: string | string[]
    /**
     * Redirect user without subscription to this route
     */
    redirectTo?: string
    /**
     * Whether to allow access during trial period
     */
    allowTrial?: boolean
}

declare module '#app' {
    interface PageMeta {
        subscription?: SubscriptionOptions
    }
}

declare module 'vue-router' {
    interface RouteMeta {
        subscription?: SubscriptionOptions
    }
}

export default defineNuxtRouteMiddleware(async (to) => {
    // If subscription check is disabled (default), skip middleware
    if (to.meta?.subscription === false || !to.meta?.subscription) {
        return
    }

    const { loggedIn, client } = useAuth()
    const { plan, redirectTo = '/', allowTrial = true } = to.meta.subscription

    // First check if user is authenticated
    if (!loggedIn.value) {
        return navigateTo('/auth')
    }

    // If no specific plan is required, just check if user is authenticated
    if (!plan) {
        return
    }

    try {
        // Fetch user's subscriptions
        const { data: subscriptions, error } = await client.subscription.list()

        if (error || !subscriptions) {
            console.error('Failed to fetch subscriptions:', error)
            return navigateTo(redirectTo)
        }

        // Find active subscription(s)
        const activeSubscriptions = subscriptions.filter((sub: any) => {
            if (allowTrial) {
                return sub.status === 'active' || sub.status === 'trialing'
            }
            return sub.status === 'active'
        })

        if (!activeSubscriptions.length) {
            // No active subscription found
            return navigateTo(redirectTo)
        }

        // Check if user has required plan(s)
        const requiredPlans = Array.isArray(plan) ? plan : [plan]
        const userPlans = activeSubscriptions.map((sub: any) => sub.plan)

        const hasRequiredPlan = requiredPlans.some(requiredPlan =>
            userPlans.includes(requiredPlan)
        )

        if (!hasRequiredPlan) {
            // User doesn't have the required plan
            return navigateTo(redirectTo)
        }

        // Store subscription data in state for easy access in components
        useState('paywall:subscriptions', () => activeSubscriptions)

        // User has required subscription, allow access
        return
    } catch (err) {
        console.error('Error checking subscription:', err)
        return navigateTo(redirectTo)
    }
})
