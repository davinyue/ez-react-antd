import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig({
  plugins: [
    react({
      // 使用自动 JSX runtime，不需要手动导入 React
      jsxRuntime: 'automatic',
    }),
    libInjectCss(),
    dts({
      insertTypesEntry: true,
      outDir: 'dist',
      compilerOptions: {
        // 确保注释被保留到 .d.ts 文件中
        removeComments: false,
      },
      // 确保正确处理 UTF-8 编码
      beforeWriteFile: (filePath, content) => {
        // 确保输出文件使用 UTF-8 编码
        return {
          filePath,
          content: content,
        };
      },
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'EzReactAntd',
      formats: ['es'], // 只构建 ES 模块，移除 UMD
      fileName: (format) => `ez-react-antd.${format}.js`,
    },
    rollupOptions: {
      // [external]: 告诉打包工具哪些第三方库不要打包进 ez-react-antd 中
      // 1. 减小包体积 (react, antd 等由宿主环境提供)
      // 2. 避免多实例冲突 (如 react 需要单例)
      // 3. 业务项目必须安装这些依赖
      external: [
        'react',
        'react-dom',
        'antd',
        'react-redux',
        'react-router',
        '@fortawesome/fontawesome-svg-core',
        '@fortawesome/free-regular-svg-icons',
        '@fortawesome/free-solid-svg-icons',
        '@fortawesome/react-fontawesome',
        'antd-img-crop',
        'react-select',
        'react-window'
      ],
      // 移除 output.globals 配置，因为不再构建 UMD 格式
    },
  },
});
