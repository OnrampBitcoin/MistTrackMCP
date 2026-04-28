import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Register blockchain explorer URL generation tool to MCP server
 * @param server MCP server instance
 */
export function registerChainExplorerUrlTool(server: McpServer): void {
  server.tool(
    'get_chain_explorer_url',
    'Generate URL for corresponding blockchain explorer based on coin type and address or transaction hash',
    {
      coin: z.string().describe('Coin code, e.g. "ETH", "BTC", "USDT-TRC20", etc.'),
      address: z.string().optional().describe('Blockchain address. Provide either address or txid.'),
      txid: z.string().optional().describe('Transaction hash. Provide either txid or address.'),
    },
    async ({ coin, address, txid }): Promise<CallToolResult> => {
      try {
        if (!address && !txid) {
          return {
            content: [
              {
                type: 'text',
                text: 'Either address or txid parameter must be provided'
              }
            ]
          };
        }

        if (address && txid) {
          return {
            content: [
              {
                type: 'text',
                text: 'Provide either address or txid, not both'
              }
            ]
          };
        }

        // Import blockchain explorer URL generation utility
        const { getChainExplorerUrl, normalizeCoinFormat } = await import('../utils/misttrackDashboard.js');
        const target = txid || address || '';
        const targetType = txid ? 'tx' : 'address';
        
        // Normalize coin format
        const normalizedCoin = normalizeCoinFormat(coin, target);
        
        // Get blockchain explorer URL
        const url = getChainExplorerUrl(normalizedCoin, target, targetType);
        
        const textResult = `${txid ? 'Transaction Hash' : 'Address'}: ${target}
Coin: ${normalizedCoin}
Blockchain Explorer URL: ${url}`;
        
        return {
          content: [
            {
              type: 'text',
              text: textResult
            }
          ]
        };
      } catch (e: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to generate blockchain explorer URL: ${e.message}`
            }
          ]
        };
      }
    }
  );
} 
