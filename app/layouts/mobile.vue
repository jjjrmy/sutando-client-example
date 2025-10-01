<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Main Content Area -->
    <main class="flex-1 pb-16 overflow-y-auto">
      <slot />
    </main>

    <!-- Bottom Navigation -->
    <nav
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-safe pb-safe"
    >
      <div class="grid grid-cols-3 h-16">
        <!-- Dashboard -->
        <NuxtLink
          to="/"
          class="nav-link flex flex-col items-center justify-center space-y-1 text-gray-600 hover:text-black transition-colors"
          :class="{ active: $route.path === '/' }"
        >
          <Icon name="ri:home-line" size="24" />
          <span class="text-xs">Dashboard</span>
        </NuxtLink>

        <!-- Create Post -->
        <NuxtLink
          to="/post/create"
          class="nav-link flex flex-col items-center justify-center space-y-1 text-gray-600 hover:text-black transition-colors"
          :class="{ active: $route.path === '/post/create' }"
        >
          <Icon name="ri:add-line" size="24" />
          <span class="text-xs">Create</span>
        </NuxtLink>

        <!-- Profile - always links to user's own profile -->
        <NuxtLink
          to="/profile"
          class="nav-link flex flex-col items-center justify-center space-y-1 text-gray-600 hover:text-black transition-colors"
          :class="{ active: isProfileActive }"
        >
          <Icon name="ri:user-line" size="24" />
          <span class="text-xs">Profile</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const route = useRoute();

// Check if profile section is active
const isProfileActive = computed(() => {
  return route.path.startsWith("/profile");
});
</script>

<style scoped>
/* Active state for navigation items */
.nav-link.active {
  color: #000;
  font-weight: 600;
}

.nav-link.active svg {
  color: #000;
  stroke-width: 2;
}

/* Optional: Add an indicator dot or underline for active state */
.nav-link.active::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background-color: #000;
  border-radius: 50%;
}

.nav-link {
  position: relative;
}
</style>
