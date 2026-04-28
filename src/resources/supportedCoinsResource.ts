import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Register supported coins resource
 * @param server MCP server instance
 */
export function registerSupportedCoinsResource(server: McpServer) {
  server.resource(
    "supported-coins",
    "coins://list",
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: JSON.stringify({
          coins: [
            "ETH", "BTC", "USDT-ERC20", "USDC-ERC20", "WETH-ERC20",
            "TRX", "USDT-TRC20", "USDC-TRC20", "USDD-TRC20",
            "BNB", "USDT-BEP20", "USDC-BEP20", "BUSD-BEP20",
            "POL-Polygon", "USDT-Polygon", "USDC-Polygon",
            "AVAX-Avalanche", "USDT-Avalanche", "USDC-Avalanche",
            "ETH-Arbitrum", "USDT-Arbitrum", "USDC-Arbitrum",
            "ETH-Optimism", "USDT-Optimism", "USDC-Optimism",
            "ETH-Base", "USDC-Base", "USDT-Base",
            "ETH-zkSync", "ZK-zkSync", "BTC-Merlin",
            "TON", "USDT-TON",
            "SOL", "USDT-Solana", "USDC-Solana",
            "LTC", "DOGE", "BCH", "HSK", "SUI", "USDC-SUI"
          ]
        })
      }]
    })
  );
} 
