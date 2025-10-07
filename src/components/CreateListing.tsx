"use client";

import { useState } from "react";
import { validateListing, getWallet } from "@/lib/sbtc";
import { createListingOnChain } from "@/lib/marketplace-contract";
import { getAccountNonce } from "@/lib/stacks";

export default function CreateListing({ onListingCreated }: { onListingCreated: () => void }) {
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amtNum = parseFloat(amount);
    const priceNum = parseFloat(price);

    // validate
    const validationErr = validateListing(amtNum, priceNum);
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setLoading(true);

    try {
      const wallet = getWallet();
      if (!wallet) {
        setError("no wallet found");
        return;
      }

      // get nonce
      const nonce = await getAccountNonce(wallet.address);

      // convert to sats (1 sBTC = 100,000,000 sats)
      const amountSats = Math.floor(amtNum * 100000000);
      // convert price to micro-stx (1 STX = 1,000,000 micro-stx)
      const priceMicroStx = Math.floor(priceNum * 1000000);

      console.log("creating listing on-chain...");
      console.log("amount (sats):", amountSats);
      console.log("price (micro-stx):", priceMicroStx);

      // create listing on-chain
      const result = await createListingOnChain(
        wallet.privateKey,
        amountSats,
        priceMicroStx,
        nonce
      );

      console.log("listing created on-chain:", result);

      // reset form
      setAmount("");
      setPrice("");

      // notify parent
      onListingCreated();
    } catch (e: any) {
      console.error("listing creation failed:", e);
      setError(e.message || "failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-listing">
      <h2>create listing</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>sBTC amount</label>
          <input
            type="number"
            step="0.00000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.001"
            required
          />
        </div>

        <div className="form-group">
          <label>price (STX)</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="100"
            required
          />
        </div>

        {error && (
          <div className="error-msg">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "creating..." : "create listing"}
        </button>
      </form>
    </div>
  );
}
