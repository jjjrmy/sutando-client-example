<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <div class="sticky top-0 bg-white border-b border-gray-200 z-10">
      <div class="px-4 py-3 flex items-center justify-between">
        <NuxtLink to="/">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </NuxtLink>
        <h1 class="text-lg font-semibold">New Post</h1>
        <button class="text-blue-500 font-semibold">Share</button>
      </div>
    </div>

    <div class="px-4 py-4">
      <!-- Image Upload Area -->
      <div class="mb-6">
        <div v-if="!imagePreview" class="relative">
          <input
            type="file"
            accept="image/*"
            @change="handleImageUpload"
            class="hidden"
            ref="imageInput"
          />
          <button
            @click="imageInput.click()"
            class="w-full aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
          >
            <svg
              class="w-12 h-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p class="text-gray-500 text-sm">Tap to upload a photo</p>
            <p class="text-gray-400 text-xs mt-1">JPG, PNG, GIF up to 10MB</p>
          </button>
        </div>

        <!-- Image Preview -->
        <div v-else class="relative">
          <img
            :src="imagePreview"
            alt="Preview"
            class="w-full aspect-square object-cover rounded-lg"
          />
          <button
            @click="removeImage"
            class="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Caption Input -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Caption</label
        >
        <textarea
          v-model="caption"
          placeholder="Write a caption..."
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
        <p class="text-xs text-gray-500 mt-1">{{ caption.length }}/2,200</p>
      </div>

      <!-- Share Button -->
      <button
        @click="createPost"
        :disabled="isCreating || (!imagePreview && !caption.trim())"
        class="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {{ isCreating ? "Creating..." : "Share Post" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Post from "~/models/Post";

definePageMeta({
  layout: "mobile",
  // subscription: true,
});

const router = useRouter();
const { user } = useAuth();
const imageInput = ref();
const imagePreview = ref("");
const imageFile = ref<File | null>(null);
const caption = ref("");
const isCreating = ref(false);

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    imageFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const removeImage = () => {
  imagePreview.value = "";
  imageFile.value = null;
  if (imageInput.value) {
    imageInput.value.value = "";
  }
};

const createPost = async () => {
  if (isCreating.value || (!imagePreview.value && !caption.value.trim())) {
    return;
  }

  isCreating.value = true;

  try {
    // For now, we'll send the base64 image data as the photo field
    // In the next step, we'll handle actual file uploads in the API endpoint
    const { data, error: fetchError } = await useDynamicFetch<Post>(
      "/api/post",
      {
        method: "POST",
        body: {
          user_id: user.value?.id,
          title: null, // No title for Instagram-style posts
          content: caption.value,
          photo: imagePreview.value, // Base64 image data for now
        },
      }
    );

    if (fetchError.value) {
      const errorData = fetchError.value.data;

      // Check if it's an R2 configuration issue
      if (errorData?.statusCode === 503 || errorData?.detail?.includes("R2")) {
        console.error("R2 Storage Error:", errorData);
        alert(
          "Image upload service is not available.\n\n" +
            "For local development, please run:\n" +
            "npx wrangler pages dev --local\n\n" +
            "Instead of npm run dev"
        );
      } else {
        console.error("Failed to create post:", fetchError.value);
        alert(errorData?.message || "Failed to create post. Please try again.");
      }
      return;
    }

    if (!data.value) {
      alert("Failed to create post. Please try again.");
      return;
    }

    // Redirect to the new post
    if (data.value.id) {
      await router.push(`/post/${data.value.id}`);
    }
  } catch (error) {
    console.error("Failed to create post:", error);
    alert("An unexpected error occurred. Please try again.");
  } finally {
    isCreating.value = false;
  }
};
</script>
