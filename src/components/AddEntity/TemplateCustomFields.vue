<template>
  <div class="template-custom-fields">
    <div class="form-input-container" v-for="field in sortedFields" :key="field.id">
      <label :for="field.id" class="form-label">
        {{ field.fieldName }}:
        <span v-if="field.isRequired" class="required-field">*</span>
      </label>

      <textarea
        v-if="field.fieldType === 'textarea'"
        class="form-control"
        :id="field.id"
        :required="field.isRequired"
        :value="modelValue[field.id]"
        @input="updateValue(field.id, $event.target.value)"
        autocomplete="off"
      />

      <input
        v-else
        :type="field.fieldType"
        class="form-control"
        :id="field.id"
        :required="field.isRequired"
        :value="modelValue[field.id]"
        @input="updateValue(field.id, $event.target.value)"
        autocomplete="off"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'TemplateCustomFields',
  props: {
    fields: {
      type: Array,
      required: true,
      default: () => [],
    },
    // Oczekujemy obiektu { 'id_pola': 'wartosc' }
    modelValue: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
  emits: ['update:modelValue'],
  computed: {
    sortedFields() {
      // Sortowanie bez mutowania propsa
      return [...this.fields].sort((a, b) => a.sort_order - b.sort_order);
    },
  },
  methods: {
    updateValue(id, value) {
      // Emitujemy nowy obiekt wartości, zachowując pozostałe pola
      this.$emit('update:modelValue', {
        ...this.modelValue,
        [id]: value,
      });
    },
  },
};
</script>

<style scoped>
/* Tutaj style z twojego głównego pliku, jeśli są specyficzne dla inputów */
</style>
