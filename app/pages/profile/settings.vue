<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="sticky top-0 bg-white border-b border-gray-200 z-10">
      <div class="px-4 py-3 flex items-center">
        <NuxtLink to="/" class="mr-4">
          <Icon name="ri:arrow-left-line" size="24" />
          <span class="sr-only">Back</span>
        </NuxtLink>
        <h1 class="text-lg font-semibold">Settings</h1>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="!user && !userError"
      class="flex justify-center items-center py-20 px-4"
    >
      <div class="text-center">
        <Icon
          name="ri:loader-4-line"
          size="48"
          class="text-blue-500 mx-auto mb-4 animate-spin"
        />
        <p class="text-gray-500">Loading settings...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="userError"
      class="flex justify-center items-center py-20 px-4"
    >
      <div class="text-center">
        <Icon
          name="ri:error-warning-line"
          size="48"
          class="text-red-400 mx-auto mb-4"
        />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          Error loading profile
        </h3>
        <p class="text-gray-500 mb-4">
          Unable to load your profile data. Please try again.
        </p>
        <button
          @click="refreshNuxtData()"
          class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- Profile Section -->
    <template v-else-if="user">
      <div class="bg-white mb-2">
        <div class="flex items-center px-4 py-4">
          <div class="size-16 rounded-full mr-4 flex-shrink-0 overflow-hidden">
            <img
              :src="user?.avatar"
              :alt="user?.name"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="flex-1">
            <h2 class="font-semibold">{{ user?.name }}</h2>
            <p class="text-sm text-gray-600">@{{ user?.username }}</p>
          </div>
        </div>
      </div>

      <!-- Settings Groups -->
      <div class="space-y-2">
        <!-- Account Settings -->
        <div class="bg-white">
          <h3
            class="px-4 py-3 text-sm font-semibold text-gray-900 border-b border-gray-100"
          >
            Account
          </h3>
          <button
            class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <Icon name="ri:mail-line" class="size-5 text-gray-600" />
              <span class="text-sm">Email Address</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-gray-500">{{
                user?.email || "—"
              }}</span>
              <Icon name="ri:arrow-right-s-line" class="size-5 text-gray-400" />
            </div>
          </button>

          <button
            class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <Icon name="ri:phone-line" class="size-5 text-gray-600" />
              <span class="text-sm">Phone Number</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-gray-500">{{
                user?.phoneNumber || "-"
              }}</span>
              <Icon name="ri:arrow-right-s-line" class="size-5 text-gray-400" />
            </div>
          </button>
        </div>

        <!-- Linked Accounts -->
        <div class="bg-white">
          <h3
            class="px-4 py-3 text-sm font-semibold text-gray-900 border-b border-gray-100"
          >
            Linked Accounts
          </h3>

          <div class="px-4 py-3 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <Icon name="ri:apple-fill" class="size-5" />
                <div>
                  <p class="text-sm font-medium">Apple</p>
                  <p class="text-xs text-gray-500">
                    {{
                      accounts?.apple
                        ? `Connected${getAccountEmail("apple")}`
                        : "Not connected"
                    }}
                  </p>
                </div>
              </div>
              <button
                v-if="accounts?.apple"
                class="text-xs text-red-500 font-medium"
                @click="disconnectAccount('apple')"
              >
                Disconnect
              </button>
              <button
                v-else
                class="text-xs text-blue-500 font-medium"
                @click="connectApple"
              >
                Connect
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <Icon name="ri:google-fill" class="size-5" />
                <div>
                  <p class="text-sm font-medium">Google</p>
                  <p class="text-xs text-gray-500">
                    {{
                      accounts?.google
                        ? `Connected${getAccountEmail("google")}`
                        : "Not connected"
                    }}
                  </p>
                </div>
              </div>
              <button
                v-if="accounts?.google"
                class="text-xs text-red-500 font-medium"
                @click="disconnectAccount('google')"
              >
                Disconnect
              </button>
              <button
                v-else
                class="text-xs text-blue-500 font-medium"
                @click="connectGoogle"
              >
                Connect
              </button>
            </div>
          </div>
        </div>

        <!-- Subscription -->
        <div class="bg-white">
          <h3
            class="px-4 py-3 text-sm font-semibold text-gray-900 border-b border-gray-100"
          >
            Subscription
          </h3>

          <div
            v-if="activeSubscription"
            @click="manageSubscription"
            class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div class="flex items-center space-x-3">
              <Icon name="ri:bank-card-line" class="size-5 text-gray-600" />
              <span class="text-sm">Manage Subscription</span>
            </div>
            <div class="flex items-center space-x-2">
              <span
                :class="[
                  'text-xs px-2 py-1 rounded-full',
                  activeSubscription.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : activeSubscription.status === 'canceled'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800',
                ]"
              >
                {{
                  activeSubscription.status === "active"
                    ? "Pro"
                    : activeSubscription.status
                }}
              </span>
              <Icon name="ri:arrow-right-s-line" class="size-5 text-gray-400" />
            </div>
          </div>

          <div v-else class="px-4 py-6 text-center">
            <Icon
              name="ri:bank-card-line"
              class="size-8 text-gray-300 mx-auto mb-2"
            />
            <p class="text-sm text-gray-500 mb-3">No active subscription</p>
            <NuxtLink
              to="/paywall"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Plans
            </NuxtLink>
          </div>
        </div>

        <!-- Sign Out -->
        <div class="bg-white mb-8">
          <button
            @click="signOut"
            class="w-full px-4 py-4 text-red-500 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { make } from "sutando";
