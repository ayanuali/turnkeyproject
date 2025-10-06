"use client";

import { useState } from "react";
import { makeWallet, generateUserId } from "@/lib/turnkey";
import { saveWallet } from "@/lib/sbtc";

export default function WalletSetup({ onWalletCreated }: { onWalletCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createWallet = async () => {
    setLoading(true);
    setError("");

    try {
      // generate random user id
      const uid = generateUserId();
      console.log("creating wallet for:", uid);

      // create via turnkey
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

        <button
          onClick={createWallet}
          disabled={loading}
          className="create-btn"
        >
          {loading ? "creating wallet..." : "create wallet"}
        </button>

        <div className="info">
          <p>no browser extension needed</p>
          <p>powered by turnkey</p>
        </div>
      </div>
    </div>
  );
}
