const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Atomic Cross-Chain Slashing (ACCS)", function () {
  let accs, registry, hvm;
  let owner, validator1, validator2, subnetOwner, oracle;
  let leaseId, subnetId;

  beforeEach(async function () {
    [owner, validator1, validator2, subnetOwner, oracle] = await ethers.getSigners();

    // Deploy HVM
    const HVM = await ethers.getContractFactory("HeterogeneousVerificationModule");
    hvm = await HVM.deploy(owner.address);

    // Deploy Registry
    const SecurityLeasingRegistry = await ethers.getContractFactory("SecurityLeasingRegistry");
    registry = await SecurityLeasingRegistry.deploy(
      owner.address,
      ethers.parseEther("1000"),
      86400,
      31536000
    );

    // Deploy ACCS
    const ACCS = await ethers.getContractFactory("AtomicCrossChainSlashing");
    accs = await ACCS.deploy(
      await registry.getAddress(),
      await hvm.getAddress(),
      owner.address
    );

    subnetId = ethers.id("test-subnet-1");
  });

  describe("Stake Management", function () {
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

      // Create lease
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
    });

    it("Should lock stake for a lease", async function () {
      const stakeAmount = ethers.parseEther("2000");
      
      await expect(
        accs.connect(validator1).lockStake(leaseId, stakeAmount, 86400 * 30, {
          value: stakeAmount
        })
      ).to.emit(accs, "StakeLocked");

      const staked = await accs.getStakedAmount(leaseId);
      expect(staked.amount).to.equal(stakeAmount);
      expect(staked.isLocked).to.be.true;
    });

    it("Should reject locking with insufficient funds", async function () {
      const stakeAmount = ethers.parseEther("2000");
      
      await expect(
        accs.connect(validator1).lockStake(leaseId, stakeAmount, 86400 * 30, {
          value: ethers.parseEther("1000") // Insufficient
        })
      ).to.be.revertedWith("Insufficient stake");
    });

    it("Should unlock stake after lease expires", async function () {
      const stakeAmount = ethers.parseEther("2000");
      
      // Lock stake
      await accs.connect(validator1).lockStake(leaseId, stakeAmount, 86400 * 30, {
        value: stakeAmount
      });

      // Expire lease
      await registry.connect(owner).expireLease(leaseId);

      // Unlock stake
      await expect(
        accs.connect(validator1).unlockStake(leaseId)
      ).to.emit(accs, "StakeUnlocked");
    });
  });

  describe("Proof of Malice", function () {
    let stakeAmount;

    beforeEach(async function () {
      stakeAmount = ethers.parseEther("2000");
      
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
        stakeAmount,
        86400 * 30
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        log => log.topics[0] === ethers.id("LeaseCreated(address,bytes32,bytes32,uint256,uint256)")
      );
      leaseId = event.topics[1];

      await registry.connect(validator1).activateLease(leaseId);

      // Lock stake
      await accs.connect(validator1).lockStake(leaseId, stakeAmount, 86400 * 30, {
        value: stakeAmount
      });
    });

    it("Should submit proof of malice", async function () {
      const blockHash = ethers.id("block1");
      const previousBlockHash = ethers.id("block0");
      const signature = "0x1234";
      const stateProof = "0x5678";
      const merkleRoot = ethers.id("merkle");

      await expect(
        accs.connect(owner).submitProofOfMalice(
          leaseId,
          0, // DoubleSign
          blockHash,
          previousBlockHash,
          signature,
          stateProof,
          merkleRoot
        )
      ).to.emit(accs, "ProofOfMaliceSubmitted");
    });

    it("Should verify and execute slash", async function () {
      const blockHash = ethers.id("block1");
      const previousBlockHash = ethers.id("block0");
      const signature = "0x1234";
      const stateProof = "0x5678";
      const merkleRoot = ethers.id("merkle");

      const tx = await accs.connect(owner).submitProofOfMalice(
        leaseId,
        0, // DoubleSign
        blockHash,
        previousBlockHash,
        signature,
        stateProof,
        merkleRoot
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        log => log.topics[0] === ethers.id("ProofOfMaliceSubmitted(address,bytes32,bytes32,uint8)")
      );
      const proofId = event.topics[1];

      // Verify proof (this will trigger slash)
      await expect(
        accs.connect(owner).verifyProof(proofId)
      ).to.emit(accs, "AtomicSlashExecuted");
    });
  });
});