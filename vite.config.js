import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        granja: resolve(__dirname, 'granja.html'),
        granjaNave: resolve(__dirname, 'granja-nave.html'),
        granjaParque: resolve(__dirname, 'granja-parque.html'),
        granjaEmbalaje: resolve(__dirname, 'granja-embalaje.html'),
        granjaHuevos: resolve(__dirname, 'granja-huevos.html'),
        historia: resolve(__dirname, 'historia.html'),
        principios: resolve(__dirname, 'principios.html'),
        contacto: resolve(__dirname, 'contacto.html'),
      }
    }
  }
})

