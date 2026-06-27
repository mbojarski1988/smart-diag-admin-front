<template>
  <UModal v-model:open="open" :title="isEdit ? 'Edytuj PID' : 'Nowy PID'">
    <template #body>
      <form class="space-y-4" @submit.prevent="submit">
        <UFormField label="Model auta" required>
          <UInput
            v-model="form.model"
            placeholder="Focus MK3"
            class="w-full"
            required
          />
        </UFormField>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="PID" required>
            <UInput
              v-model="form.pid"
              placeholder="22F40D"
              class="w-full"
              required
            />
          </UFormField>

          <UFormField label="Jednostka">
            <UInput
              v-model="form.unit"
              placeholder="°C, rpm, V"
              class="w-full"
            />
          </UFormField>
        </div>

        <UFormField label="Nazwa" required>
          <UInput
            v-model="form.name"
            placeholder="Temperatura oleju"
            class="w-full"
            required
          />
        </UFormField>

        <UFormField label="Opis">
          <UTextarea
            v-model="form.description"
            placeholder="Krótki opis parametru lub wskazówki diagnostyczne..."
            class="w-full"
            :rows="4"
          />
        </UFormField>

        <UFormField label="Aktywny">
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
import type { KnownPid, KnownPidWrite } from '~/types'
import { getApiErrorMessage } from '~/utils/apiError'

const props = defineProps<{
  modelValue: boolean
  knownPid?: KnownPid
  initialModel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  saved: []
}>()

const $api = useApi()

const open = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const isEdit = computed(() => !!props.knownPid)

const defaultForm = (): KnownPidWrite => ({
  model: props.initialModel?.trim() || '',
  pid: '',
  name: '',
  unit: '',
  description: '',
  active: true,
})

const form = reactive<KnownPidWrite>(defaultForm())
const loading = ref(false)
const error = ref('')

watch(open, (val) => {
  if (!val) return

  error.value = ''

  if (props.knownPid) {
    form.model = props.knownPid.model
    form.pid = props.knownPid.pid
    form.name = props.knownPid.name
    form.unit = props.knownPid.unit ?? ''
    form.description = props.knownPid.description ?? ''
    form.active = props.knownPid.active
  } else {
    Object.assign(form, defaultForm())
  }
})

async function submit() {
  if (loading.value) return

  error.value = ''

  if (!form.model.trim() || !form.pid.trim() || !form.name.trim()) {
    error.value = 'Uzupełnij model auta, PID i nazwę.'
    return
  }

  loading.value = true

  try {
    const payload: KnownPidWrite = {
      model: form.model.trim(),
      pid: form.pid.trim().toUpperCase(),
      name: form.name.trim(),
      unit: form.unit?.trim() || undefined,
      description: form.description?.trim() || undefined,
      active: form.active,
    }

    if (isEdit.value && props.knownPid) {
      await $api.patch(`/api/admin/known-pids/${props.knownPid.id}`, payload)
    } else {
      await $api.post('/api/admin/known-pids', payload)
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
