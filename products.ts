export const subscriptionPlans = [
    {
        id: "monthly",
        name: "basic", // the name of the plan for Stripe/database
        displayName: "Monthly",
        priceId: "price_1SAclCJqchVnnn7K8rTDfTXT", // the price ID from stripe
        price: "$9.99",
        period: "per month",
        description: "Cancel anytime",
        isPopular: true,
        features: [
            "Unlimited posts with photos",
            "Priority support and new features",
            "Ad-free browsing experience",
            "Custom profile themes",
            "Analytics dashboard"
        ],
        limits: {
            projects: 5,
            storage: 10
        }
    },
    {
        id: "annual",
        name: "basic_annual", // different name for annual plan
        displayName: "Annual",
        priceId: "price_annual_placeholder", // TODO: Replace with actual annual price ID
        price: "$95.99",
        period: "per year",
        description: "Best value",
        discount: "Save 20%",
        isPopular: false,
        features: [
            "Everything in Monthly plan",
            "2 months free",
            "Early access to beta features",
            "Premium support",
            "Exclusive member badge"
        ],
        limits: {
            projects: 10,
            storage: 25
        }
    }
];

// Get a specific plan by ID
export const getPlanById = (id: string) => {
    return subscriptionPlans.find(plan => plan.id === id);
};

// Get a specific plan by Stripe price ID
export const getPlanByPriceId = (priceId: string) => {
    return subscriptionPlans.find(plan => plan.priceId === priceId);
};

// Get the default/basic plan for auth configuration
export const getBasicPlan = () => {
    return subscriptionPlans[0];
};
