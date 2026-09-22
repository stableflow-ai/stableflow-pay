export interface PayConfigChain {
  network: string;
  chainId: string;
  chainName: string;
  logo: string;
  explorer: string;
}

export interface PayConfigToken {
  symbol: string;
  network: string;
  decimals: number;
  contractAddress: string;
  price: string;
  supportPayment: boolean;
  supportReceive: boolean;
}

export interface PayConfig {
  chains: PayConfigChain[];
  tokens: PayConfigToken[];
}
