<template>
  <UModal v-model:open="open" :title="isEdit ? 'Edytuj prompt AI' : 'Nowy prompt AI'">
    <template #body>
      <form class="space-y-4" @submit.prevent="submit">
        <UFormField label="Nazwa" required>
          <UInput
            v-model="form.name"
            placeholder="Analiza VIN"
            class="w-full"
            required
          />
        </UFormField>

        <UFormField label="Prompt" required>
          <UTextarea
            v-model="form.prompt"
            placeholder="Wpisz treść promptu..."
            class="w-full"
            :rows="8"
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
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="open = false">Anuluj</UButton>
        <UButton :loading="loading" @click="submit">Zapisz</UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { AiPrompt, AiPromptWrite } from '~/types'
import { getApiErrorMessage } from '~/utils/apiError'

const props = defineProps<{
  modelValue: boolean
  aiPrompt?: AiPrompt
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  saved: []
}>()

const { $api } = useNuxtApp() as { $api: ReturnType<typeof import('axios').default.create> }

const open = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const isEdit = computed(() => !!props.aiPrompt)

const defaultForm = (): AiPromptWrite => ({
  name: '',
  prompt: '',
})

const form = reactive<AiPromptWrite>(defaultForm())
const loading = ref(false)
const error = ref('')

watch(open, (val) => {
  if (val) {
    error.value = ''
    if (props.aiPrompt) {
      form.name = props.aiPrompt.name
      form.prompt = props.aiPrompt.prompt
    } else {
      Object.assign(form, defaultForm())
    }
  }
})

async function submit() {
  error.value = ''
  loading.value = true
  try {
    if (isEdit.value && props.aiPrompt) {
      await $api.patch(`/api/admin/ai-prompts/${props.aiPrompt.id}`, form)
    } else {
      await $api.post('/api/admin/ai-prompts', form)
    }
    open.value = false
    emit('saved')
  } catch (e: unknown) {
    error.value = getApiErrorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>
