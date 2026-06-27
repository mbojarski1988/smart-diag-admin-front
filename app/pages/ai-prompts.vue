<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-(--ui-text-highlighted)">Prompty AI</h2>
        <p class="text-sm text-(--ui-text-muted)">Zarządzaj promptami używanymi przez moduły AI</p>
      </div>
      <UButton icon="i-heroicons-plus" @click="openCreate">Nowy prompt</UButton>
    </div>

    <UCard>
      <UTable :data="aiPrompts" :columns="columns" :loading="loading">
        <template #prompt-cell="{ row }">
          <p class="max-w-3xl truncate text-sm text-(--ui-text-muted)">
            {{ row.original.prompt }}
          </p>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex gap-1">
            <UButton
              size="xs"
              variant="ghost"
              icon="i-heroicons-pencil-square"
              title="Edytuj"
              :aria-label="`Edytuj prompt ${row.original.name}`"
              @click="openEdit(row.original)"
            />
            <UButton
              size="xs"
              variant="ghost"
              color="error"
              icon="i-heroicons-trash"
              title="Usuń"
              :aria-label="`Usuń prompt ${row.original.name}`"
              @click="confirmDelete(row.original)"
            />
          </div>
        </template>
      </UTable>

      <div
        v-if="!loading && !error && aiPrompts.length === 0"
        class="p-6 text-center text-sm text-(--ui-text-muted)"
      >
        Brak promptów AI do wyświetlenia.
      </div>

      <div v-if="error" class="p-4">
        <UAlert
          color="error"
          variant="soft"
          icon="i-heroicons-exclamation-circle"
          :description="error"
        />
      </div>
    </UCard>

    <AiPromptModal v-model="isModalOpen" :ai-prompt="editingAiPrompt" @saved="load" />

    <UModal v-model:open="isDeleteOpen" title="Usuń prompt AI">
      <template #body>
        <p>
          Czy na pewno chcesz usunąć prompt
          <strong>{{ deleteTarget?.name }}</strong>?
          Tej operacji nie można cofnąć.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="isDeleteOpen = false">Anuluj</UButton>
          <UButton color="error" :loading="deleteLoading" @click="doDelete">Usuń</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { AiPrompt } from '~/types'
import { getApiErrorMessage } from '~/utils/apiError'

definePageMeta({ middleware: 'auth' })

const $api = useApi()

const aiPrompts = ref<AiPrompt[]>([])
const loading = ref(true)
const error = ref('')

const isModalOpen = ref(false)
const editingAiPrompt = ref<AiPrompt | undefined>(undefined)

const isDeleteOpen = ref(false)
const deleteTarget = ref<AiPrompt | null>(null)
const deleteLoading = ref(false)

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Nazwa' },
  { accessorKey: 'prompt', header: 'Prompt' },
  { id: 'actions', header: 'Akcje' },
]

async function load() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await $api.get<{ items: AiPrompt[] }>('/api/admin/ai-prompts')
    aiPrompts.value = data.items
  } catch {
    error.value = 'Nie udało się pobrać promptów AI.'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingAiPrompt.value = undefined
  isModalOpen.value = true
}

function openEdit(aiPrompt: AiPrompt) {
  editingAiPrompt.value = aiPrompt
  isModalOpen.value = true
}

function confirmDelete(aiPrompt: AiPrompt) {
  deleteTarget.value = aiPrompt
  isDeleteOpen.value = true
}

async function doDelete() {
  if (!deleteTarget.value) return
  if (deleteLoading.value) return
  deleteLoading.value = true
  error.value = ''
  try {
    await $api.delete(`/api/admin/ai-prompts/${deleteTarget.value.id}`)
    isDeleteOpen.value = false
    await load()
  } catch (e: unknown) {
    error.value = getApiErrorMessage(e, 'Nie udało się usunąć promptu AI.')
  } finally {
    deleteLoading.value = false
  }
}

onMounted(load)
</script>
