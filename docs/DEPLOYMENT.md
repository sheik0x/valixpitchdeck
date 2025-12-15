# Deployment Guide

## Prerequisites

- Node.js 18+
- Hardhat installed globally or locally
- Go 1.19+ (for validator node)
- Access to blockchain RPC endpoint
- Private keys for deployment (keep secure!)

## Step 1: Install Dependencies

```bash
npm install
cd validator-node && go mod download
```

## Step 2: Configure Environment

Create a `.env` file:

```env
PRIVATE_KEY=your_private_key_here
RPC_URL=https://api.avax.network/ext/bc/C/rpc
NETWORK=avalanche
```

## Step 3: Deploy Contracts

### Local Development

```bash
# Start local Hardhat node
npx hardhat node

# In another terminal, deploy
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet (Fuji)

```bash
npx hardhat run scripts/deploy.js --network fuji
```

### Mainnet (Avalanche)

```bash
npx hardhat run scripts/deploy.js --network avalanche
```

### Save Contract Addresses

After deployment, save the contract addresses:

```javascript
SecurityLeasingRegistry: 0x...
SlashingEngine: 0x...
RewardDistributor: 0x...
LeaseManager: 0x...
```

## Step 4: Configure Contracts

### Set Slashing Engine in Registry

```javascript
// Update registry to allow slashing engine to slash
// This requires modifying the registry contract or using governance
```

### Set Subnet Adapters

```javascript
const leaseManager = await ethers.getContractAt("LeaseManager", LEASE_MANAGER_ADDRESS);

// Set Avalanche subnet adapter
await leaseManager.setSubnetAdapter(
  subnetId,
  avalancheAdapterAddress
);
```

## Step 5: Deploy Subnet Adapters

### Deploy Avalanche Adapter

```javascript
const AvalancheSubnetAdapter = await ethers.getContractFactory("AvalancheSubnetAdapter");
const adapter = await AvalancheSubnetAdapter.deploy(
  subnetId,
  subnetManagerAddress
);
```

### Deploy Cosmos Adapter

```javascript
const CosmosSubnetAdapter = await ethers.getContractFactory("CosmosSubnetAdapter");
const adapter = await CosmosSubnetAdapter.deploy(
  subnetId,
  subnetManagerAddress,
  cosmosBridgeAddress
);
```

## Step 6: Initialize Governance

```javascript
const Governance = await ethers.getContractFactory("Governance");
const governance = await Governance.deploy(
  [governor1, governor2, governor3], // Initial governors
  emergencyPauseAddress
);
```

## Step 7: Set Up Monitoring

```bash
cd monitoring
npm install

# Configure monitoring
export RPC_URL=your_rpc_url
export REGISTRY_ADDRESS=0x...
export SLASHING_ENGINE_ADDRESS=0x...
export WEBHOOK_URL=your_webhook_url

# Start monitor
node monitor.js
```

## Step 8: Run Validator Node

```bash
cd validator-node

# Create config.yaml
cat > config.yaml << EOF
validator:
  address: "0x..."
  private_key: "..."
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
EOF

# Run node
go run main.go --config config.yaml
```

## Verification

### Verify Contracts on Explorer

```bash
npx hardhat verify --network avalanche CONTRACT_ADDRESS "constructor" "args"
```

### Test Basic Functionality

```bash
npx hardhat test
```

## Post-Deployment Checklist

- [ ] All contracts deployed and verified
- [ ] Governance initialized with proper addresses
- [ ] Subnet adapters deployed and configured
- [ ] Monitoring service running
- [ ] Validator nodes configured
- [ ] Documentation updated with addresses
- [ ] Security audit completed
- [ ] Emergency procedures documented

## Troubleshooting

### Contract Deployment Fails

- Check RPC endpoint is accessible
- Verify sufficient balance for gas
- Check contract size limits

### Validator Node Issues

- Verify RPC connection
- Check private key format
- Review logs for errors

### Monitoring Not Working

- Verify contract addresses
- Check RPC endpoint
- Review webhook configuration