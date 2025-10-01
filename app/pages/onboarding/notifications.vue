<template>
  <div
    class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col"
  >
    <!-- Progress Bar -->
    <div class="px-4 pt-safe">
      <div class="py-4">
        <div class="flex space-x-2">
          <div class="flex-1 h-1 bg-purple-600 rounded-full"></div>
          <div class="flex-1 h-1 bg-purple-600 rounded-full"></div>
          <div class="flex-1 h-1 bg-gray-200 rounded-full"></div>
        </div>
        <p class="text-xs text-gray-500 mt-2">Step 2 of 3</p>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col justify-center px-8 py-8">
      <!-- Icon -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-6"
        >
          <svg
            class="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>

        <h1 class="text-3xl font-bold mb-3">Stay Connected</h1>
        <p class="text-gray-600 text-lg mb-8">
          Get notified when friends post, comment, or message you
        </p>
      </div>

      <!-- Features List -->
      <div class="bg-white rounded-2xl p-6 mb-8 shadow-sm">
        <div class="space-y-4">
          <div class="flex items-start space-x-3">
            <div
              class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <svg
                class="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div>
              <p class="font-medium">Likes & Comments</p>
              <p class="text-sm text-gray-500">
                Know when someone interacts with your posts
              </p>
            </div>
          </div>

          <div class="flex items-start space-x-3">
            <div
              class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <svg
                class="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <p class="font-medium">Direct Messages</p>
              <p class="text-sm text-gray-500">Get alerted for new messages</p>
            </div>
          </div>

          <div class="flex items-start space-x-3">
            <div
              class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <svg
                class="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <div>
              <p class="font-medium">New Followers</p>
              <p class="text-sm text-gray-500">Know when someone follows you</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Illustration -->
      <div class="flex justify-center mb-8">
        <div class="relative">
          <div
            class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span class="text-white text-xs font-bold">3</span>
          </div>
          <svg
            class="w-16 h-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="px-6 pb-safe">
      <div class="py-4 space-y-3">
        <button
          class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
        >
          Enable Notifications
        </button>
        <NuxtLink
          to="/onboarding/camera"
          class="block w-full text-center text-gray-500 font-medium text-sm"
        >
          Not now
        </NuxtLink>
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
