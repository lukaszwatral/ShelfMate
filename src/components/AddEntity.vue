<template>
  <div class="add-entity-container">
    <EntityPreview :new-entity="newEntity" :initial-icon="initialIcon" v-if="mode !== 'view'" />

    <form @submit.prevent="onSubmit" autocomplete="off">
      <div class="form-input-container">
        <label for="type" class="form-label">
          {{ trans('addEntity.type') }}: <span class="required-field">*</span>
        </label>
        <VueSelect
          v-model="newEntity.type"
          name="type"
          :options="typeOptions"
          :placeholder="trans('addEntity.typeDefault')"
          :isClearable="false"
          :isSearchable="false"
          :isDisabled="isView"
        >
          <template #option="{ option }">
            <span class="select-option">
              <i v-if="option.icon" :class="`bi bi-${option.icon}`"></i>
              <span>{{ option.label }}</span>
            </span>
          </template>
          <template #value="{ option }">
            <span class="select-option">
              <i v-if="option.icon" :class="`bi bi-${option.icon}`"></i>
              <span>{{ option.label }}</span>
            </span>
          </template>
        </VueSelect>
      </div>

      <template v-if="newEntity.type">
        <div class="form-input-container">
          <label for="parent" class="form-label">{{ trans('addEntity.parentEntity') }}:</label>
          <VueSelect
            v-model="newEntity.parentId"
            name="parent"
            :options="parentOptions"
            :placeholder="trans('addEntity.null')"
            :isDisabled="isView"
          >
            <template #option="{ option }">
              <span class="select-option">
                <i v-if="option.icon" :class="`bi bi-${option.icon}`"></i>
                <span>{{ option.label }}</span>
              </span>
            </template>
            <template #value="{ option }">
              <span class="select-option">
                <i v-if="option.icon" :class="`bi bi-${option.icon}`"></i>
                <span>{{ option.label }}</span>
              </span>
            </template>
          </VueSelect>
        </div>

        <div class="form-input-container" v-if="newEntity.type !== 'category'">
          <label for="category" class="form-label">{{ trans('addEntity.category') }}:</label>
          <VueSelect
            v-model="newEntity.categoryId"
            name="category"
            :options="categoryOptions"
            :placeholder="trans('addEntity.null')"
            :isDisabled="isView"
          >
            <template #option="{ option }">
              <span class="select-option">
                <i v-if="option.icon" :class="`bi bi-${option.icon}`"></i>
                <span>{{ option.label }}</span>
              </span>
            </template>
            <template #value="{ option }">
              <span class="select-option">
                <i v-if="option.icon" :class="`bi bi-${option.icon}`"></i>
                <span>{{ option.label }}</span>
              </span>
            </template>
          </VueSelect>
        </div>

        <div class="form-input-container">
          <label for="name" class="form-label">
            {{ trans('addEntity.name') }}: <span class="required-field">*</span>
          </label>
          <input
            id="name"
            type="text"
            class="form-control input-inset"
            :placeholder="trans('addEntity.namePlaceholder')"
            required
            v-model="newEntity.name"
            autocomplete="off"
            :readonly="isView"
          />
        </div>

        <div class="form-input-container">
          <label for="description" class="form-label">{{ trans('addEntity.description') }}:</label>
          <textarea
            id="description"
            class="form-control"
            :placeholder="trans('addEntity.descriptionPlaceholder')"
            v-model="newEntity.description"
            autocomplete="off"
            :readonly="isView"
          />
        </div>

        <div class="form-input-container">
          <label for="code" class="form-label"> {{ trans('addEntity.code') }}: </label>
          <span class="tooltip-container">
            <i class="bi bi-info-circle-fill"></i>
            <span class="tooltip-text">{{ trans('addEntity.codeTooltip') }}</span>
          </span>
          <div class="input-with-icon form-control">
            <input
              id="code"
              type="text"
              class="form-control"
              placeholder=""
              v-model="code"
              autocomplete="off"
              :readonly="isView"
            />
            <i v-if="!isView" class="bi bi-upc-scan" @click="scanBarcode"></i>
          </div>
        </div>

        <TemplateCustomFields
          v-if="templateCustomFields.length > 0"
          :fields="templateCustomFields"
          v-model="templateCustomFieldsValues"
          :readonly="isView"
        />

        <AttributeManager v-if="isAdd || isEdit" v-model="attributes" />
      </template>

      <button
        v-if="!isView"
        class="add-container-right shadow-sm"
        style="border: none"
        type="submit"
        :disabled="!newEntity.type"
      >
        <button class="add-circle-btn">
          <i v-if="isAdd" class="bi bi-plus icon-large"></i>
          <i v-else class="bi bi-save icon-large"></i>
        </button>
        <span class="add-label">
          {{ isAdd ? trans('home.addEntity') : trans('addEntity.saveChanges') }}
        </span>
      </button>
    </form>
  </div>
