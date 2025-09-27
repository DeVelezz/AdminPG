import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import history from 'connect-history-api-fallback'


// https://vite.dev/config/
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    middlewareMode: false,
    setupMiddlewares(middlewares) {
      middlewares.use(history())
      return middlewares
    }
  }
})
