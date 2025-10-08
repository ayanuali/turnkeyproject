"use client";

import { useState, useEffect } from "react";
import WalletSetup from "@/components/WalletSetup";
import CreateListing from "@/components/CreateListing";
import ListingBrowser from "@/components/ListingBrowser";
import SwapModal from "@/components/SwapModal";
import { getWallet } from "@/lib/sbtc";
import { getAccountNonce } from "@/lib/stacks";
import { cancelListingOnChain, updatePriceOnChain } from "@/lib/marketplace-contract";
import { Listing } from "@/types";

export default function Home() {
  const [hasWallet, setHasWallet] = useState(false);
  const [walletAddr, setWalletAddr] = useState("");
  const [activeTab, setActiveTab] = useState<"browse" | "create" | "my-listings">("browse");
  const [selectedListing, setSelectedListing] = useState<any>(null);
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

  const handleBuyClick = (listing: any) => {
    setSelectedListing(listing);
  };

  const handleCancelClick = async (listing: any) => {
    if (!confirm(`Cancel listing #${listing.id}?`)) return;

    try {
      const wallet = getWallet();
      if (!wallet) {
        alert("No wallet found");
        return;
      }

      console.log("canceling listing:", listing.id);
      const nonce = await getAccountNonce(wallet.address);

      const result = await cancelListingOnChain(wallet.privateKey, listing.id, nonce);
      const txId = typeof result === 'string' ? result : result.txid || 'unknown';

      console.log("cancel tx:", txId);
      alert(`Listing cancelled!\n\nTransaction: ${txId}\n\nRefresh in ~30 seconds to see changes.`);

      setTimeout(() => setRefreshKey(prev => prev + 1), 2000);
    } catch (e: any) {
      console.error("cancel failed:", e);
      alert(e.message || "cancel failed");
    }
  };

  const handleEditClick = async (listing: any) => {
    const newPrice = prompt(`Enter new price in STX (current: ${(listing.price / 1000000).toFixed(2)})`);
    if (!newPrice) return;

    const newPriceNum = parseFloat(newPrice);
    if (isNaN(newPriceNum) || newPriceNum <= 0) {
      alert("Invalid price");
      return;
    }

    try {
      const wallet = getWallet();
      if (!wallet) {
        alert("No wallet found");
        return;
      }

      console.log("updating price for listing:", listing.id, "to", newPriceNum, "STX");
      const nonce = await getAccountNonce(wallet.address);
      const newPriceMicroStx = Math.floor(newPriceNum * 1000000);

      const result = await updatePriceOnChain(wallet.privateKey, listing.id, newPriceMicroStx, nonce);
      const txId = typeof result === 'string' ? result : result.txid || 'unknown';

      console.log("update price tx:", txId);
      alert(`Price updated to ${newPriceNum} STX!\n\nTransaction: ${txId}\n\nRefresh in ~30 seconds to see changes.`);

      setTimeout(() => setRefreshKey(prev => prev + 1), 2000);
    } catch (e: any) {
      console.error("edit failed:", e);
      alert(e.message || "edit failed");
    }
  };

  const handleSwapSuccess = () => {
    // refresh listings
    setRefreshKey(prev => prev + 1);
  };

  const handleExportKey = () => {
    const wallet = getWallet();
    if (!wallet) {
      alert("No wallet found");
      return;
    }

    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text).then(
        () => alert(`Private key copied to clipboard!\n\nAddress: ${wallet.address}\n\nPrivate Key: ${wallet.privateKey}\n\n⚠️ NEVER share this with anyone!`),
        () => alert(`Failed to copy. Here's your private key:\n\n${wallet.privateKey}\n\n⚠️ Copy it manually and NEVER share with anyone!`)
      );
    };

    if (confirm("⚠️ WARNING ⚠️\n\nYour private key gives FULL ACCESS to your wallet.\n\nNEVER share it with anyone!\n\nCopy to clipboard?")) {
      copyToClipboard(wallet.privateKey);
    }
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
          <button
            onClick={handleExportKey}
            style={{
              marginLeft: "12px",
              padding: "6px 12px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500"
            }}
          >
            🔑 export key
          </button>
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
            onCancelClick={handleCancelClick}
            onEditClick={handleEditClick}
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
