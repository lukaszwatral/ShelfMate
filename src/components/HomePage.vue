<template>
  <div class="homepage">
    <div class="logo-container">
      <div class="logo">
        <img src="@/assets/images/logo.png" alt="logo" />
        <div class="logo-name">
          <span class="title">ShelfMate</span>
          <span class="subtitle">{{ trans('home.subtitle') }}</span>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="dashboard shadow-sm" v-if="dashboardData">
        <span>{{ trans('home.dashboardTitle') }}</span>
        <div class="dashboard-content">
          <router-link :to="{ name: 'item' }">
            <div class="tile-container">
              <div class="tile">
                <span>{{ itemsCount }}</span>
              </div>

              <span class="tile-name">{{ trans('home.items') }}</span>
            </div>
          </router-link>
          <router-link :to="{ name: 'category' }">
            <div class="tile-container">
              <div class="tile">
                <span>{{ categoriesCount }}</span>
              </div>
              <span class="tile-name">{{ trans('home.categories') }}</span>
            </div>
          </router-link>
          <router-link :to="{ name: 'place' }">
            <div class="tile-container">
              <div class="tile">
                <span>{{ placesCount }}</span>
              </div>
              <span class="tile-name">{{ trans('home.places') }}</span>
            </div>
          </router-link>
        </div>
      </div>

      <router-link :to="{ name: 'addEntity' }">
        <div class="add-container shadow-sm">
          <span class="add-label">
            {{ trans('home.addEntity') }}
          </span>

          <button class="add-circle-btn">
            <i class="bi bi-plus icon-large"></i>
          </button>
        </div>
      </router-link>

      <div
        class="expiry-date-items shadow-sm"
        v-if="expiringItems.length > 0"
        data-bs-toggle="offcanvas"
        data-bs-target="#expiringOffcanvas"
      >
        <i class="bi bi-exclamation"></i>
        <span>{{ expiringItems.length }}</span>
        <span>{{ trans('home.expiryWarning') }}</span>
      </div>

      <div
        class="offcanvas offcanvas-end"
        tabindex="-1"
        id="expiringOffcanvas"
        aria-labelledby="expiringOffcanvasLabel"
      >
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="expiringOffcanvasLabel">
            {{ trans('home.expiryListTitle') }}
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div class="offcanvas-body">
          <template v-for="item in expiringItems" :key="item.id">
            <router-link :to="{ name: 'viewEntity', params: { id: item.id } }">
              <EntityListItem :entity="item" />
            </router-link>
          </template>
        </div>
      </div>

      <div class="collection-slider-container" v-if="history.length > 0">
        <div class="header-row">
          <span>{{ trans('home.recent') }}</span>
          <i
            class="bi bi-trash3 text-danger cursor-pointer"
            @click="clearHistory"
            style="font-size: 1.1rem"
          ></i>
        </div>

        <div class="slider-wrapper">
          <div v-for="item in history" :key="item.id" class="slider-item" @click="openRecent(item)">
            <div class="icon-box">
              <i :class="`bi bi-${item.icon}`"></i>
            </div>

            <div class="text-content">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-type">{{ trans('addEntity.' + item.type) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { trans } from '@/translations/translator.js';
import { entityRepository } from '@/db/index.js';
import { HistoryService } from '@/services/HistoryService.js';
import EntityListItem from '@/components/EntityListItem.vue';

export default {
  name: 'HomePage',
  components: { EntityListItem },
  data() {
    return {
      dashboardData: {
        items: [],
        categories: [],
        places: [],
      },
      history: [],
      expiringItems: [],
    };
  },
  async mounted() {
    await Promise.all([this.fetchDashboardData(), this.loadHistory(), this.fetchExpiring()]);
  },
  computed: {
    itemsCount() {
      return this.dashboardData?.items?.length ?? 0;
    },
    categoriesCount() {
      return this.dashboardData?.categories?.length ?? 0;
    },
    placesCount() {
      return this.dashboardData?.places?.length ?? 0;
    },
  },
  methods: {
    trans,
    async fetchDashboardData() {
      try {
        const data = await entityRepository.findAll();
        const entities = data ? Object.values(data) : [];

        this.dashboardData = entities.reduce(
          (acc, entity) => {
            if (!entity || !entity.type) return acc;
            if (entity.type === 'item') acc.items.push(entity);
            else if (entity.type === 'category') acc.categories.push(entity);
            else if (entity.type === 'place') acc.places.push(entity);
            return acc;
          },
          { items: [], categories: [], places: [] },
        );
      } catch (error) {
        this.dashboardData = { items: [], categories: [], places: [] };
      }
    },
    async loadHistory() {
      try {
        const history = await HistoryService.getList();
        const checks = history.map(async (item) => {
          const entity = await entityRepository.find(item.id);
          return entity ? item : null;
        });

        const validItems = await Promise.all(checks);
        this.history = validItems.filter((item) => item !== null);
      } catch (e) {
        this.history = [];
      }
    },
    async clearHistory() {
      await HistoryService.clear();
      this.history = [];
    },
    openRecent(item) {
      this.$router.push({ name: 'viewEntity', params: { id: item.id } });
    },
    async fetchExpiring() {
      try {
        this.expiringItems = await entityRepository.findExpiringIn3Days();
      } catch (e) {
        this.expiringItems = [];
      }
    },
  },
};
</script>

<style scoped></style>
