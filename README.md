# MistTrack MCP Server

MistTrack MCP Server connects MCP clients such as Claude Desktop to the MistTrack OpenAPI. It lets an AI assistant query blockchain addresses and transactions for labels, balances, profiles, counterparties, risk scores, malicious fund signals, and fund-flow traces.

## Features

- Address detection for common chains and token formats
- Address labels, overview, profile, action, and counterparty analysis
- MistTrack Risk Score V3.0 for address and transaction hash checks
- Malicious fund checks based on MistTrack threat intelligence
- Recursive multi-layer transaction investigation
- MistTrack dashboard and chain explorer URL generation
- Built-in MCP resources and prompts for risk analysis workflows

## Requirements

- Node.js 18 or newer
- A MistTrack API key
- A MistTrack plan that supports OpenAPI access

Get an API key from the MistTrack dashboard: https://dashboard.misttrack.io/apikeys

## Installation

Use the package directly through `npx`:

```bash
npx -y misttrack@latest --key YOUR_MISTTRACK_API_KEY
```

Or install it globally:

```bash
npm install -g misttrack
misttrack --key YOUR_MISTTRACK_API_KEY
```

You can also provide the API key through the environment:

```bash
export MISTTRACK_API_KEY=YOUR_MISTTRACK_API_KEY
npx -y misttrack@latest
```

## Claude Desktop Configuration

Add the server to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "misttrack": {
      "command": "npx",
      "args": [
        "-y",
        "misttrack@latest",
        "--key",
        "YOUR_MISTTRACK_API_KEY"
      ]
    }
  }
}
```

Restart Claude Desktop after changing the configuration.

## Command Options

| Option | Description | Default |
| --- | --- | --- |
| `-k, --key <key>` | MistTrack API key | `MISTTRACK_API_KEY` |
| `-u, --base-url <url>` | MistTrack API base URL | `https://openapi.misttrack.io` |
| `-r, --rate-limit <limit>` | API request rate limit, requests per second | `1.0` |
| `-m, --max-retries <retries>` | Maximum retry count for retryable API errors | `3` |
| `-d, --retry-delay <delay>` | Initial retry delay in seconds | `1.0` |
| `-b, --retry-backoff <backoff>` | Retry backoff multiplier | `2.0` |

## Tools

Tool names below are the server-side MCP tool names. Some clients display them with a server prefix, such as `mcp_misttrack_get_risk_score`.

| Tool | Purpose |
| --- | --- |
| `detect_address_chain` | Detect likely chains and token formats from an address |
| `get_address_labels` | Get MistTrack labels for an address |
| `get_address_overview` | Get address balance, transaction statistics, and formatted overview |
| `get_address_action` | Get transaction action analysis for an address |
| `get_address_trace` | Get address profile, interacted platforms, and threat intelligence |
| `get_address_counterparty` | Get address counterparty analysis |
| `check_malicious_funds` | Check malicious fund signals from address threat intelligence |
| `get_risk_score` | Get MistTrack Risk Score V3.0 for an address or transaction hash |
| `get_dashboard_url` | Generate a MistTrack dashboard URL |
| `get_chain_explorer_url` | Generate a blockchain explorer URL for an address or transaction hash |
| `get_url_info` | Return both MistTrack dashboard and explorer URLs |
| `analyze_transactions_recursive` | Recursively analyze transaction relationships and fund-flow paths |

## Risk Score

`get_risk_score` uses MistTrack's official `GET /v3/risk_score` endpoint.

```typescript
{
  coin: string;                       // Example: ETH, BTC, USDT-TRC20
  address?: string;                   // Provide either address or txid
  txid?: string;                      // Provide either txid or address
  direction?: 'deposit' | 'withdraw'; // Only used for txid queries, default: deposit
}
```

Important response fields:

| Field | Description |
| --- | --- |
| `score` | Risk score returned by MistTrack |
| `risk_level` | `Low`, `Moderate`, `High`, or `Severe` |
| `detail_list` | Human-readable risk indicators |
| `risk_detail` | Detailed risk exposure records used in scoring |
| `risk_detail[].hop_dic` | Hop-level fund-flow path between the queried target and risk entity |
| `address_label` | Entity label for the queried address, or from/to address label for txid queries |
| `risk_report_url` | MistTrack AML risk report URL |

Risk level guide:

| Level | Score | Suggested operation |
| --- | --- | --- |
| `Severe` | `91-100` | Prohibit withdrawals and trading, report immediately |
| `High` | `71-90` | Maintain high-level surveillance and perform deeper investigation |
| `Moderate` | `31-70` | Apply moderate supervision |
| `Low` | `0-30` | Minimal supervision |

Example prompts:

```text
Assess the ETH risk score for address 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045.
```

```text
Check the risk score for this ETH transaction hash using withdraw direction: [TX_HASH]
```

## Recursive Transaction Analysis

`analyze_transactions_recursive` builds a compact multi-layer transaction graph for fund tracing.

```typescript
{
  coin: string;
  address: string;
  max_depth?: number;                  // 1-3, default: 1
  start_timestamp?: number;
  end_timestamp?: number;
  transaction_type?: 'in' | 'out' | 'all';
}
```

It can identify labeled counterparties, important risk entities, label statistics, and traceable fund-flow paths.

Example:

```text
Analyze potential BTC fund flows for 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa with a depth of 2.
```

## Supported Coins

MistTrack supports many chains and token formats. Common examples include:

- Ethereum: `ETH`, `USDT-ERC20`, `USDC-ERC20`, `WETH-ERC20`
- Bitcoin: `BTC`
- TRON: `TRX`, `USDT-TRC20`, `USDC-TRC20`
- BNB Smart Chain: `BNB`, `USDT-BEP20`, `USDC-BEP20`
- Polygon: `POL-Polygon`, `USDT-Polygon`, `USDC-Polygon`
- Avalanche: `AVAX-Avalanche`, `USDT-Avalanche`, `USDC-Avalanche`
- Arbitrum, Optimism, Base, zkSync, Merlin, Toncoin, Solana, Litecoin, Dogecoin, Bitcoin Cash, HashKey Chain, and Sui

For the latest full list, see the official MistTrack documentation: https://docs.misttrack.io/openapi/overview

## Example Workflows

### Address label lookup

```text
Check the labels for this Ethereum address: [ETH_ADDRESS]
```

![Label Check Example](images/labels_check.jpg)

### Address overview

```text
Analyze the overview information for this Bitcoin address: [BTC_ADDRESS]
```

![Address Overview Example](images/overview.jpg)

### Counterparty analysis

```text
Analyze the counterparties of this address: [ETH_ADDRESS]
```

### Exchange fund-flow tracing

```text
Track fund flow between this address and exchanges with depth 2: [ETH_ADDRESS]
```

![Exchange Fund Flow](images/exchanges.jpg)

### Malicious fund detection

```text
Check whether this address has malicious fund exposure: [ETH_ADDRESS]
```

![Malicious Fund Detection](images/funds_clean.jpg)

## Local Development

Install dependencies:

```bash
npm install
```

Build TypeScript:

```bash
npm run build
```

Run locally:

```bash
npm run dev -- --key YOUR_MISTTRACK_API_KEY
```

## Official Documentation

- MistTrack Docs: https://docs.misttrack.io/
- OpenAPI overview: https://docs.misttrack.io/openapi/overview
- Risk Score V3.0: https://docs.misttrack.io/api-endpoints/get-risk-score-v3
