// server/routes/.well-known/apple-app-site-association.ts
export default defineEventHandler((event) => {
    const config = useRuntimeConfig();
    setHeader(event, "Content-Type", "application/json");

    const appIdentifier = `${process.env.APPLE_TEAM_ID}.${config.public.appIdentifier}`;

    return {
        applinks: {
            apps: [],
            details: [
                {
                    appIDs: [appIdentifier],
                    components: [
                        {
                            "/": "/api/auth/subscription/*",
                            "comment": "Matches any URL that starts with /api/auth/subscription/"
                        }
                    ]
                }
            ]
        },
        webcredentials: {
            apps: [appIdentifier]
        }
    };
});