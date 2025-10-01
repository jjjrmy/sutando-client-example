<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <div class="sticky top-0 bg-white border-b border-gray-200 z-10">
      <div class="px-4 py-3 flex items-center">
        <NuxtLink to="/" class="mr-4">
          <Icon name="ri:arrow-left-line" size="24" />
          <span class="sr-only">Back</span>
        </NuxtLink>
        <h1 class="text-lg font-semibold">Post</h1>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="postError" class="flex justify-center items-center py-20 px-4">
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
          We couldn't load this post. It may have been deleted or you may not
          have permission to view it.
        </p>
        <NuxtLink
          to="/"
          class="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Back to Timeline
        </NuxtLink>
      </div>
    </div>

    <!-- Post Content -->
    <div v-else-if="post" class="flex flex-col pb-20">
      <PostComponent :post :isFullView="true" />
      <Comments />
    </div>
  </div>
</template>

<script setup lang="ts">
import { make } from "sutando";
import PostComponent from "~/app/components/Post.vue";
import Post from "~/models/Post";

definePageMeta({
  layout: "mobile",
});

const route = useRoute();
const postId = route.params.id;

// Fetch post from the API
const { data: postData, error: postError } = await useDynamicFetch<Post>(
  `/api/post/${postId}`
);

// Convert API response to Sutando model
const post = computed((): Post | undefined => {
  if (!postData.value) return undefined;
  return make(Post, postData.value);
});
</script>
