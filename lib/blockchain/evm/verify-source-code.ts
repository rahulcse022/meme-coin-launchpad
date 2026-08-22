import fs from "node:fs";
import path from "node:path";
import { memeTokenBytecode } from "@/lib/contracts/evm/meme-token-bytecode";
import { supportedNetworks } from "@/config/chains";

function getExplorerApiUrl(networkId: string): string | undefined {
  switch (networkId) {
    case "ethereum":
    case "sepolia":
      return "https://api.etherscan.io/v2/api";
    case "bnb":
      return "https://api.bscscan.com/api";
    case "bsc-testnet":
      return "https://api-testnet.bscscan.com/api";
    case "polygon":
      return "https://api.polygonscan.com/api";
    case "base":
      return "https://api.basescan.org/api";
    case "arbitrum":
      return "https://api.arbiscan.io/api";
    default:
      return undefined;
  }
}

function getExplorerApiKey(networkId: string): string | undefined {
  switch (networkId) {
    case "ethereum":
    case "sepolia":
      return process.env.ETHERSCAN_API_KEY;
    case "bnb":
    case "bsc-testnet":
      return process.env.BSCSCAN_API_KEY;
    case "polygon":
      return process.env.POLYGONSCAN_API_KEY;
    case "base":
      return process.env.BASESCAN_API_KEY;
    case "arbitrum":
      return process.env.ARBISCAN_API_KEY;
    default:
      return undefined;
  }
}

export function getStandardJsonInput(): {
  language: string;
  sources: Record<string, { content: string }>;
  settings: {
    optimizer: { enabled: boolean; runs: number };
    evmVersion: string;
    outputSelection: Record<string, Record<string, string[]>>;
  };
} {
  const sources: Record<string, { content: string }> = {};

  function resolve(importPath: string) {
    if (sources[importPath]) return;

    let diskPath = "";
    if (importPath.startsWith("@openzeppelin/")) {
      diskPath = path.join(process.cwd(), "node_modules", importPath);
    } else if (importPath === "MemeToken.sol") {
      diskPath = path.join(process.cwd(), "contracts/evm/MemeToken.sol");
    } else {
      diskPath = path.join(process.cwd(), "contracts/evm", importPath);
    }

    const content = fs.readFileSync(diskPath, "utf8");
    sources[importPath] = { content };

    const importRegex = /import\s+.*?["'](.*?)["']/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const relativeImport = match[1];
      let childImportPath = "";

      if (relativeImport.startsWith("@openzeppelin/")) {
        childImportPath = relativeImport;
      } else {
        childImportPath = path.join(path.dirname(importPath), relativeImport);
        childImportPath = path.normalize(childImportPath);
        childImportPath = childImportPath.split(path.sep).join("/");
      }

      resolve(childImportPath);
    }
  }

  resolve("MemeToken.sol");

  return {
    language: "Solidity",
    sources,
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "paris",
      outputSelection: {
        "*": {
          "*": ["evm.bytecode.object"],
        },
      },
    },
  };
}

export async function submitExplorerVerification(params: {
  networkId: string;
  contractAddress: string;
  transactionInputHex: string;
}): Promise<{ success: boolean; result?: string; error?: string }> {
  const apikey = getExplorerApiKey(params.networkId);
  const apiUrl = getExplorerApiUrl(params.networkId);

  if (!apiUrl || !apikey) {
    return {
      success: false,
      error: `Explorer configuration missing for network: ${params.networkId}. API URL or API Key is not set.`,
    };
  }

  const bytecodeHex = memeTokenBytecode.slice(2);
  const cleanInput = params.transactionInputHex.startsWith("0x")
    ? params.transactionInputHex.slice(2)
    : params.transactionInputHex;

  let constructorArgs = "";
  if (cleanInput.startsWith(bytecodeHex)) {
    constructorArgs = cleanInput.slice(bytecodeHex.length);
  }

  const compilerInput = getStandardJsonInput();
  const sourceCodeStr = JSON.stringify(compilerInput);
  
  const network = supportedNetworks.find((n) => n.id === params.networkId);
  const chainId = network?.evmChainId;

  const urlObj = new URL(apiUrl);
  if (chainId) {
    urlObj.searchParams.set("chainid", chainId.toString());
  }
  const finalApiUrl = urlObj.toString();

  const bodyData: Record<string, string> = {
    apikey,
    module: "contract",
    action: "verifysourcecode",
    contractaddress: params.contractAddress,
    sourceCode: sourceCodeStr,
    codeformat: "solidity-standard-json-input",
    contractname: "MemeToken.sol:MemeToken",
    compilerversion: "v0.8.24+commit.e11b9ed9",
    constructorArguments: constructorArgs,
  };

  const body = new URLSearchParams(bodyData);

  try {
    const res = await fetch(finalApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      return {
        success: false,
        error: `HTTP error response from block explorer API: ${res.statusText}`,
      };
    }

    const data = (await res.json()) as { status: string; message: string; result: string };
    if (data.status === "1") {
      return { success: true, result: data.result }; // guid code
    } else {
      return { success: false, error: data.result };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
