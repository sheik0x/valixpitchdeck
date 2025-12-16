# Technical Specification

## Protocol Overview

The Unified Security Layer is a smart contract protocol that enables main chain validators to lease their security stake to heterogeneous subnets through a trust-minimized mechanism.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│           Main Chain (Avalanche C-Chain)                │
│  ┌──────────────────────────────────────────────────┐  │
│  │     Security Leasing Protocol                    │  │
│  │  - SecurityLeasingRegistry                       │  │
│  │  - AtomicCrossChainSlashing (ACCS)              │  │
│  │  - HeterogeneousVerificationModule (HVM)        │  │
│  │  - DynamicFeeMarket                             │  │
│  │  - SlashingEngine                                │  │
│  │  - RewardDistributor                             │  │
│  │  - LeaseManager                                  │  │
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

## Smart Contracts

### SecurityLeasingRegistry

**Purpose**: Central registry managing validators, subnets, and leases.

**Key Functions**:
- `registerValidator()` - Register a validator
- `registerSubnet()` - Register a subnet
- `createLease()` - Create a security lease
- `activateLease()` - Activate a lease
- `expireLease()` - Mark lease as expired
- `slashLease()` - Execute slashing

**State Variables**:
- `validators` - Mapping of validator addresses to Validator structs
- `subnets` - Mapping of subnet IDs to Subnet structs
- `leases` - Mapping of lease IDs to Lease structs

### AtomicCrossChainSlashing (ACCS)

**Purpose**: Trustless cross-chain slashing mechanism.

**Key Functions**:
- `lockStake()` - Lock validator stake
- `submitProofOfMalice()` - Submit proof of malicious behavior
- `verifyProof()` - Verify proof cryptographically
- `unlockStake()` - Unlock stake after lease expires

**Security Properties**:
- Stake held in escrow on main chain
- Cryptographic proof verification
- Automatic slashing execution
- No trusted intermediaries

### HeterogeneousVerificationModule (HVM)

**Purpose**: Standardized interface for multi-VM state proof verification.

**Key Functions**:
- `registerVerifier()` - Register VM-specific verifier
- `updateLightClientHeader()` - Update light client state
- `submitStateProof()` - Submit state proof
- `verifyStateProof()` - Verify state proof

**Supported VM Types**:
- EVM (0)
- Move VM (1)
- Cosmos SDK (2)
- Substrate (3)
- Custom (4)

### DynamicFeeMarket

**Purpose**: Market-driven matching of security bids and offers.

**Key Functions**:
- `createSecurityBid()` - Create bid from subnet
- `createValidatorOffer()` - Create offer from validator
- `getBid()` - Get bid details
- `getOffer()` - Get offer details

**Matching Algorithm**:
1. Check price compatibility (bid price >= offer min price)
2. Check duration compatibility (bid duration <= offer max duration)
3. Check QoS compatibility (offer QoS >= bid QoS)
4. Match if all conditions met

### SlashingEngine

**Purpose**: Handles violation reporting and slashing logic.

**Key Functions**:
- `createSlashingCondition()` - Define slashing conditions
- `reportViolation()` - Report validator violation
- `manualSlash()` - Manual slashing (governance only)

**Slashing Types**:
- DoubleSign (0)
- Downtime (1)
- InvalidBlock (2)
- GovernanceViolation (3)

### RewardDistributor

**Purpose**: Manages reward accumulation and distribution.

**Key Functions**:
- `setRewardRate()` - Set reward rate for subnet
- `accumulateRewards()` - Accumulate rewards for lease
- `claimRewards()` - Claim accumulated rewards

**Fee Structure**:
- Protocol fee: 5% (configurable)
- Subnet fee: 5% (configurable)
- Validator receives: 90%

### LeaseManager

**Purpose**: Coordinates between main chain and subnets.

**Key Functions**:
- `setSubnetAdapter()` - Set adapter for subnet
- `activateLeaseOnSubnet()` - Activate lease on subnet
- `handleLeaseExpiration()` - Handle lease expiration

## Data Structures

### Validator
```solidity
struct Validator {
    address validatorAddress;
    uint256 totalStake;
    uint256 availableStake;
    uint256 leasedStake;
    bool isActive;
    uint256 registrationTime;
    uint256 minLeaseDuration;
    uint256 maxLeaseDuration;
    string[] supportedSubnetTypes;
}
```

