import { Listing } from "@/types";

// get listings from localstorage
export const getListings = (): Listing[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem("listings");
    if (!stored) return [];

    const listings = JSON.parse(stored);
    return listings.filter((l: Listing) => l.status === "active");
  } catch (e) {
    console.error("cant load listings:", e);
    return [];
  }
};

// save listing to localstorage
export const saveListing = (listing: Listing) => {
  try {
    // get ALL listings from storage (not filtered)
    const stored = localStorage.getItem("listings");
    const allListings = stored ? JSON.parse(stored) : [];

    allListings.push(listing);

    localStorage.setItem("listings", JSON.stringify(allListings));
    console.log("listing saved:", listing.id);
    console.log("total listings in storage:", allListings.length);

    return true;
  } catch (e) {
    console.error("save failed:", e);
    return false;
  }
};

// update listing status
export const updateListingStatus = (id: string, status: "sold" | "cancelled") => {
  try {
    const stored = localStorage.getItem("listings");
    if (!stored) return false;

    const listings = JSON.parse(stored);
    const updated = listings.map((l: Listing) =>
      l.id === id ? { ...l, status } : l
    );

    localStorage.setItem("listings", JSON.stringify(updated));
    console.log("listing updated:", id, status);

    return true;
  } catch (e) {
    console.error("update failed:", e);
    return false;
  }
};

// generate listing id
export const generateListingId = () => {
  return `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// validate listing data
export const validateListing = (amount: number, price: number) => {
  if (amount <= 0) return "amount must be positive";
  if (price <= 0) return "price must be positive";
  if (isNaN(amount) || isNaN(price)) return "invalid numbers";

  return null;
};

// format sbtc amount for display
export const formatSBTC = (amount: number) => {
  return `${amount.toFixed(8)} sBTC`;
};

// format stx amount
export const formatSTX = (amount: number) => {
  return `${amount.toFixed(2)} STX`;
};

// get wallet from localstorage
export const getWallet = () => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem("wallet");
    if (!stored) return null;

    return JSON.parse(stored);
  } catch (e) {
    console.error("cant load wallet:", e);
    return null;
  }
};

// save wallet to localstorage
export const saveWallet = (wallet: any) => {
  try {
    localStorage.setItem("wallet", JSON.stringify(wallet));
    console.log("wallet saved");
    return true;
  } catch (e) {
    console.error("wallet save failed:", e);
    return false;
  }
};
