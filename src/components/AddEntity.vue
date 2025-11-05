<template>
  <div class="add-entity-container">
    <form @submit.prevent="addEntity">
      <div class="form-floating">
        <select name="type" class="form-select" id="type" required v-model="newEntity.type">
          <option :value="null">{{ $t('addEntity.typeDefault') }}</option>
          <option value="item">{{ $t('addEntity.item') }}</option>
          <option value="category">{{ $t('addEntity.category') }}</option>
          <option value="place">{{ $t('addEntity.place') }}</option>
        </select>
        <label for="type">{{ $t('addEntity.type') }}</label>
      </div>
      <div class="form-floating">
        <select name="parent" id="parent" class="form-select" v-model="newEntity.parentId">
          <option :value="null">{{ $t('addEntity.null') }}</option>
          <option v-for="entity in allEntities" :key="entity.id" :value="entity.id">
            {{ entity.name }} ({{ entity.type }})
          </option>
        </select>
        <label for="parent">{{ $t('addEntity.parentEntity') }}</label>
      </div>
      <div class="form-floating">
        <input
          id="name"
          type="text"
          class="form-control"
          :placeholder="$t('addEntity.namePlaceholder')"
          required
          v-model="newEntity.name"
        />
        <label for="name" class="form-label">{{ $t('addEntity.name') }}</label>
      </div>
      <div class="form-floating">
        <textarea
          id="description"
          type="text"
          :placeholder="$t('addEntity.descriptionPlaceholder')"
          v-model="newEntity.description"
          class="form-control"
        />
        <label for="description">{{ $t('addEntity.description') }}</label>
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
import { ref, onMounted } from 'vue'
import { createEntity, getEntities } from '@/services/entityService.js'
import { useI18n } from 'vue-i18n'
import { AttributeTypeDescriptions, AttributeTypeEnumValues } from '@/Enum/AttributeTypeEnum.js'

const { t } = useI18n()

defineOptions({
  name: 'AddEntity',
})

const allEntities = ref([])
const newEntity = ref({
  type: null,
  name: '',
  description: '',
  parentId: null,
})

const attributes = ref([])

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
    allEntities.value = await getEntities()
  } catch (error) {
    console.error('Error fetching entities:', error)
  }
}
onMounted(async () => {
  await fetchEntities()
})

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
      parentId: null,
    }
    attributes.value = []
    await fetchEntities()
  } catch (error) {
    console.error('Error adding entity:', error)
  }
}
</script>

<style scoped>
.accordion-item {
  margin-bottom: 8px;
}
</style>
