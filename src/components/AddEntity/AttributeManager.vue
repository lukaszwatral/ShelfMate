<template>
  <div class="attribute-manager">
    <div class="accordion" id="attributesAccordion">
      <div v-for="(attr, idx) in localAttributes" :key="idx" class="accordion-item">
        <h2 class="accordion-header" :id="'heading' + idx">
          <button
            class="accordion-button form-control"
            type="button"
            data-bs-toggle="collapse"
            :data-bs-target="'#collapse' + idx"
            aria-expanded="false"
            :aria-controls="'collapse' + idx"
          >
            <span>{{ attr.name || trans('addEntity.attribute.defaultName') }}</span>
          </button>
        </h2>
        <div
          :id="'collapse' + idx"
          class="accordion-collapse show collapse"
          :aria-labelledby="'heading' + idx"
          data-bs-parent="#attributesAccordion"
        >
          <div class="accordion-body d-flex flex-column gap-2">
            <div class="d-flex align-items-center gap-2">
              <label class="form-label mb-0">{{ trans('addEntity.attribute.type') }}:</label>
              <select class="form-select" v-model="attr.type" @change="onTypeChange(idx)">
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
                autocomplete="off"
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
                        :id="`attr-${idx}-opt-${optIdx}`"
                        :value="opt"
                        v-model="attr.value"
                      />
                      <input
                        v-else
                        type="radio"
                        class="form-check-input"
                        :id="`attr-${idx}-opt-${optIdx}`"
                        :name="`attr-${idx}`"
                        :value="opt"
                        v-model="attr.value"
                        :required="attr.required"
                      />
                      <label class="form-check-label ms-2" :for="`attr-${idx}-opt-${optIdx}`">
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
                    autocomplete="off"
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
              <input type="file" accept="image/*" multiple @change="onImagesChange($event, idx)" />
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

            <template v-if="attr.type === 'file'">
              <input type="file" multiple @change="onFilesChange($event, idx)" />
              <div v-if="attr.value && attr.value.length" class="mt-2">
                <div
                  v-for="(file, i) in attr.value"
                  :key="i"
                  class="d-flex align-items-center gap-2 mb-2 p-2 border rounded"
                >
                  <i class="bi bi-file-earmark" style="font-size: 1.5rem"></i>
                  <div class="flex-grow-1">
                    <div>{{ file.file.name }}</div>
                    <small class="text-muted">{{ formatFileSize(file.file.size) }}</small>
                  </div>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeFile(idx, i)">
                    <i class="bi bi-x icon-small"></i>
                  </button>
                </div>
              </div>
            </template>

            <div
              v-if="!['radio', 'checkbox', 'select', 'image', 'file'].includes(attr.type)"
              class="d-flex align-items-center gap-2"
            >
              <label class="form-label mb-0">{{ trans('addEntity.attribute.value') }}:</label>
              <textarea
                v-if="attr.type === 'textarea'"
                class="form-control"
                v-model="attr.value"
                :required="attr.required"
                :placeholder="trans('addEntity.attribute.valuePlaceholder')"
                autocomplete="off"
              />
              <input
                v-else
                :type="attr.type"
                class="form-control"
                v-model="attr.value"
                :required="attr.required"
                :placeholder="trans('addEntity.attribute.valuePlaceholder')"
                autocomplete="off"
              />
            </div>

            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                :id="'required-' + idx"
                v-model="attr.required"
              />
              <label class="form-check-label" :for="'required-' + idx">
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
  </div>
</template>

<script>
import { trans } from '@/translations/translator.js';
import { AttributeTypeDescriptions, AttributeTypeEnumValues } from '@/Enum/AttributeTypeEnum.js';

export default {
  name: 'AttributeManager',
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      AttributeTypeDescriptions,
      AttributeTypeEnumValues,
    };
  },
  computed: {
    localAttributes: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
  },
  methods: {
    trans,
    addAttribute() {
      const type = 'text';
      const newAttributes = [
        ...this.localAttributes,
        {
          name: '',
          type,
          value: ['radio', 'select'].includes(type) ? null : type === 'checkbox' ? [] : '',
          required: false,
          options: [],
        },
      ];
      this.localAttributes = newAttributes;
    },
    removeAttribute(idx) {
      const newAttributes = [...this.localAttributes];
      newAttributes.splice(idx, 1);
      this.localAttributes = newAttributes;
    },
    onTypeChange(idx) {
      const attr = this.localAttributes[idx];
      if (['radio', 'checkbox', 'select'].includes(attr.type)) {
        if (!attr.options || attr.options.length <= 0) {
          attr.options = [''];
        }
        if (attr.type === 'checkbox') {
          attr.value = [];
        } else if (['radio', 'select'].includes(attr.type)) {
          attr.value = null;
        }
      }
      if (!['radio', 'checkbox', 'select'].includes(attr.type)) {
        attr.options = [];
        attr.value = '';
      }
      // Aktualizacja przez przypisanie
      this.localAttributes = [...this.localAttributes];
    },
    onImagesChange(event, idx) {
      const files = Array.from(event.target.files);
      this.localAttributes[idx].value = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        isPrimary: false,
      }));
    },
    onFilesChange(event, idx) {
      const files = Array.from(event.target.files);
      this.localAttributes[idx].value = files.map((file) => ({
        file,
      }));
    },
    removeFile(attrIdx, fileIdx) {
      this.localAttributes[attrIdx].value.splice(fileIdx, 1);
    },
    setPrimaryImage(attrIdx, imgIdx) {
      const attr = this.localAttributes[attrIdx];
      if (attr.value && attr.value.length > imgIdx) {
        for (const img of attr.value) {
          img.isPrimary = false;
        }
        attr.value[imgIdx].isPrimary = true;
      }
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    },
  },
};
</script>

<style scoped>
/* Style specyficzne dla menedżera atrybutów */
.attribute-options-box {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 5px;
}
.icon-small {
  font-size: 1rem;
}
</style>
