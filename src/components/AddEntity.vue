<template>
  <div class="add-entity-container">
    <form @submit.prevent="addEntity">
      <div class="form-input-container shadow-sm">
        <label for="type" class="form-label">{{ $t('addEntity.type') }}:</label>
        <VueSelect
          v-model="newEntity.type"
          name="type"
          :options="[
            { label: $t('addEntity.category'), value: 'category' },
            { label: $t('addEntity.place'), value: 'place' },
            { label: $t('addEntity.item'), value: 'item' },
          ]"
          :placeholder="$t('addEntity.typeDefault')"
          :isClearable="false"
          :isSearchable="false"
        />
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
                  }))
                : allEntities.map((ent) => ({
                    label: `${ent.name} (${t('addEntity.' + ent.type)})`,
                    value: ent.id,
                  }))),
            ]"
            :placeholder="$t('addEntity.null')"
          />
        </div>

        <div class="form-input-container shadow-sm" v-if="newEntity.type !== 'category'">
          <label for="category" class="form-label">{{ $t('addEntity.category') }}:</label>
          <VueSelect
            v-model="newEntity.categoryId"
            name="category"
            :options="allCategories.map((cat) => ({ label: cat.name, value: cat.id }))"
            :placeholder="$t('addEntity.null')"
          />
        </div>

        <div class="form-input-container shadow-sm">
          <label for="name" class="form-label">{{ $t('addEntity.name') }}:</label>
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
          <label for="name" class="form-label"
            >{{ $t('addEntity.code') }}: <i class="bi bi-info-circle icon-small"></i
          ></label>
          <div class="input-with-icon form-control">
            <input
              id="name"
              type="text"
              class="form-control"
              placeholder=""
              readonly
              v-model="newEntity.code"
            />
            <i class="bi bi-upc-scan" @click="scanBarcode"></i>
          </div>
        </div>
      </template>

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
              <span>{{ attr.name || 'Nowy atrybut' }}</span>
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
                <label class="form-label mb-0">Typ:</label>
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
                <label class="form-label mb-0">Nazwa:</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="attr.name"
                  placeholder="Nazwa atrybutu"
                  required
                />
              </div>
              <!-- Opcje dla radio, checkbox, select -->
              <div v-if="['radio', 'checkbox', 'select'].includes(attr.type)" class="mb-2 ms-4">
                <label>Opcje:</label>
                <div
                  v-for="(option, optIdx) in attr.options"
                  :key="optIdx"
                  class="d-flex gap-2 mb-1"
                >
                  <input
                    type="text"
                    class="form-control"
                    v-model="attr.options[optIdx]"
                    placeholder="Wartość opcji"
                    required
                  />
                  <button
                    type="button"
                    class="btn btn-danger btn-sm"
                    @click="attr.options.splice(optIdx, 1)"
                  >
                    Usuń
                  </button>
                </div>
                <button
                  type="button"
                  class="btn btn-secondary btn-sm mt-1"
                  @click="attr.options.push('')"
                >
                  Dodaj opcję
                </button>
              </div>
              <!-- Pole wartości nie jest dostępne dla radio, checkbox, select -->
              <div
                v-if="!['radio', 'checkbox', 'select'].includes(attr.type)"
                class="d-flex align-items-center gap-2"
              >
                <label class="form-label mb-0">Wartość:</label>
                <component
                  :is="attr.type === 'textarea' ? 'textarea' : 'input'"
                  :type="attr.type !== 'textarea' ? attr.type : undefined"
                  class="form-control"
                  v-model="attr.value"
                  :required="attr.required"
                  @input="updateAttribute(idx, 'value', attr.value)"
                  placeholder="Wartość atrybutu"
                />
              </div>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="'required-' + attr.id"
                  v-model="attr.required"
                />
                <label class="form-check-label" :for="'required-' + attr.id"> Wymagane </label>
              </div>
              <button
                type="button"
                class="btn btn-danger align-self-end"
                @click="removeAttribute(idx)"
              >
                <i class="bi bi-trash"></i> Usuń
              </button>
            </div>
          </div>
        </div>
      </div>

      <button class="btn btn-secondary mt-3" type="button" @click="addAttribute">
        Dodaj atrybut
      </button>
      <button class="btn btn-primary mt-3" type="submit">{{ $t('addEntity.add') }}</button>
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
const { t } = useI18n()

defineOptions({
  name: 'AddEntity',
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
  attributes: [],
})

const attributes = ref([])
const barcode = ref(null)

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
  // Jeśli zmieniamy typ na radio, checkbox lub select, resetuj opcje
  if (key === 'type' && ['radio', 'checkbox', 'select'].includes(val)) {
    attributes.value[idx].options = []
    // Dla tych typów nie ma wartości domyślnej
    attributes.value[idx].value = ''
  }
  // Jeśli zmieniamy typ na inny niż radio, checkbox, select, usuń opcje
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
</style>
