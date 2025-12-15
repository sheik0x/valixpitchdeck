# Testnet Deployment Guide

## Prerequisites

1. **Environment Setup**
   ```bash
   # Install dependencies
   npm install
   
   # Set up environment variables
   cp .env.example .env
   ```

2. **Required Environment Variables**
   ```env
   PRIVATE_KEY=your_private_key_here
   FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
   SNOWTRACE_API_KEY=your_snowtrace_api_key (optional, for verification)
   ```

3. **Get Testnet AVAX**
   - Visit: https://faucet.avax.network/
   - Request testnet AVAX for deployment

## Deployment Steps

### 1. Deploy Contracts

```bash
# Deploy to Fuji testnet
npx hardhat run scripts/deploy-fuji.js --network fuji
```

### 2. Verify Contracts (Optional)

```bash
# Verify SecurityLeasingRegistry
npx hardhat verify --network fuji <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# Example:
npx hardhat verify --network fuji \
  0x1234... \
  "0x5678..." \
  "1000000000000000000000" \
  "86400" \
  "31536000"
```

### 3. Update Frontend Configuration

Update `frontend/.env.local`:

```env
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_FEE_MARKET_ADDRESS=0x...
NEXT_PUBLIC_ACCS_ADDRESS=0x...
NEXT_PUBLIC_HVM_ADDRESS=0x...
NEXT_PUBLIC_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
```

### 4. Deploy Frontend

```bash
cd frontend
npm run build
# Deploy to Vercel, Netlify, or your preferred hosting
```

## Testing on Testnet

### 1. Register Validator

```javascript
// Using ethers.js
const registry = new ethers.Contract(registryAddress, abi, signer);
await registry.registerValidator(
  ethers.parseEther("10000"),
  ethers.parseEther("5000"),
  ["avalanche"],
  86400,
  31536000
);
```

### 2. Register Subnet

```javascript
const subnetId = ethers.id("my-test-subnet");
await registry.registerSubnet(
  subnetId,
  "avalanche",
  subnetAddress,
  ethers.parseEther("1000")
);
```

### 3. Create Bid

```javascript
const feeMarket = new ethers.Contract(feeMarketAddress, feeMarketAbi, signer);
const qos = {
  minUptime: 9950,
  maxLatency: 100,
  minValidatorCount: 10,
  securityLevel: 8,
  geographicDiversity: 5000,
};
await feeMarket.createSecurityBid(
  subnetId,
  ethers.parseEther("10000"),
  86400 * 30,
  qos,
  ethers.ZeroAddress,
  ethers.parseEther("0.05")
);
```

## Monitoring

### Contract Interactions

Monitor on Snowtrace:
- https://testnet.snowtrace.io/address/<CONTRACT_ADDRESS>

### Events

Track important events:
- ValidatorRegistered
- SubnetRegistered
- LeaseCreated
- ProofOfMaliceSubmitted
- AtomicSlashExecuted

## Troubleshooting

### Common Issues

1. **Insufficient Gas**
   - Get more testnet AVAX from faucet
   - Check gas prices

2. **Contract Verification Fails**
   - Ensure constructor args match exactly
   - Check compiler version matches

3. **Transaction Reverts**
   - Check contract state
   - Verify permissions
   - Review error messages

## Post-Deployment Checklist

- [ ] All contracts deployed
- [ ] Contracts verified on Snowtrace
- [ ] Frontend updated with addresses
- [ ] Test validator registration
- [ ] Test subnet registration
- [ ] Test lease creation
- [ ] Test fee market
- [ ] Monitor for errors
- [ ] Document testnet addresses