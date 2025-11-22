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

      <div class="collection-slider-container">
        <span>{{ trans('home.largestCollections') }}</span>
        <div class="collection-slider">
          <img class="img-thumbnail" src="@/assets/images/logo.png" alt="logo" />
          <span>{{ trans('home.collection') }}</span>
          <div class="count-container">
            <span>0</span>
            <span>{{ trans('home.items') }}</span>
          </div>
        </div>
      </div>
      <div class="collection-slider-container">
        <span>{{ trans('home.recentCollections') }}</span>
        <div class="collection-slider">
          <img class="img-thumbnail" src="@/assets/images/logo.png" alt="logo" />
          <span>{{ trans('home.collection') }}</span>
          <div class="count-container">
            <span>0</span>
            <span>{{ trans('home.items') }}</span>
          </div>
        </div>
      </div>

      <div class="expiry-date-items shadow-sm">
        <i class="bi bi-exclamation"></i>
        <span>2</span>
        <span>{{ trans('home.expiryWarning') }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { trans } from '@/translations/translator.js'
import { getDashboardData } from '@/services/entityService.js'
export default {
  name: 'HomePage',
  data() {
    return {
      dashboardData: {
        items: [],
        categories: [],
        places: [],
      },
    }
  },
  mounted() {
    try {
      getDashboardData().then((data) => {
        this.dashboardData = data
      })
    } catch (error) {
      this.dashboardData = { items: [], categories: [], places: [] }
    }
  },
  methods: {
    trans,
  },
  computed: {
    itemsCount() {
      return this.dashboardData?.items?.length ?? 0
    },
    categoriesCount() {
      return this.dashboardData?.categories?.length ?? 0
    },
    placesCount() {
      return this.dashboardData?.places?.length ?? 0
    },
  },
}
</script>

<style scoped></style>
