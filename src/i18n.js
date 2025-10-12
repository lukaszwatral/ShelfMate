import { createI18n } from 'vue-i18n'

const messages = {
  pl: {
    home: {
      subtitle: 'Składuj gdzie chcesz, jak chcesz.',
      dashboardTitle: 'Panel',
      items: 'Przedmioty',
      categories: 'Kategorie',
      places: 'Miejsca',
      addItem: 'Dodaj przedmiot',
      largestCollections: 'Największe kolekcje:',
      recentCollections: 'Ostatnie kolekcje:',
      expiryWarning: 'przedmiotom kończy się termin przydatności',
      collection: 'Kolekcja',
    },
  },
  en: {
    home: {
      subtitle: 'Store it where you want, how you want.',
      dashboardTitle: 'Dashboard',
      items: 'Items',
      categories: 'Categories',
      places: 'Places',
      addItem: 'Add item',
      largestCollections: 'Largest collections:',
      recentCollections: 'Recent collections:',
      expiryWarning: 'items are nearing their expiration date',
      collection: 'Collection',
    },
  },
}

export default createI18n({
  legacy: false,
  locale: 'pl',
  fallbackLocale: 'en',
  messages,
})
