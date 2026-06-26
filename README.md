# 🖥️ CareBridge+ Frontend Application

Welcome to the **CareBridge+** frontend application. This is a state-of-the-art React 19 single-page application (SPA) built with Vite and Tailwind CSS. It powers the user interfaces, dashboard portals, and real-time workspaces for admins, hospital networks, primary care clinics, and patients.

---

## 🎨 Tech Stack & UI Design System

*   **React 19**: Leveraging modern hooks, concurrent features, and streamlined state management.
*   **Vite 6**: Fast bundling, instantaneous Hot Module Replacement (HMR), and optimized production compilation.
*   **Tailwind CSS v4**: Utility-first styling utilizing CSS variables and compile-time performance optimizations.
*   **Motion (Framer Motion)**: Liquid transitions, glassmorphic layout updates, and interactive feedback loops.
*   **Recharts**: Custom responsive visualization charts for health metrics (vitals, medication logs) and operational dashboards.
*   **Lucide React**: Crisp, modern SVG iconography suited for clinical software environments.

---

## 📂 Codebase Directory Structure

The frontend application code lives under the `frontend/` directory, structured as follows:

```bash
frontend/
├── public/                # Static assets (logos, illustrations, compiled PDF reports)
├── src/
│   ├── assets/            # Embedded images, icons, and logo SVGs
│   ├── components/        # UI Component Library
│   │   ├── analyst/       # Vitals graphs and health logs tracking analytics
│   │   ├── auth/          # Registration, login, and access recovery flows
│   │   ├── common/        # Shared components (buttons, badges, inputs, loaders, modals)
│   │   ├── landing/       # High-conversion website homepage and features overview
│   │   ├── legal/         # ABDM regulations and platform compliance notices
│   │   ├── medicine/      # Adherence metrics, logs scheduler, and reminder configurations
│   │   └── panels/        # Core Role-Based Workspaces (Admin, Hospital, Clinic, Patient, CRM)
│   ├── services/          # Client-side API wrappers & network abstractions
│   │   └── firebaseService.ts # Shared Firestore observers and query wrappers with local caching
│   ├── types.ts           # Shared TypeScript interfaces for patients, referrals, and users
│   ├── firebase.ts        # Firebase Core initialization & IndexedDB offline cache manager
│   ├── index.css          # Tailwind CSS directives & global custom styling rules
│   └── main.tsx           # Application bootstrapping
├── index.html             # HTML entry point (incorporating Outfit/Inter typography)
├── vite.config.ts         # Vite build settings, path aliases (@/*), and process.env injections
└── README.md              # Frontend Developer Guide (this file)
```

---

## ⚙️ Configuration & Firebase Integration

The frontend connects directly to **Firebase Firestore** and **Firebase Auth**. The credentials are loaded from `firebase-applet-config.json` at the project root:

```json
{
  "apiKey": "your-api-key",
  "authDomain": "your-auth-domain",
  "projectId": "your-project-id",
  "storageBucket": "your-storage-bucket",
  "messagingSenderId": "your-messaging-sender-id",
  "appId": "your-app-id",
  "firestoreDatabaseId": "your-custom-firestore-db-id"
}
```

> [!NOTE]
> Multi-tab offline persistence is automatically configured in `src/firebase.ts` via `enableMultiTabIndexedDbPersistence`. If network connectivity drops, the client continues to serve local snapshots seamlessly.

---

## 🚀 Key Modules & Role Panels

CareBridge+ contains 5 key operational interfaces:

1.  **Patient Dashboard (`PatientPanel.tsx`)**: Provides patients with charts to log weight/BP, a medicine tracker with an automated **Medication Adherence Score**, and an interactive chat window with the **AI Health Coach**.
2.  **Clinic Workspace (`ClinicPanel.tsx`)**: Empowers clinics to register new patients, run real-time OPD queues, refer patients to hospital specialists, and use the **AI Marketing Studio** to draft posters/messages.
3.  **Hospital Workspace (`HospitalPanel.tsx`)**: Enables hospital coordinators to view referred patients, triage urgency tiers, assign internal specialists, and edit department directories.
4.  **Admin Center (`AdminPanel.tsx`)**: The central control hub. Handles clinic/hospital credential verification, approves registration queues, configures platform pricing, and tracks server audit logs.
5.  **Healthcare CRM (`HealthcareCRM.tsx`)**: Interactive Kanban boards and timeline streams for supervising patient navigation pipelines and post-discharge surveys.

---

## 🛠️ Development & Build Commands

All development tasks should be coordinated from the **project root directory** for proper monorepo environment variable injection:

*   **Start Local Server**:
    ```bash
    npm run dev
    ```
    *This compiles the React code and hosts it on port `3000` via the unified Express-Vite backend middleware.*

*   **Production Compilation**:
    ```bash
    npm run build
    ```
    *Vite bundles the frontend application and outputs files into the root `dist/` directory.*

*   **Preview Build Output**:
    ```bash
    npm run preview
    ```
    *Spins up a lightweight local static server serving the built `dist/` folder.*
