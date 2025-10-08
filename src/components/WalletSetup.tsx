"use client";

import { useState } from "react";
import { useTurnkey } from "@turnkey/sdk-react";
import { makeWallet, generateUserId } from "@/lib/turnkey";
import { saveWallet } from "@/lib/sbtc";

export default function WalletSetup({ onWalletCreated }: { onWalletCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useRealTurnkey, setUseRealTurnkey] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importKey, setImportKey] = useState("");
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
      alert(`Wallet created!\n\nAddress: ${wallet.address}\n\nIMPORTANT: Save your private key to restore later:\n${wallet.privateKey}\n\n(Copy it now!)`);

      // notify parent
      onWalletCreated();
    } catch (e: any) {
      console.error("wallet creation failed:", e);
      setError(e.message || "failed to create wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleImportWallet = () => {
    if (!importKey || importKey.length !== 64) {
      setError("Invalid private key (must be 64 hex characters)");
      return;
    }

    try {
      const { getAddressFromPrivateKey, pubKeyfromPrivKey } = require("@stacks/transactions");
      const { StacksTestnet } = require("@stacks/network");

      const network = new StacksTestnet();
      const address = getAddressFromPrivateKey(importKey, network.version);
      const publicKey = pubKeyfromPrivKey(importKey).data;

      const wallet = {
        address,
        privateKey: importKey,
        publicKey: Buffer.from(publicKey).toString('hex'),
        userId: `imported-${Date.now()}`,
      };

      saveWallet(wallet);
      console.log("wallet imported:", wallet.address);
      onWalletCreated();
    } catch (e: any) {
      console.error("import failed:", e);
      setError("Failed to import wallet");
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

        {!showImport ? (
          <>
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

            <button
              onClick={() => setShowImport(true)}
              style={{
                marginTop: "12px",
                background: "transparent",
                color: "#0070f3",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                textDecoration: "underline"
              }}
            >
              or restore existing wallet
            </button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>
                Enter your private key (64 hex characters):
              </label>
              <input
                type="text"
                value={importKey}
                onChange={(e) => setImportKey(e.target.value)}
                placeholder="abcdef123456..."
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontFamily: "monospace",
                  fontSize: "12px"
                }}
              />
            </div>

            <button
              onClick={handleImportWallet}
              className="create-btn"
              style={{ marginBottom: "8px" }}
            >
              restore wallet
            </button>

            <button
              onClick={() => {
                setShowImport(false);
                setImportKey("");
                setError("");
              }}
              style={{
                background: "transparent",
                color: "#666",
                border: "none",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              back
            </button>
          </>
        )}

        <div className="info">
          <p>no browser extension needed</p>
          <p>powered by turnkey {useRealTurnkey ? "(real mode)" : "(demo mode)"}</p>
        </div>
      </div>
    </div>
  );
}
