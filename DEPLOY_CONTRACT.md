# Deploy Marketplace Contract to Testnet

## Option 1: Using Clarinet (Recommended)

1. Install Clarinet:
```bash
brew install clarinet
```

2. Deploy to testnet:
```bash
clarinet deployments generate --testnet
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

## Option 2: Manual Deployment with Script

1. Get testnet STX for gas fees:
   - Go to https://explorer.hiro.so/sandbox/faucet?chain=testnet
   - Paste your wallet address: `ST1QTR8405NG7ZMSX7V2A9P03ZTHRPACD384PDQ0H`
   - Request testnet STX

2. Export your private key:
```bash
export DEPLOYER_PRIVATE_KEY="your_private_key_here"
```

3. Run deployment script:
```bash
node scripts/deploy-contract.js
```

4. Wait for confirmation (check explorer)

5. Update contract address in `src/lib/marketplace-contract.ts`:
```typescript
export const MARKETPLACE_CONTRACT_ADDRESS = "YOUR_ADDRESS_HERE";
```

## Option 3: Use Platform UI (Easiest for now)

1. Go to https://explorer.hiro.so/sandbox/deploy?chain=testnet

2. Paste the contract code from `contracts/marketplace.clar`

3. Set contract name: `marketplace`

4. Connect your wallet (you'll need Hiro Wallet or Leather extension)

5. Deploy and wait for confirmation

6. Copy the deployed contract address and update `src/lib/marketplace-contract.ts`

## After Deployment

The app will automatically use on-chain storage for listings instead of localstorage!

All users will see the same listings because they're stored on the blockchain.
