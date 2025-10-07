"use client";

import { useState, useEffect } from "react";
import { getListings, formatSBTC, formatSTX, getWallet } from "@/lib/sbtc";
import { Listing } from "@/types";

export default function ListingBrowser({
  onBuyClick,
  refresh
}: {
  onBuyClick: (listing: Listing) => void;
  refresh: number;
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

  // filter out my own listings
  const otherListings = listings.filter(l => l.seller !== myAddr);
  console.log("other listings (filtered):", otherListings.length);

  return (
    <div className="listing-browser">
      <h2>available listings</h2>

      {otherListings.length === 0 ? (
        <div className="no-listings">
          <p>no listings available</p>
          <p className="hint">create a listing in another browser to test</p>
        </div>
      ) : (
        <div className="listings-grid">
          {otherListings.map(listing => (
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

              <button
                className="buy-btn"
                onClick={() => onBuyClick(listing)}
              >
                buy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
