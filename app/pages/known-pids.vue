<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-(--ui-text-highlighted)">Znane PID-y</h2>
        <p class="text-sm text-(--ui-text-muted)">Zarządzaj listą PID-ów przypisanych do modeli aut</p>
      </div>
      <UButton icon="i-heroicons-plus" @click="openCreate">Nowy PID</UButton>
    </div>

    <UCard>
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <UFormField label="Filtr modelu" class="sm:w-80">
          <UInput
            v-model="modelFilter"
            placeholder="np. Focus MK3"
            class="w-full"
            @keyup.enter="load"
          />
        </UFormField>
        <div class="flex gap-2">
          <UButton icon="i-heroicons-magnifying-glass" variant="soft" @click="load">Filtruj</UButton>
          <UButton icon="i-heroicons-x-mark" color="neutral" variant="ghost" @click="clearFilter">Wyczyść</UButton>
        </div>
      </div>

      <UTable :data="knownPids" :columns="columns" :loading="loading">
        <template #pid-cell="{ row }">
          <code class="text-xs font-semibold">{{ row.original.pid }}</code>
        </template>

        <template #unit-cell="{ row }">
          {{ row.original.unit || '-' }}
        </template>

        <template #description-cell="{ row }">
          <p class="max-w-2xl truncate text-sm text-(--ui-text-muted)">
            {{ row.original.description || '-' }}
          </p>
        </template>

        <template #active-cell="{ row }">
          <UBadge
            :color="row.original.active ? 'success' : 'neutral'"
            variant="soft"
            size="sm"
          >
            {{ row.original.active ? 'Tak' : 'Nie' }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex gap-1">
            <UButton
              size="xs"
              variant="ghost"
              icon="i-heroicons-pencil-square"
              title="Edytuj"
              :aria-label="`Edytuj PID ${row.original.pid}`"
              @click="openEdit(row.original)"
            />
            <UButton
              size="xs"
              variant="ghost"
              color="error"
              icon="i-heroicons-trash"
              title="Usuń"
              :aria-label="`Usuń PID ${row.original.pid}`"
              @click="confirmDelete(row.original)"
            />
          </div>
        </template>
      </UTable>

      <div
        v-if="!loading && !error && knownPids.length === 0"
        class="p-6 text-center text-sm text-(--ui-text-muted)"
      >
        Brak PID-ów do wyświetlenia.
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

    <KnownPidModal
      v-model="isModalOpen"
      :known-pid="editingKnownPid"
      :initial-model="modelFilter"
      @saved="load"
    />

    <UModal v-model:open="isDeleteOpen" title="Usuń PID">
      <template #body>
        <p>
          Czy na pewno chcesz usunąć PID
          <strong>{{ deleteTarget?.pid }}</strong>
          dla modelu
          <strong>{{ deleteTarget?.model }}</strong>?
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
import type { KnownPid } from '~/types'
import { getApiErrorMessage } from '~/utils/apiError'

definePageMeta({ middleware: 'auth' })

const $api = useApi()

const knownPids = ref<KnownPid[]>([])
const loading = ref(true)
const error = ref('')
const modelFilter = ref('')

const isModalOpen = ref(false)
const editingKnownPid = ref<KnownPid | undefined>(undefined)

const isDeleteOpen = ref(false)
const deleteTarget = ref<KnownPid | null>(null)
const deleteLoading = ref(false)

const columns = [
  { accessorKey: 'model', header: 'Model' },
  { accessorKey: 'pid', header: 'PID' },
  { accessorKey: 'name', header: 'Nazwa' },
  { accessorKey: 'unit', header: 'Jednostka' },
  { accessorKey: 'description', header: 'Opis' },
  { accessorKey: 'active', header: 'Aktywny' },
  { id: 'actions', header: 'Akcje' },
]

async function load() {
  loading.value = true
  error.value = ''

  try {
    const { data } = await $api.get<{ items: KnownPid[] }>('/api/admin/known-pids', {
      params: modelFilter.value.trim() ? { model: modelFilter.value.trim() } : undefined,
    })
    knownPids.value = data.items
  } catch {
    error.value = 'Nie udało się pobrać listy PID-ów.'
  } finally {
    loading.value = false
  }
}

function clearFilter() {
  modelFilter.value = ''
  load()
}

function openCreate() {
  editingKnownPid.value = undefined
  isModalOpen.value = true
}

function openEdit(knownPid: KnownPid) {
  editingKnownPid.value = knownPid
  isModalOpen.value = true
}

function confirmDelete(knownPid: KnownPid) {
  deleteTarget.value = knownPid
  isDeleteOpen.value = true
}

async function doDelete() {
  if (!deleteTarget.value) return
  if (deleteLoading.value) return

  deleteLoading.value = true
  error.value = ''

  try {
    await $api.delete(`/api/admin/known-pids/${deleteTarget.value.id}`)
    isDeleteOpen.value = false
    await load()
  } catch (e: unknown) {
    error.value = getApiErrorMessage(e, 'Nie udało się usunąć PID-u.')
  } finally {
    deleteLoading.value = false
  }
}

onMounted(load)
</script>
