// wallet stuff
export interface Wallet {
  address: string;
  walletId: string;
  userId: string;
}

// listing for marketplace
export interface Listing {
  id: string;
  seller: string;
  amount: number; // sbtc amount
  price: number; // stx price
  status: 'active' | 'sold' | 'cancelled';
  created: number; // timestamp
}

// tx tracking
export interface TxStatus {
  txId: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

// turnkey activity result
export interface ActivityResult {
  activity: {
    id: string;
    status: string;
    result: any;
  };
}
