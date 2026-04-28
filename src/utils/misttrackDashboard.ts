/**
 * MistTrack Dashboard URL Generation Tool
 * 
 * Provides functions for generating MistTrack dashboard URLs to directly access analysis pages for specific addresses
 */

/**
 * Generate MistTrack dashboard URL based on coin and address
 * 
 * @param coin Coin code, e.g. "ETH", "BTC", "USDT-TRC20", etc.
 * @param address Blockchain address
 * @returns MistTrack dashboard URL
 * 
 * @example
 * ```typescript
 * getDashboardUrl("USDT-TRC20", "TGBZh32uiJL3RuVfQiwZrQs5U6nJBmUYxb")
 * // returns: "https://dashboard.misttrack.io/address/USDT-TRC20/TGBZh32uiJL3RuVfQiwZrQs5U6nJBmUYxb"
 * ```
 */
export function getDashboardUrl(coin: string, address: string): string {
  // Ensure coin format is correct
  coin = normalizeCoinFormat(coin, address);
  
  // Build URL
  const baseUrl = "https://dashboard.misttrack.io/address";
  const url = `${baseUrl}/${coin}/${address}`;
  
  return url;
}

/**
 * Normalize coin format, e.g. convert "usdt_trc20" to "USDT-TRC20"
 * 
 * @param coin Input coin code
 * @param address Optional address, used to infer coin type based on address format
 * @returns Normalized coin code
 */
export function normalizeCoinFormat(coin: string, address?: string): string {
  coin = coin.trim().replace(/_/g, "-");
  
  const upperCoin = coin.toUpperCase();
  const aliases: Record<string, string> = {
    "BSC": "BNB",
    "MATIC": "POL-Polygon",
    "POLYGON": "POL-Polygon",
    "AVAX": "AVAX-Avalanche",
    "AVALANCHE": "AVAX-Avalanche",
    "ARBITRUM": "ETH-Arbitrum",
    "OPTIMISM": "ETH-Optimism",
    "BASE": "ETH-Base",
    "ZKSYNC": "ETH-zkSync",
    "MERLIN": "BTC-Merlin",
    "IOTEX": "IOTX"
  };

  if (aliases[upperCoin]) {
    return aliases[upperCoin];
  }
  
  // Handle common special cases
  if (upperCoin === "USDT" && address) {
    // Determine USDT chain based on address format
    if (address.startsWith("T")) {
      return "USDT-TRC20";
    } else if (address.startsWith("0x")) {
      return "USDT-ERC20";
    }
  }

  const suffixMap: Record<string, string> = {
    "POLYGON": "Polygon",
    "AVALANCHE": "Avalanche",
    "ARBITRUM": "Arbitrum",
    "OPTIMISM": "Optimism",
    "BASE": "Base",
    "ZKSYNC": "zkSync",
    "MERLIN": "Merlin",
    "SOLANA": "Solana",
    "IOTEX": "IoTeX",
    "SUI": "SUI"
  };

  const parts = upperCoin.split("-");
  if (parts.length >= 2) {
    const chain = parts[parts.length - 1];
    const normalizedChain = suffixMap[chain] || chain;
    return `${parts.slice(0, -1).join("-")}-${normalizedChain}`;
  }
  
  return upperCoin;
}

/**
 * Generate blockchain explorer URL based on coin and address
 * 
 * @param coin Coin code
 * @param target Blockchain address or transaction hash
 * @param targetType Whether the target is an address or transaction hash
 * @returns Blockchain explorer URL
 */
export function getChainExplorerUrl(
  coin: string,
  target: string,
  targetType: 'address' | 'tx' = 'address'
): string {
  coin = normalizeCoinFormat(coin, target);
  const pathType = targetType === 'tx' ? 'tx' : 'address';
  
  // Mapping of blockchain explorer URLs for different chains
  const explorers: Record<string, string> = {
    "ETH": `https://etherscan.io/${pathType}/${target}`,
    "USDT-ERC20": `https://etherscan.io/${pathType}/${target}`,
    "USDC-ERC20": `https://etherscan.io/${pathType}/${target}`,
    "USDT-TRC20": `https://tronscan.org/#/${targetType === 'tx' ? 'transaction' : 'address'}/${target}`,
    "USDC-TRC20": `https://tronscan.org/#/${targetType === 'tx' ? 'transaction' : 'address'}/${target}`,
    "USDT-BEP20": `https://bscscan.com/${pathType}/${target}`,
    "USDC-BEP20": `https://bscscan.com/${pathType}/${target}`,
    "BTC": targetType === 'tx'
      ? `https://www.blockchain.com/explorer/transactions/btc/${target}`
      : `https://www.blockchain.com/explorer/addresses/btc/${target}`,
    "BNB": `https://bscscan.com/${pathType}/${target}`,
    "TRX": `https://tronscan.org/#/${targetType === 'tx' ? 'transaction' : 'address'}/${target}`,
    "POL-Polygon": `https://polygonscan.com/${pathType}/${target}`,
    "USDT-Polygon": `https://polygonscan.com/${pathType}/${target}`,
    "USDC-Polygon": `https://polygonscan.com/${pathType}/${target}`,
    "AVAX-Avalanche": `https://snowtrace.io/${pathType}/${target}`,
    "USDT-Avalanche": `https://snowtrace.io/${pathType}/${target}`,
    "USDC-Avalanche": `https://snowtrace.io/${pathType}/${target}`,
    "ETH-Arbitrum": `https://arbiscan.io/${pathType}/${target}`,
    "USDT-Arbitrum": `https://arbiscan.io/${pathType}/${target}`,
    "USDC-Arbitrum": `https://arbiscan.io/${pathType}/${target}`,
    "ETH-Optimism": `https://optimistic.etherscan.io/${pathType}/${target}`,
    "USDT-Optimism": `https://optimistic.etherscan.io/${pathType}/${target}`,
    "USDC-Optimism": `https://optimistic.etherscan.io/${pathType}/${target}`,
    "ETH-Base": `https://basescan.org/${pathType}/${target}`,
    "USDC-Base": `https://basescan.org/${pathType}/${target}`,
    "USDT-Base": `https://basescan.org/${pathType}/${target}`,
    "SOL": `https://solscan.io/${targetType === 'tx' ? 'tx' : 'account'}/${target}`,
    "USDT-Solana": `https://solscan.io/${targetType === 'tx' ? 'tx' : 'account'}/${target}`,
    "USDC-Solana": `https://solscan.io/${targetType === 'tx' ? 'tx' : 'account'}/${target}`,
    "TON": `https://tonscan.org/${targetType === 'tx' ? 'tx' : 'address'}/${target}`,
    "USDT-TON": `https://tonscan.org/${targetType === 'tx' ? 'tx' : 'address'}/${target}`,
  };
  
  return explorers[coin] || `https://dashboard.misttrack.io/address/${coin}/${target}`;
}
