import type { H3Event } from 'h3'
import { getAuthSession } from './auth'
import type { User } from 'better-auth'
import Subscription from '../../models/Subscription'

interface SubscriptionCheckOptions {
    /**
     * Required subscription plan(s) - can be a single plan or array of plans
     */
    plan?: string | string[]
    /**
     * Whether to allow access during trial period
     */
    allowTrial?: boolean
}

/**
 * Get user's subscriptions
 */
export const getUserSubscriptions = async (): Promise<Subscription[] | null> => {
    const session = await getAuthSession()

    if (!session || !session.user) {
        return null
    }

    try {
        // Query subscriptions from the database using the user's ID
        const subscriptions = await Subscription.query()
            .where('referenceId', session.user.id)
            .get()

        return subscriptions.all()
    } catch (error) {
        console.error('Error fetching subscriptions:', error)
        return null
    }
}

/**
 * Get user's active subscriptions
 */
export const getActiveSubscriptions = async (allowTrial = true): Promise<Subscription[] | null> => {
    const subscriptions = await getUserSubscriptions()

    if (!subscriptions) {
        return null
    }

    return subscriptions.filter(sub => {
        if (allowTrial) {
            return sub.status === 'active' || sub.status === 'trialing'
        }
        return sub.status === 'active'
    })
}

/**
 * Check if user has a specific subscription plan
 */
export const hasSubscriptionPlan = async (
    requiredPlans: string | string[],
    options: { allowTrial?: boolean } = { allowTrial: true }
): Promise<boolean> => {
    const activeSubscriptions = await getActiveSubscriptions(options.allowTrial)

    if (!activeSubscriptions || activeSubscriptions.length === 0) {
        return false
    }

    const plans = Array.isArray(requiredPlans) ? requiredPlans : [requiredPlans]
    const userPlans = activeSubscriptions.map(sub => sub.plan)

    return plans.some(plan => userPlans.includes(plan))
}

/**
 * Require user to have a specific subscription plan
 * Throws 403 error if user doesn't have the required plan
 */
export const requireSubscription = async (
    options: SubscriptionCheckOptions = {}
): Promise<Subscription[]> => {
    // First check if user is authenticated
    const event = useEvent();
    const session = await getAuthSession()

    if (!session || !session.user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    // If no specific plan is required, just return active subscriptions
    if (!options.plan) {
        const activeSubscriptions = await getActiveSubscriptions(options.allowTrial)

        if (!activeSubscriptions || activeSubscriptions.length === 0) {
            throw createError({
                statusCode: 403,
                statusMessage: 'No active subscription'
            })
        }

        // Save subscriptions to event context for later use
        event.context.subscriptions = activeSubscriptions
        return activeSubscriptions
    }

    // Check if user has required plan
    const hasRequiredPlan = await hasSubscriptionPlan(options.plan, {
        allowTrial: options.allowTrial
    })

    if (!hasRequiredPlan) {
        const plans = Array.isArray(options.plan) ? options.plan.join(' or ') : options.plan
        throw createError({
            statusCode: 403,
            statusMessage: `Subscription required: ${plans}`
        })
    }

    const activeSubscriptions = await getActiveSubscriptions(options.allowTrial)

    // Save user and subscriptions to event context for later use
    event.context.user = session.user as User
    event.context.subscriptions = activeSubscriptions

    return activeSubscriptions!
}

/**
 * Get subscription limits for a user
 */
export const getSubscriptionLimits = async (): Promise<Record<string, any> | null> => {
    const activeSubscriptions = await getActiveSubscriptions()

    if (!activeSubscriptions || activeSubscriptions.length === 0) {
        return null
    }

    // Merge limits from all active subscriptions (using the highest values)
    const mergedLimits: Record<string, any> = {}

    for (const sub of activeSubscriptions) {
        if (sub.limits) {
            for (const [key, value] of Object.entries(sub.limits)) {
                if (typeof value === 'number') {
                    mergedLimits[key] = Math.max(mergedLimits[key] || 0, value)
                } else {
                    mergedLimits[key] = value
                }
            }
        }
    }

    return mergedLimits
}
