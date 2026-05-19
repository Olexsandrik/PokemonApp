import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
 server: {
    allowedHosts: [
      '.ngrok-free.app',
      'your-specific-id.ngrok-free.app' 
    ]
  }
})
