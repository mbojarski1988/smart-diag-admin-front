<template>
  <UModal v-model:open="open" :title="isEdit ? 'Edytuj użytkownika' : 'Nowy użytkownik'">
    <template #body>
      <form class="space-y-4" @submit.prevent="submit">
        <UFormField label="E-mail" required>
          <UInput
            v-model="form.email"
            type="email"
            placeholder="jan@firma.pl"
            class="w-full"
            required
          />
        </UFormField>

        <UFormField label="Imię" required>
          <UInput
            v-model="form.firstName"
            placeholder="Jan"
            class="w-full"
            required
          />
        </UFormField>

        <UFormField label="Nazwisko" required>
          <UInput
            v-model="form.lastName"
            placeholder="Kowalski"
            class="w-full"
            required
          />
        </UFormField>

        <UFormField label="Rola" required>
          <USelect
            v-model="form.role"
            :items="roleItems"
            class="w-full"
          />
        </UFormField>

        <UFormField v-if="!isEdit" label="Hasło" required>
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Min. 8 znaków"
            class="w-full"
            required
          />
        </UFormField>

        <UFormField v-if="isEdit" label="Aktywny">
          <USwitch v-model="form.active" />
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
import type { AuthUser, UserWrite } from '~/types'
import { getApiErrorMessage } from '~/utils/apiError'

const props = defineProps<{
  modelValue: boolean
  user?: AuthUser
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

const isEdit = computed(() => !!props.user)

const roleItems = [
  { label: 'Administrator', value: 'ROLE_ADMIN' },
  { label: 'Pracownik', value: 'ROLE_EMPLOYEE' },
]

const defaultForm = (): UserWrite => ({
  email: '',
  firstName: '',
  lastName: '',
  role: 'ROLE_EMPLOYEE',
  password: '',
  active: true,
})

const form = reactive<UserWrite>(defaultForm())
const loading = ref(false)
const error = ref('')

watch(open, (val) => {
  if (val) {
    error.value = ''
    if (props.user) {
      form.email = props.user.email
      form.firstName = props.user.firstName
      form.lastName = props.user.lastName
      form.role = props.user.role
      form.active = props.user.active
      form.password = undefined
    } else {
      Object.assign(form, defaultForm())
    }
  }
})

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const payload: UserWrite = { ...form }
    if (isEdit.value && props.user) {
      delete payload.password
      await $api.patch(`/api/admin/users/${props.user.id}`, payload)
    } else {
      await $api.post('/api/admin/users', payload)
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
