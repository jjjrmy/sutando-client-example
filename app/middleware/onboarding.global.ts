export default defineNuxtRouteMiddleware(async (to) => {
    const { userModel, fetchSession, loggedIn, user } = useAuth();

    // Skip if not logged in or on onboarding routes
    if (!loggedIn.value || to.path.startsWith('/onboarding')) return;

    // Only fetch session if user data is not already loaded
    // The auth middleware should have already fetched the session
    if (!user.value) {
        await fetchSession();
    }

    if (userModel.value && !userModel.value.was_onboarded) {
        return navigateTo('/onboarding');
    }
});
