# Comprehensive Test Plan

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: All major flows
- **E2E Tests**: Critical user journeys
- **Load Tests**: Performance under load

## Unit Tests

### SecurityLeasingRegistry
- [x] Validator registration
- [x] Subnet registration
- [x] Lease creation
- [x] Lease activation
- [x] Lease expiration
- [ ] Edge cases (boundary conditions)
- [ ] Error conditions

### AtomicCrossChainSlashing
- [x] Stake locking
- [x] Proof submission
- [x] Proof verification
- [x] Stake unlocking
- [ ] Multiple proof types
- [ ] Edge cases

### DynamicFeeMarket
- [x] Bid creation
- [x] Offer creation
- [x] Matching logic
- [ ] Complex matching scenarios
- [ ] QoS validation

### HeterogeneousVerificationModule
- [x] Verifier registration
- [x] Header updates
- [x] Proof submission
- [ ] Different VM types
- [ ] Invalid proof handling

## Integration Tests

### Full Protocol Flow
- [x] Complete lease lifecycle
- [x] Slashing flow
- [ ] Reward distribution flow
- [ ] Multiple validators
- [ ] Multiple subnets
- [ ] Concurrent operations

### Cross-Contract Interactions
- [ ] Registry ↔ ACCS
- [ ] Registry ↔ Fee Market
- [ ] ACCS ↔ HVM
- [ ] Fee Market → Registry (lease creation)

## Frontend Tests

### Component Tests
- [ ] Dashboard components
- [ ] Fee Market components
- [ ] Form validation
- [ ] Error handling

### E2E Tests
- [ ] Wallet connection
- [ ] Validator registration flow
- [ ] Bid creation flow
- [ ] Offer creation flow
- [ ] Lease viewing
- [ ] Navigation

## Load Tests

### Performance Tests
- [ ] 100+ validators
- [ ] 50+ subnets
- [ ] 1000+ leases
- [ ] High transaction volume
- [ ] Gas optimization

## Security Tests

### Attack Scenarios
- [ ] Reentrancy attacks
- [ ] Front-running
- [ ] Integer overflow/underflow
- [ ] Access control bypass
- [ ] Oracle manipulation
- [ ] Proof forgery attempts

## Test Execution

```bash
# Run all tests
npm test

# Run specific test file
npm test test/ACCS.test.js

# Run with coverage
npm test -- --coverage

# Run gas reports
REPORT_GAS=true npm test
```

## Test Data

### Test Accounts
- Owner: Governance address
- Validator1: Test validator
- Validator2: Test validator
- SubnetOwner: Test subnet owner
- Oracle: Proof submitter

### Test Values
- Min Stake: 1,000 AVAX
- Test Stake: 10,000 AVAX
- Lease Duration: 30 days
- Test Subnet ID: keccak256("test-subnet-1")

## Continuous Integration

### CI Pipeline
1. Lint code
2. Type check
3. Run unit tests
4. Run integration tests
5. Generate coverage report
6. Check coverage threshold

### Pre-commit Hooks
- Format code
- Run linter
- Run tests
- Check types



