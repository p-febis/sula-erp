import { defineConfig } from 'vitest/config'
import { config } from 'dotenv'
import path from 'path'

config()

export default defineConfig({
  test: {
    env: process.env,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