</template>

<script>
import { trans } from '@/translations/translator.js';
import VueSelect from 'vue3-select-component';
import 'vue3-select-component/styles';
import {
  Code,
  codeRepository,
  CustomField,
  customFieldRepository,
  CustomFieldValue,
  customFieldValueRepository,
  Entity,
  entityRepository,
  File,
  fileRepository,
} from '@/db/index.js';
import { Filesystem, Directory } from '@capacitor/filesystem';
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerTypeHint,
} from '@capacitor/barcode-scanner';

// Importy nowych komponentów
import EntityPreview from '@/components/AddEntity/EntityPreview.vue';
import TemplateCustomFields from '@/components/AddEntity/TemplateCustomFields.vue';
import AttributeManager from '@/components/AddEntity/AttributeManager.vue';
import toast from 'bootstrap/js/src/toast.js';
import { Toast } from '@capacitor/toast';

export default {
  name: 'AddEntity',
  props: {
    initialType: {
      type: String,
      default: null,
    },
    mode: {
      type: String,
      default: 'add', // 'add' | 'view' | 'edit'
      validator: (v) => ['add', 'view', 'edit'].includes(v),
    },
    entityId: {
      type: [Number, String],
      default: null,
    },
  },
  components: {
    VueSelect,
    EntityPreview,
    TemplateCustomFields,
    AttributeManager,
  },
  data() {
    return {
      allEntities: [],
      allCategories: [],
      newEntity: new Entity(),
      code: null,
      initialIcon: 'question',
      loadingEntity: false,

      // Dane dla komponentów potomnych
      templateCustomFields: [],
      templateCustomFieldsValues: {}, // Obiekt klucz-wartość
      attributes: [], // Lista dynamicznych atrybutów
    };
  },
  async mounted() {
    if (this.mode === 'add') {
      this.newEntity.type = this.initialType;
    }
    await this.fetchEntities();
    if ((this.isEdit || this.isView) && this.entityId) {
      await this.loadEntity(this.entityId);
    }
  },
  computed: {
    isAdd() {
      return this.mode === 'add';
    },
    isEdit() {
      return this.mode === 'edit';
    },
    isView() {
      return this.mode === 'view';
    },
    typeOptions() {
      return [
        { label: trans('addEntity.category'), value: 'category', icon: 'tag-fill' },
        { label: trans('addEntity.place'), value: 'place', icon: 'box-seam-fill' },
        { label: trans('addEntity.item'), value: 'item', icon: 'bag-fill' },
      ];
    },
    parentOptions() {
      return [
        { label: trans('addEntity.null'), value: null },
        ...(this.newEntity.type === 'category'
          ? this.allCategories.map((cat) => ({
              label: `${cat.name} (${trans('addEntity.' + cat.type)})`,
              value: cat.id,
              icon: cat.icon || 'tag-fill',
            }))
          : this.allEntities.map((ent) => ({
              label: `${ent.name} (${trans('addEntity.' + ent.type)})`,
              value: ent.id,
              icon: ent.icon || (ent.type === 'item' ? 'bag-fill' : 'box-seam-fill'),
            }))),
      ];
    },
    categoryOptions() {
      return this.allCategories.map((cat) => ({
        label: cat.name,
        value: cat.id,
        icon: cat.icon || 'tag-fill',
      }));
    },
  },
  methods: {
    trans,
    async fetchEntities() {
      try {
        const entities = await entityRepository.findAll();
        this.allEntities = entities.filter((ent) => ent.type !== 'category');
        this.allCategories = entities.filter((ent) => ent.type === 'category');
      } catch (error) {
        console.error('Error fetching entities:', error);
      }
    },
    async scanBarcode() {
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: CapacitorBarcodeScannerTypeHint.ALL,
      });
      this.code = result.ScanResult;
    },
    async saveFileToDevice(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target.result.split(',')[1];
          const fileName = Date.now() + '_' + file.name;
          try {
            const result = await Filesystem.writeFile({
              path: fileName,
              data: base64,
              directory: Directory.Data,
            });
            resolve(result.uri);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    async fetchTemplateCustomFields() {
      // Zbierz pola z szablonu kategorii (jeśli wybrana) oraz pola przypięte bezpośrednio do encji (atrybuty)
      const fields = [];

      // 1) Pola z kategorii (szablon)
      if (this.newEntity.categoryId) {
        try {
          const templateFields = await customFieldRepository.findByCategoryTemplate(
            this.newEntity.categoryId,
          );
          fields.push(...templateFields);
        } catch (e) {
          console.error('Error fetching template fields:', e);
        }
      }

      // 2) Pola przypięte bezpośrednio do encji (atrybuty) – tylko w trybach view/edit i dla istniejącej encji
      try {
        const isExisting = this.isEdit || this.isView;
        const entityId = this.newEntity?.getId ? this.newEntity.getId() : this.newEntity?.id;
        if (isExisting && entityId) {
          const entityFields = await customFieldRepository.findByEntity(Number(entityId));
          // TemplateCustomFields obsługuje textarea oraz input type dla prostych typów.
          const allowedTypes = new Set([
            'text',
            'number',
            'date',
            'datetime',
            'textarea',
            'color',
            'url',
            'email',
          ]);
          const filtered = entityFields.filter((f) => allowedTypes.has(f.fieldType));
          fields.push(...filtered);
        }
      } catch (e) {
        console.error('Error fetching entity fields:', e);
      }

      // Ustaw zebrane pola (kolejność wg sort_order – już sortowane w repozytoriach)
      this.templateCustomFields = fields;
      // Reset wartości pól przy zmianie zestawu pól (np. zmiana kategorii)
      if (!this.loadingEntity) {
        this.templateCustomFieldsValues = {};
      }
    },

    // --- GŁÓWNA METODA ZAPISU ---
    async addEntity() {
      try {
        // 1. Zapis Encji
        const addedEntity = await entityRepository.save(this.newEntity);

        // 2. Zapis Kodu
        if (this.code) {
          const code = new Code();
          code.setCodeValue(this.code);
          code.setEntityId(addedEntity);
          await codeRepository.save(code);
        }

        // 3. Zapis Pól Szablonowych
        if (Object.keys(this.templateCustomFieldsValues).length > 0) {
          for (const [fieldId, value] of Object.entries(this.templateCustomFieldsValues)) {
            const valueObj = new CustomFieldValue();
            valueObj
              .setEntityId(addedEntity)
              .setCustomFieldId(fieldId)
              .setFieldValue(JSON.stringify(value));
            await customFieldValueRepository.save(valueObj);
          }
        }

        // 4. Zapis Dynamicznych Atrybutów (z komponentu AttributeManager)
        if (this.attributes.length > 0) {
          for (const [idx, attr] of this.attributes.entries()) {
            // Tworzenie definicji pola
            const field = new CustomField();
            field
              .setEntityId(addedEntity)
              .setFieldName(attr.name)
              .setFieldType(attr.type)
              .setOptions(JSON.stringify(attr.options) || '')
              .setIsRequired(attr.required)
              .setSortOrder(idx);

            if (this.newEntity.type === 'category') {
              field.setCategoryTemplateId(addedEntity);
            }

            const insertedField = await customFieldRepository.save(field);
            const valueObj = new CustomFieldValue();
            valueObj.setEntityId(addedEntity).setCustomFieldId(insertedField);

            // Obsługa plików i obrazów
            if (
              (attr.type === 'image' || attr.type === 'file') &&
              attr.value &&
              attr.value.length
            ) {
              const fileIds = [];
              for (const fileObj of attr.value) {
                // Zapisz fizycznie na urządzeniu
                const filePath = await this.saveFileToDevice(fileObj.file);

                // Zapisz wpis w tabeli plików
                const file = new File();
                file.setEntityId(addedEntity);
                file.setFileName(fileObj.file.name);
                file.setMimeType(fileObj.file.type);
                file.setFilePath(filePath);
                file.setIsPrimary(fileObj.isPrimary || false);
                const addedFile = await fileRepository.save(file);
                fileIds.push(addedFile);
              }
              valueObj.setFieldValue(JSON.stringify(fileIds));
            } else {
              valueObj.setFieldValue(JSON.stringify(attr.value) || '');
            }

            await customFieldValueRepository.save(valueObj);
          }
        }

        this.newEntity = new Entity();
        this.newEntity.type = null;
        this.attributes = [];
        this.templateCustomFieldsValues = {};
        this.code = null;
        await this.fetchEntities();
        setTimeout(async () => {
          await Toast.show({
            text: trans('addEntity.entityAdded', {}, this.$.appContext.provides.i18n),
            duration: 'short',
          });
        }, 500);
      } catch (error) {
        console.error('Error adding entity:', error);
      }
    },
    async loadEntity(id) {
      try {
        this.loadingEntity = true;
        const entity = await entityRepository.find(Number(id));
        if (!entity) return;
        // Ustaw encję w formularzu
        this.newEntity = entity;
        // Czyścimy listę nowych atrybutów (w trybie edycji służy do dodawania nowych)
        this.attributes = [];

        // Ikona początkowa
        switch (entity.type) {
          case 'category':
            this.initialIcon = 'tag-fill';
            break;
          case 'place':
            this.initialIcon = 'box-seam-fill';
            break;
          case 'item':
            this.initialIcon = 'bag-fill';
            break;
        }

        // Kod
        const codes = await codeRepository.findBy({ entityId: entity.getId() });
        if (codes && codes.length > 0) {
          this.code = codes[0].getCodeValue();
        } else {
          this.code = null;
        }

        // Pola szablonu dla kategorii encji + pola przypięte do encji (atrybuty)
        await this.fetchTemplateCustomFields();

        // Załaduj wartości pól i przypisz do pól szablonowych
        const values = await customFieldValueRepository.findByEntityWithFields(entity.getId());
        const fieldIds = new Set(this.templateCustomFields.map((f) => f.id));
        const mapped = {};
        for (const v of values) {
          if (fieldIds.has(v.customFieldId)) {
            try {
              mapped[v.customFieldId] = v.fieldValue ? JSON.parse(v.fieldValue) : '';
            } catch (e) {
              mapped[v.customFieldId] = v.fieldValue;
            }
          }
        }
        this.templateCustomFieldsValues = mapped;
      } catch (e) {
        console.error('Error loading entity:', e);
      } finally {
        this.loadingEntity = false;
      }
    },
    async updateEntity() {
      try {
        // Aktualizacja encji
        const id = await entityRepository.save(this.newEntity);

        // Aktualizacja/Usunięcie/Zapis kodu
        const existingCodes = await codeRepository.findBy({ entityId: id });
        const existing = existingCodes && existingCodes.length > 0 ? existingCodes[0] : null;

        if (this.code && this.code.toString().length > 0) {
          if (existing) {
            existing.setCodeValue(this.code);
            await codeRepository.save(existing);
          } else {
            const c = new Code();
            c.setEntityId(id).setCodeValue(this.code);
            await codeRepository.save(c);
          }
        } else if (existing) {
          // Usunięcie kodu jeśli wyczyszczono
          await codeRepository.remove(existing);
        }

        // Zapis wartości pól szablonowych
        if (Object.keys(this.templateCustomFieldsValues).length > 0) {
          for (const [fieldId, value] of Object.entries(this.templateCustomFieldsValues)) {
            await customFieldValueRepository.setFieldValue(
              id,
              Number(fieldId),
              JSON.stringify(value),
            );
          }
        }

        // Zapis nowych dynamicznych atrybutów dodanych w trybie edycji
        if (this.attributes.length > 0) {
          for (const [idx, attr] of this.attributes.entries()) {
            // Tworzenie definicji pola
            const field = new CustomField();
            field
              .setEntityId(id)
              .setFieldName(attr.name)
              .setFieldType(attr.type)
              .setOptions(JSON.stringify(attr.options) || '')
              .setIsRequired(attr.required)
              .setSortOrder(idx);

            if (this.newEntity.type === 'category') {
              field.setCategoryTemplateId(id);
            }

            const insertedField = await customFieldRepository.save(field);
            const valueObj = new CustomFieldValue();
            valueObj.setEntityId(id).setCustomFieldId(insertedField);

            // Obsługa plików i obrazów
            if (
              (attr.type === 'image' || attr.type === 'file') &&
              attr.value &&
              attr.value.length
            ) {
              const fileIds = [];
              for (const fileObj of attr.value) {
                // Zapisz fizycznie na urządzeniu
                const filePath = await this.saveFileToDevice(fileObj.file);

                // Zapisz wpis w tabeli plików
                const file = new File();
                file.setEntityId(id);
                file.setFileName(fileObj.file.name);
                file.setMimeType(fileObj.file.type);
                file.setFilePath(filePath);
                file.setIsPrimary(fileObj.isPrimary || false);
                const addedFile = await fileRepository.save(file);
                fileIds.push(addedFile);
              }
              valueObj.setFieldValue(JSON.stringify(fileIds));
            } else {
              valueObj.setFieldValue(JSON.stringify(attr.value) || '');
            }

            await customFieldValueRepository.save(valueObj);
          }

          // Wyczyść listę dodawanych atrybutów po zapisie
          this.attributes = [];

          // Odśwież dostępne pola i ich wartości, aby nowe atrybuty były widoczne bez przeładowania
          await this.fetchTemplateCustomFields();
          const values = await customFieldValueRepository.findByEntityWithFields(id);
          const fieldIds = new Set(this.templateCustomFields.map((f) => f.id));
          const mapped = {};
          for (const v of values) {
            if (fieldIds.has(v.customFieldId)) {
              try {
                mapped[v.customFieldId] = v.fieldValue ? JSON.parse(v.fieldValue) : '';
              } catch (e) {
                mapped[v.customFieldId] = v.fieldValue;
              }
            }
          }
          this.templateCustomFieldsValues = mapped;
        }

        setTimeout(async () => {
          await Toast.show({
            text: trans('addEntity.entityUpdated', {}, this.$.appContext.provides.i18n),
            duration: 'short',
          });
        }, 300);
      } catch (e) {
        console.error('Error updating entity:', e);
      }
    },
    onSubmit() {
      if (this.isView) return;
      if (this.isEdit) return this.updateEntity();
      return this.addEntity();
    },
  },
  watch: {
    'newEntity.type'(newVal, oldVal) {
      if (!this.loadingEntity && newVal !== oldVal) {
        // Reset powiązań tylko podczas realnej zmiany przez użytkownika
        this.newEntity.parentId = null;
        this.newEntity.categoryId = null;
      }
      switch (newVal) {
        case 'category':
          this.initialIcon = 'tag-fill';
          break;
        case 'place':
          this.initialIcon = 'box-seam-fill';
          break;
        case 'item':
          this.initialIcon = 'bag-fill';
          break;
      }
    },
    'newEntity.categoryId'() {
      this.fetchTemplateCustomFields();
    },
  },
};
</script>

<style scoped>
.required-field {
  color: red;
}
</style>