import { ref } from "vue";
import { Capacitor } from "@capacitor/core";
import {
  SignInWithApple,
  type SignInWithAppleOptions as SignInWithAppleOptionsType,
} from "@capacitor-community/apple-sign-in";
import User from "~/models/User";

definePageMeta({
  layout: "mobile",
});

const { user: authUser, client, signOut: authSignOut } = useAuth();
const config = useRuntimeConfig();
const isNative = Capacitor.isNativePlatform();

// Fetch full user data from the API endpoint
const { data: userData, error: userError } = await useDynamicFetch<User>(
  `/api/user/${authUser.value?.id}`
);

// Convert API response to Sutando model
const user = computed((): User | undefined => {
  if (!userData.value) return undefined;
  return make(User, userData.value);
});

// Fetch subscriptions similar to dashboard.vue
const { data: subscriptions } = await client.subscription.list();

// Fetch linked accounts - make it reactive so we can update it
const { data: linkedAccountsData } = await client.listAccounts();
const linkedAccounts = ref(linkedAccountsData);

// Find active subscription
const activeSubscription = computed(() => {
  if (!subscriptions || !Array.isArray(subscriptions)) return null;
  return subscriptions.find(
    (sub: any) => sub.status === "active" || sub.status === "trialing"
  );
});

// Check if specific providers are connected
const accounts = computed(() => {
  const accountsList = linkedAccounts.value || [];
  return {
    apple: accountsList.some((acc: any) => acc.providerId === "apple"),
    google: accountsList.some((acc: any) => acc.providerId === "google"),
  };
});

// Notification states
const pushNotificationsEnabled = ref(true);
const emailNotificationsEnabled = ref(false);

// Helper function to get account email
const getAccountEmail = (provider: string) => {
  const account = (linkedAccounts.value || []).find(
    (acc: any) => acc.providerId === provider
  );
  // Account may have different structure, for now just return empty
  return "";
};

// Toggle functions
const togglePushNotifications = () => {
  pushNotificationsEnabled.value = !pushNotificationsEnabled.value;
  // TODO: Update backend preference
};

const toggleEmailNotifications = () => {
  emailNotificationsEnabled.value = !emailNotificationsEnabled.value;
  // TODO: Update backend preference
};

