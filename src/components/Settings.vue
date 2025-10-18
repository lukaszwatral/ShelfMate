<template>
  <div class="content-container settings" v-if="isInitialized">
    <h1>{{ $t('settings.title') }}</h1>
    <div class="settings-row">
      <label for="language">{{ $t('settings.chooseLanguage') }}: </label>
      <div class="dropdown shadow-sm">
        <button
          class="btn btn-secondary dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <span
            >{{ selectedLocale.name }}
            <img :src="flagSrc(selectedLocale.code)" :alt="selectedLocale.code"
          /></span>
        </button>
        <ul class="dropdown-menu">
          <li
            class="shadow-sm"
            v-for="locale in availableLocales"
            :key="locale.code"
            @click="changeLocale(locale.code)"
          >
            {{ locale.name }} <img :src="flagSrc(locale.code)" :alt="locale.code" />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getAvailableLocales, getLocale, setLocale } from '@/services/settings.js'
import { ref, onMounted } from 'vue'
import { closeDbConnection } from '@/services/database.js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineOptions({
  name: 'Settings',
})

const currentLocale = ref('')
const availableLocales = ref([])
const selectedLocale = ref('')
const isInitialized = ref(false)

onMounted(async () => {
  currentLocale.value = await getLocale()
  availableLocales.value = await getAvailableLocales()
  selectedLocale.value = currentLocale.value[0]
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
  if (selectedLocale.value === code) return
  await setLocale(code)
  closeDbConnection()
  window.location.reload()
}
</script>

<style scoped></style>
