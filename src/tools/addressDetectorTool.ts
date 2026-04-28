import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Register address detection tool to MCP server
 * Detect blockchain and possible tokens based on address format features
 * @param server MCP server instance
 */
export function registerAddressDetectorTool(server: McpServer): void {
  server.tool(
    'detect_address_chain',
    'Detect blockchain and possible tokens based on address format features',
    {
      address: z.string().describe('Address to detect'),
    },
    async ({ address }): Promise<CallToolResult> => {
      // Clean up any whitespace at the beginning or end of the address
      address = address.trim();
      
      let result: {
        success: boolean;
        address: string;
        detected_chains: string[];
        description: string;
        recommended_coins: string[];
      };
      
      // Check EVM-format addresses (including Ethereum, BNB Smart Chain, Polygon, Avalanche, and other EVM chains)
      if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
        result = {
          success: true,
          address: address,
          detected_chains: ["ETH", "BNB", "POL-Polygon", "AVAX-Avalanche", "ETH-Arbitrum", "ETH-Optimism", "ETH-Base"],
          description: "This is an EVM-format address, which may apply to multiple EVM-compatible chains, including Ethereum, BNB Smart Chain, Polygon, Avalanche, Arbitrum, Optimism, Base, etc.",
          recommended_coins: [
            "ETH",
            "USDT-ERC20",
            "USDC-ERC20",
            "BNB",
            "USDT-BEP20",
            "POL-Polygon",
            "USDT-Polygon",
            "AVAX-Avalanche",
            "ETH-Arbitrum",
            "ETH-Optimism",
            "ETH-Base"
          ]
        };
      } 
      // Check Bitcoin addresses
      else if (
        (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) ||
        (/^bc1[ac-hj-np-z02-9]{11,71}$/i.test(address))
      ) {
        result = {
          success: true,
          address: address,
          detected_chains: ["BTC"],
          description: "This is a Bitcoin format address.",
          recommended_coins: ["BTC"]
        };
      }
      // Check Tron addresses
      else if (/^T[a-zA-Z0-9]{33}$/.test(address)) {
        result = {
          success: true,
          address: address,
          detected_chains: ["TRX"],
          description: "This is a TRON format address.",
          recommended_coins: ["TRX", "USDT-TRC20"]
        };
      }
      // Check Ripple addresses. MistTrack OpenAPI may not support XRP in the current public coin list.
      else if (/^r[a-zA-Z0-9]{24,34}$/.test(address)) {
        result = {
          success: true,
          address: address,
          detected_chains: ["XRP"],
          description: "This is a Ripple format address. XRP is not listed in the current MistTrack OpenAPI coin list, so API queries may return UnsupportedToken.",
          recommended_coins: []
        };
      }
      // Check Solana addresses
      else if (address.length === 44 || address.length === 43) {
        // Solana addresses are typically 43-44 characters long, base58 encoded
        // Note: There's no direct base58 decoder in TypeScript, so we use a simple heuristic method
        if (/^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(address)) {
          result = {
            success: true,
            address: address,
            detected_chains: ["SOL"],
            description: "This may be a Solana format address.",
            recommended_coins: ["SOL"]
          };
        } else {
          result = {
            success: false,
            address: address,
            detected_chains: [],
            description: "Unable to recognize this address format. Please try to specify the coin type manually for querying.",
            recommended_coins: []
          };
        }
      }
      // If chain type cannot be determined
      else {
        result = {
          success: false,
          address: address,
          detected_chains: [],
          description: "Unable to recognize this address format. Please try to specify the coin type manually for querying.",
          recommended_coins: []
        };
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );
} 
