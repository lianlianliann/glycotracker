import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/GlycemicTracker.Frontend/src/assets', filename)
      }
    },
  }
}
export default defineConfig({
  root: 'src/GlycemicTracker.Frontend', 
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/GlycemicTracker.Frontend/src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
