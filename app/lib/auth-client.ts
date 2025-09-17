import { createAuthClient } from "better-auth/vue";
import { phoneNumberClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    plugins: [
        phoneNumberClient()
    ],
    debug: true
})