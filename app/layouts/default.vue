<template>
  <div class="flex h-screen bg-(--ui-bg-muted) overflow-hidden">
    <!-- Sidebar -->
    <aside
      class="flex flex-col w-64 bg-(--ui-bg) border-r border-(--ui-border) shrink-0"
    >
      <!-- Logo -->
      <div class="flex items-center gap-2.5 px-4 py-4 border-b border-(--ui-border)">
        <UIcon name="i-heroicons-wrench-screwdriver" class="size-6 text-(--ui-primary)" />
        <span class="font-semibold text-(--ui-text-highlighted)">SmartDiag Admin</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-2 space-y-0.5">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="
            route.path.startsWith(item.to)
              ? 'bg-(--ui-primary)/10 text-(--ui-primary)'
              : 'text-(--ui-text-muted) hover:bg-(--ui-bg-elevated) hover:text-(--ui-text)'
          "
        >
          <UIcon :name="item.icon" class="size-5 shrink-0" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- Footer -->
      <div class="p-2 border-t border-(--ui-border)">
        <button
          class="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-(--ui-text-muted) hover:bg-(--ui-bg-elevated) hover:text-(--ui-text) transition-colors"
          @click="auth.logout()"
        >
          <UIcon name="i-heroicons-arrow-right-on-rectangle" class="size-5 shrink-0" />
          Wyloguj
        </button>
      </div>
    </aside>

    <!-- Main area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top bar -->
      <header class="flex items-center h-14 px-6 bg-(--ui-bg) border-b border-(--ui-border) shrink-0">
        <h1 class="text-sm font-semibold text-(--ui-text-highlighted)">
          {{ currentTitle }}
        </h1>
        <div class="ml-auto">
          <UButton
            :icon="colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
          />
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const colorMode = useColorMode()
const auth = useAuth()

const navItems = [
  { label: 'Licencje', icon: 'i-heroicons-key', to: '/licenses' },
  { label: 'Użytkownicy', icon: 'i-heroicons-users', to: '/users' },
]

const currentTitle = computed(() => {
  const item = navItems.find((i) => route.path.startsWith(i.to))
  return item?.label ?? 'Dashboard'
})
</script>
