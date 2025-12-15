# Security Audit Preparation

## Overview

This document provides all necessary information for security auditors to review the Unified Security Layer protocol.

## Protocol Summary

The Unified Security Layer enables main chain validators to lease their security stake to heterogeneous subnets through a trust-minimized mechanism featuring:

1. **Atomic Cross-Chain Slashing (ACCS)** - Trustless slashing via cryptographic proofs
2. **Heterogeneous Verification Module (HVM)** - Multi-VM state proof verification
3. **Dynamic Fee Market** - Market-driven security leasing

## Architecture

See `ARCHITECTURE.md` for detailed architecture documentation.

## Smart Contracts

### Core Contracts

1. **SecurityLeasingRegistry.sol** - Central registry
2. **AtomicCrossChainSlashing.sol** - Cross-chain slashing
3. **HeterogeneousVerificationModule.sol** - Multi-VM verification
4. **DynamicFeeMarket.sol** - Fee market
5. **SlashingEngine.sol** - Slashing logic
6. **RewardDistributor.sol** - Reward distribution
7. **LeaseManager.sol** - Lease coordination

### Adapter Contracts

8. **ISubnetAdapter.sol** - Standard interface
9. **AvalancheSubnetAdapter.sol** - Avalanche integration
10. **CosmosSubnetAdapter.sol** - Cosmos integration
11. **GenericSubnetAdapter.sol** - Generic integration

### Governance

12. **Governance.sol** - Protocol governance

## Security Assumptions

1. Main chain (Avalanche C-Chain) is secure
2. Cryptographic primitives are secure
3. Oracles are honest (or economically secured)
4. Smart contracts are correctly implemented

## Threat Model

See `SECURITY.md` for detailed threat analysis.

## Key Security Features

### Trust Minimization

- No trusted bridges
- Cryptographic proof verification
- Economic security guarantees
- Automatic enforcement

### Access Control

- Role-based permissions
- Governance controls
- Emergency pause capability

### Economic Security

- Stake escrow mechanism
- Slashing penalties
- Reward incentives
- Fee structures

## Testing

### Test Coverage

- Unit tests for all contracts
- Integration tests for flows
- Edge case testing
- Error condition testing

### Running Tests

```bash
npm test
npm run test:coverage
```

## Known Limitations

1. Oracle trust for proof submission
2. VM verifier implementation required
3. Gas costs for some operations
4. Scalability considerations

## Areas of Focus for Audit

### Critical Areas

1. **ACCS Proof Verification**
   - Cryptographic verification logic
   - Proof replay prevention
   - Slashing execution

2. **Stake Management**
   - Escrow mechanism
   - Unlocking logic
   - Slashing calculations

3. **Access Control**
   - Permission checks
   - Governance functions
   - Emergency controls

4. **Economic Logic**
   - Fee calculations
   - Reward distribution
   - Matching algorithm

### Medium Priority

1. **State Management**
   - Lease lifecycle
   - Validator state
   - Subnet state

2. **Integration Points**
   - Subnet adapters
   - HVM verifiers
   - External contracts

## Code Quality

### Standards

- Solidity 0.8.20
- OpenZeppelin patterns
- Checks-Effects-Interactions
- ReentrancyGuard where needed

### Documentation

- NatSpec comments
- Inline documentation
- Architecture diagrams
- Technical specifications

## Deployment Information

### Testnet

- Network: Avalanche Fuji
- Chain ID: 43113
- RPC: https://api.avax-test.network/ext/bc/C/rpc

### Mainnet (Future)

- Network: Avalanche Mainnet
- Chain ID: 43114
- RPC: https://api.avax.network/ext/bc/C/rpc

## Contact

For audit questions:
- Technical: See code comments
- Security: security@unifiedsecuritylayer.io (to be set up)
- General: See README.md

## References

- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Avalanche Documentation](https://docs.avax.network/)
- [Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)