<template>
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
</template>

<script>
import { trans } from '@/translations/translator.js';
import VueSelect from 'vue3-select-component';
import iconsObject from '/src/assets/icons-picker.json';

const animationDuration = 5000;
export default {
  name: 'EntityPreview',
  components: { VueSelect },
  props: {
    newEntity: { type: Object, required: true },
    initialIcon: { type: String, default: null },
  },
  created() {
    this.iconOptions = this.iconNamesArray.map((icon) => ({ label: icon, value: icon }));
  },
  async mounted() {
    this.newEntity.type = this.initialType;
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
  data() {
    return {
      isColorpickerActive: true,
      showIconSelect: false,
      isIconClicked: true,
      iconNamesArray: Object.keys(iconsObject),
      iconOptions: [],
    };
  },
  methods: {
    trans,
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
    handleClickOutside(e) {
      if (this.showIconSelect) {
        const select = this.$refs.iconSelect?.$el || this.$refs.iconSelect;
        if (select && !select.contains(e.target)) {
          this.showIconSelect = false;
        }
      }
    },
  },
};
</script>

<style scoped></style>
