<template>
  <div class="pt-safe p-6">
    <h1 class="text-3xl font-bold mb-6">Subscription Dashboard</h1>

    <!-- Loading state -->
    <div v-if="pending" class="text-center py-8">
      <p class="text-gray-600">Loading subscription data...</p>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4"
    >
      <p class="text-red-800">Error loading subscription data:</p>
      <p class="text-red-600 text-sm mt-1">{{ error.message }}</p>
      <button
        @click="handleRefresh"
        class="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Retry
      </button>
    </div>

    <!-- Success state -->
    <div v-else-if="data" class="space-y-6">
      <!-- Message -->
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <p class="text-green-800 font-medium">{{ data.message }}</p>
      </div>

      <!-- Active Subscriptions -->
      <div class="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <h2 class="text-xl font-semibold mb-4">Active Subscriptions</h2>
        <div class="space-y-3">
          <div
            v-for="sub in data.subscriptions"
            :key="sub.id"
            class="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="font-medium text-gray-600">Plan:</span>
                <span class="ml-2 font-semibold text-gray-900">{{
                  sub.plan
                }}</span>
              </div>
              <div>
                <span class="font-medium text-gray-600">Status:</span>
                <span
                  :class="[
                    'ml-2 px-2 py-1 rounded text-xs font-medium',
                    sub.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : sub.status === 'trialing'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800',
                  ]"
                  >{{ sub.status }}</span
                >
              </div>
              <div class="col-span-2">
                <span class="font-medium text-gray-600">Period End:</span>
                <span class="ml-2">{{
                  new Date(sub.periodEnd).toLocaleDateString()
                }}</span>
              </div>
              <div v-if="sub.limits" class="col-span-2 mt-2">
                <span class="font-medium text-gray-600">Limits:</span>
                <div class="mt-1 pl-2">
                  <pre class="text-xs bg-white p-2 rounded border">{{
                    JSON.stringify(sub.limits, null, 2)
                  }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-3 text-sm text-gray-600">
          Total Active Subscriptions:
          <span class="font-semibold">{{ data.totalActiveSubscriptions }}</span>
        </div>
      </div>

      <!-- Subscription Limits -->
      <div class="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <h2 class="text-xl font-semibold mb-4">Merged Subscription Limits</h2>
        <div
          v-if="
            data.subscriptionLimits &&
            Object.keys(data.subscriptionLimits).length > 0
          "
          class="bg-gray-50 rounded-lg p-4"
        >
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="(value, key) in data.subscriptionLimits"
              :key="key"
              class="flex items-center justify-between bg-white rounded p-3 border border-gray-200"
            >
              <span class="text-sm font-medium text-gray-600 capitalize"
                >{{ key }}:</span
              >
              <span class="text-lg font-semibold text-gray-900">{{
                value
              }}</span>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 text-sm">No limits defined</div>
      </div>

      <!-- Plan Checks -->
      <div class="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <h2 class="text-xl font-semibold mb-4">Plan Access</h2>
        <div class="flex gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-600">Basic Plan:</span>
            <span
              :class="[
                'px-2 py-1 rounded text-sm font-medium',
                data.planChecks.hasBasicPlan
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800',
              ]"
            >
              {{ data.planChecks.hasBasicPlan ? "✓ Active" : "✗ Inactive" }}
            </span>
          </div>
        </div>
      </div>

      <!-- Refresh Button -->
      <div class="flex justify-end">
        <button
          @click="handleRefresh"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Refresh Data
        </button>
      </div>
    </div>

    <!-- No data state -->
    <div v-else class="text-center py-8">
      <p class="text-gray-600">No subscription data available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define page meta to require 'basic' subscription
definePageMeta({
  subscription: {
    plan: "basic",
    redirectTo: "/products", // Redirect to products page if no basic subscription
    allowTrial: true, // Allow trial users to access
  },
});

// Type definition for the response
interface SubscriptionData {
  message: string;
  subscriptions: Array<{
    id: string;
    plan: string;
    status: string;
    periodEnd: string;
    limits?: Record<string, any>;
  }>;
  subscriptionLimits: Record<string, any> | null;
  planChecks: {
    hasBasicPlan: boolean;
  };
  totalActiveSubscriptions: number;
}

// Fetch data from test endpoint
const { data, pending, error, refresh } =
  await useDynamicFetch<SubscriptionData>("/api/tools/test", {
    // Optional: Add error handling
    onResponseError({ response }) {
      console.error("Failed to fetch subscription data:", response._data);
    },
  });

// Log data for debugging
watchEffect(() => {
  if (data.value) {
    console.log("Subscription data loaded:", data.value);
  }
});

// Handler for refresh button
const handleRefresh = () => {
  refresh();
};
</script>

<style scoped>
.pt-safe {
  padding-top: env(safe-area-inset-top);
}
</style>
