<template>
  <div class="content-container settings" v-if="isInitialized">
    <h1>{{ $t('settings.title') }}</h1>
    <div class="settings-row">
      <label for="language">{{ $t('settings.chooseLanguage') }}: </label>
      <div class="form-input-container shadow-sm">
        <VueSelect
          name="language"
          v-if="isInitialized"
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
import VueSelect from 'vue3-select-component';
import { trans } from '@/translations/translator.js';
import { flagSrc } from '@/Enum/FlagMapEnum.js';
import { Setting, settingRepository } from '@/db/index.js';
import { localeRepository } from '@/db/repositories/LocaleRepository.js';

export default {
  name: 'Settings',
  components: { VueSelect },
  data() {
    return {
      currentLocale: '',
      availableLocales: [],
      isInitialized: false,
    };
  },
  async mounted() {
    const localeCode = await settingRepository.getValue('locale');
    this.availableLocales = await localeRepository.findAll();
    this.currentLocale =
      this.availableLocales.find((l) => l.code === localeCode) || this.availableLocales[0];
    this.isInitialized = true;
  },

  methods: {
    flagSrc,
    trans,
    async changeLocale(code) {
      const newSetting = new Setting({ key: 'locale', value: code });
      await settingRepository.save(newSetting);
      // Dynamiczna zmiana języka bez reloadu
      const i18n = this.$.appContext.provides.i18n;
      if (i18n) {
        i18n.global.locale.value = code;
        this.currentLocale = this.availableLocales.find((l) => l.code === code);
      } else {
        console.warn('Nie znaleziono instancji i18n');
      }
    },
  },
};
</script>
<style scoped></style>
