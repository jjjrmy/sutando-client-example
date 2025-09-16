export default defineNuxtRouteMiddleware(async (to, from) => {
    const authClient = useAuth();
    const { data: session } = await authClient.useSession(useDynamicFetch);
    if (!session.value) {
        return navigateTo("/auth");
    }
});