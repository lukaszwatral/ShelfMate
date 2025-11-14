<template>
  <div class="add-entity-container">
    <form @submit.prevent="addEntity">
      <div class="form-input-container shadow-sm">
        <label for="type" class="form-label"
          >{{ trans('addEntity.type') }}: <span class="required-field">*</span></label
        >
        <VueSelect
          v-model="newEntity.type"
          name="type"
          :options="[
            { label: trans('addEntity.category'), value: 'category', icon: 'tag' },
            { label: trans('addEntity.place'), value: 'place', icon: 'box-seam' },
            { label: trans('addEntity.item'), value: 'item', icon: 'bag' },
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
        <div class="form-input-container shadow-sm">
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

        <div class="form-input-container shadow-sm" v-if="newEntity.type !== 'category'">
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

        <div class="form-input-container shadow-sm">
          <label for="name" class="form-label"
            >{{ trans('addEntity.name') }}: <span class="required-field">*</span></label
          >
          <input
            id="name"
            type="text"
            class="form-control"
            :placeholder="trans('addEntity.namePlaceholder')"
            required
            v-model="newEntity.name"
          />
        </div>
        <div class="form-input-container shadow-sm">
          <label for="description" class="form-label">{{ trans('addEntity.description') }}:</label>
          <textarea
            id="description"
            type="text"
            :placeholder="trans('addEntity.descriptionPlaceholder')"
            v-model="newEntity.description"
            class="form-control"
          />
        </div>

        <div class="form-input-container shadow-sm">
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
              v-model="newEntity.code"
            />
            <i class="bi bi-upc-scan" @click="scanBarcode"></i>
          </div>
        </div>

        <div class="form-input-container shadow-sm">
          <label for="icon" class="form-label">{{ trans('addEntity.icon') }}: </label>
          <VueSelect
            v-model="newEntity.icon"
            name="icon"
            :options="iconNamesArray.map((icon) => ({ label: icon, value: icon }))"
            :placeholder="trans('addEntity.iconPlaceholder')"
          >
            <template #value="{ option }">
              <span class="select-option">
                <i :class="`bi bi-${option.label}`"></i>
                <span>{{ option.label }}</span>
              </span>
            </template>

            <template #option="{ option }">
              <span class="select-option">
                <i :class="`bi bi-${option.label}`"></i>
                <span>{{ option.label }}</span>
              </span>
            </template>
          </VueSelect>
        </div>

        <div class="accordion" id="attributesAccordion">
          <div v-for="(attr, idx) in attributes" :key="attr.id" class="accordion-item">
            <h2 class="accordion-header" :id="'heading' + attr.id">
              <button
                class="accordion-button shadow-sm"
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
                  <label class="form-label mb-0">{{ trans('addEntity.attribute.options') }}:</label>
                  <div class="mb-2 attribute-options-box shadow-sm">
                    <div
                      v-for="(opt, optIdx) in attr.options"
                      :key="optIdx"
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
                        {{ trans('addEntity.attribute.remove') }}
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
                <div
                  v-if="!['radio', 'checkbox', 'select'].includes(attr.type)"
                  class="d-flex align-items-center gap-2"
                >
                  <label class="form-label mb-0">{{ trans('addEntity.attribute.value') }}:</label>
                  <component
                    :is="attr.type === 'textarea' ? 'textarea' : 'input'"
                    :type="attr.type !== 'textarea' ? attr.type : undefined"
                    class="form-control"
                    v-model="attr.value"
                    :required="attr.required"
                    @input="updateAttribute(idx, 'value', attr.value)"
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
      <button class="btn btn-primary mt-3" type="submit" :disabled="!newEntity.type">
        {{ trans('addEntity.add') }}
      </button>
    </form>
  </div>
</template>

<script>
import { trans } from '@/translations/translator.js'
import VueSelect from 'vue3-select-component'
import { createEntity, getEntities } from '@/services/entityService.js'
import { AttributeTypeDescriptions, AttributeTypeEnumValues } from '@/Enum/AttributeTypeEnum.js'
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerTypeHint,
} from '@capacitor/barcode-scanner'
import 'vue3-select-component/styles'
import iconsObject from 'bootstrap-icons/font/bootstrap-icons.json'
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
      iconNamesArray: Object.keys(iconsObject),
      newEntity: {
        type: null,
        parentId: null,
        categoryId: null,
        name: '',
        description: '',
        code: '',
        icon: '',
        attributes: [],
      },
      AttributeTypeDescriptions,
      AttributeTypeEnumValues,
    }
  },
  async mounted() {
    this.newEntity.type = this.initialType
    await this.fetchEntities()
  },
  methods: {
    AttributeTypeEnumValues() {
      return AttributeTypeEnumValues
    },
    trans,
    addAttribute() {
      this.attributes.push({
        name: '',
        type: AttributeTypeEnumValues[0],
        value: '',
        id: Date.now() + Math.random(),
        required: false,
        options: [],
      })
    },
    removeAttribute(idx) {
      this.attributes.splice(idx, 1)
    },
    updateAttribute(idx, key, val) {
      this.attributes[idx][key] = val
      if (key === 'type' && ['radio', 'checkbox', 'select'].includes(val)) {
        if (!this.attributes[idx].options || this.attributes[idx].options.length <= 0) {
          this.attributes[idx].options = ['']
        }
        this.attributes[idx].value = ''
      }
      if (key === 'type' && !['radio', 'checkbox', 'select'].includes(val)) {
        this.attributes[idx].options = []
      }
    },
    async fetchEntities() {
      try {
        const entities = await getEntities()
        this.allEntities = entities.filter((ent) => ent.type !== 'category')
        this.allCategories = entities.filter((ent) => ent.type === 'category')
      } catch (error) {
        console.error('Error fetching entities:', error)
      }
    },
    async scanBarcode() {
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: CapacitorBarcodeScannerTypeHint.ALL,
      })
      this.newEntity.code = result.ScanResult
    },
    async addEntity() {
      // @TODO add entity function
    },
  },
  watch: {
    'newEntity.type'(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.newEntity.parentId = null
        this.newEntity.categoryId = null
      }
    },
  },
}
</script>
