<template>
  <div class="add-entity-container">
    <EntityPreview :new-entity="newEntity" :initial-icon="initialIcon" v-if="mode !== 'view'" />

    <form @submit.prevent="onSubmit" autocomplete="off" novalidate>
      <div class="form-input-container">
        <label for="type" class="form-label">
          {{ trans('addEntity.type') }}: <span class="required-field">*</span>
        </label>
        <div :class="{ 'is-invalid-select': errors.type }">
          <VueSelect
            v-model="newEntity.type"
            name="type"
            :options="typeOptions"
            :placeholder="trans('addEntity.typeDefault')"
            :isClearable="false"
            :isSearchable="false"
            :isDisabled="isView"
            @option-selected="clearError('type')"
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
        <div v-if="errors.type" class="text-danger small mt-1">
          {{ errors.type }}
        </div>
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
            :class="{ 'is-invalid': errors.name }"
            :placeholder="trans('addEntity.namePlaceholder')"
            v-model="newEntity.name"
            @input="clearError('name')"
            autocomplete="off"
            :readonly="isView"
          />
          <div v-if="errors.name" class="invalid-feedback">
            {{ errors.name }}
          </div>
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
          <div class="input-with-icon form-control">
            <input
              id="code"
              type="text"
              class="form-control"
              placeholder=""
              v-model="code.value"
              autocomplete="off"
              :readonly="isView"
            />
            <i v-if="!isView" class="bi bi-upc-scan" @click="scanBarcode"></i>
          </div>
          <div v-if="errors.code && mode !== 'view'" class="text-danger small mt-1">
            {{ errors.code }}
          </div>
        </div>

        <div class="form-input-container d-flex align-items-center gap-3">
          <label class="form-label mb-0">Tag NFC:</label>

          <div class="nfc-icon-wrapper" @click="!isView ? openNfcModal() : null">
            <i class="bi bi-broadcast nfc-status-icon" :class="nfcIconClass"></i>
          </div>

          <div v-if="nfcCode.value && !isView" class="nfc-icon-wrapper ms-2" @click="removeNfcTag">
            <i class="bi bi-trash text-danger" style="font-size: 1.4rem"></i>
          </div>

          <span class="small text-muted" v-if="!isView">
            <span v-if="nfcState === 'empty'">{{ trans('addEntity.nfc.empty') }}</span>
            <span v-if="nfcState === 'valid'">{{ trans('addEntity.nfc.valid') }}</span>
            <span v-if="nfcState === 'error'" class="text-danger">{{
              trans('addEntity.nfc.error')
            }}</span>
          </span>
        </div>

        <TemplateCustomFields
          ref="templateFieldsRef"
          v-if="templateCustomFields.length > 0"
          :fields="templateCustomFields"
          v-model="templateCustomFieldsValues"
          :readonly="isView"
        />

        <AttributeManager ref="attributeManagerRef" v-if="isAdd || isEdit" v-model="attributes" />
      </template>

      <div v-if="hasErrors && !isView" class="alert alert-danger mt-3 mb-3 text-center small-alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ trans('validation.fixErrors', {}, this.$.appContext.provides.i18n) }}
      </div>

      <button
        v-if="!isView"
        class="add-container-right shadow-sm"
        style="border: none"
        type="submit"
      >
        <span class="add-circle-btn">
          <i v-if="isAdd" class="bi bi-plus icon-large"></i>
          <i v-else class="bi bi-save icon-large"></i>
        </span>
        <span class="add-label">
          {{ isAdd ? trans('home.addEntity') : trans('addEntity.saveChanges') }}
        </span>
      </button>
      <div class="entity-actions-view" v-if="isView">
        <button @click.stop.prevent="redirectToEdit">
          <i class="bi bi-pencil-square"></i>
        </button>

        <button @click.stop.prevent="toggleRemoveAction">
          <i class="bi bi-trash-fill"></i>
        </button>
      </div>
    </form>

    <div v-if="showNfcModal" class="nfc-modal-overlay">
      <div class="nfc-modal-content text-center shadow">
        <div class="mb-4">
          <i class="bi bi-broadcast display-1 text-primary blink-animation"></i>
        </div>
        <h4>{{ trans('addEntity.nfc.scanning') }}</h4>
        <p class="text-muted">{{ trans('addEntity.nfc.scanningInfo') }}</p>
        <button class="btn btn-outline-secondary mt-3" @click="closeNfcModal">
          {{ trans('addEntity.nfc.cancel') }}
        </button>
      </div>
    </div>
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
import { CapacitorNfc } from '@capgo/capacitor-nfc';
import EntityPreview from '@/components/AddEntity/EntityPreview.vue';
import TemplateCustomFields from '@/components/AddEntity/TemplateCustomFields.vue';
import AttributeManager from '@/components/AddEntity/AttributeManager.vue';
import { Toast } from '@capacitor/toast';
import { HistoryService } from '@/services/HistoryService.js';
import { Dialog } from '@capacitor/dialog';

