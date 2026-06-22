<template>
  <UModal v-model:open="open" :title="isEdit ? 'Edytuj licencję' : 'Nowa licencja'">
    <template #body>
      <form class="space-y-4" @submit.prevent="submit">
        <UFormField label="Nazwa klienta" required>
          <UInput
            v-model="form.clientName"
            placeholder="Firma ABC sp. z o.o."
            class="w-full"
            required
          />
        </UFormField>

        <UFormField label="E-mail klienta" required>
          <UInput
            v-model="form.clientEmail"
            type="email"
            placeholder="kontakt@firma.pl"
            class="w-full"
            required
          />
        </UFormField>

        <UFormField label="Notatka">
          <UTextarea
            v-model="form.note"
            placeholder="Opcjonalna notatka..."
            class="w-full"
            :rows="3"
          />
        </UFormField>

        <UFormField label="Ważna do" required>
          <UInput
            v-model="form.validUntil"
            type="date"
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
import type { License, LicenseWrite } from '~/types'

const props = defineProps<{
  modelValue: boolean
  license?: License
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  saved: []
}>()

const { $api } = useNuxtApp() as { $api: ReturnType<typeof import('axios').default.create> }
const config = useRuntimeConfig()

const open = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const isEdit = computed(() => !!props.license)

const defaultForm = (): LicenseWrite => ({
  clientName: '',
  clientEmail: '',
  note: '',
  validUntil: '',
})

const form = reactive<LicenseWrite>(defaultForm())
const loading = ref(false)
const error = ref('')

watch(open, (val) => {
  if (val) {
    error.value = ''
    if (props.license) {
      form.clientName = props.license.clientName
      form.clientEmail = props.license.clientEmail
      form.note = props.license.note ?? ''
      form.validUntil = props.license.validUntil.split('T')[0]
    } else {
      Object.assign(form, defaultForm())
    }
  }
})

async function submit() {
  error.value = ''
  loading.value = true
  const headers = { 'X-Admin-Key': config.public.adminKey as string }
  try {
    if (isEdit.value && props.license) {
      await $api.patch(`/api/admin/licenses/${props.license.id}`, form, { headers })
    } else {
      await $api.post('/api/admin/licenses', form, { headers })
    }
    open.value = false
    emit('saved')
  } catch (e: any) {
    error.value = e?.response?.data?.error ?? 'Wystąpił błąd. Spróbuj ponownie.'
  } finally {
    loading.value = false
  }
}
</script>
