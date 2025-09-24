import { requireAuth } from "../../utils/auth"
import {
    requireSubscription,
    getSubscriptionLimits,
    hasSubscriptionPlan,
    getActiveSubscriptions
} from "../../utils/subscription"

export default defineEventHandler(async () => {
    await requireAuth()

    // Require any active subscription
    const subscriptions = await requireSubscription()

    // Get subscription limits
    const limits = await getSubscriptionLimits()

    // Check if user has specific plan (without throwing error)
    const hasBasicPlan = await hasSubscriptionPlan('basic')

    // Get all active subscriptions
    const activeSubscriptions = await getActiveSubscriptions()

    return {
        message: 'Test endpoint - authenticated and subscription verified',
        subscriptions: subscriptions.map(sub => ({
            id: sub.id,
            plan: sub.plan,
            status: sub.status,
            periodEnd: sub.periodEnd,
            limits: sub.limits
        })),
        subscriptionLimits: limits,
        planChecks: {
            hasBasicPlan,
        },
        totalActiveSubscriptions: activeSubscriptions?.length || 0
    }
})
