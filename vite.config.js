// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { resolve } from 'path';
// import fs from 'fs/promises';
// // Library configuration
// export default defineConfig({
//   resolve: {
//     alias: {
//       src: resolve(__dirname, 'src'),
//     },
//   },
//   esbuild: {
//     loader: 'tsx',
//     include: /src\/.*\.(jsx|tsx|js)$/,
//     exclude: [],
//   },
//   optimizeDeps: {
//     esbuildOptions: {
//       plugins: [
//         {
//           name: 'load-tsx-and-jsx-files',
//           setup(build) {
//             build.onLoad(
//                 { filter: /src\\.*\.(tsx|js)$/ },
//                 async (args) => ({
//                   loader: 'tsx',
//                   contents: await fs.readFile(args.path, 'utf8'),
//                 })
//             );
//           },
//         },
//       ],
//     },
//   },
//   plugins: [
//     react({
//       babel: {
//         plugins: [
//           [
//             'babel-plugin-styled-components',
//             {
//               displayName: true,
//               fileName: false,
//             },
//           ],
//         ],
//       },
//     }),
//   ],
//   build: {
//     lib: {
//       // entry: 'src/index.ts',
//       entry: 'src/main.jsx',
//       name: 'MyLibrary',
//       fileName: (format) => `index.${format}.js`,
//       formats: ['es', 'umd'],
//     },
//     rollupOptions: {
//       external: ['react', 'react-dom'],
//       output: {
//         globals: {
//           react: 'React',
//           'react-dom': 'ReactDOM',
//         },
//       },
//     },
//   },
//   server: {
//     port: 3000,
//   },
// });

// =====================

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs/promises';
// Build configuration
export default defineConfig({
  resolve: {
    alias: {
      src: resolve(__dirname, 'src'),
      '@': resolve(__dirname, 'src'),
    },
  },
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.(jsx|tsx|js)$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          name: 'load-tsx-and-jsx-files',
          setup(build) {
            build.onLoad(
                { filter: /src\\.*\.(tsx|js)$/ },
                async (args) => ({
                  loader: 'tsx',
                  contents: await fs.readFile(args.path, 'utf8'),
                })
            );
          },
        },
      ],
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [
          [
            'babel-plugin-styled-components',
            {
              displayName: true,
              fileName: false,
            },
          ],
        ],
      },
    }),
  ],
  publicDir: 'public', // Thư mục chứa các tệp tĩnh
  build: {
    // outDir mặc định là 'dist'
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
  server: {
    port: 3000,
  },
});
