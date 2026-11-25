import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
export default defineConfig({
 resolve: {alias: [
 {find:'@',replacement:fileURLToPath(new URL('./src',import.meta.url))},
 {find:/^@higgsfield-ai\/icons(\/.*)?$/,replacement:fileURLToPath(new URL('./src/lib/quanta-icons.ts',import.meta.url))}
 ]},
 plugins:[react(),tailwindcss()],
 build:{outDir:'dist'}
})
