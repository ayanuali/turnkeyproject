import { Turnkey } from "@turnkey/sdk-browser";
import { createActivityPoller } from "@turnkey/http";
import { IframeStamper } from "@turnkey/iframe-stamper";

// init the turnkey client
let tkClient: any = null;
let stamper: any = null;

export const setupTurnkey = async () => {
  if (tkClient) return tkClient;

  try {
    // create iframe stamper for embedded auth
    stamper = new IframeStamper({
      iframeUrl: "https://auth.turnkey.com",
      iframeContainer: document.body,
      iframeElementId: "turnkey-iframe",
    });

    // wait for iframe ready
    await stamper.init();

    tkClient = new Turnkey({
      apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_URL || "https://api.turnkey.com",
      defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORG_ID,
      stamper,
    });

    console.log("turnkey ready with iframe stamper");
    return tkClient;
  } catch (e) {
    console.error("setup failed:", e);
    // TODO: add retry logic
    throw e;
  }
};

// create wallet for user
// NOTE: stacks uses secp256k1 curve
export const makeWallet = async (uid: string) => {
  if (!tkClient) await setupTurnkey();

  // build wallet config
  const cfg = {
    walletName: `wallet-${uid}`,
    accounts: [{
      curve: "CURVE_SECP256K1",
      pathFormat: "PATH_FORMAT_BIP32",
      path: "m/44'/5757'/0'/0/0", // stacks derivation path
      addressFormat: "ADDRESS_FORMAT_UNCOMPRESSED"
    }]
  };

  try {
    const activity = await tkClient.createWallet(cfg);

    // poll for result
    const poller = createActivityPoller({
      client: tkClient.apiClient,
      requestFn: tkClient.apiClient.getActivity,
    });

    const result = await poller({
      activityId: activity.activity.id,
      organizationId: process.env.NEXT_PUBLIC_TURNKEY_ORG_ID,
    });

    // extract wallet info
    const walletId = result.activity.result.createWalletResult?.walletId;
    const addr = result.activity.result.createWalletResult?.addresses?.[0];

    console.log("wallet created:", walletId);

    return { walletId, address: addr, userId: uid };
  } catch (e) {
    console.error("wallet creation error:", e);
    throw e;
  }
};

// sign stacks transaction
// stacks not natively supported so use raw signing
export const signStacksTx = async (walletId: string, txBytes: Uint8Array) => {
  if (!tkClient) await setupTurnkey();

  try {
    // convert to hex
    const payload = Buffer.from(txBytes).toString("hex");

    console.log("signing payload:", payload.substring(0, 20) + "...");

    const activity = await tkClient.signRawPayload({
      signWith: walletId,
      payload,
      encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
      hashFunction: "HASH_FUNCTION_SHA256"
    });

    // poll for signature
    const poller = createActivityPoller({
      client: tkClient.apiClient,
      requestFn: tkClient.apiClient.getActivity,
    });

    const result = await poller({
      activityId: activity.activity.id,
      organizationId: process.env.NEXT_PUBLIC_TURNKEY_ORG_ID,
    });

    const sig = result.activity.result.signRawPayloadResult?.signature;

    console.log("got signature");

    return sig;
  } catch (e) {
    console.error("signing failed:", e);
    throw e;
  }
};

// get public key for wallet
export const getWalletPubKey = async (walletId: string) => {
  if (!tkClient) await setupTurnkey();

  try {
    const wallet = await tkClient.getWallet({ walletId });
    const pubKey = wallet.accounts?.[0]?.publicKey;

    console.log("pubkey:", pubKey);
    return pubKey;
  } catch (e) {
    console.error("cant get pubkey:", e);
    throw e;
  }
};

// helper to generate user id
export const generateUserId = () => {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
