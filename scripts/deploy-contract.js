// Script to deploy marketplace contract to testnet
// Run with: node scripts/deploy-contract.js

const {
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
} = require("@stacks/transactions");
const { StacksTestnet } = require("@stacks/network");
const fs = require("fs");
const path = require("path");

const network = new StacksTestnet();

// you need a private key with testnet STX
// get testnet STX from: https://explorer.hiro.so/sandbox/faucet?chain=testnet
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY || "YOUR_PRIVATE_KEY_HERE";

async function deployContract() {
  try {
    console.log("reading contract file...");
    const contractPath = path.join(__dirname, "../contracts/marketplace.clar");
    const contractCode = fs.readFileSync(contractPath, "utf8");

    console.log("deploying marketplace contract to testnet...");

    const txOptions = {
      contractName: "marketplace",
      codeBody: contractCode,
      senderKey: DEPLOYER_KEY,
      network,
      anchorMode: AnchorMode.Any,
      fee: BigInt(50000), // 0.05 STX
    };

    const transaction = await makeContractDeploy(txOptions);
    const result = await broadcastTransaction(transaction, network);

    console.log("contract deployed!");
    console.log("transaction id:", result.txid || result);
    console.log("\ncheck status at:");
    console.log(`https://explorer.hiro.so/txid/${result.txid || result}?chain=testnet`);

    console.log("\nonce confirmed, update MARKETPLACE_CONTRACT_ADDRESS in:");
    console.log("src/lib/marketplace-contract.ts");
  } catch (error) {
    console.error("deployment failed:", error);
    process.exit(1);
  }
}

deployContract();
