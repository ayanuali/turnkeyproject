"use client";

import { useState, useEffect } from "react";
import { formatSBTC, formatSTX, getWallet } from "@/lib/sbtc";
import { getListingCount, getListingFromChain } from "@/lib/marketplace-contract";
import { cvToValue } from "@stacks/transactions";

interface OnChainListing {
  id: number;
  seller: string;
  amount: number;
  price: number;
  active: boolean;
}

export default function ListingBrowser({
  onBuyClick,
  refresh,
  showOnlyOthers = true,
}: {
  onBuyClick: (listing: any) => void;
  refresh: number;
  showOnlyOthers?: boolean;
}) {
  const [listings, setListings] = useState<OnChainListing[]>([]);
  const [myAddr, setMyAddr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadListings();

    // get my address
    const wallet = getWallet();
    if (wallet) {
      setMyAddr(wallet.address);
    }
  }, [refresh]);

  const loadListings = async () => {
    setLoading(true);
    try {
      console.log("fetching listings from blockchain...");

      // get total count
      const countData = await getListingCount();
      console.log("count response:", countData);

      // parse count from clarity value (it's a uint CV)
      let count = 0;
      if (countData.result) {
        // clarity uint is represented as 0x + 32 hex chars (128 bits)
        // we need to parse just the actual value (last bytes)
        const hex = countData.result.replace("0x01", ""); // 0x01 prefix is clarity uint type
        // take last 16 chars (64 bits) to avoid overflow
        const lastBytes = hex.slice(-16);
        count = parseInt(lastBytes, 16);
      }
      console.log("total listings on-chain:", count);

      if (count === 0) {
        setListings([]);
        return;
      }

      // fetch all listings
      const fetchedListings: OnChainListing[] = [];
      for (let i = 1; i <= count; i++) {
        const listingData = await getListingFromChain(i);
        console.log(`listing ${i}:`, listingData);

        if (listingData.result && listingData.result.data) {
          const data = cvToValue(listingData.result);
          fetchedListings.push({
            id: i,
            seller: data.seller,
            amount: Number(data.amount),
            price: Number(data.price),
            active: data.active,
          });
        }
      }

      console.log("fetched listings:", fetchedListings);
      setListings(fetchedListings.filter(l => l.active));
    } catch (e) {
      console.error("failed to load listings:", e);
    } finally {
      setLoading(false);
    }
  };

  // filter listings based on mode
  const displayListings = showOnlyOthers
    ? listings.filter(l => l.seller !== myAddr)
    : listings.filter(l => l.seller === myAddr);

  console.log("display listings (filtered):", displayListings.length);

  return (
    <div className="listing-browser">
      <h2>{showOnlyOthers ? "available listings" : "my listings"}</h2>

      {loading ? (
        <div className="no-listings">
          <p>loading listings from blockchain...</p>
        </div>
      ) : displayListings.length === 0 ? (
        <div className="no-listings">
          <p>{showOnlyOthers ? "no listings available" : "you haven't created any listings yet"}</p>
          <p className="hint">listings are stored on stacks testnet blockchain</p>
        </div>
      ) : (
        <div className="listings-grid">
          {displayListings.map(listing => (
            <div key={listing.id} className="listing-card">
              <div className="listing-amount">
                {formatSBTC(listing.amount / 100000000)}
              </div>

              <div className="listing-price">
                {formatSTX(listing.price / 1000000)}
              </div>

              <div className="listing-seller">
                seller: {listing.seller.substring(0, 10)}...
              </div>

              {showOnlyOthers && (
                <button
                  className="buy-btn"
                  onClick={() => onBuyClick(listing)}
                >
                  buy
                </button>
              )}
              {!showOnlyOthers && (
                <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
                  id: {listing.id} • active: {listing.active ? "yes" : "no"}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
