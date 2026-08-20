import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const solc = require("solc");

const root = process.cwd();
const sourcePath = path.join(root, "contracts/evm/MemeToken.sol");
const source = fs.readFileSync(sourcePath, "utf8");

function findImports(importPath) {
  const candidates = [
    path.join(root, "node_modules", importPath),
    path.join(root, "contracts/evm", importPath),
  ];

  for (const file of candidates) {
    if (fs.existsSync(file)) {
      return { contents: fs.readFileSync(file, "utf8") };
    }
  }

  return { error: `File not found: ${importPath}` };
}

const input = {
  language: "Solidity",
  sources: {
    "MemeToken.sol": { content: source },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    evmVersion: "paris",
    outputSelection: {
      "*": {
        "*": ["evm.bytecode.object"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
const errors = (output.errors || []).filter((item) => item.severity === "error");

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error.formattedMessage || error.message);
  }
  process.exit(1);
}

const bytecode = output.contracts["MemeToken.sol"]?.MemeToken?.evm?.bytecode?.object;

if (!bytecode) {
  console.error("solc did not return MemeToken bytecode.");
  process.exit(1);
}

const file = `export const memeTokenBytecode = "0x${bytecode}" as const;\n`;
const dest = path.join(root, "lib/contracts/evm/meme-token-bytecode.ts");
fs.writeFileSync(dest, file);
console.log(`Wrote ${dest} (${bytecode.length / 2} bytes)`);
