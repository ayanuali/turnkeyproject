import { createStacksPrivateKey, getAddressFromPrivateKey, publicKeyToString, pubKeyfromPrivKey } from "@stacks/transactions";
import { StacksTestnet } from "@stacks/network";

// NOTE: For production, you'd integrate Turnkey's iframe stamper or passkey auth
// This demo uses local key generation to showcase the Stacks transaction flow
// In production, Turnkey would securely manage these keys in their infrastructure

// init the turnkey client
let tkClient: any = null;

export const setupTurnkey = async () => {
  if (tkClient) return tkClient;

  try {
    // mock turnkey client for demo
    // in production, this would use real turnkey SDK with proper auth
    tkClient = {
      initialized: true,
      orgId: process.env.NEXT_PUBLIC_TURNKEY_ORG_ID || "",
    };

    console.log("turnkey client initialized (demo mode)");
    return tkClient;
  } catch (e) {
    console.error("setup failed:", e);
    throw e;
  }
};

// create wallet for user
// NOTE: For demo purposes, generating keys locally
// In production, Turnkey would generate and manage keys securely in their infrastructure
export const makeWallet = async (uid: string) => {
  if (!tkClient) await setupTurnkey();

  try {
    console.log("generating wallet (demo mode - production would use turnkey key management)");

    // generate stacks keypair
    // in production, turnkey does this securely on their servers
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const privKeyHex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    const privateKey = createStacksPrivateKey(privKeyHex);
    const publicKey = pubKeyfromPrivKey(privKeyHex);
    const network = new StacksTestnet();
    const address = getAddressFromPrivateKey(privKeyHex, network.version);

    // store in localstorage for demo (production uses turnkey's secure storage)
    const walletData = {
      walletId: `demo-wallet-${uid}`,
      address: address,
      userId: uid,
      privateKey: privKeyHex, // NEVER store privkeys in production!
      publicKey: publicKeyToString(publicKey),
    };

    console.log("wallet created:", address);

    return walletData;
  } catch (e) {
    console.error("wallet creation error:", e);
    throw e;
  }
};

// sign stacks transaction
// In production, Turnkey signs on their secure servers
// For demo, we sign locally to show the transaction flow
export const signStacksTx = async (walletId: string, txBytes: Uint8Array) => {
  if (!tkClient) await setupTurnkey();

  try {
    const payload = Buffer.from(txBytes).toString("hex");
    console.log("signing payload (demo mode):", payload.substring(0, 20) + "...");

    // in production, turnkey would sign this on their servers
    // for demo, we're simulating a successful signature
    // the actual signing happens in stacks.ts using the private key

    // return a placeholder - actual signing done in transaction building
    const demoSig = "00".repeat(65); // 65 byte signature placeholder
    console.log("signature generated (demo mode)");
    return demoSig;
  } catch (e) {
    console.error("signing failed:", e);
    throw e;
  }
};

// get public key for wallet
export const getWalletPubKey = async (walletId: string) => {
  if (!tkClient) await setupTurnkey();

  try {
    // in demo mode, retrieve from localstorage
    const walletJson = localStorage.getItem("wallet");
    if (!walletJson) throw new Error("no wallet found");

    const wallet = JSON.parse(walletJson);
    console.log("got pubkey from wallet");
    return wallet.publicKey;
  } catch (e) {
    console.error("cant get pubkey:", e);
    throw e;
  }
};

// helper to generate user id
export const generateUserId = () => {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
