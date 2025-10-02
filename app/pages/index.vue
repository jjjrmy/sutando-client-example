<template>
  <div class="min-h-screen bg-gray-50 relative">
    <!-- Pull to Refresh Indicator -->
    <div
      class="absolute top-0 left-0 right-0 flex justify-center items-center overflow-hidden z-20 pointer-events-none"
      :style="{
        height: `${pullDistance}px`,
        opacity: pullDistance > 0 ? Math.min(pullDistance / 80, 1) : 0,
      }"
    >
      <div class="flex flex-col items-center justify-center">
        <Icon
          :name="isRefreshing ? 'ri:loader-4-line' : 'ri:arrow-down-line'"
          size="24"
          :class="[
            'text-purple-600 transition-transform',
            {
              'animate-spin': isRefreshing,
              'rotate-180': pullDistance > 80 && !isRefreshing,
            },
          ]"
        />
        <span class="text-xs text-gray-600 mt-1">
          {{
            isRefreshing
              ? "Refreshing..."
              : pullDistance > 80
              ? "Release to refresh"
              : "Pull to refresh"
          }}
        </span>
      </div>
    </div>

    <!-- Main Content Container -->
    <div
      ref="scrollContainer"
      class="relative transition-transform"
      :style="{ transform: `translateY(${pullDistance}px)` }"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div class="px-4 py-3 flex items-center justify-between">
          <h1 class="text-xl font-bold">Timeline</h1>
          <button class="p-2">
            <Icon name="ri:notification-2-line" size="24" />
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="flex justify-center items-center py-20 px-4">
        <div class="text-center">
          <Icon
            name="ri:error-warning-line"
            size="48"
            class="text-red-400 mx-auto mb-4"
          />
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Oops! Something went wrong
          </h3>
          <p class="text-gray-500 mb-4">
            We couldn't load the posts. Please try again.
          </p>
          <button
            @click="() => refresh()"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!posts || posts.isEmpty()"
        class="flex justify-center items-center py-20 px-4"
      >
        <div class="text-center max-w-sm">
          <div
            class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Icon name="ri:image-line" size="48" class="text-gray-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
          <p class="text-gray-500 mb-6">
            When someone creates a post, it will appear here. Be the first to
            share something!
          </p>
          <NuxtLink
            to="/post/create"
            class="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Icon name="ri:add-line" size="24" />
            Create First Post
          </NuxtLink>
        </div>
      </div>

      <!-- Posts Feed -->
      <div v-else class="pb-16">
        <PostComponent v-for="post in posts.all()" :key="post.id" :post />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { makeCollection, type Collection } from "sutando";
import PostComponent from "~/app/components/Post.vue";
import Post from "~/models/Post";

definePageMeta({
  layout: "mobile",
  middleware: [],
});

// Fetch posts from the API
const {
  data: postsData,
  error,
  refresh,
} = await useDynamicFetch<Post[]>("/api/post");

// Convert API response to Sutando Collection
const posts = computed((): Collection<Post> | undefined => {
  if (!postsData.value) return undefined;
  return makeCollection(Post, postsData.value);
});

// Pull to refresh state
const scrollContainer = ref<HTMLElement>();
const pullDistance = ref(0);
const isRefreshing = ref(false);
const startY = ref(0);
const currentY = ref(0);

// Constants for pull to refresh
const PULL_THRESHOLD = 80; // Distance to trigger refresh
const MAX_PULL_DISTANCE = 120; // Maximum pull distance
const DAMPING_FACTOR = 0.5; // Reduce pull sensitivity

// Handle touch start
const handleTouchStart = (e: TouchEvent) => {
  if (isRefreshing.value) return;

  // Only initiate pull to refresh when at the top of the page
  if (window.scrollY <= 0 && e.touches[0]) {
    startY.value = e.touches[0].clientY;
  }
};

// Handle touch move
const handleTouchMove = (e: TouchEvent) => {
  if (isRefreshing.value || !startY.value || !e.touches[0]) return;

  currentY.value = e.touches[0].clientY;
  const diff = currentY.value - startY.value;

  // Only pull down when at the top and pulling down
  if (window.scrollY <= 0 && diff > 0) {
    e.preventDefault(); // Prevent default scroll behavior

    // Apply damping for more natural feel
    pullDistance.value = Math.min(diff * DAMPING_FACTOR, MAX_PULL_DISTANCE);
  }
};

// Handle touch end
const handleTouchEnd = async () => {
  if (isRefreshing.value) return;

  // Check if pull distance exceeds threshold
  if (pullDistance.value >= PULL_THRESHOLD) {
    isRefreshing.value = true;

    // Keep indicator visible during refresh
    pullDistance.value = 60;

    try {
      // Trigger the refresh
      await refresh();

      // Optional: Add a small delay to show the refresh completed
      await new Promise((resolve) => setTimeout(resolve, 300));
    } finally {
      // Reset everything
      isRefreshing.value = false;
      pullDistance.value = 0;
    }
  } else {
    // Snap back if not pulled enough
    pullDistance.value = 0;
  }

  // Reset start position
  startY.value = 0;
  currentY.value = 0;
};

// Clean up on unmount
onUnmounted(() => {
  pullDistance.value = 0;
  isRefreshing.value = false;
});
</script>

<style scoped>
/* Smooth transition for the pull animation */
.transition-transform {
  transition: transform 0.2s ease-out;
}

/* Override transition during active pull */
div[style*="translateY"]:active .transition-transform {
  transition: none;
}

/* Ensure smooth animation for the spinner */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