### Subnet
```solidity
struct Subnet {
    bytes32 subnetId;
    string subnetType;
    address subnetAddress;
    uint256 requiredStake;
    uint256 currentLeasedStake;
    bool isActive;
    address subnetOwner;
}
```

### Lease
```solidity
struct Lease {
    bytes32 leaseId;
    address validator;
    bytes32 subnetId;
    uint256 leasedStake;
    uint256 startTime;
    uint256 endTime;
    uint256 slashingAmount;
    bool isActive;
    LeaseStatus status;
}
```

### QoSRequirement
```solidity
struct QoSRequirement {
    uint256 minUptime;           // Basis points
    uint256 maxLatency;          // Milliseconds
    uint256 minValidatorCount;
    uint256 securityLevel;       // 1-10
    uint256 geographicDiversity; // Basis points
}
```

## Protocol Flow

### Lease Creation Flow

1. Validator registers on main chain
2. Subnet registers on main chain
3. Subnet creates bid in fee market
4. Validator creates offer in fee market
5. Market matches bid and offer
6. Lease created in registry
7. Validator locks stake in ACCS
8. Lease activated
9. Validator registered on subnet via adapter

### Slashing Flow

1. Malicious behavior detected on subnet
2. Proof-of-malice submitted to ACCS
3. ACCS verifies proof cryptographically
4. If valid, stake is slashed automatically
5. Validator removed from subnet
6. Lease marked as slashed

### Reward Flow

1. Validator performs duties on subnet
2. Rewards accumulate based on rate
3. Validator claims rewards
4. Fees distributed (protocol + subnet)
5. Validator receives remainder

## Gas Optimization

### Strategies

1. **Packed Storage**: Use smaller types where possible
2. **Batch Operations**: Group multiple operations
3. **Event Optimization**: Minimize event data
4. **Loop Optimization**: Avoid unnecessary loops
5. **Storage Caching**: Cache storage reads

### Estimated Gas Costs

- Register Validator: ~150,000 gas
- Create Lease: ~200,000 gas
- Lock Stake: ~100,000 gas
- Submit Proof: ~150,000 gas
- Verify Proof: ~200,000 gas
- Claim Rewards: ~100,000 gas

## Upgradeability

### Current Design

- **No Upgradeability**: Contracts are immutable for security
- **Governance**: Can update parameters via governance
- **New Features**: Deploy new contracts, migrate state

### Future Considerations

- Consider proxy pattern for critical contracts
- Implement time-locked upgrades
- Multi-sig governance for upgrades

## Limits and Constraints

### Validator Limits
- Minimum stake: 1,000 AVAX (configurable)
- Maximum leases per validator: No limit (gas constrained)

### Subnet Limits
- Minimum required stake: 1 AVAX (configurable)
- Maximum lease duration: 1 year (configurable)

### Protocol Limits
- Maximum validators: No limit (gas constrained)
- Maximum subnets: No limit (gas constrained)
- Maximum leases: No limit (gas constrained)

## Error Handling

### Revert Reasons

- "Only governance" - Unauthorized access
- "Validator not active" - Validator not registered/active
- "Insufficient available stake" - Not enough stake
- "Lease not found" - Invalid lease ID
- "Proof not verified" - Proof verification failed

### Error Recovery

- Failed transactions revert state
- No partial state changes
- Events emitted for all state changes
- Emergency pause available (governance)

## Events

All state changes emit events for off-chain tracking:

- `ValidatorRegistered`
- `SubnetRegistered`
- `LeaseCreated`
- `LeaseActivated`
- `LeaseExpired`
- `LeaseSlashed`
- `ProofOfMaliceSubmitted`
- `AtomicSlashExecuted`
- `SecurityBidCreated`
- `ValidatorOfferCreated`
- `MatchCreated`

## Access Control

### Roles

1. **Governance**: Protocol owner, can update parameters
2. **Validator**: Can register, create leases, claim rewards
3. **Subnet Owner**: Can register subnet, create bids
4. **Oracle**: Can submit proofs (HVM/ACCS)
5. **Public**: Can view state, create offers

### Permissions

- Governance: All functions
- Validator: Registration, leasing, rewards
- Subnet Owner: Subnet registration, bidding
- Oracle: Proof submission
- Public: Read-only, offer creation

---

**Version**: 1.0
**Last Updated**: 2024-12-15



