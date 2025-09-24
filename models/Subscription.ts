import { sutando, Model } from 'sutando';

export default class Subscription extends Model {
    table = 'subscription';
    primaryKey = 'id';
    keyType = 'string';

    // Fields
    id!: string;
    plan!: string;
    referenceId!: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    status!: 'active' | 'trialing' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid';
    periodStart?: Date;
    periodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
    seats?: number;
    trialStart?: Date | null;
    trialEnd?: Date | null;
    limits?: Record<string, any>;
    priceId?: string;
    created_at?: Date;
    updated_at?: Date;

    // Casts
    casts = {
        periodStart: 'date',
        periodEnd: 'date',
        trialStart: 'date',
        trialEnd: 'date',
        cancelAtPeriodEnd: 'boolean',
        seats: 'integer',
        limits: 'json'
    };

    // Relationships
    user() {
        return this.belongsTo(User, 'referenceId', 'id');
    }
}

// Import User model for relationship
import User from './User';
