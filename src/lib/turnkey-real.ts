// Real Turnkey integration with passkeys
import { useTurnkey } from "@turnkey/sdk-react";

export { useTurnkey };

// Helper to create sub-organization for user (called once per user)
export const createUserSubOrg = async (turnkeyClient: any, userName: string) => {
  try {
    const response = await turnkeyClient.createSubOrganization({
      subOrganizationName: `user-${userName}-${Date.now()}`,
      rootUsers: [{
        userName: userName,
        authenticators: [], // passkey will be added
      }],
      rootQuorumThreshold: 1,
    });

    console.log("sub-org created:", response);
    return response;
  } catch (e) {
    console.error("sub-org creation failed:", e);
    throw e;
  }
};

// Create wallet in user's sub-org
export const createWalletInSubOrg = async (turnkeyClient: any, subOrgId: string) => {
  try {
    const response = await turnkeyClient.createWallet({
      organizationId: subOrgId,
      walletName: `stacks-wallet-${Date.now()}`,
      accounts: [{
        curve: "CURVE_SECP256K1",
        pathFormat: "PATH_FORMAT_BIP32",
        path: "m/44'/5757'/0'/0/0",
        addressFormat: "ADDRESS_FORMAT_UNCOMPRESSED",
      }],
    });

    console.log("wallet created in sub-org");
    return response;
  } catch (e) {
    console.error("wallet creation failed:", e);
    throw e;
  }
};

// Sign raw payload with turnkey
export const signWithTurnkey = async (turnkeyClient: any, walletId: string, payload: string) => {
  try {
    const response = await turnkeyClient.signRawPayload({
      signWith: walletId,
      payload,
      encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
      hashFunction: "HASH_FUNCTION_SHA256",
    });

    return response;
  } catch (e) {
    console.error("signing failed:", e);
    throw e;
  }
};
