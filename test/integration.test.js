const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Integration Tests - Full Protocol Flow", function () {
  let registry, accs, hvm, feeMarket, leaseManager, slashingEngine, rewardDistributor;
  let owner, validator1, validator2, subnetOwner, oracle;
  let subnetId;

  beforeEach(async function () {
    [owner, validator1, validator2, subnetOwner, oracle] = await ethers.getSigners();

    // Deploy in order
    const SecurityLeasingRegistry = await ethers.getContractFactory("SecurityLeasingRegistry");
    registry = await SecurityLeasingRegistry.deploy(
      owner.address,
      ethers.parseEther("1000"),
      86400,
      31536000
    );

    const HVM = await ethers.getContractFactory("HeterogeneousVerificationModule");
    hvm = await HVM.deploy(owner.address);

    const ACCS = await ethers.getContractFactory("AtomicCrossChainSlashing");
    accs = await ACCS.deploy(
      await registry.getAddress(),
      await hvm.getAddress(),
      owner.address
    );

    const SlashingEngine = await ethers.getContractFactory("SlashingEngine");
    slashingEngine = await SlashingEngine.deploy(
      await registry.getAddress(),
      owner.address,
      await accs.getAddress()
    );

    const RewardDistributor = await ethers.getContractFactory("RewardDistributor");
    rewardDistributor = await RewardDistributor.deploy(
      await registry.getAddress(),
      owner.address,
      ethers.ZeroAddress
    );

    const FeeMarket = await ethers.getContractFactory("DynamicFeeMarket");
    feeMarket = await FeeMarket.deploy(
      await registry.getAddress(),
      owner.address
    );

    const LeaseManager = await ethers.getContractFactory("LeaseManager");
    leaseManager = await LeaseManager.deploy(
      await registry.getAddress(),
      owner.address
    );

    // Configure contracts
    await registry.setFeeMarket(await feeMarket.getAddress());
    await registry.setACCS(await accs.getAddress());

    subnetId = ethers.id("test-subnet-1");
  });

  it("Should complete full lease lifecycle", async function () {
    // 1. Register validator
    await registry.connect(validator1).registerValidator(
      ethers.parseEther("10000"),
      ethers.parseEther("5000"),
      ["avalanche"],
      86400,
      31536000
    );

    // 2. Register subnet
    await registry.connect(subnetOwner).registerSubnet(
      subnetId,
      "avalanche",
      ethers.Wallet.createRandom().address,
      ethers.parseEther("2000")
    );

    // 3. Create bid in fee market
    const qos = {
      minUptime: 9950,
      maxLatency: 100,
      minValidatorCount: 1,
      securityLevel: 8,
      geographicDiversity: 5000,
    };

    await feeMarket.connect(subnetOwner).createSecurityBid(
      subnetId,
      ethers.parseEther("2000"),
      86400 * 30,
      qos,
      ethers.ZeroAddress,
      ethers.parseEther("0.05")
    );

    // 4. Create offer
    const supportedQoS = {
      minUptime: 9980,
      maxLatency: 80,
      minValidatorCount: 1,
      securityLevel: 9,
      geographicDiversity: 6000,
    };

    await feeMarket.connect(validator1).createValidatorOffer(
      ethers.parseEther("2000"),
      ethers.parseEther("0.04"),
      86400 * 90,
      supportedQoS
    );

    // 5. Create lease (simulated from matching)
    const leaseTx = await registry.connect(validator1).createLease(
      validator1.address,
      subnetId,
      ethers.parseEther("2000"),
      86400 * 30
    );
    const leaseReceipt = await leaseTx.wait();
    const leaseEvent = leaseReceipt.logs.find(
      log => log.topics[0] === ethers.id("LeaseCreated(address,bytes32,bytes32,uint256,uint256)")
    );
    const leaseId = leaseEvent.topics[1];

    // 6. Lock stake in ACCS
    await accs.connect(validator1).lockStake(leaseId, ethers.parseEther("2000"), 86400 * 30, {
      value: ethers.parseEther("2000")
    });

    // 7. Activate lease
    await registry.connect(validator1).activateLease(leaseId);

    // 8. Verify lease is active
    const lease = await registry.getLease(leaseId);
    expect(lease.status).to.equal(1); // Active

    // 9. Set reward rate
    await rewardDistributor.connect(owner).setRewardRate(
      subnetId,
      ethers.parseEther("0.001")
    );

    // 10. Accumulate rewards
    await rewardDistributor.accumulateRewards(leaseId);

    // 11. Verify rewards accumulated
    const reward = await rewardDistributor.getPendingReward(leaseId);
    expect(reward).to.be.gt(0);
  });

  it("Should handle slashing flow", async function () {
    // Setup: Register validator, subnet, create lease, lock stake
    await registry.connect(validator1).registerValidator(
      ethers.parseEther("10000"),
      ethers.parseEther("5000"),
      ["avalanche"],
      86400,
      31536000
    );

    await registry.connect(subnetOwner).registerSubnet(
      subnetId,
      "avalanche",
      ethers.Wallet.createRandom().address,
      ethers.parseEther("2000")
    );

    const leaseTx = await registry.connect(validator1).createLease(
      validator1.address,
      subnetId,
      ethers.parseEther("2000"),
      86400 * 30
    );
    const leaseReceipt = await leaseTx.wait();
    const leaseEvent = leaseReceipt.logs.find(
      log => log.topics[0] === ethers.id("LeaseCreated(address,bytes32,bytes32,uint256,uint256)")
    );
    const leaseId = leaseEvent.topics[1];

    await accs.connect(validator1).lockStake(leaseId, ethers.parseEther("2000"), 86400 * 30, {
      value: ethers.parseEther("2000")
    });

    await registry.connect(validator1).activateLease(leaseId);

    // Submit proof of malice
    const blockHash = ethers.id("block1");
    const previousBlockHash = ethers.id("block0");
    
    const proofTx = await accs.connect(owner).submitProofOfMalice(
      leaseId,
      0, // DoubleSign
      blockHash,
      previousBlockHash,
      "0x1234",
      "0x5678",
      ethers.id("merkle")
    );
    const proofReceipt = await proofTx.wait();
    const proofEvent = proofReceipt.logs.find(
      log => log.topics[0] === ethers.id("ProofOfMaliceSubmitted(address,bytes32,bytes32,uint8)")
    );
    const proofId = proofEvent.topics[1];

    // Verify and slash
    await accs.connect(owner).verifyProof(proofId);

    // Verify lease is slashed
    const lease = await registry.getLease(leaseId);
    expect(lease.status).to.equal(3); // Slashed
  });
});