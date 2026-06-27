<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-(--ui-text-highlighted)">Użytkownicy</h2>
        <p class="text-sm text-(--ui-text-muted)">Zarządzaj kontami użytkowników</p>
      </div>
      <UButton icon="i-heroicons-plus" @click="openCreate">Nowy użytkownik</UButton>
    </div>

    <UCard>
      <UTable :data="users" :columns="columns" :loading="loading">
        <template #fullName-cell="{ row }">
          <div class="flex items-center gap-2">
            <UAvatar
              :alt="`${row.original.firstName} ${row.original.lastName}`"
              size="xs"
            />
            <span>{{ row.original.firstName }} {{ row.original.lastName }}</span>
          </div>
        </template>

        <template #role-cell="{ row }">
          <UBadge color="primary" variant="soft" size="sm">
            {{ row.original.role === 'ROLE_ADMIN' ? 'Administrator' : 'Pracownik' }}
          </UBadge>
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
              :aria-label="`Edytuj użytkownika ${row.original.firstName} ${row.original.lastName}`"
              @click="openEdit(row.original)"
            />
            <UButton
              size="xs"
              variant="ghost"
              icon="i-heroicons-key"
              color="warning"
              title="Reset hasła"
              :aria-label="`Resetuj hasło użytkownika ${row.original.firstName} ${row.original.lastName}`"
              @click="openResetPassword(row.original)"
            />
            <UButton
              size="xs"
              variant="ghost"
              color="error"
              icon="i-heroicons-trash"
              title="Usuń"
              :aria-label="`Usuń użytkownika ${row.original.firstName} ${row.original.lastName}`"
              @click="confirmDelete(row.original)"
            />
          </div>
        </template>
      </UTable>

      <div
        v-if="!loading && !error && users.length === 0"
        class="p-6 text-center text-sm text-(--ui-text-muted)"
      >
        Brak użytkowników do wyświetlenia.
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

    <UserModal v-model="isUserModalOpen" :user="editingUser" @saved="load" />

    <ResetPasswordModal
      v-model="isResetOpen"
      :user-id="resetTarget?.id ?? null"
      :user-name="resetTarget ? `${resetTarget.firstName} ${resetTarget.lastName}` : ''"
      @done="load"
    />

    <UModal v-model:open="isDeleteOpen" title="Usuń użytkownika">
      <template #body>
        <p>
          Czy na pewno chcesz usunąć użytkownika
          <strong>{{ deleteTarget?.firstName }} {{ deleteTarget?.lastName }}</strong>?
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
import type { AuthUser } from '~/types'
import { getApiErrorMessage } from '~/utils/apiError'

definePageMeta({ middleware: 'auth' })

const $api = useApi()

const users = ref<AuthUser[]>([])
const loading = ref(true)
const error = ref('')

const isUserModalOpen = ref(false)
const editingUser = ref<AuthUser | undefined>(undefined)

const isResetOpen = ref(false)
const resetTarget = ref<AuthUser | null>(null)

const isDeleteOpen = ref(false)
const deleteTarget = ref<AuthUser | null>(null)
const deleteLoading = ref(false)

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { id: 'fullName', header: 'Imię i nazwisko' },
  { accessorKey: 'email', header: 'E-mail' },
  { accessorKey: 'role', header: 'Rola' },
  { accessorKey: 'active', header: 'Aktywny' },
  { id: 'actions', header: 'Akcje' },
]

async function load() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await $api.get<{ items: AuthUser[] }>('/api/admin/users')
    users.value = data.items
  } catch {
    error.value = 'Nie udało się pobrać użytkowników.'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingUser.value = undefined
  isUserModalOpen.value = true
}

function openEdit(user: AuthUser) {
  editingUser.value = user
  isUserModalOpen.value = true
}

function openResetPassword(user: AuthUser) {
  resetTarget.value = user
  isResetOpen.value = true
}

function confirmDelete(user: AuthUser) {
  deleteTarget.value = user
  isDeleteOpen.value = true
}

async function doDelete() {
  if (!deleteTarget.value) return
  if (deleteLoading.value) return
  deleteLoading.value = true
  error.value = ''
  try {
    await $api.delete(`/api/admin/users/${deleteTarget.value.id}`)
    isDeleteOpen.value = false
    await load()
  } catch (e: unknown) {
    error.value = getApiErrorMessage(e, 'Nie udało się usunąć użytkownika.')
  } finally {
    deleteLoading.value = false
  }
}

onMounted(load)
</script>
