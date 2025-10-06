"use client";

import { useState } from "react";
import { saveListing, generateListingId, validateListing, getWallet } from "@/lib/sbtc";
import { Listing } from "@/types";

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

      // create listing
      const listing: Listing = {
        id: generateListingId(),
        seller: wallet.address,
        amount: amtNum,
        price: priceNum,
        status: "active",
        created: Date.now(),
      };

      // save to localstorage
      saveListing(listing);

      console.log("listing created:", listing.id);

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
