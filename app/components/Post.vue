<template>
  <!-- Mini view for profile grid -->
  <article v-if="isMiniView" class="aspect-square bg-gray-200 relative group">
    <NuxtLink :to="`/post/${post.id}`">
      <div v-if="post.photo_url" class="absolute inset-0 overflow-hidden">
        <img
          :src="post.photo_url"
          :alt="post.title || 'Post image'"
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div
        v-else
        class="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center"
      >
        <div class="text-center p-2">
          <p class="text-xs text-gray-600 truncate">
            {{ post.title || post.content }}
          </p>
        </div>
      </div>
      <!-- Hover overlay -->
      <div
        class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100"
      >
        <div class="text-white text-center">
          <div class="flex items-center space-x-4">
            <span class="flex items-center">
              <Icon name="ri:heart-fill" size="16" class="mr-1" />
              <span class="text-sm">0</span>
            </span>
            <span class="flex items-center">
              <Icon name="ri:chat-1-fill" size="16" class="mr-1" />
              <span class="text-sm">0</span>
            </span>
          </div>
        </div>
      </div>
    </NuxtLink>
  </article>

  <!-- Regular/Full view -->
  <article
    v-else
    class="bg-white"
    :class="{ 'border-b border-gray-200': !isFullView }"
  >
    <!-- Post Header -->
    <div class="px-4 py-3 flex items-center justify-between">
      <NuxtLink
        :to="`/profile/${post.user_id}`"
        class="flex items-center space-x-3"
      >
        <div
          v-if="user.avatar"
          class="size-10 rounded-full mr-4 flex-shrink-0 overflow-hidden"
        >
          <img
            :src="user.avatar"
            :alt="user.name"
            class="w-full h-full object-cover"
          />
        </div>
        <div>
          <p class="font-semibold text-sm">{{ user.username }}</p>
          <p class="text-xs text-gray-500">
            {{ post.created_at.toLocaleDateString() }}
          </p>
        </div>
      </NuxtLink>
    </div>

    <!-- Post Image -->
    <NuxtLink :to="`/post/${post.id}`">
      <div v-if="post.photo_url" class="aspect-square relative overflow-hidden">
        <img
          :src="post.photo_url"
          :alt="post.title || 'Post image'"
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div v-else class="aspect-square bg-gray-200"></div>
    </NuxtLink>

    <!-- Post Actions (only for timeline view) -->
    <div v-if="!isFullView" class="px-4 py-3">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-4">
          <button class="hover:opacity-70 transition-opacity">
            <Icon name="ri:heart-line" size="24" />
          </button>
          <button class="hover:opacity-70 transition-opacity">
            <Icon name="ri:chat-1-line" size="24" />
          </button>
        </div>
      </div>

      <!-- Likes -->
      <p class="font-semibold text-sm mb-1">0 likes</p>

      <!-- Caption -->
      <div class="text-sm">
        <span class="font-semibold">{{ user.username }}</span>
        <span class="ml-1">{{ post.content }}</span>
      </div>

      <!-- View Comments -->
      <NuxtLink
        :to="`/post/${post.id}`"
        class="text-sm text-gray-500 mt-1 block"
      >
        View all 0 comments
      </NuxtLink>
    </div>

    <!-- Full view details (only for post detail page) -->
    <div v-else class="px-4 py-3">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-4">
          <button class="hover:opacity-70 transition-opacity">
            <Icon name="ri:heart-line" size="24" />
          </button>
          <button class="hover:opacity-70 transition-opacity">
            <Icon name="ri:chat-1-line" size="24" />
          </button>
        </div>
      </div>

      <!-- Likes -->
      <p class="font-semibold text-sm mb-1">0 likes</p>

      <!-- Caption -->
      <div class="text-sm mb-2">
        <span class="font-semibold">{{ user.username }}</span>
        <span class="ml-1">{{ post.content }}</span>
      </div>

      <!-- Time -->
      <p class="text-xs text-gray-500 mb-4">
        {{ post.created_at.toLocaleDateString() }}
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
import type Post from "../../models/Post";
import type User from "../../models/User";

interface PostProps {
  post: Post;
  user?: User;
  isFullView?: boolean;
  isMiniView?: boolean;
}

const props = withDefaults(defineProps<PostProps>(), {
  isFullView: false,
  isMiniView: false,
});

const user = computed((): User => {
  const userFromProps = props.user;
  const userFromRelation = props.post.getRelation<User>("user");

  if (!userFromProps && !userFromRelation) {
    throw new Error("User is required");
  }

  return userFromProps || (userFromRelation as User);
});
</script>
