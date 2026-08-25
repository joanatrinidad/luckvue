import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// LEARNING: This file configures Vite — the tool that runs your dev server
// and bundles your app for production.
// @vitejs/plugin-react adds JSX/TSX support (lets you write HTML inside JS).
export default defineConfig({
  plugins: [react()],
})
