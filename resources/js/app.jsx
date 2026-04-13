/**
 * app.jsx
 * 
 * Entry point untuk aplikasi React dengan Inertia.js
 * 
 * Fungsi file ini:
 * - Menginisialisasi Inertia.js dengan React
 * - Mengatur resolver untuk load komponen Pages secara dinamis
 * - Setup progress bar untuk navigasi
 * 
 * Cara kerjanya:
 * 1. Import dependencies (React, Inertia, CSS)
 * 2. Setup createInertiaApp dengan resolver untuk Pages
 * 3. Render aplikasi ke DOM element #app
 */

import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Mall Approval System';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
