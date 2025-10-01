<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <div class="sticky top-0 bg-white border-b border-gray-200 z-10">
      <div class="px-4 py-3 flex items-center justify-between">
        <NuxtLink to="/">
          <Icon name="ri:arrow-left-line" size="24" />
          <span class="sr-only">Back</span>
        </NuxtLink>
        <h1 class="text-lg font-semibold">{{ profileUser?.username }}</h1>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="userError" class="flex justify-center items-center py-20 px-4">
      <div class="text-center">
        <Icon
          name="ri:error-warning-line"
          size="48"
          class="text-red-400 mx-auto mb-4"
        />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">User not found</h3>
        <p class="text-gray-500 mb-4">
          This user doesn't exist or may have been deleted.
        </p>
        <NuxtLink
          to="/"
          class="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Back to Timeline
        </NuxtLink>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else-if="profileUser">
      <!-- Profile Info -->
      <div class="px-4 py-4">
        <!-- Profile Picture and Stats -->
        <div class="flex items-center mb-4">
          <div
            class="w-20 h-20 rounded-full mr-4 flex-shrink-0 overflow-hidden"
          >
            <img
              :src="profileUser.avatar"
              :alt="profileUser.name"
              class="w-full h-full object-cover"
            />
          </div>

          <div class="flex-1">
            <p class="font-bold text-lg text-center">
              {{ profilePosts?.count() }}
            </p>
            <p class="text-gray-600 text-sm text-center">Posts</p>
          </div>
        </div>

        <!-- Name and Bio -->
        <div class="mb-4">
          <h2 class="font-bold">{{ profileUser.name }}</h2>
          <p class="text-sm text-gray-600 mb-1">{{ profileUser.email }}</p>
          <p class="text-xs text-gray-500">
            Joined {{ profileUser.createdAt?.toLocaleDateString() }}
          </p>
        </div>

        <template v-if="!isOwnProfile">
          <!-- Action Buttons -->
          <div class="flex space-x-2 mb-4">
            <button
              class="flex-1 bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Message
            </button>
          </div>
        </template>
        <template v-else>
          <!-- Own Profile Actions -->
          <div class="flex space-x-2 mb-4">
            <NuxtLink
              to="/profile/settings"
              class="flex-1 bg-gray-200 text-black font-semibold py-2 rounded-lg hover:bg-gray-300 transition-colors text-center"
            >
              Edit Profile
            </NuxtLink>
            <button
              class="flex-1 bg-gray-200 text-black font-semibold py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Share Profile
            </button>
          </div>
        </template>
      </div>

      <!-- Posts Grid -->
      <div class="border-t border-gray-200">
        <!-- Empty posts state -->
        <div v-if="!profilePosts || profilePosts.isEmpty()" class="py-20 px-4">
          <div class="text-center">
            <Icon
              name="ri:image-line"
              size="48"
              class="text-gray-400 mx-auto mb-4"
            />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              No posts yet
            </h3>
            <p class="text-gray-500">
              {{ isOwnProfile ? "You haven't" : "This user hasn't" }} posted
              anything yet.
            </p>
            <NuxtLink
              v-if="isOwnProfile"
              to="/post/create"
              class="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create First Post
            </NuxtLink>
          </div>
        </div>

        <!-- Posts Grid -->
        <div v-else class="grid grid-cols-3 gap-0.5">
          <PostComponent
            v-for="userPost in profilePosts"
            :key="userPost.id"
            :post="userPost"
            :isMiniView="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { make, type Collection } from "sutando";
import PostComponent from "~/app/components/Post.vue";
import User from "~/models/User";
import Post from "~/models/Post";

definePageMeta({
  layout: "mobile",
});

const route = useRoute();
const { user } = useAuth();

// Use current user's ID if no ID is provided in the route
const profileId = computed(() => {
  const id = route.params.id as string | undefined;
  return id || user.value?.id || "";
});

const isOwnProfile = computed(() => profileId.value === user.value?.id);

// Fetch user data from the API
const { data: profileUserData, error: userError } = await useDynamicFetch<User>(
  `/api/user/${profileId.value}`
);

const profileUser = computed((): User | undefined => {
  if (!profileUserData.value) return undefined;
  return make(User, profileUserData.value);
});

const profilePosts = computed((): Collection<Post> | undefined => {
  if (!profileUser.value) return undefined;
  return profileUser.value?.getRelation<Post, true>("posts");
});
</script>
