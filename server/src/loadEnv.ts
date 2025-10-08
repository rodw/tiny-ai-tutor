import dotenv from "dotenv";
import envalid from "envalid";
import fs from "fs";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const dotEnvCandidates = [
  path.resolve(__dirname, "../.env"),
  path.resolve(__dirname, "../../.env"),
];

const envSpec = {
  OPENAI_KEY: envalid.str(),
  OPENAI_MODEL: envalid.str({default: "gpt-4o"}),
  SERVER_PORT: envalid.num({default: 3000}),
  NODE_DEBUG: envalid.str({default: ""}),
};

function _loadDotEnv() {
  for (const envFile of dotEnvCandidates) {
    if (fs.existsSync(envFile)) {
      dotenv.config({ path: envFile });
      return;
    }
  }
}

function _cleanEnv() {
  return envalid.cleanEnv(process.env, envSpec);
}

export type EnvVars = envalid.CleanedEnv<typeof envSpec>

export function loadEnv(): EnvVars {
  _loadDotEnv();
  return _cleanEnv();
}