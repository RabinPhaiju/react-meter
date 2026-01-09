import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Replace 'your-username' and 'your-repo' below with your actual GitHub username and repository name
export default defineConfig({
  base: '/react-meter/',
  plugins: [react()],
})
