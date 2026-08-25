import { additionalFiles } from "@trigger.dev/build/extensions/core";
import { pythonExtension } from "@trigger.dev/python/extension";
import { defineConfig } from "@trigger.dev/sdk";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

const project = process.env.TRIGGER_PROJECT_REF;
if (!project) throw new Error("TRIGGER_PROJECT_REF is required");

export default defineConfig({
  project,
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
        requirementsFile: "./python/requirements.txt",
        scripts: ["./python/**/*.py"],
      }),
    ],
  },
});
