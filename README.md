# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
<div align="center">

  <img src="https://via.placeholder.com/150x150?text=SQAHub" alt="SQAHub Logo" width="120" height="120" />

  # SQAHub Frontend (FE)

  <p>
    <b>Modern Testing Management System (TMS) Dashboard</b>
  </p>

  <a href="https://reactjs.org/">
    <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  </a>
  <a href="https://vitejs.dev/">
    <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License" />
  </a>

  <br />
  <br />

  <p align="center">
    <strong>SQAHub</strong> membantu tim QA mengelola siklus pengujian perangkat lunak dengan lebih terstruktur, cepat, dan transparan.
    <br />
    Frontend ini berkomunikasi dengan backend <a href="#">Spring Boot (Java)</a>.
  </p>
</div>

---

## ✨ Fitur Unggulan

<table>
  <tr>
    <td width="50%">
      <h3>📊 Dashboard Interaktif</h3>
      <p>Visualisasi metrik pengujian, progress bar, dan status pass/fail secara real-time.</p>
    </td>
    <td width="50%">
      <h3>🧪 Test Case Management</h3>
      <p>Buat, edit, dan organisir test case, test suites, dan test plans dengan mudah.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🚀 Test Execution</h3>
      <p>Jalankan pengujian manual, catat hasil, dan lampirkan bukti bug secara langsung.</p>
    </td>
    <td width="50%">
      <h3>👥 Team Collaboration</h3>
      <p>Manajemen akses user untuk QA Lead, Tester, dan Developer.</p>
    </td>
  </tr>
</table>

## 🛠️ Teknologi yang Digunakan

Project ini dibangun menggunakan *tech stack* modern untuk memastikan performa dan *developer experience* terbaik:

| Kategori | Teknologi |
| :--- | :--- |
| **Core Framework** | React 18 |
| **Language** | TypeScript |
| **Build Tool** | Vite |
| **Styling** | CSS Modules / Tailwind (Sesuaikan) |
| **HTTP Client** | Axios |
| **Routing** | React Router DOM |
| **Backend** | Spring Boot (Java) |

## ⚙️ Persiapan & Instalasi

Ikuti langkah mudah ini untuk menjalankan project di komputer lokal Anda:

### 1. Prasyarat
Pastikan Anda sudah menginstall:
* [Node.js](https://nodejs.org/) (v16+)
* [Git](https://git-scm.com/)

### 2. Instalasi
```bash
# Clone repository
git clone [https://github.com/username-anda/sqahub-fe.git](https://github.com/username-anda/sqahub-fe.git)

# Masuk ke direktori
cd sqahub-fe

# Install dependencies
npm install
# atau
yarn install
