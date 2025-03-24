import { defineConfig } from 'vite';
import {createVitePlugins} from './build/vite'
import path from "path"


// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    port: 3000, // 默认端口号
    open: true, // 启动时自动打开浏览器
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss', '.css'],
    alias: {
      '@': path.resolve(__dirname, 'src'), // 将 @ 指向 src 目录
    },
  },
  plugins: [createVitePlugins()], // 引入插件
  css:{
    preprocessorOptions:{
     scss:{
       additionalData: '@use "@/styles/variables.scss" as *;',
       javascriptEnabled: true,
       api: 'modern-compiler',
       silenceDeprecations: ['legacy-js-api'], // 静默特定弃用警告
     }
    }
  },
  build: {
    outDir: 'dist', // 输出目录
    emptyOutDir: true, // 在构建前清空输出目录
    rollupOptions: {
      output: {
        entryFileNames: '[name].[hash].js',
        chunkFileNames: '[name].[hash].js',
        assetFileNames: '[name].[hash][extname]',
      },
    },
  },
});
