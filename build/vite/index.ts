import AutoImport from 'unplugin-auto-import/vite';
import Vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import UnoCSS from "unocss/vite"

export function createVitePlugins() {
  return [
    Vue(),
    UnoCSS(),
    AutoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,     // .vue
        "src/auto-imports.d.ts" // 确保包含这个文件
      ],
      imports: ['vue', 'vue-router'],
      dts: 'src/types/auto-imports.d.ts',
      // eslintrc: {
      //   enabled: false, // Default `false`
      //   filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
      //   globalsPropValue: true // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
      // }
    }),
    Components({
      // 生成自定义 `auto-components.d.ts` 全局声明
      dts: 'src/types/auto-components.d.ts',
      globs: ['src/components/**/*.vue']
    })
  ];
}
