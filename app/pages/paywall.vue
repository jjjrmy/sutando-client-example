<template>
  <div class="fixed inset-0 bg-white flex flex-col">
    <!-- Header with close button -->
    <div class="flex justify-end p-4">
      <button
        class="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full"
      >
        <svg
          class="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>

    <!-- Scrollable main content -->
    <div class="flex-1 overflow-y-auto pb-48">
      <div class="px-6">
        <!-- Hero Gradient -->
        <div class="mb-8">
          <div
            class="w-full h-64 bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500 rounded-2xl"
          ></div>
        </div>

        <!-- Title and Subtitle -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">Get CatGPT Plus</h1>
          <p class="text-gray-600 text-lg leading-relaxed">
            Our most advanced features, for our most dedicated users
          </p>
        </div>

        <!-- Try Free Button -->
        <div class="mb-12">
          <button
            class="w-full bg-orange-100 text-orange-600 font-semibold py-4 px-6 rounded-2xl text-lg"
          >
            TRY FREE FOR 1 WEEK
          </button>
        </div>

        <!-- Features List -->
        <div class="space-y-8 mb-8">
          <!-- Feature 1 -->
          <div class="flex items-start">
            <div class="flex-shrink-0 mr-4">
              <svg
                class="w-6 h-6 text-orange-500 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">
                Priority access to our advanced feline intelligence
              </h3>
              <p class="text-gray-500">
                Skip the queue, get instant cat insights
              </p>
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="flex items-start">
            <div class="flex-shrink-0 mr-4">
              <svg
                class="w-6 h-6 text-orange-500 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">
                4x faster response times during peak purring hours
              </h3>
              <p class="text-gray-500">Never miss a crucial meow-ment</p>
            </div>
          </div>

          <!-- Feature 3 -->
          <div class="flex items-start">
            <div class="flex-shrink-0 mr-4">
              <svg
                class="w-6 h-6 text-orange-500 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">
                Custom personality matching with 100+ cat breeds
              </h3>
              <p class="text-gray-500">
                Find your perfect feline personality match
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed Bottom CTA Section -->
    <div
      class="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe"
    >
      <div class="px-6 py-4">
        <!-- Main CTA Button -->
        <button
          class="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-2xl text-lg mb-3 transition-colors"
        >
          Get started for free
        </button>

        <!-- Pricing Info -->
        <p class="text-center text-sm text-gray-600 mb-4">
          Auto-renews for <span class="font-semibold">$69.99/year</span> until
          canceled
        </p>

        <!-- Bottom Links -->
        <div class="flex justify-center items-center space-x-6 text-sm">
          <button class="text-orange-500 font-medium">Restore Purchases</button>
          <span class="text-gray-400">|</span>
          <button class="text-orange-500 font-medium">Terms</button>
          <span class="text-gray-400">|</span>
          <button class="text-orange-500 font-medium">Privacy</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  auth: false,
});
// This page is static HTML/CSS only as requested
// Add any dynamic functionality here if needed in the future
</script>

<style scoped>
/* Add pb-safe utility for iPhone safe area if not already in Tailwind config */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
