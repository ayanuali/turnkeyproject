// On-chain marketplace contract interactions
import {
  makeContractCall,
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  standardPrincipalCV,
  contractPrincipalCV,
  serializeCV,
} from "@stacks/transactions";
import { StacksTestnet } from "@stacks/network";

const network = new StacksTestnet();

// deployed contract address
export const MARKETPLACE_CONTRACT_ADDRESS = "ST1QNFKCN58W3F1D9FQYSZGQKWG872KC6KYAV692X";
export const MARKETPLACE_CONTRACT_NAME = "marketplace";

// create listing on-chain
export const createListingOnChain = async (
  senderKey: string,
  amount: number,
  price: number,
  nonce: number
) => {
  try {
    console.log("creating on-chain listing");

    const txOptions = {
      contractAddress: MARKETPLACE_CONTRACT_ADDRESS,
      contractName: MARKETPLACE_CONTRACT_NAME,
      functionName: "create-listing",
      functionArgs: [
        uintCV(amount),
        uintCV(price),
      ],
      senderKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      nonce: BigInt(nonce),
      fee: BigInt(10000),
    };

    const tx = await makeContractCall(txOptions);
    const result = await broadcastTransaction(tx, network);

    console.log("listing created on-chain:", result);
    return result;
  } catch (e) {
    console.error("on-chain listing creation failed:", e);
    throw e;
  }
};

// get listing from contract
export const getListingFromChain = async (listingId: number) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_STACKS_API_URL || "https://api.testnet.hiro.so";

    // call read-only function
    const serializedCV = serializeCV(uintCV(listingId));
    const serializedArg = Buffer.from(serializedCV).toString('hex');
    console.log(`fetching listing ${listingId}, serialized:`, serializedArg);

    const response = await fetch(
      `${apiUrl}/v2/contracts/call-read/${MARKETPLACE_CONTRACT_ADDRESS}/${MARKETPLACE_CONTRACT_NAME}/get-listing`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: MARKETPLACE_CONTRACT_ADDRESS,
          arguments: [`0x${serializedArg}`],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`failed to fetch listing: ${response.status}`);
    }

    const data = await response.json();
    console.log("fetched listing from chain:", data);

    return data;
  } catch (e) {
    console.error("failed to get listing from chain:", e);
    throw e;
  }
};

// get total listing count
export const getListingCount = async () => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_STACKS_API_URL || "https://api.testnet.hiro.so";

    const response = await fetch(
      `${apiUrl}/v2/contracts/call-read/${MARKETPLACE_CONTRACT_ADDRESS}/${MARKETPLACE_CONTRACT_NAME}/get-count`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: MARKETPLACE_CONTRACT_ADDRESS,
          arguments: [],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`failed to fetch count: ${response.status}`);
    }

    const data = await response.json();
    console.log("listing count:", data);

    return data;
  } catch (e) {
    console.error("failed to get listing count:", e);
    return { result: "0x0000000000000000000000000000000000" }; // return 0
  }
};

// buy listing on-chain
export const buyListingOnChain = async (
  senderKey: string,
  listingId: number,
  nonce: number
) => {
  try {
    console.log("buying listing on-chain");

    const txOptions = {
      contractAddress: MARKETPLACE_CONTRACT_ADDRESS,
      contractName: MARKETPLACE_CONTRACT_NAME,
      functionName: "buy-listing",
      functionArgs: [uintCV(listingId)],
      senderKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      nonce: BigInt(nonce),
      fee: BigInt(10000),
    };

    const tx = await makeContractCall(txOptions);
    const result = await broadcastTransaction(tx, network);

    console.log("listing bought on-chain:", result);
    return result;
  } catch (e) {
    console.error("on-chain buy failed:", e);
    throw e;
  }
};

// helper to parse clarity value
export const parseClarityValue = (clarityHex: string) => {
  // basic parser - would need proper clarity value parsing library
  // for now just return the hex
  return clarityHex;
};
