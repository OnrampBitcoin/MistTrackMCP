import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Register risk score tool to MCP server
 * @param server MCP server instance
 */
export function registerRiskScoreTool(server: McpServer): void {
  server.tool(
    'get_risk_score',
    'Get risk score for the specified address or transaction hash',
    {
      coin: z.string().describe('Coin type to check, such as ETH, BTC, etc.'),
      address: z.string().optional().describe('Address to check (either address or txid must be provided)'),
      txid: z.string().optional().describe('Transaction hash to check (either address or txid must be provided)'),
      direction: z.enum(['deposit', 'withdraw']).optional().describe('Transaction direction for txid queries. Only applies when txid is provided. Defaults to deposit.'),
    },
    async ({ coin, address, txid, direction }): Promise<CallToolResult> => {
      // Handle null values, convert to undefined
      const addressParam = address || undefined;
      const txidParam = txid || undefined;
      
      if (!addressParam && !txidParam) {
        return {
          content: [
            {
              type: 'text',
              text: 'Either address or txid parameter must be provided'
            }
          ]
        };
      }

      if (addressParam && txidParam) {
        return {
          content: [
            {
              type: 'text',
              text: 'Provide either address or txid, not both'
            }
          ]
        };
      }
      
      try {
        // Import analysis client
        const { MistTrackClientManager } = await import('../utils/misttrackClientManager.js');
        const client = MistTrackClientManager.getClient();
        
        // Get risk score
        const result = await client.getRiskScore(coin, addressParam, txidParam, direction);
        
        if (result.success) {
          const data = result.data || {};
          const score = data.score || 0;
          const riskLevel = data.risk_level || data.level || 'Unknown';
          const detailList = Array.isArray(data.detail_list) ? data.detail_list : [];
          const riskDetail = Array.isArray(data.risk_detail) ? data.risk_detail : [];

          const targetType = txidParam ? 'Transaction Hash' : 'Address';
          const targetValue = txidParam || addressParam;
          const lines = [
            `${targetType}: ${targetValue}`,
            `Coin: ${coin}`,
            txidParam ? `Direction: ${direction || 'deposit'}` : '',
            `Risk Score: ${score}`,
            `Risk Level: ${riskLevel}`,
            data.address_label ? `Address Label: ${data.address_label}` : '',
            data.hacking_event ? `Hacking Event: ${data.hacking_event}` : '',
            detailList.length > 0 ? `Risk Indicators: ${detailList.join(', ')}` : '',
            data.risk_report_url ? `Risk Report URL: ${data.risk_report_url}` : ''
          ].filter(Boolean);

          if (riskDetail.length > 0) {
            lines.push('');
            lines.push('Risk Detail:');
            for (const item of riskDetail.slice(0, 5)) {
              const summary = [
                item.entity ? `entity=${item.entity}` : '',
                item.risk_type ? `type=${item.risk_type}` : '',
                item.exposure_type ? `exposure=${item.exposure_type}` : '',
                item.hop_num !== undefined ? `hops=${item.hop_num}` : '',
                item.volume !== undefined ? `volume_usd=${item.volume}` : '',
                item.percent !== undefined ? `percent=${item.percent}` : ''
              ].filter(Boolean).join(', ');
              lines.push(`- ${summary || JSON.stringify(item)}`);
              if (item.hop_dic) {
                lines.push(`  hop_dic: ${JSON.stringify(item.hop_dic)}`);
              }
            }
            if (riskDetail.length > 5) {
              lines.push(`... ${riskDetail.length - 5} more risk detail items omitted`);
            }
          }
          
          return {
            content: [
              {
                type: 'text',
                text: lines.join('\n')
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `Failed to get risk score: ${result.msg || 'Unknown error'}`
              }
            ]
          };
        }
      } catch (e: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to get risk score: ${e.message}`
            }
          ]
        };
      }
    }
  );
}
