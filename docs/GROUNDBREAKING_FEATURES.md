# Groundbreaking Features

This document describes the three groundbreaking features that make the Unified Security Layer unique and revolutionary.

## 1. Atomic Cross-Chain Slashing (ACCS)

### Overview

**Atomic Cross-Chain Slashing (ACCS)** is a smart contract on the Main Chain that holds a portion of the validator's stake. If the validator acts maliciously on the Subnet (e.g., double-signing), the Subnet provides a cryptographically verifiable proof-of-malice back to the Main Chain's ACCS contract, which immediately and trustlessly executes the slash.

### Key Innovation: Trustless Economic Guarantee

The subnet's security is backed by the main chain's huge economic value, **without needing a trusted intermediary or bridge**.

### How It Works

1. **Stake Escrow**: When a lease is created, the validator locks a portion of their stake in the ACCS contract on the main chain.

2. **Proof Submission**: If malicious behavior is detected on the subnet, a cryptographically verifiable proof-of-malice is submitted to the ACCS contract.

3. **Verification**: The ACCS contract verifies the proof using cryptographic signatures and state proofs.

4. **Atomic Slashing**: Upon verification, the stake is immediately slashed on the main chain, without requiring any trusted intermediary.

### Supported Malice Types

- **Double Sign**: Validator signed two conflicting blocks
- **Invalid State Transition**: Validator produced invalid state transition
- **Censorship**: Validator censored transactions
- **Invalid Block Production**: Validator produced invalid block

### Technical Implementation

```solidity
// Lock stake when lease is created
accs.lockStake(leaseId, stakeAmount, lockDuration);

// Submit proof of malice from subnet
accs.submitProofOfMalice(
    leaseId,
    MaliceType.DoubleSign,
    blockHash,
    previousBlockHash,
    signature,
    stateProof,
    merkleRoot
);

// Automatic verification and slashing
// No trusted intermediary required!
```

### Benefits

- ✅ **Trustless**: No trusted bridge or intermediary needed
- ✅ **Immediate**: Slashing happens atomically on main chain
- ✅ **Cryptographically Secure**: Uses cryptographic proofs, not trust
- ✅ **Economic Guarantee**: Subnet security backed by main chain value

---

## 2. Heterogeneous Verification Module (HVM)

### Overview

**Heterogeneous Verification Module (HVM)** is a standardized interface that allows the Subnet to transmit a simplified, light-client-verified state proof to the Main Chain. This means the system can support different Subnet VMs (e.g., an EVM, a Move VM, or a custom one).

### Key Innovation: Generalized Interoperability

It moves beyond only supporting homogeneous subnets (like a single Cosmos SDK version) to **truly heterogeneous chains**.

### How It Works

1. **Standardized Interface**: All VMs implement the same interface for state proof submission.

2. **VM-Specific Verifiers**: Each VM type has its own verifier contract that understands that VM's proof format.

3. **Light Client Integration**: Uses light client headers to verify state proofs without full node sync.

4. **Universal Verification**: The HVM can verify proofs from any VM type through the standardized interface.

### Supported VM Types

- **EVM**: Ethereum Virtual Machine (Ethereum, Avalanche C-Chain, etc.)
- **Move VM**: Move language VMs (Aptos, Sui, etc.)
- **Cosmos SDK**: Cosmos SDK-based chains
- **Substrate**: Substrate-based chains (Polkadot, Kusama, etc.)
- **Custom**: Any custom VM with a verifier implementation

### Technical Implementation

```solidity
// Register verifier for a subnet and VM type
hvm.registerVerifier(subnetId, VMType.EVM, evmVerifierAddress);

// Submit state proof from subnet
hvm.submitStateProof(
    subnetId,
    VMType.EVM,
    stateRoot,
    previousStateRoot,
    blockHash,
    blockNumber,
    proofData,
    merkleRoot
);

// Automatic verification using appropriate verifier
bool isValid = hvm.verifyStateProof(proofId);
```

### Benefits

- ✅ **Universal**: Supports any VM type with a verifier
- ✅ **Standardized**: Same interface for all VMs
- ✅ **Lightweight**: Uses light client proofs, not full sync
- ✅ **Extensible**: Easy to add new VM types

---

## 3. Dynamic Fee Market

### Overview

**Dynamic Fee Market** is a market where Subnets can bid for a specific Quality of Service (QoS) of leased security. The fee is paid from the Subnet's native token and is distributed to the Main Chain Validators leasing their stake.

### Key Innovation: Sustainable Economic Model

It creates a **continuous, direct revenue stream** for Main Chain validators, aligning their financial incentive with securing the subnet ecosystem.

### How It Works

1. **Subnet Bids**: Subnets create bids specifying:
   - Required stake amount
   - Lease duration
   - QoS requirements (uptime, latency, validator count, etc.)
   - Price per unit of stake per second
   - Payment token (subnet native token)

2. **Validator Offers**: Validators create offers specifying:
   - Available stake
   - Minimum price
   - Maximum duration
   - Supported QoS level

3. **Automatic Matching**: The market automatically matches bids and offers based on:
   - Price compatibility
   - Duration compatibility
   - QoS compatibility

4. **Lease Creation**: When matched, leases are automatically created and validators start earning fees.

### QoS Requirements

- **Minimum Uptime**: Required uptime percentage
- **Maximum Latency**: Maximum acceptable latency
- **Minimum Validator Count**: Minimum number of validators
- **Security Level**: Security level (1-10 scale)
- **Geographic Diversity**: Required geographic distribution

### Technical Implementation

```solidity
// Subnet creates bid
feeMarket.createSecurityBid(
    subnetId,
    requiredStake,
    duration,
    qosRequirements,
    paymentToken,
    bidPrice
);

// Validator creates offer
feeMarket.createValidatorOffer(
    availableStake,
    minPrice,
    maxDuration,
    supportedQoS
);

// Automatic matching and lease creation
// Validators earn fees in subnet native token
```

### Benefits

- ✅ **Sustainable**: Continuous revenue stream for validators
- ✅ **Market-Driven**: Prices determined by supply and demand
- ✅ **QoS-Based**: Subnets get the security level they need
- ✅ **Multi-Token**: Supports subnet native tokens
- ✅ **Aligned Incentives**: Validators incentivized to secure subnets

---

## Integration

All three features work together:

1. **HVM** verifies state proofs from heterogeneous subnets
2. **ACCS** uses HVM-verified proofs to execute trustless slashing
3. **Fee Market** creates economic incentives for validators to participate
4. **ACCS** ensures validators are economically accountable

This creates a complete, trustless, economically sustainable security leasing system for heterogeneous subnets.

## Comparison to Alternatives

### Traditional Approaches

- **Separate Validator Sets**: Each subnet needs its own validators (fragmentation)
- **Trusted Bridges**: Require trusted intermediaries (centralization risk)
- **Homogeneous Only**: Only support one VM type (limited)

### Our Solution

- **Shared Security**: Main chain validators secure all subnets (unified)
- **Trustless**: No trusted intermediaries (decentralized)
- **Heterogeneous**: Supports any VM type (generalized)

This is why it's groundbreaking! 🚀