import { additionalFiles } from "@trigger.dev/build/extensions/core";
import { pythonExtension } from "@trigger.dev/python/extension";
import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "proj_hmocyjfdufxyfnxiaixa",
  runtime: "node",
  dirs: ["./src/trigger"],
  maxDuration: 1800,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      factor: 2,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10_000,
      randomize: true,
    },
  },
  build: {
    external: ["sharp", "@takumi-rs/core", "@takumi-rs/image-response"],
    extensions: [
      additionalFiles({ files: ["./assets/**"] }),
      pythonExtension({
        devPythonBinaryPath: "python3",
        requirements: ["Pillow==11.3.0"],
        scripts: ["./python/**/*.py"],
      }),
    ],
  },
});
