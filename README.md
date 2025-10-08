# sBTC P2P Marketplace

A fully on-chain peer-to-peer marketplace for trading sBTC, built with Turnkey embedded wallets on Stacks blockchain. No browser extensions needed!

**Live Demo:** https://turnkeyproject.vercel.app

**Built for:** [Turnkey Embedded Wallet Challenge](https://dorahacks.io/hackathon/turnkey-embedded-wallet-challenge)

---

## Features

✅ **Embedded Wallets** - No browser extension needed, powered by Turnkey SDK
✅ **On-Chain Storage** - All listings stored on Stacks blockchain smart contract
✅ **Create Listings** - Sell sBTC for STX with custom pricing
✅ **Browse & Buy** - View all active listings and purchase with STX
✅ **Edit Price** - Sellers can update listing prices on-chain
✅ **Cancel Listings** - Sellers can cancel/delist anytime
✅ **Wallet Import/Export** - Backup and restore wallets with private key
✅ **Transaction History** - View sold/cancelled listings
✅ **Real Blockchain** - All transactions on Stacks testnet

---

## Smart Contract

**Deployed Contract:** `ST1QNFKCN58W3F1D9FQYSZGQKWG872KC6KYAV692X.marketplace-2`

**Functions:**
- `create-listing` - Create new sBTC listing
- `get-listing` - Fetch listing by ID
- `get-count` - Get total number of listings
- `mark-sold` - Mark listing as sold (called after payment)
- `cancel-listing` - Cancel active listing (seller only)
- `update-price` - Update listing price (seller only)

**View on Explorer:**
https://explorer.hiro.so/txid/ST1QNFKCN58W3F1D9FQYSZGQKWG872KC6KYAV692X.marketplace-2?chain=testnet

---

## Tech Stack

- **Frontend:** Next.js 14 (React, TypeScript)
- **Wallets:** Turnkey SDK (`@turnkey/sdk-react`, `@turnkey/sdk-browser`)
- **Blockchain:** Stacks Testnet
- **Smart Contracts:** Clarity
- **Transactions:** `@stacks/transactions`, `@stacks/network`
- **Deployment:** Vercel

---

## Architecture

### Wallet Management
- Demo mode: Generates secp256k1 keypairs locally (simulates Turnkey approach)
- Real mode: Supports Turnkey passkey authentication (optional)
- Private keys stored in browser localStorage
- Export/import functionality for wallet recovery

### Smart Contract Flow
```
1. User creates listing → Transaction to create-listing function
2. Listing stored on-chain with: seller, amount, price, active status
3. Buyers browse listings → Read from get-listing/get-count
4. Buyer purchases → Two transactions:
   a. STX payment from buyer to seller
   b. Call mark-sold to mark listing inactive
5. Seller can edit price → Transaction to update-price
6. Seller can cancel → Transaction to cancel-listing
```

### Data Storage
- **On-Chain:** All listing data (amount, price, seller, status)
- **LocalStorage:** Wallet private keys (for demo mode)
- **No Backend:** Fully decentralized, reads directly from blockchain

---

## Setup & Installation

### Prerequisites
- Node.js 16+ and npm
- Testnet STX for transactions (from faucet)

### Install Dependencies
```bash
npm install
```

### Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_TURNKEY_API_URL=https://api.turnkey.com
NEXT_PUBLIC_TURNKEY_ORG_ID=287c3fd9-a40f-44d5-980e-94ad5e443afb
NEXT_PUBLIC_RPID=turnkeyproject.vercel.app
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_STACKS_API_URL=https://api.testnet.hiro.so
```

### Run Development Server
```bash
npm run dev
```

Open http://localhost:3000

### Build for Production
```bash
npm run build
npm start
```

---

## Testing the App

### 1. Create Wallet (Seller)
1. Visit https://turnkeyproject.vercel.app
2. Click "create demo wallet"
3. **IMPORTANT:** Copy and save the private key from the alert
4. Click "🔑 export key" button anytime to backup your wallet

### 2. Get Testnet STX
- Go to https://explorer.hiro.so/sandbox/faucet?chain=testnet
- Paste your wallet address
- Request testnet STX (~10 STX recommended)

### 3. Create Listing
1. Go to "create listing" tab
2. Enter sBTC amount (e.g., `0.5`)
3. Enter price in STX (e.g., `10`)
4. Click "create listing"
5. Wait ~30 seconds for blockchain confirmation
6. Refresh page → listing appears in "my listings"

### 4. Test as Buyer (Different Wallet)
1. Open **incognito window** at https://turnkeyproject.vercel.app
2. Create a new wallet (save private key!)
3. Send testnet STX from seller wallet to buyer wallet
4. Go to "browse" tab
5. See the listing from seller wallet (proves it's on-chain!)
6. Click "buy" → confirm swap
7. Wait for transactions to confirm
8. Listing disappears from browse (marked as sold)

### 5. Manage Listings
- **Edit Price:** Go to "my listings" → click "edit price" → enter new price
- **Cancel:** Go to "my listings" → click "cancel" → confirm
- **View History:** Sold/cancelled listings show in "my listings" with red status

### 6. Restore Wallet
1. Close browser/open new incognito window
2. Click "or restore existing wallet"
3. Paste your private key (from step 1.3)
4. Click "restore wallet"
5. Same wallet address restored!

---

## Contract Deployment

The smart contract is already deployed, but if you want to deploy your own:

### Using Hiro Explorer (Easiest)
1. Go to https://explorer.hiro.so/sandbox/deploy?chain=testnet
2. Copy contract code from `contracts/marketplace.clar`
3. Set contract name (e.g., `marketplace-test`)
4. Connect wallet and deploy
5. Update `MARKETPLACE_CONTRACT_NAME` in `src/lib/marketplace-contract.ts`

### Using Clarinet CLI
```bash
# Install clarinet
brew install clarinet

# Generate deployment plan
clarinet deployments generate --testnet

# Deploy
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

See `DEPLOY_CONTRACT.md` for detailed instructions.

---

## Project Structure

```
turnkeyproject/
├── contracts/
│   └── marketplace.clar          # Smart contract for listings
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with TurnkeyProvider
│   │   └── page.tsx              # Main app with tabs
│   ├── components/
│   │   ├── WalletSetup.tsx       # Wallet creation/import
│   │   ├── CreateListing.tsx     # Create listing form
│   │   ├── ListingBrowser.tsx    # Browse/My listings view
│   │   └── SwapModal.tsx         # Buy confirmation modal
│   ├── lib/
│   │   ├── turnkey.ts            # Turnkey wallet functions
│   │   ├── stacks.ts             # Stacks transaction building
│   │   ├── marketplace-contract.ts # Contract interaction
│   │   └── sbtc.ts               # Utility functions
│   └── types/
│       └── index.ts              # TypeScript types
├── DEPLOY_CONTRACT.md            # Contract deployment guide
├── package.json
└── README.md
```

---

## Key Implementation Details

### Turnkey Integration
- Uses `@turnkey/sdk-react` for React integration
- Demo mode: Generates secp256k1 keypairs locally
- Real mode: Passkey authentication (WebAuthn)
- Derivation path: `m/44'/5757'/0'/0/0` (Stacks)

### Transaction Signing
```typescript
// Build STX transfer
const tx = await makeSTXTokenTransfer({
  recipient: sellerAddress,
  amount: priceInMicroStx,
  senderKey: privateKey,
  network: new StacksTestnet(),
  memo: `buy-listing-${listingId}`,
  nonce: BigInt(nonce),
  fee: BigInt(10000)
});

// Broadcast to network
await broadcastTransaction(tx, network);
```

### Contract Calls
```typescript
// Call update-price function
const tx = await makeContractCall({
  contractAddress: "ST1QN...",
  contractName: "marketplace-2",
  functionName: "update-price",
  functionArgs: [uintCV(listingId), uintCV(newPrice)],
  senderKey: privateKey,
  network,
  anchorMode: AnchorMode.Any,
  nonce: BigInt(nonce),
  fee: BigInt(10000)
});
```

---

## Known Limitations

- Demo mode stores private keys in localStorage (use "export key" to backup!)
- Buyer needs sufficient STX for payment + gas fees
- Transaction confirmations take ~30 seconds on testnet
- Currently simulates sBTC trades (uses STX for payments)
- No transaction status polling (manual refresh needed)

---

## Security Notes

⚠️ **This is a demo/testnet app:**
- Private keys stored in browser localStorage
- Only use testnet STX (no real money)
- Always backup your private key
- Never share your private key with anyone
- For production: implement proper key management (Turnkey production mode)

---

## Future Improvements

- [ ] Real sBTC token transfers (not just STX)
- [ ] Transaction status polling/notifications
- [ ] Gas estimation and balance checks
- [ ] Multi-signature support
- [ ] Escrow functionality
- [ ] Order book / matching engine
- [ ] Price charts and history
- [ ] Mobile responsive design
- [ ] Unit tests

---

## Demo Video

TODO: Add link to demo video

---

## Links

- **Live App:** https://turnkeyproject.vercel.app
- **Contract:** https://explorer.hiro.so/txid/ST1QNFKCN58W3F1D9FQYSZGQKWG872KC6KYAV692X.marketplace-2?chain=testnet
- **Testnet Faucet:** https://explorer.hiro.so/sandbox/faucet?chain=testnet
- **Turnkey Docs:** https://docs.turnkey.com
- **Stacks Docs:** https://docs.stacks.co

---

## License

MIT

---

## Hackathon Submission

**Challenge:** Turnkey Embedded Wallet Challenge on Stacks
**Category:** DeFi / Marketplace
**Highlights:**
- Fully functional P2P marketplace
- No browser extension required
- All data stored on-chain
- Complete CRUD operations for listings
- Real blockchain transactions on Stacks testnet
- Wallet import/export functionality
- Demonstrates Turnkey's embedded wallet approach

Built with ❤️ for the Turnkey x Stacks community
