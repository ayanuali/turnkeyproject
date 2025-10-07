"use client";

import { useState, useEffect } from "react";
import { formatSBTC, formatSTX, getWallet } from "@/lib/sbtc";
import { getListingCount, getListingFromChain } from "@/lib/marketplace-contract";
import { cvToValue, deserializeCV } from "@stacks/transactions";

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

        if (listingData.okay && listingData.result) {
          // deserialize clarity value from hex
          const clarityValue = deserializeCV(Buffer.from(listingData.result.replace('0x', ''), 'hex'));
          console.log(`deserialized listing ${i}:`, clarityValue);

          const data = cvToValue(clarityValue);
          console.log(`parsed listing ${i}:`, data);

          if (data && typeof data === 'object' && 'value' in data) {
            // it's an optional (some) type, unwrap it
            const listingObj = data.value as any;

            // convert seller principal to string
            const sellerStr = typeof listingObj.seller === 'string'
              ? listingObj.seller
              : listingObj.seller.address || listingObj.seller.value || String(listingObj.seller);

            // convert clarity uint values to numbers
            const amountNum = typeof listingObj.amount === 'number'
              ? listingObj.amount
              : Number(listingObj.amount.value || listingObj.amount);

            const priceNum = typeof listingObj.price === 'number'
              ? listingObj.price
              : Number(listingObj.price.value || listingObj.price);

            const activeVal = typeof listingObj.active === 'boolean'
              ? listingObj.active
              : Boolean(listingObj.active.value);

            console.log(`converted values for listing ${i}:`, {
              seller: sellerStr,
              amount: amountNum,
              price: priceNum,
              active: activeVal
            });

            fetchedListings.push({
              id: i,
              seller: sellerStr,
              amount: amountNum,
              price: priceNum,
              active: activeVal,
            });
          }
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
