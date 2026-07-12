import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  base: process.env.NODE_ENV === 'production' ? '/Mundo-do-Esporte/' : '/',
=======
  base: '/EvoluaFit/',
>>>>>>> c8796498efbab4642c148fd6ac0020e8ff2b5889
})
