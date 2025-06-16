import dts from 'rollup-plugin-dts'
import { defineConfig } from 'rollup'

export default defineConfig({
  input: 'dist/src/index.d.ts', // entry .d.ts file
  output: {
    file: 'dist/index.d.ts',      // final single declaration file
    format: 'es',
  },
  plugins: [dts()],
})
