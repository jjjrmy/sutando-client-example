import useAuth from "../../utils/auth";

export default defineEventHandler((event) => {
    return useAuth(event.context.cloudflare.env.DB)
        .handler(toWebRequest(event));
});