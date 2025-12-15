# Architecture Documentation

## Overview

The Unified Security Layer implements a **Security Leasing Protocol** that enables main chain validators to lease their security stake to subnets without transferring it, solving the Security Fragmentation and Cold Start Problem.

## Core Components

### 1. Security Leasing Registry

The central registry that manages:
- Validator registration and stake tracking
- Subnet registration
- Lease creation and lifecycle
- State management

**Key Features:**
- Validators register with their total stake and available stake
- Subnets register with their required security stake
- Leases connect validators to subnets with specific terms

### 2. Slashing Engine

Handles validator misbehavior and slashing:
- Violation reporting
- Slashing condition management
- Automatic slashing execution
- Evidence verification

**Slashing Types:**
- Double Sign
- Downtime
- Invalid Block
- Governance Violation

### 3. Reward Distributor

Manages reward distribution:
- Reward rate setting per subnet
- Reward accumulation
- Fee distribution (protocol + subnet)
- Reward claiming

**Fee Structure:**
- Protocol fee (default: 5%)
- Subnet fee (default: 5%)
- Validator receives remainder (90%)

### 4. Lease Manager

Coordinates between main chain and subnets:
- Subnet adapter management
- Lease activation on subnets
- Validator registration on subnets
- Lease expiration handling

### 5. Subnet Adapters

Multi-chain integration layer:
- **Avalanche Subnet Adapter**: For Avalanche subnets
- **Cosmos Subnet Adapter**: For Cosmos app-chains
- **Generic Subnet Adapter**: For custom implementations

## Protocol Flow

### Lease Creation Flow

```
1. Validator registers on main chain
   └─> Specifies total stake, available stake, supported subnet types

2. Subnet registers on main chain
   └─> Specifies required stake, subnet type, adapter address

3. Lease is created
   └─> Validator creates lease for specific subnet
   └─> Lease is in "Pending" status

4. Lease is activated
   └─> LeaseManager activates lease
   └─> Validator registered on subnet via adapter
   └─> Lease status changes to "Active"

5. Validation period
   └─> Validator performs validation duties on subnet
   └─> Rewards accumulate
   └─> Violations can be reported

6. Lease expiration
   └─> Lease expires at end time
   └─> Validator removed from subnet
   └─> Final rewards claimed
```

### Slashing Flow

```
1. Violation detected
   └─> Oracle or subnet adapter reports violation

2. Violation recorded
   └─> SlashingEngine records violation
   └─> Violation count incremented

3. Threshold check
   └─> If violation count >= threshold
   └─> Slashing is triggered

4. Slashing execution
   └─> Stake is slashed from validator
   └─> Lease is marked as "Slashed"
   └─> Validator removed from subnet
```

## Trust Minimization

### Mechanisms

1. **Cryptographic Commitments**
   - Validators commit stake without transferring
   - Slashing can occur on main chain

2. **Time-Locked Commitments**
   - Validators cannot exit immediately
   - Ensures security during lease period

3. **Multi-Signature Schemes**
   - Distributed trust across validator sets
   - Prevents single point of failure

4. **Automatic Slashing**
   - Programmatic enforcement
   - No manual intervention required

## Economic Model

### Stake Requirements

- **Minimum Validator Stake**: 1000 tokens (configurable)
- **Minimum Lease Duration**: 1 day (configurable)
- **Maximum Lease Duration**: 1 year (configurable)

### Reward Structure

- Rewards are calculated per second per unit of stake
- Rates are set per subnet by governance
- Fees are deducted before distribution

### Slashing Structure

- Slashing percentage is configurable per subnet
- Minimum: 1% of leased stake
- Maximum: 100% of leased stake
- Threshold-based (e.g., 3 violations trigger slash)

## Security Considerations

### Attack Vectors

1. **Validator Collusion**
   - Mitigation: Distributed validator sets, slashing

2. **Subnet Malicious Behavior**
   - Mitigation: Governance oversight, reputation system

3. **Oracle Manipulation**
   - Mitigation: Multiple oracles, reputation system

4. **Smart Contract Bugs**
   - Mitigation: Audits, formal verification, bug bounties

### Best Practices

- Start with conservative parameters
- Gradual rollout with monitoring
- Regular security audits
- Emergency pause functionality

## Future Enhancements

1. **Reputation System**
   - Track validator performance
   - Weight rewards based on reputation

2. **Dynamic Pricing**
   - Market-based reward rates
   - Supply/demand matching

3. **Cross-Chain Bridges**
   - Native support for more chains
   - IBC integration for Cosmos

4. **Insurance Pool**
   - Optional insurance for validators
   - Protection against slashing

5. **Delegation**
   - Allow token holders to delegate to validators
   - Increase validator capacity