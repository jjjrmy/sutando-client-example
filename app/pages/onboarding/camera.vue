<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col"
  >
    <!-- Progress Bar -->
    <div class="px-4 pt-safe">
      <div class="py-4">
        <div class="flex space-x-2">
          <div class="flex-1 h-1 bg-purple-600 rounded-full"></div>
          <div class="flex-1 h-1 bg-purple-600 rounded-full"></div>
          <div class="flex-1 h-1 bg-purple-600 rounded-full"></div>
        </div>
        <p class="text-xs text-gray-500 mt-2">Step 3 of 3</p>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col justify-center px-8 py-8">
      <!-- Icon -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-6"
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
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <h1 class="text-3xl font-bold mb-3">Share Your Moments</h1>
        <p class="text-gray-600 text-lg mb-8">
          Allow access to camera and photos to create and share posts
        </p>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="bg-white rounded-2xl p-4 text-center">
          <div
            class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <svg
              class="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h3 class="font-semibold mb-1">Camera</h3>
          <p class="text-xs text-gray-500">Take photos & videos</p>
        </div>

        <div class="bg-white rounded-2xl p-4 text-center">
          <div
            class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <svg
              class="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 class="font-semibold mb-1">Photos</h3>
          <p class="text-xs text-gray-500">Share from gallery</p>
        </div>
      </div>

      <!-- Permission Benefits -->
      <div class="bg-white rounded-2xl p-6 mb-8">
        <h3 class="font-medium mb-3">Why we need access:</h3>
        <ul class="space-y-2">
          <li class="flex items-start space-x-2">
            <svg
              class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span class="text-sm text-gray-600"
              >Create posts with photos and videos</span
            >
          </li>
          <li class="flex items-start space-x-2">
            <svg
              class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span class="text-sm text-gray-600"
              >Add photos to your stories</span
            >
          </li>
          <li class="flex items-start space-x-2">
            <svg
              class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span class="text-sm text-gray-600"
              >Update your profile picture</span
            >
          </li>
        </ul>
      </div>

      <!-- Privacy Note -->
      <div class="bg-blue-50 rounded-xl p-4 mb-8">
        <div class="flex items-start space-x-3">
          <svg
            class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <div>
            <p class="text-sm font-medium text-blue-900">
              Your privacy matters
            </p>
            <p class="text-xs text-blue-700 mt-1">
              You can change these permissions anytime in your device settings
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="px-6 pb-safe">
      <div class="py-4 space-y-3">
        <button
          class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
        >
          Allow Access
        </button>
        <NuxtLink
          to="/"
          class="block w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors text-center"
        >
          Skip & Finish Setup
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
