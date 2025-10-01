<template>
  <div class="min-h-screen bg-gray-50">
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
</template>

<script setup lang="ts">
import { makeCollection, type Collection } from "sutando";
import PostComponent from "~/app/components/Post.vue";
import Post from "~/models/Post";

definePageMeta({
  layout: "mobile",
});

// Fetch posts from the API
const {
  data: postsData,
  error,
  refresh,
} = await useDynamicFetch<Record<string, any>[]>("/api/post");

// Convert API response to Sutando Collection
const posts = computed((): Collection<Post> | undefined => {
  if (!postsData.value) return undefined;
  return makeCollection(Post, postsData.value);
});
</script>
