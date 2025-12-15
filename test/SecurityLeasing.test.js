const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Security Leasing Protocol", function () {
  let registry, slashingEngine, rewardDistributor, leaseManager;
  let owner, validator1, validator2, subnetOwner;
  let subnetId;

  beforeEach(async function () {
    [owner, validator1, validator2, subnetOwner] = await ethers.getSigners();

    // Deploy contracts
    const SecurityLeasingRegistry = await ethers.getContractFactory("SecurityLeasingRegistry");
    registry = await SecurityLeasingRegistry.deploy(
      owner.address,
      ethers.parseEther("1000"), // minValidatorStake
      86400, // minLeaseDuration (1 day)
      31536000 // maxLeaseDuration (1 year)
    );

    const SlashingEngine = await ethers.getContractFactory("SlashingEngine");
    slashingEngine = await SlashingEngine.deploy(await registry.getAddress(), owner.address);

    const RewardDistributor = await ethers.getContractFactory("RewardDistributor");
    rewardDistributor = await RewardDistributor.deploy(
      await registry.getAddress(),
      owner.address,
      ethers.ZeroAddress // native token
    );

    const LeaseManager = await ethers.getContractFactory("LeaseManager");
    leaseManager = await LeaseManager.deploy(await registry.getAddress(), owner.address);

    subnetId = ethers.id("test-subnet-1");
  });

  describe("Validator Registration", function () {
    it("Should register a validator", async function () {
      await registry.connect(validator1).registerValidator(
        ethers.parseEther("10000"), // totalStake
        ethers.parseEther("5000"),  // availableStake
        ["avalanche", "cosmos"],    // supportedSubnetTypes
        86400,                       // minLeaseDuration
        31536000                     // maxLeaseDuration
      );

      const validator = await registry.getValidator(validator1.address);
      expect(validator.isActive).to.be.true;
      expect(validator.totalStake).to.equal(ethers.parseEther("10000"));
      expect(validator.availableStake).to.equal(ethers.parseEther("5000"));
    });

    it("Should reject validator with insufficient stake", async function () {
      await expect(
        registry.connect(validator1).registerValidator(
          ethers.parseEther("500"), // below minimum
          ethers.parseEther("500"),
          ["avalanche"],
          86400,
          31536000
        )
      ).to.be.revertedWith("Stake too low");
    });
  });

  describe("Subnet Registration", function () {
    it("Should register a subnet", async function () {
      await registry.connect(subnetOwner).registerSubnet(
        subnetId,
        "avalanche",
        ethers.Wallet.createRandom().address,
        ethers.parseEther("1000") // requiredStake
      );

      const subnet = await registry.getSubnet(subnetId);
      expect(subnet.isActive).to.be.true;
      expect(subnet.subnetType).to.equal("avalanche");
    });
  });

  describe("Lease Creation", function () {
    beforeEach(async function () {
      // Register validator
      await registry.connect(validator1).registerValidator(
        ethers.parseEther("10000"),
        ethers.parseEther("5000"),
        ["avalanche"],
        86400,
        31536000
      );

      // Register subnet
      await registry.connect(subnetOwner).registerSubnet(
        subnetId,
        "avalanche",
        ethers.Wallet.createRandom().address,
        ethers.parseEther("1000")
      );
    });

    it("Should create a lease", async function () {
      const tx = await registry.connect(validator1).createLease(
        validator1.address,
        subnetId,
        ethers.parseEther("2000"), // leasedStake
        86400 * 30 // 30 days
      );

      const receipt = await tx.wait();
      const leaseCreatedEvent = receipt.logs.find(
        log => log.topics[0] === ethers.id("LeaseCreated(address,bytes32,bytes32,uint256,uint256)")
      );

      expect(leaseCreatedEvent).to.not.be.undefined;

      const leases = await registry.getValidatorLeases(validator1.address);
      expect(leases.length).to.equal(1);
    });

    it("Should reject lease with insufficient available stake", async function () {
      await expect(
        registry.connect(validator1).createLease(
          validator1.address,
          subnetId,
          ethers.parseEther("6000"), // exceeds available
          86400 * 30
        )
      ).to.be.revertedWith("Insufficient available stake");
    });
  });

  describe("Slashing", function () {
    let leaseId;

    beforeEach(async function () {
      // Setup validator and subnet
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
        ethers.parseEther("1000")
      );

      // Create and activate lease
      const tx = await registry.connect(validator1).createLease(
        validator1.address,
        subnetId,
        ethers.parseEther("2000"),
        86400 * 30
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        log => log.topics[0] === ethers.id("LeaseCreated(address,bytes32,bytes32,uint256,uint256)")
      );
      leaseId = event.topics[1];

      await registry.connect(validator1).activateLease(leaseId);
    });

    it("Should report violation", async function () {
      await slashingEngine.connect(owner).reportViolation(
        leaseId,
        0, // DoubleSign
        50, // severity
        "ipfs://evidence"
      );

      const violationCount = await slashingEngine.getViolationCount(leaseId);
      expect(violationCount).to.equal(1);
    });
  });
});