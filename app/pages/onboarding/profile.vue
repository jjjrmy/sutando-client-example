<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Progress Bar -->
    <div class="px-4 pt-safe">
      <div class="py-4">
        <div class="flex space-x-2">
          <div class="flex-1 h-1 bg-purple-600 rounded-full"></div>
          <div class="flex-1 h-1 bg-gray-200 rounded-full"></div>
          <div class="flex-1 h-1 bg-gray-200 rounded-full"></div>
        </div>
        <p class="text-xs text-gray-500 mt-2">Step 1 of 3</p>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 px-6 py-6">
      <h1 class="text-2xl font-bold mb-2">Create your profile</h1>
      <p class="text-gray-600 mb-8">
        Add a photo and username so friends can find you
      </p>

      <!-- Profile Photo Upload -->
      <div class="flex flex-col items-center mb-8">
        <div class="relative mb-4">
          <div
            class="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <button
            class="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full shadow-lg"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
        <button class="text-purple-600 font-medium text-sm">
          Add Profile Photo
        </button>
      </div>

      <!-- Form Fields -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Full Name</label
          >
          <input
            type="text"
            placeholder="John Doe"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Username</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              >@</span
            >
            <input
              type="text"
              placeholder="johndoe"
              class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <p class="text-xs text-gray-500 mt-1">
            This will be your unique handle
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Bio</label
          >
          <textarea
            placeholder="Tell us about yourself..."
            rows="3"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">0/150</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Date of Birth</label
          >
          <input
            type="date"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <p class="text-xs text-gray-500 mt-1">This won't be shown publicly</p>
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="px-6 pb-safe">
      <div class="py-4 space-y-3">
        <NuxtLink
          to="/onboarding/notifications"
          class="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors text-center"
        >
          Continue
        </NuxtLink>
        <button class="w-full text-gray-500 font-medium text-sm">
          Skip for now
        </button>
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
