import {
  makeSTXTokenTransfer,
  makeContractCall,
  makeUnsignedContractCall,
  makeUnsignedSTXTokenTransfer,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  createStacksPrivateKey,
  getAddressFromPrivateKey,
  TransactionVersion,
  bufferCV,
  uintCV,
  standardPrincipalCV,
  MessageSignature,
  createMessageSignature,
  pubKeyfromPrivKey,
  publicKeyToAddress,
  AddressVersion,
} from "@stacks/transactions";
import { StacksTestnet } from "@stacks/network";

const network = new StacksTestnet();

// build sbtc transfer transaction
// NOTE: sbtc is a contract call not native token
// using mainnet contract address for reference - update with testnet when available
export const buildSBTCTransfer = async (
  fromAddr: string,
  toAddr: string,
  amount: number,
  nonce: number,
  publicKey: string
) => {
  try {
    // sbtc contract - mainnet address for now
    // TODO: update with actual testnet contract when available
    const contractAddr = "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4";
    const contractName = "sbtc-token";

    console.log("building sbtc transfer tx");

    // build unsigned contract call
    const txOptions = {
      contractAddress: contractAddr,
      contractName: contractName,
      functionName: "transfer",
      functionArgs: [
        uintCV(amount),
        standardPrincipalCV(fromAddr),
        standardPrincipalCV(toAddr),
        bufferCV(Buffer.from("p2pswap")), // memo
      ],
      publicKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      nonce: BigInt(nonce),
      fee: BigInt(10000), // 0.01 STX
    };

    const tx = await makeUnsignedContractCall(txOptions);

    // serialize for signing
    const serialized = tx.serialize();

    console.log("tx built, size:", serialized.length);

    return { tx, serialized };
  } catch (e) {
    console.error("build tx failed:", e);
    throw e;
  }
};

// build stx transfer (for payments)
export const buildSTXTransfer = async (
  fromAddr: string,
  toAddr: string,
  amount: number,
  memo: string,
  nonce: number,
  publicKey: string
) => {
  try {
    console.log("building stx transfer");

    const txOptions = {
      recipient: toAddr,
      amount: BigInt(amount),
      publicKey,
      network,
      memo,
      anchorMode: AnchorMode.Any,
      nonce: BigInt(nonce),
      fee: BigInt(1000), // 0.001 STX
    };

    const tx = await makeUnsignedSTXTokenTransfer(txOptions);
    const serialized = tx.serialize();

    console.log("stx tx built");

    return { tx, serialized };
  } catch (e) {
    console.error("stx transfer build failed:", e);
    throw e;
  }
};

// attach turnkey signature to unsigned tx
export const attachSignatureToTx = (unsignedTx: any, signatureHex: string, publicKeyHex: string) => {
  try {
    console.log("attaching signature to tx");

    // turnkey returns signature as hex string
    // convert to buffer
    const sigBuffer = Buffer.from(signatureHex, "hex");

    // stacks uses recoverable ECDSA signatures (65 bytes: r + s + recovery)
    // turnkey might return 64 bytes (r + s), need to add recovery byte
    let finalSig = sigBuffer;
    if (sigBuffer.length === 64) {
      // add recovery byte (usually 0 or 1)
      finalSig = Buffer.concat([sigBuffer, Buffer.from([0])]);
    }

    // create message signature object
    const msgSig = createMessageSignature(finalSig.toString("hex"));

    // attach to transaction auth
    if (unsignedTx.auth && unsignedTx.auth.spendingCondition) {
      unsignedTx.auth.spendingCondition.signature = msgSig;
    }

    console.log("signature attached");
    return unsignedTx;
  } catch (e) {
    console.error("signature attachment failed:", e);
    throw e;
  }
};

// broadcast signed tx object
export const broadcastSignedTx = async (signedTx: any) => {
  try {
    console.log("broadcasting tx...");

    const result = await broadcastTransaction(signedTx, network);

    console.log("tx broadcast:", result.txid || result);

    return result.txid || result;
  } catch (e: any) {
    console.error("broadcast failed:", e);
    // log more details
    if (e.message) console.error("error msg:", e.message);
    throw e;
  }
};

// check tx status
export const checkTxStatus = async (txId: string) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_STACKS_API_URL || "https://api.testnet.hiro.so";
    const resp = await fetch(`${apiUrl}/extended/v1/tx/${txId}`);

    if (!resp.ok) {
      throw new Error(`status check failed: ${resp.status}`);
    }

    const data = await resp.json();

    console.log("tx status:", data.tx_status);

    return {
      status: data.tx_status,
      result: data.tx_result,
    };
  } catch (e) {
    console.error("cant check tx status:", e);
    throw e;
  }
};

// get account nonce
export const getAccountNonce = async (address: string) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_STACKS_API_URL || "https://api.testnet.hiro.so";
    const resp = await fetch(`${apiUrl}/v2/accounts/${address}?proof=0`);

    if (!resp.ok) {
      throw new Error(`nonce fetch failed: ${resp.status}`);
    }

    const data = await resp.json();
    const nonce = data.nonce;

    console.log("account nonce:", nonce);

    return nonce;
  } catch (e) {
    console.error("nonce fetch error:", e);
    // return 0 as fallback
    return 0;
  }
};

// helper to convert stx to microstacks
export const stxToMicro = (stx: number) => {
  return stx * 1000000;
};
