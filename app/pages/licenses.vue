<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-semibold text-(--ui-text-highlighted)">Licencje</h2>
        <p class="text-sm text-(--ui-text-muted)">Zarządzaj licencjami klientów</p>
      </div>
      <UButton icon="i-heroicons-plus" @click="openCreate">Nowa licencja</UButton>
    </div>

    <UCard>
      <UTable :data="licenses" :columns="columns" :loading="loading">
        <template #validUntil-cell="{ row }">
          {{ row.original.validUntil.split('T')[0] }}
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
              @click="openEdit(row.original)"
            />
            <UButton
              size="xs"
              variant="ghost"
              :icon="row.original.active ? 'i-heroicons-no-symbol' : 'i-heroicons-check-circle'"
              :color="row.original.active ? 'warning' : 'success'"
              :title="row.original.active ? 'Dezaktywuj' : 'Aktywuj'"
              @click="confirmToggle(row.original)"
            />
            <UButton
              size="xs"
              variant="ghost"
              color="error"
              icon="i-heroicons-trash"
              title="Usuń"
              @click="confirmDelete(row.original)"
            />
          </div>
        </template>
      </UTable>

      <div v-if="error" class="p-4">
        <UAlert
          color="error"
          variant="soft"
          icon="i-heroicons-exclamation-circle"
          :description="error"
        />
      </div>
    </UCard>

    <LicenseModal v-model="isModalOpen" :license="editingLicense" @saved="load" />

    <UModal v-model:open="isDeleteOpen" title="Usuń licencję">
      <template #body>
        <p>
          Czy na pewno chcesz usunąć licencję dla
          <strong>{{ targetLicense?.clientName }}</strong>?
          Tej operacji nie można cofnąć.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="isDeleteOpen = false">Anuluj</UButton>
          <UButton color="error" :loading="actionLoading" @click="doDelete">Usuń</UButton>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="isToggleOpen"
      :title="targetLicense?.active ? 'Dezaktywuj licencję' : 'Aktywuj licencję'"
    >
      <template #body>
        <p v-if="targetLicense?.active">
          Czy na pewno chcesz dezaktywować licencję dla
          <strong>{{ targetLicense?.clientName }}</strong>?
        </p>
        <p v-else>
          Czy na pewno chcesz aktywować licencję dla
          <strong>{{ targetLicense?.clientName }}</strong>?
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="isToggleOpen = false">Anuluj</UButton>
          <UButton
            :color="targetLicense?.active ? 'warning' : 'success'"
            :loading="actionLoading"
            @click="doToggle"
          >
            {{ targetLicense?.active ? 'Dezaktywuj' : 'Aktywuj' }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { License } from '~/types'

definePageMeta({ middleware: 'auth' })

const { $api } = useNuxtApp() as { $api: ReturnType<typeof import('axios').default.create> }
const config = useRuntimeConfig()

const licenses = ref<License[]>([])
const loading = ref(true)
const error = ref('')

const isModalOpen = ref(false)
const editingLicense = ref<License | undefined>(undefined)

const isDeleteOpen = ref(false)
const isToggleOpen = ref(false)
const targetLicense = ref<License | null>(null)
const actionLoading = ref(false)

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'clientName', header: 'Klient' },
  { accessorKey: 'clientEmail', header: 'E-mail' },
  { accessorKey: 'validUntil', header: 'Ważna do' },
  { accessorKey: 'active', header: 'Aktywna' },
  { id: 'actions', header: 'Akcje' },
]

const adminHeaders = computed(() => ({
  'X-Admin-Key': config.public.adminKey as string,
}))

async function load() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await $api.get<{ items: License[] }>('/api/admin/licenses', {
      headers: adminHeaders.value,
    })
    licenses.value = data.items
  } catch {
    error.value = 'Nie udało się pobrać licencji.'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingLicense.value = undefined
  isModalOpen.value = true
}

function openEdit(license: License) {
  editingLicense.value = license
  isModalOpen.value = true
}

function confirmDelete(license: License) {
  targetLicense.value = license
  isDeleteOpen.value = true
}

function confirmToggle(license: License) {
  targetLicense.value = license
  isToggleOpen.value = true
}

async function doDelete() {
  if (!targetLicense.value) return
  actionLoading.value = true
  try {
    await $api.delete(`/api/admin/licenses/${targetLicense.value.id}`, {
      headers: adminHeaders.value,
    })
    isDeleteOpen.value = false
    await load()
  } catch {
    isDeleteOpen.value = false
  } finally {
    actionLoading.value = false
  }
}

async function doToggle() {
  if (!targetLicense.value) return
  actionLoading.value = true
  try {
    if (targetLicense.value.active) {
      await $api.post(
        `/api/admin/licenses/${targetLicense.value.id}/deactivate`,
        {},
        { headers: adminHeaders.value },
      )
    } else {
      await $api.patch(
        `/api/admin/licenses/${targetLicense.value.id}`,
        { active: true },
        { headers: adminHeaders.value },
      )
    }
    isToggleOpen.value = false
    await load()
  } catch {
    isToggleOpen.value = false
  } finally {
    actionLoading.value = false
  }
}

onMounted(load)
</script>
