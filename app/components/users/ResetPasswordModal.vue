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
import { getApiErrorMessage } from '~/utils/apiError'

const props = defineProps<{
  modelValue: boolean
  userId: number | null
  userName: string
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  done: []
}>()

const $api = useApi()

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
  if (loading.value) return
  if (!props.userId) {
    error.value = 'Nie wybrano użytkownika.'
    return
  }

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
  } catch (e: unknown) {
    error.value = getApiErrorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>
