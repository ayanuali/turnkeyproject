"use client";

import { useState, useEffect } from "react";
import { getListings, formatSBTC, formatSTX, getWallet } from "@/lib/sbtc";
import { Listing } from "@/types";

export default function ListingBrowser({
  onBuyClick,
  refresh,
  showOnlyOthers = true,
}: {
  onBuyClick: (listing: Listing) => void;
  refresh: number;
  showOnlyOthers?: boolean;
}) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [myAddr, setMyAddr] = useState("");

  useEffect(() => {
    loadListings();

    // get my address
    const wallet = getWallet();
    if (wallet) {
      setMyAddr(wallet.address);
    }
  }, [refresh]);

  const loadListings = () => {
    const allListings = getListings();
    setListings(allListings);
    console.log("loaded", allListings.length, "listings");
    console.log("my address:", myAddr);
    console.log("all listings:", allListings);
  };

  // filter listings based on mode
  const displayListings = showOnlyOthers
    ? listings.filter(l => l.seller !== myAddr)
    : listings.filter(l => l.seller === myAddr);

  console.log("display listings (filtered):", displayListings.length);

  return (
    <div className="listing-browser">
      <h2>{showOnlyOthers ? "available listings" : "my listings"}</h2>

      {displayListings.length === 0 ? (
        <div className="no-listings">
          <p>{showOnlyOthers ? "no listings available" : "you haven't created any listings yet"}</p>
          {showOnlyOthers && <p className="hint">note: listings are stored locally in your browser</p>}
        </div>
      ) : (
        <div className="listings-grid">
          {displayListings.map(listing => (
            <div key={listing.id} className="listing-card">
              <div className="listing-amount">
                {formatSBTC(listing.amount)}
              </div>

              <div className="listing-price">
                {formatSTX(listing.price)}
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
                  status: {listing.status}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
