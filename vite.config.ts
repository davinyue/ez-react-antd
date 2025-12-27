import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig({
    plugins: [
        react(),
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
            name: 'EzAntd',
            formats: ['es', 'umd'],
            fileName: (format) => `ez-antd.${format}.js`,
        },
        rollupOptions: {
            // [external]: 告诉打包工具哪些第三方库不要打包进 ez-antd 中
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
            output: {
                // [globals]: 仅用于 UMD 构建 (script标签引入时)
                // 定义外部依赖在浏览器全局变量中的名称 (window.React)
                globals: {
                    'react': 'React',
                    'react-dom': 'ReactDOM',
                    'antd': 'antd',
                    'react-redux': 'ReactRedux',
                    'react-router': 'ReactRouter',
                    '@fortawesome/fontawesome-svg-core': 'FontAwesome',
                    '@fortawesome/free-regular-svg-icons': 'FontAwesomeRegular',
                    '@fortawesome/free-solid-svg-icons': 'FontAwesomeSolid',
                    '@fortawesome/react-fontawesome': 'ReactFontAwesome',
                    'antd-img-crop': 'ImgCrop',
                    'react-select': 'Select',
                    'react-window': 'ReactWindow'
                },
            },
        },
    },
});
