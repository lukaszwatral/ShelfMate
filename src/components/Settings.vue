<template>
  <div class="content-container settings" v-if="isInitialized">
    <h1>{{ $t('settings.title') }}</h1>
    <div class="settings-row">
      <label for="language">{{ $t('settings.chooseLanguage') }}: </label>
      <div class="form-input-container">
        <VueSelect
          name="language"
          v-if="isInitialized && currentLocale"
          :modelValue="currentLocale?.code"
          :options="
            availableLocales.map((l) => ({ label: l.name, value: l.code, img: flagSrc(l.code) }))
          "
          @option-selected="(opt) => changeLocale(opt.value)"
          :shouldAutofocusOption="false"
        >
          <template #placeholder>
            <span class="select-option">
              <img
                :src="flagSrc(currentLocale?.code || 'pl')"
                :alt="currentLocale?.code"
                class="option-flag"
              />
              <span>{{ currentLocale?.name }}</span>
            </span>
          </template>
          <template #value="{ option }">
            <span class="select-option">
              <img v-if="option.img" :src="option.img" class="option-flag" />
              <span>{{ option.label }}</span>
            </span>
          </template>
          <template #option="{ option }">
            <span class="select-option">
              <img v-if="option.img" :src="option.img" class="option-flag" />
              <span>{{ option.label }}</span>
            </span>
          </template>
        </VueSelect>
      </div>
    </div>
    <span>{{ $t('settings.importExport') }}</span>
    <p class="text-muted small mb-3">{{ trans('settings.importExportInfo') }}</p>
    <button class="btn btn-primary" @click="handleExport" :disabled="loading">
      <span
        v-if="loading && mode === 'export'"
        class="spinner-border spinner-border-sm me-2"
      ></span>
      <i v-else class="bi bi-download me-2"></i>
      {{ trans('settings.export') }}
    </button>

    <button class="btn btn-secondary" @click="$refs.fileInput.click()" :disabled="loading">
      <span
        v-if="loading && mode === 'import'"
        class="spinner-border spinner-border-sm me-2"
      ></span>
      <i v-else class="bi bi-upload me-2"></i>
      {{ trans('settings.import') }}
    </button>

    <input
      type="file"
      ref="fileInput"
      accept=".json"
      style="display: none"
      @change="handleImport"
    />

    <span class="text-danger">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ trans('settings.clearData') }}
    </span>
    <p class="text-muted small mb-3" v-html="trans('settings.clearDataInfo')"></p>
    <button class="btn btn-danger" @click="handleFactoryReset" :disabled="loading">
      <i class="bi bi-trash3-fill me-2"></i>{{ trans('settings.clearDataButton') }}
    </button>
  </div>
</template>

<script>
import VueSelect from 'vue3-select-component';
import { trans } from '@/translations/translator.js';
import { flagSrc } from '@/Enum/FlagMapEnum.js';
import { Setting, settingRepository } from '@/db/index.js';
import { localeRepository } from '@/db/repositories/LocaleRepository.js';
import { backupRepository } from '@/db/repositories/BackupRepository';
import { backupService } from '@/services/BackupService';
import { Toast } from '@capacitor/toast';

export default {
  name: 'Settings',
  components: { VueSelect },
  data() {
    return {
      currentLocale: {},
      availableLocales: [],
      isInitialized: false,
      loading: false,
      mode: null,
    };
  },
  async mounted() {
    try {
      const localeCode = await settingRepository.getValue('locale');
      this.availableLocales = await localeRepository.findAll();

      const foundLocale = this.availableLocales.find((l) => l.code === localeCode);

      this.currentLocale = foundLocale ||
        this.availableLocales[0] || { code: 'pl', name: 'Polski' };

      this.isInitialized = true;
    } catch (e) {
      console.error('Błąd inicjalizacji ustawień:', e);
      this.currentLocale = { code: 'pl', name: 'Polski' };
      this.isInitialized = true;
    }
  },
  methods: {
    flagSrc,
    trans,
    async changeLocale(code) {
      const newSetting = new Setting({ key: 'locale', value: code });
      await settingRepository.save(newSetting);
      const i18n = this.$.appContext.provides.i18n;
      if (i18n) {
        i18n.global.locale.value = code;
        this.currentLocale =
          this.availableLocales.find((l) => l.code === code) || this.currentLocale;
      }
    },

    async handleExport() {
      this.loading = true;
      this.mode = 'export';
      try {
        await backupService.exportBackup();
        setTimeout(async () => {
          await Toast.show({
            text: trans('settings.exportSuccess', {}, this.$.appContext.provides.i18n),
            duration: 'short',
          });
        }, 500);
      } catch (e) {
        alert(trans('settings.error') + ': ' + e.message);
      } finally {
        this.loading = false;
        this.mode = null;
      }
    },

    async handleImport(event) {
      const file = event.target.files[0];
      if (!file) return;
      event.target.value = '';

      if (!confirm(trans('settings.importConfirm', {}, this.$.appContext.provides.i18n))) return;

      this.loading = true;
      this.mode = 'import';

      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const jsonContent = e.target.result;
          await backupService.importBackup(jsonContent);
          await Toast.show({
            text: trans('settings.importNotification', {}, this.$.appContext.provides.i18n),
            duration: 'long',
          });
          setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
          alert(trans('settings.error') + ': ' + err.message);
          this.loading = false;
          this.mode = null;
        }
      };

      reader.onerror = () => {
        alert(trans('settings.error') + ': ' + reader.error.message);
        this.loading = false;
        this.mode = null;
      };

      reader.readAsText(file);
    },

    async handleFactoryReset() {
      if (!confirm(trans('settings.clearDataConfirm', {}, this.$.appContext.provides.i18n))) return;

      this.loading = true;
      try {
        await backupRepository.performFactoryReset();
        setTimeout(async () => {
          await Toast.show({
            text: trans('settings.clearDataNotification', {}, this.$.appContext.provides.i18n),
            duration: 'short',
          });
        }, 1000);
        setTimeout(() => window.location.reload(), 1000);
      } catch (e) {
        console.error(e);
        alert(trans('settings.error') + ': ' + e.message);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.settings {
  padding: 1rem;
}
.settings-row {
  margin-bottom: 1rem;
}
.option-flag {
  width: 20px;
  height: 15px;
  margin-right: 8px;
  object-fit: cover;
  border-radius: 2px;
}
.select-option {
  display: flex;
  align-items: center;
}
.danger-zone {
  opacity: 0.9;
}
</style>
