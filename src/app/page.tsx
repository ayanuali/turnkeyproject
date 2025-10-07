"use client";

import { useState, useEffect } from "react";
import WalletSetup from "@/components/WalletSetup";
import CreateListing from "@/components/CreateListing";
import ListingBrowser from "@/components/ListingBrowser";
import SwapModal from "@/components/SwapModal";
import { getWallet } from "@/lib/sbtc";
import { Listing } from "@/types";

export default function Home() {
  const [hasWallet, setHasWallet] = useState(false);
  const [walletAddr, setWalletAddr] = useState("");
  const [activeTab, setActiveTab] = useState<"browse" | "create" | "my-listings">("browse");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkWallet();
  }, []);

  const checkWallet = () => {
    const wallet = getWallet();
    if (wallet) {
      setHasWallet(true);
      setWalletAddr(wallet.address);
      console.log("wallet loaded:", wallet.address);
    }
  };

  const handleWalletCreated = () => {
    checkWallet();
  };

  const handleListingCreated = () => {
    // refresh listings
    setRefreshKey(prev => prev + 1);
    // switch to browse tab
    setActiveTab("browse");
  };

  const handleBuyClick = (listing: Listing) => {
    setSelectedListing(listing);
  };

  const handleSwapSuccess = () => {
    // refresh listings
    setRefreshKey(prev => prev + 1);
  };

  if (!hasWallet) {
    return <WalletSetup onWalletCreated={handleWalletCreated} />;
  }

  return (
    <main className="main-container">
      <header className="header">
        <h1>sBTC P2P Swap</h1>
        <div className="wallet-info">
          <span className="label">wallet:</span>
          <span className="address">{walletAddr}</span>
        </div>
      </header>

      <div className="tabs">
        <button
          className={activeTab === "browse" ? "tab active" : "tab"}
          onClick={() => setActiveTab("browse")}
        >
          browse
        </button>
        <button
          className={activeTab === "my-listings" ? "tab active" : "tab"}
          onClick={() => setActiveTab("my-listings")}
        >
          my listings
        </button>
        <button
          className={activeTab === "create" ? "tab active" : "tab"}
          onClick={() => setActiveTab("create")}
        >
          create listing
        </button>
      </div>

      <div className="content">
        {activeTab === "browse" ? (
          <ListingBrowser
            onBuyClick={handleBuyClick}
            refresh={refreshKey}
            showOnlyOthers={true}
          />
        ) : activeTab === "my-listings" ? (
          <ListingBrowser
            onBuyClick={handleBuyClick}
            refresh={refreshKey}
            showOnlyOthers={false}
          />
        ) : (
          <CreateListing onListingCreated={handleListingCreated} />
        )}
      </div>

      {selectedListing && (
        <SwapModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onSuccess={handleSwapSuccess}
        />
      )}
    </main>
  );
}
