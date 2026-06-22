<template>
  <UModal v-model:open="open" title="Resetuj hasło">
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-(--ui-text-muted)">
          Ustaw nowe hasło dla <strong>{{ userName }}</strong>.
        </p>

        <UFormField label="Nowe hasło" required>
          <UInput
            v-model="password"
            type="password"
            placeholder="Min. 8 znaków"
            class="w-full"
          />
        </UFormField>

        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          icon="i-heroicons-exclamation-circle"
          :description="error"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="open = false">Anuluj</UButton>
        <UButton :loading="loading" @click="submit">Zapisz hasło</UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  userId: number | null
  userName: string
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  done: []
}>()

const { $api } = useNuxtApp() as { $api: ReturnType<typeof import('axios').default.create> }

const open = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const password = ref('')
const loading = ref(false)
const error = ref('')

watch(open, (val) => {
  if (val) {
    password.value = ''
    error.value = ''
  }
})

async function submit() {
  if (password.value.length < 8) {
    error.value = 'Hasło musi mieć minimum 8 znaków.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await $api.post(`/api/admin/users/${props.userId}/reset-password`, {
      password: password.value,
    })
    open.value = false
    emit('done')
  } catch (e: any) {
    error.value = e?.response?.data?.error ?? 'Wystąpił błąd. Spróbuj ponownie.'
  } finally {
    loading.value = false
  }
}
</script>
