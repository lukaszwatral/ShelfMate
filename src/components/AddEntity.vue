<template>
  <div class="add-entity-container">
    <form @submit.prevent="addEntity">
      <div class="form-input-container shadow-sm">
        <label for="type" class="form-label"
          >{{ $t('addEntity.type') }}: <span class="required-field">*</span></label
        >
        <VueSelect
          v-model="newEntity.type"
          name="type"
          :options="[
            { label: $t('addEntity.category'), value: 'category', icon: 'tag' },
            { label: $t('addEntity.place'), value: 'place', icon: 'box-seam' },
            { label: $t('addEntity.item'), value: 'item', icon: 'bag' },
          ]"
          :placeholder="$t('addEntity.typeDefault')"
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
          <label for="parent" class="form-label">{{ $t('addEntity.parentEntity') }}:</label>
          <VueSelect
            v-model="newEntity.parentId"
            name="parent"
            :options="[
              { label: $t('addEntity.null'), value: null },
              ...(newEntity.type === 'category'
                ? allCategories.map((cat) => ({
                    label: `${cat.name} (${t('addEntity.' + cat.type)})`,
                    value: cat.id,
                    icon: cat.icon,
                  }))
                : allEntities.map((ent) => ({
                    label: `${ent.name} (${t('addEntity.' + ent.type)})`,
                    value: ent.id,
                    icon: ent.icon,
                  }))),
            ]"
            :placeholder="$t('addEntity.null')"
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
          <label for="category" class="form-label">{{ $t('addEntity.category') }}:</label>
          <VueSelect
            v-model="newEntity.categoryId"
            name="category"
            :options="
              allCategories.map((cat) => ({ label: cat.name, value: cat.id, icon: cat.icon }))
            "
            :placeholder="$t('addEntity.null')"
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
            >{{ $t('addEntity.name') }}: <span class="required-field">*</span></label
          >
          <input
            id="name"
            type="text"
            class="form-control"
            :placeholder="$t('addEntity.namePlaceholder')"
            required
            v-model="newEntity.name"
          />
        </div>
        <div class="form-input-container shadow-sm">
          <label for="description" class="form-label">{{ $t('addEntity.description') }}:</label>
          <textarea
            id="description"
            type="text"
            :placeholder="$t('addEntity.descriptionPlaceholder')"
            v-model="newEntity.description"
            class="form-control"
          />
        </div>

        <div class="form-input-container shadow-sm">
          <label for="code" class="form-label"> {{ $t('addEntity.code') }}: </label>
          <span class="tooltip-container">
            <i class="bi bi-info-circle-fill"></i>
            <span class="tooltip-text">{{ t('addEntity.codeTooltip') }}</span>
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
          <label for="icon" class="form-label">{{ $t('addEntity.icon') }}: </label>
          <VueSelect
            v-model="newEntity.icon"
            name="icon"
            :options="iconNamesArray.map((icon) => ({ label: icon, value: icon }))"
            :placeholder="t('addEntity.iconPlaceholder')"
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
                <span>{{ attr.name || t('addEntity.attribute.defaultName') }}</span>
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
                  <label class="form-label mb-0">{{ t('addEntity.attribute.type') }}:</label>
                  <select
                    class="form-select"
                    v-model="attr.type"
                    @change="updateAttribute(idx, 'type', attr.type)"
                  >
                    <option v-for="type in AttributeTypeEnumValues" :key="type" :value="type">
                      {{ t(AttributeTypeDescriptions[type]) }}
                    </option>
                  </select>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <label class="form-label mb-0">{{ t('addEntity.attribute.name') }}: </label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="attr.name"
                    :placeholder="t('addEntity.attribute.namePlaceholder')"
                    required
                  />
                </div>
                <!-- Opcje dla radio, checkbox, select -->
                <template v-if="['radio', 'checkbox', 'select'].includes(attr.type)">
                  <label class="form-label mb-0">{{ t('addEntity.attribute.options') }}:</label>
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
                        :placeholder="t('addEntity.attribute.optionPlaceholder')"
                        required
                      />
                      <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        @click="attr.options.splice(optIdx, 1)"
                      >
                        {{ t('addEntity.attribute.remove') }}
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
                  <label class="form-label mb-0">{{ t('addEntity.attribute.value') }}:</label>
                  <component
                    :is="attr.type === 'textarea' ? 'textarea' : 'input'"
                    :type="attr.type !== 'textarea' ? attr.type : undefined"
                    class="form-control"
                    v-model="attr.value"
                    :required="attr.required"
                    @input="updateAttribute(idx, 'value', attr.value)"
                    :placeholder="t('addEntity.attribute.valuePlaceholder')"
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
                    {{ t('addEntity.attribute.required') }}
                  </label>
                </div>
                <button
                  type="button"
                  class="btn btn-danger align-self-end"
                  @click="removeAttribute(idx)"
                >
                  <i class="bi bi-trash"></i> {{ t('addEntity.attribute.remove') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <button class="btn btn-secondary mt-3 add-attribute" type="button" @click="addAttribute">
          <i class="bi bi-plus icon-small"></i>{{ t('addEntity.attribute.new') }}
        </button>
      </template>
      <button class="btn btn-primary mt-3" type="submit" :disabled="!newEntity.type">
        {{ $t('addEntity.add') }}
      </button>
    </form>
  </div>
</template>

<script setup>
import VueSelect from 'vue3-select-component'
import { ref, onMounted, watch } from 'vue'
import { createEntity, getEntities } from '@/services/entityService.js'
import { useI18n } from 'vue-i18n'
import { AttributeTypeDescriptions, AttributeTypeEnumValues } from '@/Enum/AttributeTypeEnum.js'
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerTypeHint,
} from '@capacitor/barcode-scanner'
import 'vue3-select-component/styles'
import iconsObject from 'bootstrap-icons/font/bootstrap-icons.json'
const { t } = useI18n()

defineOptions({
  name: 'AddEntity',
})

const props = defineProps({
  initialType: {
    type: String,
    default: null,
  },
})

const allEntities = ref([])
const allCategories = ref([])
const newEntity = ref({
  type: null,
  name: '',
  description: '',
  parentId: null,
  categoryId: null,
  code: '',
  icon: '',
  attributes: [],
})

const attributes = ref([])
const iconNamesArray = Object.keys(iconsObject)
function addAttribute() {
  attributes.value.push({
    name: '',
    type: AttributeTypeEnumValues[0],
    value: '',
    id: Date.now() + Math.random(),
    options: [],
  })
}

function removeAttribute(idx) {
  attributes.value.splice(idx, 1)
}

function updateAttribute(idx, key, val) {
  attributes.value[idx][key] = val
  if (key === 'type' && ['radio', 'checkbox', 'select'].includes(val)) {
    // Dodaj pustą opcję, jeśli lista jest pusta
    if (!attributes.value[idx].options || attributes.value[idx].options.length === 0) {
      attributes.value[idx].options = ['']
    }
    attributes.value[idx].value = ''
  }
  if (key === 'type' && !['radio', 'checkbox', 'select'].includes(val)) {
    attributes.value[idx].options = []
  }
}

async function fetchEntities() {
  try {
    const entities = await getEntities()
    allEntities.value = entities.filter((entity) => entity.type !== 'category')
    allCategories.value = entities.filter((entity) => entity.type === 'category')
  } catch (error) {
    console.error('Error fetching entities:', error)
  }
}

onMounted(async () => {
  newEntity.value.type = props.initialType
  await fetchEntities()
})

watch(
  () => newEntity.value.type,
  () => {
    newEntity.value.parentId = null
    newEntity.value.categoryId = null
  },
)

async function addEntity() {
  try {
    // Dodaj atrybuty do encji
    const entityToSave = { ...newEntity.value, attributes: attributes.value }
    const newId = await createEntity(entityToSave)
    console.log('Entity added with id:', newId)
    newEntity.value = {
      type: null,
      name: '',
      description: '',
      code: '',
      icon: '',
      parentId: null,
      categoryId: null,
    }
    attributes.value = []
    await fetchEntities()
  } catch (error) {
    console.error('Error adding entity:', error)
  }
}
const scanBarcode = async () => {
  const result = await CapacitorBarcodeScanner.scanBarcode({
    hint: CapacitorBarcodeScannerTypeHint.ALL,
  })
  newEntity.value.code = result.ScanResult
}
</script>

<style scoped>
.accordion-item {
  margin-bottom: 8px;
}
.tooltip-container {
  position: relative;
  display: inline-block;
  cursor: pointer;
}
.tooltip-container .tooltip-text {
  visibility: hidden;
  width: 180px;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 4px;
  padding: 6px 8px;
  position: absolute;
  z-index: 10;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 0.95em;
  white-space: pre-line;
  box-sizing: border-box;
}
.tooltip-container:hover .tooltip-text,
.tooltip-container:focus-within .tooltip-text {
  visibility: visible;
  opacity: 1;
}
@media (max-width: 400px) {
  .tooltip-container .tooltip-text {
    left: 0;
    transform: none;
    min-width: 120px;
    max-width: 90vw;
  }
}
</style>
