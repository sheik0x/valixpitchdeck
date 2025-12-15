# Unified Security Layer - Security Leasing Protocol

A groundbreaking protocol that enables main chain validators to lease their security stake to subnets in a trust-minimized way, solving the Security Fragmentation and Cold Start Problem.

## 🎯 Problem Solved

- **Security Fragmentation**: Each subnet needs its own validator set and staking
- **Cold Start Problem**: New subnets can't bootstrap secure validator sets
- **Solution**: Main chain validators lease security without moving stake

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Main Chain (Avalanche C-Chain, etc.)          │
│  ┌──────────────────────────────────────────────────┐  │
│  │     Security Leasing Protocol (Smart Contracts)   │  │
│  │  - Validator Registry                              │  │
│  │  - Lease Manager                                   │  │
│  │  - Slashing Engine                                 │  │
│  │  - Reward Distributor                              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        │
                        │ Security Leases
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│ Avalanche    │ │  Cosmos     │ │  Generic    │
│ Subnet       │ │  App-Chain  │ │  Subnet     │
│ Adapter      │ │  Adapter    │ │  Adapter    │
└──────────────┘ └─────────────┘ └─────────────┘
```

## 📁 Project Structure

```
unified-security-layer/
├── contracts/              # Smart contracts (Solidity)
│   ├── SecurityLeasingRegistry.sol
│   ├── LeaseManager.sol
│   ├── SlashingEngine.sol
│   └── RewardDistributor.sol
├── adapters/               # Subnet integration adapters
│   ├── avalanche/
│   ├── cosmos/
│   └── generic/
├── validator-node/         # Validator node software
│   ├── client/
│   ├── monitor/
│   └── config/
├── economics/              # Economic mechanisms
│   ├── staking-pools/
│   └── fee-structures/
├── governance/             # Governance contracts
├── monitoring/             # Monitoring and alerting
└── docs/                   # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Solidity compiler (solc)
- Hardhat or Foundry
- Go 1.19+ (for validator node)

### Installation

```bash
npm install
cd validator-node && go mod download
```

### Deploy Contracts

```bash
npx hardhat deploy --network <network>
```

### Run Validator Node

```bash
cd validator-node
go run main.go --config config.yaml
```

## 🔐 Security Features

- **Trust-Minimized Leasing**: Validators commit stake without transferring
- **Automatic Slashing**: Misbehavior triggers immediate slashing
- **Multi-Signature Schemes**: Distributed trust across validator sets
- **Time-Locked Commitments**: Prevents immediate exit attacks

## 🚀 Groundbreaking Features

### 1. Atomic Cross-Chain Slashing (ACCS)
**Trustless Economic Guarantee**: Subnet security backed by main chain value without trusted intermediaries. Validators lock stake on main chain; cryptographically verifiable proof-of-malice triggers immediate, trustless slashing.

### 2. Heterogeneous Verification Module (HVM)
**Generalized Interoperability**: Standardized interface supporting EVM, Move VM, Cosmos SDK, Substrate, and custom VMs. Light-client-verified state proofs enable true heterogeneous chain support.

### 3. Dynamic Fee Market
**Sustainable Economic Model**: Market where subnets bid for QoS-based security. Creates continuous revenue stream for validators, paid in subnet native tokens. Aligns financial incentives with ecosystem security.

See [GROUNDBREAKING_FEATURES.md](docs/GROUNDBREAKING_FEATURES.md) for detailed documentation.

## 📊 Status

✅ **Core Implementation Complete** - All major components implemented and ready for testing

### What's Included

- ✅ Complete smart contract suite (Registry, Slashing, Rewards, Lease Manager)
- ✅ Multi-chain subnet adapters (Avalanche, Cosmos, Generic)
- ✅ Validator node software (Go)
- ✅ Governance system
- ✅ Monitoring service
- ✅ Comprehensive test suite
- ✅ Full documentation

### Next Steps

1. Security audit
2. Testnet deployment
3. Mainnet launch
4. Community onboarding

## 📄 License

MIT