export default {
  name: 'AddEntity',
  props: {
    initialType: { type: String, default: null },
    mode: { type: String, default: 'add', validator: (v) => ['add', 'view', 'edit'].includes(v) },
    entityId: { type: [Number, String], default: null },
  },
  components: { VueSelect, EntityPreview, TemplateCustomFields, AttributeManager },
  data() {
    return {
      allEntities: [],
      allCategories: [],
      newEntity: new Entity(),
      code: { type: 'manual', value: null },

      nfcCode: { value: null },
      nfcState: 'empty',
      showNfcModal: false,
      isScanningNfc: false,

      initialIcon: 'question',
      loadingEntity: false,
      templateCustomFields: [],
      templateCustomFieldsValues: {},
      attributes: [],
      errors: {},
    };
  },
  async mounted() {
    if (this.mode === 'add') {
      this.newEntity.type = this.initialType;
    }
    await this.fetchEntities();

    if (this.isView || this.isEdit) {
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
    hasErrors() {
      return Object.values(this.errors).some((error) => !!error);
    },

    nfcIconClass() {
      if (this.nfcState === 'valid') return 'text-success';
      if (this.nfcState === 'error') return 'text-danger';
      return 'text-secondary';
    },

    typeOptions() {
      return [
        { label: trans('addEntity.category'), value: 'category', icon: 'tag-fill' },
        { label: trans('addEntity.place'), value: 'place', icon: 'box-seam-fill' },
        { label: trans('addEntity.item'), value: 'item', icon: 'bag-fill' },
      ];
    },
    parentOptions() {
      return (this.newEntity.type === 'category' ? this.allCategories : this.allEntities).map(
        (ent) => ({
          label: `${ent.name} (${trans('addEntity.' + ent.type, {}, this.$.appContext.provides.i18n)})`,
          value: ent.id,
          icon: ent.icon || (ent.type === 'item' ? 'bag-fill' : 'box-seam-fill'),
        }),
      );
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
      this.code.type = result.format ? CapacitorBarcodeScannerTypeHint[result.format] : 'manual';
      this.code.value = result.ScanResult;
    },

    async openNfcModal() {
      this.showNfcModal = true;
      this.nfcState = 'empty';
      this.isScanningNfc = true;
      try {
        await CapacitorNfc.removeAllListeners();
        await CapacitorNfc.addListener('nfcEvent', async (event) => {
          const tag = event.tag || event;
          if (tag.id) {
            const hexId = tag.id
              .map((byte) => ('0' + (byte & 0xff).toString(16)).slice(-2))
              .join(':')
              .toUpperCase();

            await this.checkNfcUniqueness(hexId);
          }
        });
        await CapacitorNfc.startScanning({ invalidateAfterFirstRead: true });
      } catch (e) {
        console.error(e);
        this.showNfcModal = false;
        await Toast.show({
          text: trans('addEntity.nfc.nfcError', {}, this.$.appContext.provides.i18n),
          duration: 'long',
        });
      }
    },

    async closeNfcModal() {
      this.showNfcModal = false;
      this.isScanningNfc = false;
      try {
        await CapacitorNfc.removeAllListeners();
        await CapacitorNfc.stopScanning();

        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('restart-global-nfc'));
        }, 200);
      } catch (e) {}
    },

    removeNfcTag() {
      this.nfcCode.value = null;
      this.nfcState = 'empty';
      if (this.errors.nfc) delete this.errors.nfc;
    },

    async checkNfcUniqueness(hexId) {
      const existing = await codeRepository.findBy({ codeType: 'nfc', codeValue: hexId });
      const isDuplicate =
        existing &&
        existing.length > 0 &&
        (!this.newEntity.id || existing[0].getEntityId() !== this.newEntity.id);

      if (isDuplicate) {
        this.nfcState = 'error';
        this.nfcCode.value = null;
      } else {
        this.nfcState = 'valid';
        this.nfcCode.value = hexId;
      }

      await this.closeNfcModal();
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
    async prepareAttributesWithFiles(attributes) {
      const processed = [];
      for (const attr of attributes) {
        const newAttr = { ...attr };
        if ((attr.type === 'image' || attr.type === 'file') && attr.value?.length) {
          const filePaths = [];
          for (const fileObj of attr.value) {
            if (fileObj.file instanceof File || fileObj.file instanceof Blob) {
              const path = await this.saveFileToDevice(fileObj.file);
              filePaths.push({
                name: fileObj.file.name,
                type: fileObj.file.type,
                isPrimary: fileObj.isPrimary || false,
                path: path,
              });
            } else {
              filePaths.push(fileObj);
            }
          }
          newAttr.savedFiles = filePaths;
        }
        processed.push(newAttr);
      }
      return processed;
    },

    async fetchTemplateCustomFields() {
      const fields = [];
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
      try {
        const isExisting = this.isEdit || this.isView;
        const entityId = this.newEntity?.getId ? this.newEntity.getId() : this.newEntity?.id;
        if (isExisting && entityId) {
          const entityFields = await customFieldRepository.findByEntity(Number(entityId));
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
      this.templateCustomFields = fields;
      if (!this.loadingEntity) {
        this.templateCustomFieldsValues = {};
      }
    },

    validateForm() {
      const existingCodeError = this.errors.code;
      const existingNfcError = this.errors.nfc;
      this.errors = {};
      if (existingCodeError) this.errors.code = existingCodeError;
      if (existingNfcError) this.errors.nfc = existingNfcError;

      let isValid = true;

      if (!this.newEntity.type) {
        this.errors.type = trans('validation.required', {}, this.$.appContext.provides.i18n);
        isValid = false;
      }
      if (
        !this.newEntity.name ||
        this.newEntity.name.trim().length < 3 ||
        this.newEntity.name.trim().length > 255
      ) {
        this.errors.name = trans('validation.nameLength', {}, this.$.appContext.provides.i18n);
        isValid = false;
      }
      if (this.$refs.templateFieldsRef && !this.$refs.templateFieldsRef.validateFields())
        isValid = false;
      if (this.$refs.attributeManagerRef && !this.$refs.attributeManagerRef.validateAttributes())
        isValid = false;

      if (this.hasErrors) isValid = false;
      return isValid;
    },
    clearError(field) {
      if (this.errors[field]) delete this.errors[field];
    },

    resetForm() {
      this.newEntity = new Entity();
      this.newEntity.type = null;
      this.attributes = [];
      this.templateCustomFieldsValues = {};
      this.code = { type: 'manual', value: null };

      this.nfcCode = { value: null };
      this.nfcState = 'empty';

      this.errors = {};
    },

    async addEntity() {
      try {
        const preparedAttributes = await this.prepareAttributesWithFiles(this.attributes);
        const entityId = await entityRepository.createWithRelatedData(
          this.newEntity,
          this.code,
          this.templateCustomFieldsValues,
          preparedAttributes,
        );

        if (this.nfcCode.value && this.nfcState === 'valid') {
          const nfc = new Code();
          nfc.setEntityId(entityId);
          nfc.setCodeType('nfc');
          nfc.setCodeValue(this.nfcCode.value);
          await codeRepository.save(nfc);
        }

        this.resetForm();
        await this.fetchEntities();
        setTimeout(async () => {
          await Toast.show({
            text: trans('addEntity.entityAdded', {}, this.$.appContext.provides.i18n),
            duration: 'short',
          });
        }, 500);
      } catch (error) {
        console.error('Error adding entity:', error);
        await Toast.show({
          text:
            trans('error.generic', {}, this.$.appContext.provides.i18n) || 'Error adding entity',
          duration: 'long',
        });
      }
    },

    async updateEntity() {
      try {
        const id = await entityRepository.save(this.newEntity);
        const existingCodes = await codeRepository.findBy({ entityId: id });

        // Barcode logic
        const barcodeCode = existingCodes.find((c) => c.getCodeType() !== 'nfc');
        if (this.code && this.code.value) {
          if (barcodeCode) {
            barcodeCode.setCodeType(this.code.type);
            barcodeCode.setCodeValue(this.code.value);
            await codeRepository.save(barcodeCode);
          } else {
            const c = new Code();
            c.setEntityId(id);
            c.setCodeType(this.code.type);
            c.setCodeValue(this.code.value);
            await codeRepository.save(c);
          }
        } else if (barcodeCode) {
          await codeRepository.remove(barcodeCode);
        }

        // NFC Logic
        const nfcCodeDb = existingCodes.find((c) => c.getCodeType() === 'nfc');

        if (this.nfcCode.value && this.nfcState === 'valid') {
          if (nfcCodeDb) {
            nfcCodeDb.setCodeValue(this.nfcCode.value);
            await codeRepository.save(nfcCodeDb);
          } else {
            const nfc = new Code();
            nfc.setEntityId(id);
            nfc.setCodeType('nfc');
            nfc.setCodeValue(this.nfcCode.value);
            await codeRepository.save(nfc);
          }
        } else if (nfcCodeDb && !this.nfcCode.value) {
          await codeRepository.remove(nfcCodeDb);
        }

        if (Object.keys(this.templateCustomFieldsValues).length > 0) {
          for (const [fieldId, value] of Object.entries(this.templateCustomFieldsValues)) {
            await customFieldValueRepository.setFieldValue(
              id,
              Number(fieldId),
              JSON.stringify(value),
            );
          }
        }

        if (this.attributes.length > 0) {
          for (const [idx, attr] of this.attributes.entries()) {
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

            if (
              (attr.type === 'image' || attr.type === 'file') &&
              attr.value &&
              attr.value.length
            ) {
              const fileIds = [];
              for (const fileObj of attr.value) {
                let filePath;
                if (fileObj.file instanceof File || fileObj.file instanceof Blob) {
                  filePath = await this.saveFileToDevice(fileObj.file);
                } else if (fileObj.path) {
                  filePath = fileObj.path;
                } else {
                  continue;
                }

                const file = new File();
                file.setEntityId(id);
                file.setFileName(fileObj.name || fileObj.file.name);
                file.setMimeType(fileObj.type || fileObj.file.type);
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
          this.attributes = [];
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

    async loadEntity(id) {
      try {
        this.loadingEntity = true;
        const entity = await entityRepository.find(Number(id));
        if (!entity) return;
        HistoryService.addItem(entity);
        this.newEntity = entity;
        this.attributes = [];

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

        const entityId = entity.getId ? entity.getId() : entity.id;
        const codes = await codeRepository.findBy({ entityId: entityId });

        this.code = { type: 'manual', value: null };
        this.nfcCode = { value: null };
        this.nfcState = 'empty';

        if (codes && codes.length > 0) {
          const nfc = codes.find((c) => c.getCodeType() === 'nfc');
          if (nfc) {
            this.nfcCode.value = nfc.getCodeValue();
            this.nfcState = 'valid';
          }

          const barcode = codes.find((c) => c.getCodeType() !== 'nfc');
          if (barcode) {
            this.code = { type: barcode.getCodeType(), value: barcode.getCodeValue() };
          }
        }

        await this.fetchTemplateCustomFields();
        const values = await customFieldValueRepository.findByEntityWithFields(entityId);

        const fieldIds = new Set(this.templateCustomFields.map((f) => f.id));
        const mapped = {};
        const adHocAttributes = [];
        for (const v of values) {
          let parsedValue = '';
          try {
            parsedValue = v.fieldValue ? JSON.parse(v.fieldValue) : '';
          } catch (e) {
            parsedValue = v.fieldValue;
          }

          if (fieldIds.has(v.customFieldId)) {
            mapped[v.customFieldId] = parsedValue;
          } else {
            let attrValue = parsedValue;
            if ((v.fieldType === 'image' || v.fieldType === 'file') && Array.isArray(parsedValue)) {
              const fileDetails = [];
              for (const fileId of parsedValue) {
                const fileRepoResult = await fileRepository.find(fileId);
                if (fileRepoResult) {
                  fileDetails.push({
                    name: fileRepoResult.fileName,
                    type: fileRepoResult.mimeType,
                    isPrimary: fileRepoResult.isPrimary,
                    path: fileRepoResult.filePath,
                  });
                }
              }
              attrValue = fileDetails;
            }
            adHocAttributes.push({
              name: v.fieldName,
              type: v.fieldType,
              options: v.options ? JSON.parse(v.options) : [],
              required: !!v.isRequired,
              value: attrValue,
            });
          }
        }
        this.templateCustomFieldsValues = mapped;
        this.attributes = adHocAttributes;
      } catch (e) {
        console.error('Error loading entity:', e);
      } finally {
        this.loadingEntity = false;
      }
    },
    onSubmit() {
      if (this.isView) return;
      if (!this.validateForm()) return;
      if (this.isEdit) return this.updateEntity();
      return this.addEntity();
    },
    async toggleRemoveAction() {
      const i18n = this.$.appContext.provides.i18n;
      const { value } = await Dialog.confirm({
        title: trans('removeEntity.alertTitle', { entity: this.newEntity.name }, i18n),
        message: trans('removeEntity.alertMessage', { entity: this.newEntity.name }, i18n),
      });
      if (value) {
        await entityRepository.remove(this.newEntity);
        this.$emit('removeEntity');
        await Toast.show({
          text: trans('addEntity.entityRemoved', {}, this.$.appContext.provides.i18n),
          duration: 'long',
        });
        this.$router.back();
      }
    },
    redirectToEdit() {
      this.$router.push({ name: 'editEntity', params: { id: this.newEntity.id } });
    },
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler(newId) {
        if ((this.isEdit || this.isView) && newId) {
          this.loadEntity(newId);
        }
      },
    },
    'newEntity.type'(newVal, oldVal) {
      if (newVal) this.clearError('type');
      if (!this.loadingEntity && newVal !== oldVal) {
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
    async 'code.value'(newVal, oldVal) {
      if (this.code.type !== 'manual' && newVal !== oldVal && oldVal !== null) {
        this.code.type = 'manual';
      }
      if (!newVal || !this.code.type) {
        if (this.errors.code) delete this.errors.code;
        return;
      }
      const existing = await codeRepository.findBy({ codeType: this.code.type, codeValue: newVal });
      if (
        existing &&
        existing.length > 0 &&
        (!this.newEntity.id || existing[0].getEntityId() !== this.newEntity.id)
      ) {
        this.errors.code = this.trans('validation.codeExists', {}, this.$.appContext.provides.i18n);
      } else {
        if (this.errors.code) delete this.errors.code;
      }
    },
    async 'nfcCode.value'(newVal) {
      if (!newVal) {
        if (this.errors.nfc) delete this.errors.nfc;
        return;
      }
      const existing = await codeRepository.findBy({ codeType: 'nfc', codeValue: newVal });
      if (
        existing &&
        existing.length > 0 &&
        (!this.newEntity.id || existing[0].getEntityId() !== this.newEntity.id)
      ) {
        this.errors.nfc = trans('validation.nfcCodeExists', {}, this.$.appContext.provides.i18n);
      } else {
        if (this.errors.nfc) delete this.errors.nfc;
      }
    },
    mode(newMode, oldMode) {
      if ((newMode === 'edit' || newMode === 'view') && this.$route.params.id) {
        this.loadEntity(this.$route.params.id);
      }
    },
  },
  async beforeUnmount() {
    if (this.isScanningNfc) {
      await this.closeNfcModal();
    }
  },
};
</script>

<style scoped>
.required-field {
  color: red;
}
.is-invalid-select :deep(.v-select) {
  border-color: #dc3545;
}
.small-alert {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}
.nfc-icon-wrapper {
  cursor: pointer;
  font-size: 1.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.nfc-status-icon {
  transition: color 0.3s ease;
}

/* Modal Styles */
.nfc-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.nfc-modal-content {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 80%;
  max-width: 350px;
}
.blink-animation {
  animation: blink 1.5s infinite;
}
@keyframes blink {
  0% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.2;
  }
}
</style>
