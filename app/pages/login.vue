<template>
  <div class="min-h-screen flex items-center justify-center bg-(--ui-bg-muted) p-4">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="flex items-center gap-2.5">
          <UIcon name="i-heroicons-wrench-screwdriver" class="size-6 text-(--ui-primary)" />
          <span class="text-lg font-semibold text-(--ui-text-highlighted)">SmartDiag Admin</span>
        </div>
        <p class="mt-1 text-sm text-(--ui-text-muted)">Zaloguj się, aby kontynuować</p>
      </template>

      <UForm :state="state" class="space-y-4" @submit="submit">
        <UFormField label="E-mail" name="email">
          <UInput
            v-model="state.email"
            type="email"
            placeholder="admin@example.com"
            autocomplete="email"
            class="w-full"
            required
          />
        </UFormField>

        <UFormField label="Hasło" name="password">
          <UInput
            v-model="state.password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            class="w-full"
            required
          />
        </UFormField>

        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          icon="i-heroicons-exclamation-circle"
          :description="error"
        />

        <UButton
          type="submit"
          class="w-full justify-center"
          :loading="loading"
        >
          Zaloguj się
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const auth = useAuth()
const router = useRouter()

const state = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(state.email, state.password)
    await router.push('/')
  } catch {
    error.value = 'Nieprawidłowy e-mail lub hasło.'
  } finally {
    loading.value = false
  }
}
</script>
