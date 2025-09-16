import { createAuthClient } from "better-auth/vue";
import { phoneNumberClient } from "better-auth/client/plugins";

export function useAuth() {
    return createAuthClient({
        plugins: [
            phoneNumberClient()
        ],
        debug: true
    });
}