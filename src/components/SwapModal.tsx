"use client";

import { useState } from "react";
import { Listing } from "@/types";
import { formatSBTC, formatSTX, getWallet, updateListingStatus } from "@/lib/sbtc";
import { buildSTXTransfer, getAccountNonce, stxToMicro, checkTxStatus, attachSignatureToTx, broadcastSignedTx } from "@/lib/stacks";
import { signStacksTx, getWalletPubKey } from "@/lib/turnkey";

interface SwapModalProps {
  listing: Listing | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SwapModal({ listing, onClose, onSuccess }: SwapModalProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [txId, setTxId] = useState("");

  if (!listing) return null;

  const handleBuy = async () => {
    setLoading(true);
    setError("");
    setStatus("preparing transaction...");

    try {
      const wallet = getWallet();
      if (!wallet) {
        throw new Error("no wallet found");
      }

      // get public key from turnkey
      setStatus("getting wallet public key...");
      const pubKey = await getWalletPubKey(wallet.walletId);

      if (!pubKey) {
        throw new Error("could not get public key");
      }

      // get account nonce
      setStatus("getting account nonce...");
      const nonce = await getAccountNonce(wallet.address);

      // build stx payment tx
      setStatus("building transaction...");
      const amount = stxToMicro(listing.price);

      const { tx, serialized } = await buildSTXTransfer(
        wallet.address,
        listing.seller,
        amount,
        `buy-${listing.id}`,
        nonce,
        pubKey
      );

      // sign with turnkey
      setStatus("signing transaction...");
      const signature = await signStacksTx(wallet.walletId, serialized);

      if (!signature) {
        throw new Error("signing failed - no signature returned");
      }

      // attach signature to tx
      setStatus("attaching signature...");
      const signedTx = attachSignatureToTx(tx, signature, pubKey);

      // broadcast to network
      setStatus("broadcasting transaction...");
      const txResult = await broadcastSignedTx(signedTx);

      const txId = typeof txResult === 'string' ? txResult : txResult.txid || 'unknown';
      setTxId(txId);
      console.log("tx broadcasted:", txId);

      // update listing status
      updateListingStatus(listing.id, "sold");

      setStatus("transaction submitted! waiting for confirmation...");

      // wait a bit then close
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);

    } catch (e: any) {
      console.error("swap failed:", e);
      setError(e.message || "transaction failed");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>confirm swap</h2>

        <div className="swap-details">
          <div className="detail-row">
            <span>you will receive:</span>
            <span className="highlight">{formatSBTC(listing.amount)}</span>
          </div>

          <div className="detail-row">
            <span>you will pay:</span>
            <span className="highlight">{formatSTX(listing.price)}</span>
          </div>

          <div className="detail-row">
            <span>seller:</span>
            <span className="addr">{listing.seller.substring(0, 20)}...</span>
          </div>
        </div>

        {status && (
          <div className="status-msg">
            {status}
          </div>
        )}

        {error && (
          <div className="error-msg">
            {error}
          </div>
        )}

        {txId && (
          <div className="tx-id">
            tx: {txId.substring(0, 20)}...
          </div>
        )}

        <div className="modal-actions">
          <button
            onClick={onClose}
            disabled={loading}
            className="cancel-btn"
          >
            cancel
          </button>

          <button
            onClick={handleBuy}
            disabled={loading}
            className="confirm-btn"
          >
            {loading ? "processing..." : "confirm swap"}
          </button>
        </div>
      </div>
    </div>
  );
}