// Account functions
const connectApple = async () => {
  try {
    console.log("Connecting Apple account...");

    let idToken;
    if (isNative) {
      // Native Apple Sign In
      const SignInWithAppleOptions: SignInWithAppleOptionsType = {
        clientId: config.public.appIdentifier as string,
        redirectURI: `${config.public.appUrl}/api/auth/callback/apple`,
        scopes: "email name",
      };

      try {
        const result = await SignInWithApple.authorize(SignInWithAppleOptions);
        console.log("Apple Sign In result:", result);
        idToken = { token: result.response.identityToken };
      } catch (appleError) {
        console.error("Apple Sign In cancelled or failed:", appleError);
        return;
      }
    }

    // Use social sign-in which should link account when user is already authenticated
    const { error: linkError } = await client.linkSocial({
      provider: "apple",
      ...(idToken ? { idToken } : { callbackURL: "/profile/settings" }),
    });

    if (linkError) {
      console.error("Error linking Apple account:", linkError);
      alert(
        `Failed to link Apple account: ${linkError.message || "Unknown error"}`
      );
    } else {
      // For native, we need to manually refresh since there's no redirect
      if (isNative) {
        console.log("Apple account linked successfully");
        await refreshNuxtData();
        // Refresh the linked accounts list
        const { data: updatedAccounts } = await client.listAccounts();
        linkedAccounts.value = updatedAccounts;
      }
      // For web, the OAuth flow will handle the redirect
    }
  } catch (error: any) {
    console.error("Error linking Apple account:", error);
    alert(`Failed to link Apple account: ${error.message || "Unknown error"}`);
  }
};

const connectGoogle = async () => {
  try {
    console.log("Connecting Google account...");

    if (isNative) {
      // For native, Google OAuth is more complex and might need additional setup
      alert("Google sign-in on native apps is coming soon.");
      return;
    }

    // Web-based Google Sign In for linking
    // Better-auth should handle account linking automatically when a user is already signed in
    console.log("Initiating web-based Google sign in for account linking...");

    // Since user is already authenticated, this should trigger account linking
    const { error: linkError } = await client.linkSocial({
      provider: "google",
      callbackURL: "/profile/settings",
    });

    if (linkError) {
      console.error("Error linking Google account:", linkError);
      alert(
        `Failed to link Google account: ${linkError.message || "Unknown error"}`
      );
    }
    // The OAuth flow will handle the redirect
  } catch (error: any) {
    console.error("Error linking Google account:", error);
    alert(`Failed to link Google account: ${error.message || "Unknown error"}`);
  }
};

const disconnectAccount = async (provider: string) => {
  try {
    const account = (linkedAccounts.value || []).find(
      (acc: any) => acc.providerId === provider
    );
    if (account) {
      await client.unlinkAccount({
        providerId: provider,
        accountId: account.accountId,
      });
      // Refresh the accounts list
      const { data: updatedAccounts } = await client.listAccounts();
      linkedAccounts.value = updatedAccounts;
    }
  } catch (error) {
    console.error(`Error disconnecting ${provider}:`, error);
    alert(`Failed to disconnect ${provider} account.`);
  }
};

// Subscription management
const manageSubscription = async () => {
  try {
    // Open the Stripe billing portal
    const { data, error } = await client.subscription.billingPortal({
      returnUrl: window.location.href, // Return to the settings page after managing subscription
    });

    if (error) {
      console.error("Error accessing billing portal:", error);
      alert("Failed to access billing portal. Please try again.");
      return;
    }

    // Redirect to the billing portal URL
    if (data?.url) {
      window.location.href = data.url;
    }
  } catch (error) {
    console.error("Error accessing billing portal:", error);
    alert("Failed to access billing portal. Please try again.");
  }
};

// Sign out
const signOut = async () => {
  await authSignOut({ redirectTo: "/auth" });
};
</script>
