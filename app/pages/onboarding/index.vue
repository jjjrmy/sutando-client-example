<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
    <div class="max-w-md mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Onboarding Flow</h1>
      <p class="text-gray-600 mb-8">Test each step of the onboarding process</p>

      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Onboarding Steps</h2>
        <div class="space-y-3">
          <NuxtLink
            to="/onboarding/profile"
            class="block p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold">Step 1: Profile Setup</p>
                <p class="text-sm opacity-90">Create username and add photo</p>
              </div>
              <span class="text-2xl">👤</span>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/onboarding/notifications"
            class="block p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold">Step 2: Notifications</p>
                <p class="text-sm opacity-90">Enable push notifications</p>
              </div>
              <span class="text-2xl">🔔</span>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/onboarding/camera"
            class="block p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold">Step 3: Camera Access</p>
                <p class="text-sm opacity-90">Allow camera and photo access</p>
              </div>
              <span class="text-2xl">📷</span>
            </div>
          </NuxtLink>
        </div>

        <div class="mt-6 pt-6 border-t border-gray-200">
          <NuxtLink
            to="/"
            class="text-purple-600 text-sm font-medium flex items-center"
          >
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to all pages
          </NuxtLink>
        </div>
      </div>

      <div class="mt-8 text-center text-sm text-gray-500">
        <p>Each step can be accessed individually</p>
        <p>Progress bar shows current step in actual flow</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  auth: false,
});
</script>
