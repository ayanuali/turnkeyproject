"use client";

import { useState } from "react";
import { formatSBTC, formatSTX, getWallet } from "@/lib/sbtc";
import { buildSTXTransfer, getAccountNonce, stxToMicro, broadcastSignedTx } from "@/lib/stacks";
import { markListingSold } from "@/lib/marketplace-contract";

interface OnChainListing {
  id: number;
  seller: string;
  amount: number;
  price: number;
  active: boolean;
}

interface SwapModalProps {
  listing: OnChainListing | null;
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

      // get account nonce
      setStatus("getting account nonce...");
      const nonce = await getAccountNonce(wallet.address);

      // step 1: send STX payment to seller
      setStatus("sending STX payment to seller...");
      const priceInMicroStx = listing.price; // already in micro-stx from contract

      const { tx } = await buildSTXTransfer(
        wallet.address,
        listing.seller,
        priceInMicroStx,
        `buy-listing-${listing.id}`,
        nonce,
        wallet.privateKey
      );

      const paymentResult = await broadcastSignedTx(tx);
      const paymentTxId = typeof paymentResult === 'string' ? paymentResult : paymentResult.txid || 'unknown';
      console.log("payment tx broadcasted:", paymentTxId);

      // step 2: mark listing as sold on-chain
      setStatus("marking listing as sold on-chain...");
      const markSoldResult = await markListingSold(wallet.privateKey, listing.id, nonce + 1);
      const markSoldTxId = typeof markSoldResult === 'string' ? markSoldResult : markSoldResult.txid || 'unknown';
      console.log("mark-sold tx broadcasted:", markSoldTxId);

      setTxId(paymentTxId);
      setStatus(`swap complete! payment: ${paymentTxId.substring(0, 10)}... | mark-sold: ${markSoldTxId.substring(0, 10)}...`);

      // wait then refresh
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
            <span className="highlight">{formatSBTC(listing.amount / 100000000)}</span>
          </div>

          <div className="detail-row">
            <span>you will pay:</span>
            <span className="highlight">{formatSTX(listing.price / 1000000)}</span>
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
