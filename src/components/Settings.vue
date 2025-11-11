<template>
  <div class="content-container settings" v-if="isInitialized">
    <h1>{{ $t('settings.title') }}</h1>
    <div class="settings-row">
      <label for="language">{{ $t('settings.chooseLanguage') }}: </label>
      <div class="form-input-container shadow-sm">
        <VueSelect
          name="language"
          v-model="selectedLocale"
          :options="
            availableLocales.map((locale) => ({
              label: locale.name,
              value: locale.code,
              img: flagSrc(locale.code),
            }))
          "
          @option-selected="(option) => changeLocale(option.value)"
          :shouldAutofocusOption="false"
        >
          <template #placeholder>
            <span class="select-option">
              <img :src="flagSrc(currentLocale[0].code)" :alt="currentLocale[0].code" />
              <span>{{ currentLocale[0].name }}</span>
            </span>
          </template>
          <template #value="{ option }">
            <span class="select-option">
              <img v-if="option.img" :src="option.img" class="option-flag" :alt="option.label" />
              <span>{{ option.label }}</span>
            </span>
          </template>

          <template #option="{ option }">
            <span class="select-option">
              <img v-if="option.img" :src="option.img" class="option-flag" :alt="option.label" />
              <span>{{ option.label }}</span>
            </span>
          </template>
        </VueSelect>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getAvailableLocales, getLocale, setLocale } from '@/services/settings.js'
import { ref, onMounted, watch } from 'vue'
import { closeDbConnection } from '@/services/database.js'
import { useI18n } from 'vue-i18n'
import VueSelect from 'vue3-select-component'
const { t } = useI18n()

defineOptions({
  name: 'AppSettings', // zgodnie z zasadą multi-word
})

const currentLocale = ref('')
const availableLocales = ref([])
const selectedLocale = ref('')
const isInitialized = ref(false)

onMounted(async () => {
  currentLocale.value = await getLocale()
  availableLocales.value = await getAvailableLocales()
  isInitialized.value = true
})

const flagMap = {
  pl: new URL('@/assets/flags/pl.svg', import.meta.url).href,
  en: new URL('@/assets/flags/en.svg', import.meta.url).href,
}
function flagSrc(code) {
  return flagMap[code] || ''
}

async function changeLocale(code) {
  // if (selectedLocale.value === code) return
  await setLocale(code)
  closeDbConnection()
  window.location.reload()
}
</script>

<style scoped></style>
