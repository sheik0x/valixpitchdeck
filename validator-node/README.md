# Validator Node Software

Validator node software for participating in the Security Leasing Protocol.

## Features

- Multi-subnet validation support
- Automatic lease management
- Real-time monitoring
- Slashing protection
- Reward claiming

## Installation

```bash
go mod download
```

## Configuration

Create a `config.yaml` file:

```yaml
validator:
  address: "0x..."
  private_key: "..." # Encrypted
  main_chain_rpc: "https://api.avax.network/ext/bc/C/rpc"
  
leases:
  auto_activate: true
  min_stake: 1000
  max_leases: 10
  
monitoring:
  enabled: true
  check_interval: 60s
  alert_webhook: ""
  
subnets:
  - type: avalanche
    rpc: "https://..."
    adapter_address: "0x..."
```

## Running

```bash
go run main.go --config config.yaml
```

## Development

```bash
go test ./...
```