# sBTC P2P Swap

simple marketplace for trading sbtc with embedded wallets. built for the turnkey embedded wallet challenge on stacks.

## what it does

you can list sbtc for sale and other people can buy it. no wallet extension needed because it uses turnkey embedded wallets. everything runs on stacks testnet.

## tech

- next.js 14 for the frontend
- turnkey sdk for embedded wallets
- stacks blockchain (testnet)
- sbtc token for swaps
- localstorage for data (yeah i know)

## setup

install dependencies:
```bash
npm install
```

add your turnkey credentials in `.env.local`:
```
NEXT_PUBLIC_TURNKEY_API_URL=https://api.turnkey.com
NEXT_PUBLIC_TURNKEY_ORG_ID=your_org_id_here
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_STACKS_API_URL=https://api.testnet.hiro.so
```

run it:
```bash
npm run dev
```

open http://localhost:3000

## how it works

when you first visit, it creates an embedded wallet using turnkey. no extension, no seed phrases to write down. then you can either:

1. create a listing - specify how much sbtc you want to sell and for what price in stx
2. browse listings - see what others are selling and buy from them

when you buy, it builds a stacks transaction, signs it with your turnkey wallet, and broadcasts to testnet.

## challenges i ran into

stacks isn't natively supported in turnkey so i had to use raw signing methods. basically:

- manually build the stacks transaction format using public key (not private key)
- serialize it to bytes
- sign the raw payload with turnkey using sha256 hash
- attach the ECDSA signature (handling recovery byte)
- broadcast to stacks testnet

took some trial and error to get the derivation path right (`m/44'/5757'/0'/0/0`) and figure out the signing flow. also had to work around turnkey's signature format to match what stacks expects.

## transaction flow

currently the app does **STX transfers** for payments (not sBTC transfers yet). this is because:
- STX transfers work out of the box on testnet
- easier to test without needing testnet sBTC tokens
- demonstrates the full turnkey + stacks integration

the sBTC contract code is there (uses mainnet contract `SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token`) but you'd need:
- actual testnet sBTC tokens in your wallet
- confirmed testnet sBTC contract address

for the demo, STX transfers prove the embedded wallet + transaction signing works.

## known issues

- using localstorage so listings arent shared across browsers (you need to open incognito to test the full flow)
- error handling is pretty basic
- no actual tests written
- styling is minimal (dark theme only)
- currently using STX for payments, not actual sBTC transfers (but framework is there)
- no balance checking before swaps
- listings cant be cancelled once created
- need to get testnet STX from faucet to test swaps

## testing locally

1. run the app and create a wallet
2. get testnet STX from faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet
3. create a listing with some amount/price
4. open in incognito mode (or different browser)
5. create another wallet and get testnet STX for it too
6. you should see the first listing
7. try to buy it - this will submit a real STX transaction to testnet
8. check transaction status on explorer: https://explorer.hiro.so/txid/YOUR_TX_ID?chain=testnet

## improvements for later

if i had more time i would add:

- real backend for listings (firebase or something)
- switch from STX to actual sBTC transfers once testnet contract confirmed
- better error messages
- balance display (show STX and sBTC balances)
- transaction history
- ability to cancel listings
- more polish on the ui
- actual tests
- tx confirmation polling
- gas estimation

## demo video

TODO: record screen showing wallet creation, listing creation, and swap flow

## license

MIT
