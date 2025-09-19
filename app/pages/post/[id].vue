<!-- Post Detail/Edit Page -->
<template>
  <div class="container mx-auto p-4">
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">
          {{ isNew ? "Create Post" : "Edit Post" }}
        </h1>
        <NuxtLink
          :to="`/user/${post.user_id}`"
          class="text-blue-500 hover:text-blue-600"
          >← Back to User</NuxtLink
        >
      </div>

      <!-- Post Form -->
      <form @submit.prevent="savePost" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            v-model="post.title"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            v-model="post.content"
            rows="4"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          ></textarea>
        </div>
        <div class="flex space-x-2">
          <button
            type="submit"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {{ isNew ? "Create Post" : "Save Changes" }}
          </button>
          <NuxtLink
            :to="`/user/${post.user_id}`"
            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </NuxtLink>
          <button
            v-if="!isNew"
            type="button"
            @click="deletePost"
            class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Delete Post
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { make } from "sutando";
import Post from "../../../models/Post";
import { modelRef } from "~/utils/model";

const route = useRoute();
const router = useRouter();
const post = modelRef();
const isNew = computed(() => route.params.id === "create");

// Initialize post data
if (isNew.value) {
  post.value = make(Post, {
    user_id: parseInt(route.query.user_id as string),
    title: "",
    content: "",
  });
} else {
  const { data: postData } = await useDynamicFetch(
    `/api/post/${route.params.id}`
  );
  watch(
    postData,
    (newData) => {
      post.value = make(Post, newData);
    },
    { immediate: true }
  );
}

async function savePost() {
  try {
    if (isNew.value) {
      await useDynamicFetch("/api/post", {
        method: "POST",
        body: {
          user_id: post.value.user_id,
          title: post.value.title,
          content: post.value.content,
        },
      });
    } else {
      await useDynamicFetch(`/api/post/${post.value.id}`, {
        method: "PUT",
        body: {
          title: post.value.title,
          content: post.value.content,
        },
      });
    }
    router.push(`/user/${post.value.user_id}`);
  } catch (error) {
    console.error("Failed to save post:", error);
    // Add error handling UI here
  }
}

async function deletePost() {
  if (!confirm("Are you sure you want to delete this post?")) {
    return;
  }

  try {
    await useDynamicFetch(`/api/post/${post.value.id}`, {
      method: "DELETE",
    });
    router.push(`/user/${post.value.user_id}`);
  } catch (error) {
    console.error("Failed to delete post:", error);
    // Add error handling UI here
  }
}
</script>
