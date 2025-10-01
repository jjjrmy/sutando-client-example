<template>
  <div class="border-t border-gray-200">
    <div class="px-4 py-3">
      <h3 class="font-semibold text-sm mb-3">Comments</h3>

      <!-- Comment List -->
      <div class="space-y-4">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="flex space-x-3"
        >
          <div class="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
          <div class="flex-1">
            <div class="text-sm">
              <span class="font-semibold">{{ comment.username }}</span>
              <span class="ml-1">{{ comment.text }}</span>
            </div>
            <div class="flex items-center space-x-4 mt-1">
              <span class="text-xs text-gray-500">{{ comment.time }}</span>
              <button class="text-xs text-gray-600 font-semibold">Like</button>
              <button class="text-xs text-gray-600 font-semibold">Reply</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed Comment Input -->
    <div
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 pb-safe"
    >
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
        <input
          type="text"
          placeholder="Add a comment..."
          class="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:bg-gray-200 transition-colors"
        />
        <button class="text-blue-500 font-semibold text-sm">Post</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Comment {
  id: string | number;
  username: string;
  text: string;
  time: string;
}

interface CommentsProps {
  comments?: Comment[];
}

withDefaults(defineProps<CommentsProps>(), {
  comments: () => [
    { id: 1, username: "user1", text: "Great post! Love it.", time: "2h" },
    { id: 2, username: "user2", text: "This is amazing!", time: "1h" },
    { id: 3, username: "user3", text: "So cool!", time: "30m" },
  ],
});
</script>
