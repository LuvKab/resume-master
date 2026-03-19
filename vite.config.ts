import { createLogger, defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import tsconfigPaths from "vite-tsconfig-paths";

const viteLogger = createLogger();
const originalWarn = viteLogger.warn;

viteLogger.warn = (msg, options) => {
  if (
    msg.includes("Module level directives cause errors when bundled") &&
    msg.includes('"use client"')
  ) {
    return;
  }

  originalWarn(msg, options);
};

export default defineConfig({
  customLogger: viteLogger,
  server: {
    port: 3000
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" &&
          warning.message.includes('"use client"') &&
          warning.id?.includes("node_modules")
        ) {
          return;
        }

        warn(warning);
      }
    }
  },
  optimizeDeps: {
    exclude: ["pdfjs-dist"]
  },
  ssr: {
    noExternal: ["pdfjs-dist"]
  },
  plugins: [
    tsconfigPaths(),
    tanstackStart({
      srcDirectory: "src",
      router: {
        routesDirectory: "routes"
      }
    }),
    nitro(),
    viteReact()
  ]
});
