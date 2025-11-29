<template>
  <div class="add-entity-container">
    <h4>
      <i class="bi bi-broadcast" style="color: red"></i>
      {{ trans('addEntity.preview') }}
    </h4>
    <div
      class="entity-card shadow-sm"
      :style="{ background: newEntity.color }"
      @click="handleColorpickerClick"
    >
      <i
        class="bi bi-hand-index-fill pulse-hand"
        @click.stop="handleIconClick"
        :class="{ 'pulse-animation': isIconClicked }"
      ></i>
      <i
        :class="`bi bi-${newEntity.icon || initialIcon || 'question'}`"
        class="entity-icon"
        @click.stop="handleIconClick"
      ></i>

      <VueSelect
        v-model="newEntity.icon"
        v-if="showIconSelect"
        class="icon-select"
        ref="iconSelect"
        name="icon"
        :isClearable="false"
        :shouldAutofocusOption="false"
        :isMenuOpen="true"
        :options="iconOptions"
        placeholder=""
        @update:modelValue="this.showIconSelect = false"
        @click.stop
      >
        <template #dropdown></template>
        <template #value>
          <span style="visibility: hidden"></span>
        </template>
        <template #option="{ option }">
          <span
            class="icon-select-option"
            v-if="option && option.label"
            @click.stop="selectIcon(option.value)"
          >
            <i :class="`bi bi-${option.label}`"></i>
          </span>
        </template>
      </VueSelect>

      <span class="entity-name">
        {{ newEntity.name || trans('addEntity.defaultName') }}
      </span>

      <span class="entity-description">
        {{ newEntity.description || trans('addEntity.defaultDescription') }}
      </span>
      <div class="entity-colorpicker" @click.stop>
        <i
          class="bi bi-hand-index-fill"
          :class="{ 'pulse-animation': isColorpickerActive }"
          @click="handleColorpickerClick"
        ></i>
        <input type="color" ref="colorInput" v-model="newEntity.color" style="display: none" />
      </div>
      <div class="entity-actions">
        <button><i class="bi bi-pencil-square icon-small"></i></button>
        <button>
          <i class="bi bi-trash-fill icon-small"></i>
        </button>
        <button class="toggle-btn" type="button">
          <span></span>
          <i class="bi-chevron-down"></i>
        </button>
      </div>
    </div>

    <form @submit.prevent="addEntity">
      <div class="form-input-container">
        <label for="type" class="form-label"
          >{{ trans('addEntity.type') }}: <span class="required-field">*</span></label
        >
        <VueSelect
          v-model="newEntity.type"
          name="type"
          :options="[
            { label: trans('addEntity.category'), value: 'category', icon: 'tag-fill' },
            { label: trans('addEntity.place'), value: 'place', icon: 'box-seam-fill' },
            { label: trans('addEntity.item'), value: 'item', icon: 'bag-fill' },
          ]"
          :placeholder="trans('addEntity.typeDefault')"
          :isClearable="false"
          :isSearchable="false"
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
            :options="[
              { label: trans('addEntity.null'), value: null },
              ...(newEntity.type === 'category'
                ? allCategories.map((cat) => ({
                    label: `${cat.name} (${trans('addEntity.' + cat.type)})`,
                    value: cat.id,
                    icon: cat.icon,
                  }))
                : allEntities.map((ent) => ({
                    label: `${ent.name} (${trans('addEntity.' + ent.type)})`,
                    value: ent.id,
                    icon: ent.icon,
                  }))),
            ]"
            :placeholder="trans('addEntity.null')"
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
            :options="
              allCategories.map((cat) => ({ label: cat.name, value: cat.id, icon: cat.icon }))
            "
            :placeholder="trans('addEntity.null')"
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
          <label for="name" class="form-label"
            >{{ trans('addEntity.name') }}: <span class="required-field">*</span></label
          >
          <input
            id="name"
            type="text"
            class="form-control input-inset"
            :placeholder="trans('addEntity.namePlaceholder')"
            required
            v-model="newEntity.name"
          />
        </div>
        <div class="form-input-container">
          <label for="description" class="form-label">{{ trans('addEntity.description') }}:</label>
          <textarea
            id="description"
            type="text"
            :placeholder="trans('addEntity.descriptionPlaceholder')"
            v-model="newEntity.description"
            class="form-control"
          />
        </div>

        <div class="form-input-container">
          <label for="code" class="form-label"> {{ trans('addEntity.code') }}: </label>
          <span class="tooltip-container">
            <i class="bi bi-info-circle-fill"></i>
            <span class="tooltip-text">{{ trans('addEntity.codeTooltip') }}</span>
          </span>
          <div class="input-with-icon form-control">
            <input id="code" type="text" class="form-control" placeholder="" v-model="code" />
            <i class="bi bi-upc-scan" @click="scanBarcode"></i>
          </div>
        </div>

        <div class="accordion" id="attributesAccordion">
          <div v-for="(attr, idx) in attributes" :key="attr.id" class="accordion-item">
            <h2 class="accordion-header" :id="'heading' + attr.id">
              <button
                class="accordion-button form-control"
                type="button"
                data-bs-toggle="collapse"
                :data-bs-target="'#collapse' + attr.id"
                aria-expanded="false"
                :aria-controls="'collapse' + attr.id"
              >
                <span>{{ attr.name || trans('addEntity.attribute.defaultName') }}</span>
              </button>
            </h2>
            <div
              :id="'collapse' + attr.id"
              class="accordion-collapse show collapse"
              :aria-labelledby="'heading' + attr.id"
              data-bs-parent="#attributesAccordion"
            >
              <div class="accordion-body d-flex flex-column gap-2">
                <div class="d-flex align-items-center gap-2">
                  <label class="form-label mb-0">{{ trans('addEntity.attribute.type') }}:</label>
                  <select
                    class="form-select"
                    v-model="attr.type"
                    @change="updateAttribute(idx, 'type', attr.type)"
                  >
                    <option v-for="type in AttributeTypeEnumValues" :key="type" :value="type">
                      {{ trans(AttributeTypeDescriptions[type]) }}
                    </option>
                  </select>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <label class="form-label mb-0">{{ trans('addEntity.attribute.name') }}: </label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="attr.name"
                    :placeholder="trans('addEntity.attribute.namePlaceholder')"
                    required
                  />
                </div>
                <template v-if="['radio', 'checkbox', 'select'].includes(attr.type)">
                  <div class="d-flex align-items-center gap-2">
                    <label class="form-label mb-0">{{ trans('addEntity.attribute.value') }}:</label>
                    <template v-if="['radio', 'checkbox'].includes(attr.type)">
                      <div class="attribute-options-grid">
                        <div v-for="(opt, optIdx) in attr.options" :key="optIdx" class="form-check">
                          <input
                            v-if="attr.type === 'checkbox'"
                            type="checkbox"
                            class="form-check-input"
                            :id="`attr-${attr.id}-opt-${optIdx}`"
                            :value="opt"
                            v-model="attr.value"
                          />
                          <input
                            v-else
                            type="radio"
                            class="form-check-input"
                            :id="`attr-${attr.id}-opt-${optIdx}`"
                            :name="`attr-${attr.id}`"
                            :value="opt"
                            v-model="attr.value"
                            :required="attr.required"
                          />
                          <label
                            class="form-check-label ms-2"
                            :for="`attr-${attr.id}-opt-${optIdx}`"
                          >
                            {{ opt }}
                          </label>
                        </div>
                      </div>
                    </template>
                    <template v-else-if="attr.type === 'select'">
                      <select class="form-select" v-model="attr.value" :required="attr.required">
                        <option v-for="(opt, optIdx) in attr.options" :key="optIdx" :value="opt">
                          {{ opt }}
                        </option>
                      </select>
                    </template>
                  </div>
                  <label class="form-label mb-0">{{ trans('addEntity.attribute.options') }}:</label>
                  <div class="mb-2 attribute-options-box shadow-sm">
                    <div
                      v-for="(opt, optIdx) in attr.options"
                      :key="'edit-' + optIdx"
                      class="d-flex gap-2 mb-1"
                    >
                      <input
                        type="text"
                        class="form-control"
                        v-model="attr.options[optIdx]"
                        :placeholder="trans('addEntity.attribute.optionPlaceholder')"
                        required
                      />
                      <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        @click="attr.options.splice(optIdx, 1)"
                      >
                        <i class="bi bi-x icon-small"></i>
                      </button>
                    </div>
                    <button
                      type="button"
                      class="btn btn-secondary btn-sm mt-1"
                      @click="attr.options.push('')"
                    >
                      <i class="bi bi-plus icon-small"></i>
                    </button>
                  </div>
                </template>
                <template v-if="attr.type === 'image'">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    @change="onImagesChange($event, idx)"
                  />
                  <div v-if="attr.value && attr.value.length">
                    <div v-for="(img, i) in attr.value" :key="i" style="margin-bottom: 12px">
                      <img
                        :src="img.preview"
                        style="max-width: 100px; margin-top: 8px"
                        :alt="attr.name"
                      />
                      <div class="d-flex align-items-center gap-2 mt-1">
                        <input
                          type="radio"
                          :name="'isPrimary-' + idx"
                          :checked="img.isPrimary"
                          @change="setPrimaryImage(idx, i)"
                        />
                        <label>Główne zdjęcie</label>
                      </div>
                    </div>
                  </div>
                </template>
                <div
                  v-if="
                    !['radio', 'checkbox', 'select'].includes(attr.type) && attr.type !== 'image'
                  "
                  class="d-flex align-items-center gap-2"
                >
                  <label class="form-label mb-0">{{ trans('addEntity.attribute.value') }}:</label>
                  <textarea
                    v-if="attr.type === 'textarea'"
                    class="form-control"
                    :value="attr.value"
                    @input="attr.value = $event.target.value"
                    :required="attr.required"
                    :placeholder="trans('addEntity.attribute.valuePlaceholder')"
                  />
                  <input
                    v-else
                    :type="attr.type"
                    class="form-control"
                    :value="attr.value"
                    @input="attr.value = $event.target.value"
                    :required="attr.required"
                    :placeholder="trans('addEntity.attribute.valuePlaceholder')"
                  />
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="'required-' + attr.id"
                    v-model="attr.required"
                  />
                  <label class="form-check-label" :for="'required-' + attr.id">
                    {{ trans('addEntity.attribute.required') }}
                  </label>
                </div>
                <button
                  type="button"
                  class="btn btn-danger align-self-end"
                  @click="removeAttribute(idx)"
                >
                  <i class="bi bi-trash"></i> {{ trans('addEntity.attribute.remove') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <button class="btn btn-secondary mt-3 add-attribute" type="button" @click="addAttribute">
          <i class="bi bi-plus icon-small"></i>{{ trans('addEntity.attribute.new') }}
        </button>
      </template>
      <button
        class="add-container-right shadow-sm"
        style="border: none"
        type="submit"
        :disabled="!newEntity.type"
      >
        <button class="add-circle-btn">
          <i class="bi bi-plus icon-large"></i>
        </button>
        <span class="add-label">
          {{ trans('home.addEntity') }}
        </span>
      </button>
    </form>
  </div>
</template>

<script>
import { trans } from '@/translations/translator.js';
import VueSelect from 'vue3-select-component';
import { AttributeTypeDescriptions, AttributeTypeEnumValues } from '@/Enum/AttributeTypeEnum.js';
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerTypeHint,
} from '@capacitor/barcode-scanner';
import 'vue3-select-component/styles';
import iconsObject from '/src/assets/icons-picker.json';
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

const animationDuration = 5000;
export default {
  name: 'AddEntity',
  props: {
    initialType: {
      type: String,
      default: null,
    },
  },
  components: { VueSelect },
  data() {
    return {
      allEntities: [],
      allCategories: [],
      attributes: [],
      entities: [],
      iconNamesArray: Object.keys(iconsObject),
      iconOptions: [],
      newEntity: new Entity(),
      code: null,
      AttributeTypeDescriptions,
      AttributeTypeEnumValues,
      isColorpickerActive: true,
      showIconSelect: false,
      isIconClicked: true,
      initialIcon: 'question',
    };
  },
  async mounted() {
    this.newEntity.type = this.initialType;
    await this.fetchEntities();
    document.addEventListener('click', this.handleClickOutside);

    setTimeout(() => {
      this.isIconClicked = false;
    }, animationDuration);

    setTimeout(() => {
      this.isColorpickerActive = false;
    }, animationDuration);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  created() {
    this.iconOptions = this.iconNamesArray.map((icon) => ({ label: icon, value: icon }));
  },
  methods: {
    handleClickOutside(e) {
      if (this.showIconSelect) {
        const select = this.$refs.iconSelect?.$el || this.$refs.iconSelect;
        if (select && !select.contains(e.target)) {
          this.showIconSelect = false;
        }
      }
    },
    AttributeTypeEnumValues() {
      return AttributeTypeEnumValues;
    },
    trans,
    addAttribute() {
      const type = 'text';
      this.attributes.push({
        name: '',
        type,
        value: ['radio', 'select'].includes(type) ? null : type === 'checkbox' ? [] : '',
        required: false,
        options: [],
      });
    },
    removeAttribute(idx) {
      this.attributes.splice(idx, 1);
    },
    updateAttribute(idx, key, val) {
      this.attributes[idx][key] = val;
      if (key === 'type' && ['radio', 'checkbox', 'select'].includes(val)) {
        if (!this.attributes[idx].options || this.attributes[idx].options.length <= 0) {
          this.attributes[idx].options = [''];
        }
        if (val === 'checkbox') {
          this.attributes[idx].value = [];
        } else if (['radio', 'select'].includes(val)) {
          this.attributes[idx].value = null;
        }
      }
      if (key === 'type' && !['radio', 'checkbox', 'select'].includes(val)) {
        this.attributes[idx].options = [];
      }
    },
    async fetchEntities() {
      try {
        const entities = await entityRepository.findAll();
        this.entities = entities;
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
    async saveImageToDevice(file) {
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
    async addEntity() {
      try {
        const addedEntity = await entityRepository.save(this.newEntity);
        if (this.code) {
          const code = new Code();
          code.setCodeValue(this.code);
          code.setEntityId(addedEntity);
          await codeRepository.save(code);
        }
        if (this.attributes.length > 0) {
          for (const [idx, attr] of this.attributes.entries()) {
            const field = new CustomField();
            const value = new CustomFieldValue();
            field
              .setEntityId(addedEntity)
              .setFieldName(attr.name)
              .setFieldType(attr.type)
              .setOptions(JSON.stringify(attr.options) || '')
              .setIsRequired(attr.required)
              .setSortOrder(idx);
            const insertedField = await customFieldRepository.save(field);
            if (attr.type === 'image' && attr.value && attr.value.length) {
              const fileIds = [];
              for (const imgObj of attr.value) {
                const filePath = await this.saveImageToDevice(imgObj.file);
                const file = new File();
                file.setEntityId(addedEntity);
                file.setFileName(imgObj.file.name);
                file.setMimeType(imgObj.file.type);
                file.setFilePath(filePath);
                file.setIsPrimary(imgObj.isPrimary);
                const addedFile = await fileRepository.save(file);
                fileIds.push(addedFile);
              }
              value
                .setEntityId(addedEntity)
                .setCustomFieldId(insertedField)
                .setFieldValue(JSON.stringify(fileIds));
              await customFieldValueRepository.save(value);
            } else {
              value
                .setEntityId(addedEntity)
                .setCustomFieldId(insertedField)
                .setFieldValue(JSON.stringify(attr.value) || '');
              await customFieldValueRepository.save(value);
            }
          }
        }
        this.newEntity = new Entity();
        this.attributes = [];
        this.code = null;
        await this.fetchEntities();
      } catch (error) {
        console.error('Error adding entity:', error);
      }
    },
    handleColorpickerClick() {
      this.isColorpickerActive = false;
      this.$refs.colorInput && this.$refs.colorInput.click();
    },
    handleIconClick() {
      this.isIconClicked = false;
      this.showIconSelect = true;
      this.$nextTick(() => {
        if (this.$refs.iconSelect && typeof this.$refs.iconSelect.open === 'function') {
          this.$refs.iconSelect.open();
        }
      });
    },
    selectIcon(icon) {
      this.newEntity.icon = icon;
      this.showIconSelect = false;
    },
    onImageChange(event, idx) {
      const files = Array.from(event.target.files);
      this.attributes[idx].value = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
    },
    onImagesChange(event, idx) {
      const files = Array.from(event.target.files);
      this.attributes[idx].value = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
    },
    setPrimaryImage(attrIdx, imgIdx) {
      const attr = this.attributes[attrIdx];
      if (attr.value && attr.value.length > imgIdx) {
        for (const img of attr.value) {
          img.isPrimary = false;
        }
        attr.value[imgIdx].isPrimary = true;
      }
    },
  },
  watch: {
    'newEntity.type'(newVal, oldVal) {
      if (newVal !== oldVal) {
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
      }
    },
  },
};
</script>

<style scoped></style>
