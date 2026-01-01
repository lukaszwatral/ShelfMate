<h1 align="center">ShelfMate</h1>

<p align="center">
  <em>Transform Storage, Maximize Efficiency, Elevate Inventory Management</em>
</p>

<div align="center">

  <img src="https://img.shields.io/github/last-commit/lukaszwatral/ShelfMate?style=flat-square&color=333" alt="Last Commit" />
  <img src="https://img.shields.io/github/languages/top/lukaszwatral/ShelfMate?style=flat-square&color=3178C6" alt="Top Language" />
  <img src="https://img.shields.io/github/languages/count/lukaszwatral/ShelfMate?style=flat-square&color=007EC6" alt="Language Count" />

<br/><br/>

<em>Built with the tools and technologies:</em>

<br/><br/>

  <img src="https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue.js" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white" alt="Capacitor" />
  <img src="https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android" />

  <br/>

  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap" />
  <img src="https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white" alt="Sass" />
  <img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm" />
  <img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black" alt="Prettier" />

</div>

<br/>

## 📖 Overview

**ShelfMate** is an open-source inventory management and shelving organization tool crafted for developers and power users. It offers a scalable, cross-platform architecture that seamlessly integrates Android and iOS environments using **Capacitor**.

The app leverages **SQLite** for robust offline data storage and **Kysely** for type-safe database queries, ensuring high performance on mobile devices.

## ✨ Key Features

* 🎯 **Hierarchical Organization**: Manage Items, Categories, and Places in a nested folder or list structure.
* 🧩 **Modular Data Models**: Entities, tags, files, and custom fields enable flexible, detailed inventory tracking.
* 📸 **Physical Tagging**:
    * **Barcode Scanner**: Link items to physical barcodes.
    * **NFC Support**: Write and read NFC tags to quickly identify items.
* 🔍 **Smart Search**: Instant full-text search (FTS5) across entities and custom values.
* ⏰ **Expiry Tracking**: Automated local notifications 24h before an item expires (based on `expiry_date` attributes).
* 💾 **Offline First**: Built on top of a native SQLite database; no internet connection required.
* 🌍 **Localization**: Supports multiple languages (English, Polish, etc.), enhancing global usability.

## 🛠️ Tech Stack

* **Framework**: [Vue.js 3](https://vuejs.org/) (Vite)
* **Mobile Engine**: [Capacitor](https://capacitorjs.com/)
* **Database**:
    * [SQLite](https://sqlite.org/) (via `@capacitor-community/sqlite`)
    * [Kysely](https://kysely.dev/) (Type-safe SQL query builder)
* **Styling**: SCSS, Bootstrap 5 (Grid & Utilities), Bootstrap Icons
* **Plugins**:
    * `@capacitor/barcode-scanner`
    * `@capgo/capacitor-nfc`
    * `@capacitor/filesystem`
    * `@capacitor/local-notifications`

## 📂 Project Structure

```text
src/
├── assets/          # Static assets (images, icons)
├── components/      # Vue components (EntityList, AttributeManager, etc.)
├── db/              # Database layer
│   ├── models/      # Data models (Entity, Code, CustomField)
│   └── repositories/# Data access logic (EntityRepository, etc.)
├── services/        # Business logic (History, Notification, Backup)
├── translations/    # i18n logic
├── views/           # Main application views (Home, AddEntity, Settings)
└── App.vue          # Root component