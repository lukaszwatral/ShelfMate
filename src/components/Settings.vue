<template>
  <div class="content-container settings" v-if="isInitialized">
    <h1>{{ $t('settings.title') }}</h1>
    <div class="settings-row">
      <label for="language">{{ $t('settings.chooseLanguage') }}: </label>
      <div class="form-input-container shadow-sm">
        <VueSelect
          name="language"
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
              <img :src="flagSrc(currentLocale.code)" :alt="currentLocale.code" />
              <span>{{ currentLocale.name }}</span>
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

<script>
import VueSelect from 'vue3-select-component'
import { trans } from '@/translations/translator.js'
import { setLocale, getLocale, getAvailableLocales } from '@/services/settings.js'
import { closeDbConnection } from '@/services/database.js'
import { flagSrc } from '@/Enum/FlagMapEnum.js'

export default {
  name: 'Settings',
  components: { VueSelect },
  data() {
    return {
      currentLocale: '',
      availableLocales: [],
      isInitialized: false,
    }
  },
  async mounted() {
    this.currentLocale = await getLocale()
    this.availableLocales = await getAvailableLocales()
    this.isInitialized = true
  },
  methods: {
    flagSrc,
    trans,
    async changeLocale(code) {
      await setLocale(code)
      closeDbConnection()
      window.location.reload()
    },
  },
}
</script>
<style scoped></style>
