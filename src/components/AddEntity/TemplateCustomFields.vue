<template>
  <div class="template-custom-fields">
    <div class="form-input-container" v-for="field in sortedFields" :key="field.id">
      <label :for="'field-' + field.id" class="form-label">
        {{ field.fieldName }}:
        <span v-if="field.isRequired" class="required-field">*</span>
      </label>

      <textarea
        v-if="field.fieldType === 'textarea'"
        class="form-control"
        :class="{ 'is-invalid': errors[field.id] }"
        :id="'field-' + field.id"
        :value="modelValue[field.id]"
        @input="updateValue(field.id, $event.target.value)"
        autocomplete="off"
        :readonly="readonly"
      />

      <input
        v-else
        :type="field.fieldType"
        class="form-control"
        :class="{ 'is-invalid': errors[field.id] }"
        :id="'field-' + field.id"
        :value="modelValue[field.id]"
        @input="updateValue(field.id, $event.target.value)"
        autocomplete="off"
        :readonly="readonly"
      />

      <div v-if="errors[field.id]" class="invalid-feedback">
        {{ errors[field.id] }}
      </div>
    </div>
  </div>
</template>

<script>
import { trans } from '@/translations/translator.js';

export default {
  name: 'TemplateCustomFields',
  props: {
    fields: {
      type: Array,
      required: true,
      default: () => [],
    },
    modelValue: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      errors: {},
    };
  },
  computed: {
    sortedFields() {
      return [...this.fields].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    },
  },
  methods: {
    validateFields() {
      this.errors = {};
      let isValid = true;

      this.fields.forEach((field) => {
        const value = this.modelValue[field.id];

        if (field.isRequired) {
          if (value === undefined || value === null || String(value).trim() === '') {
            this.errors[field.id] = trans(
              'validation.required',
              {},
              this.$.appContext.provides.i18n,
            );
            isValid = false;
          }
        }

        if (value) {
          if (field.fieldType === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              this.errors[field.id] = trans(
                'validation.email',
                {},
                this.$.appContext.provides.i18n,
              );
              isValid = false;
            }
          }
          if (field.fieldType === 'url') {
            try {
              new URL(value);
            } catch (_) {
              this.errors[field.id] = trans('validation.url', {}, this.$.appContext.provides.i18n);
              isValid = false;
            }
          }
          if (field.fieldType === 'number') {
            if (isNaN(value)) {
              this.errors[field.id] = trans(
                'validation.number',
                {},
                this.$.appContext.provides.i18n,
              );
              isValid = false;
            }
          }
        }
      });

      return isValid;
    },

    updateValue(id, value) {
      if (this.errors[id]) {
        delete this.errors[id];
      }
      this.$emit('update:modelValue', {
        ...this.modelValue,
        [id]: value,
      });
    },
  },
};
</script>

<style scoped></style>
