"use client";

import { useState } from "react";
import { useTurnkey } from "@turnkey/sdk-react";
import { makeWallet, generateUserId } from "@/lib/turnkey";
import { saveWallet } from "@/lib/sbtc";

export default function WalletSetup({ onWalletCreated }: { onWalletCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useRealTurnkey, setUseRealTurnkey] = useState(false);
  const { passkeyClient, authIframeClient } = useTurnkey();

  const createWalletWithPasskey = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("creating wallet with turnkey passkey");

      // create passkey for authentication
      const userName = `user-${Date.now()}`;

      const passkeyResult = await passkeyClient?.createUserPasskey({
        publicKey: {
          rp: {
            name: "sBTC P2P Swap",
          },
          user: {
            name: userName,
            displayName: userName,
          },
        },
      });

      console.log("passkey created:", passkeyResult);

      // TODO: create wallet using turnkey API
      // for now fall back to demo mode
      setError("Passkey auth setup - falling back to demo mode for now");
      await createWalletDemo();
    } catch (e: any) {
      console.error("passkey wallet creation failed:", e);
      setError(e.message || "failed to create wallet with passkey");
      // fall back to demo
      await createWalletDemo();
    } finally {
      setLoading(false);
    }
  };

  const createWalletDemo = async () => {
    setLoading(true);
    setError("");

    try {
      // generate random user id
      const uid = generateUserId();
      console.log("creating wallet (demo mode) for:", uid);

      // create via demo turnkey
      const wallet = await makeWallet(uid);

      // save to localstorage
      saveWallet(wallet);

      console.log("wallet created:", wallet.address);

      // notify parent
      onWalletCreated();
    } catch (e: any) {
      console.error("wallet creation failed:", e);
      setError(e.message || "failed to create wallet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-setup">
      <div className="setup-card">
        <h1>sBTC P2P Swap</h1>
        <p>create an embedded wallet to get started</p>

        {error && (
          <div className="error-msg">
            {error}
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={useRealTurnkey}
              onChange={(e) => setUseRealTurnkey(e.target.checked)}
            />
            <span style={{ fontSize: "14px" }}>Use Real Turnkey (requires passkey setup)</span>
          </label>
        </div>

        <button
          onClick={useRealTurnkey ? createWalletWithPasskey : createWalletDemo}
          disabled={loading}
          className="create-btn"
        >
          {loading ? "creating wallet..." : useRealTurnkey ? "create wallet with passkey" : "create demo wallet"}
        </button>

        <div className="info">
          <p>no browser extension needed</p>
          <p>powered by turnkey {useRealTurnkey ? "(real mode)" : "(demo mode)"}</p>
        </div>
      </div>
    </div>
  );
}
