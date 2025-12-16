const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Heterogeneous Verification Module (HVM)", function () {
  let hvm;
  let owner, verifier;
  let subnetId;

  beforeEach(async function () {
    [owner, verifier] = await ethers.getSigners();

    const HVM = await ethers.getContractFactory("HeterogeneousVerificationModule");
    hvm = await HVM.deploy(owner.address);

    subnetId = ethers.id("test-subnet-1");
  });

  describe("Verifier Registration", function () {
    it("Should register a verifier for a subnet and VM type", async function () {
      await expect(
        hvm.connect(owner).registerVerifier(
          subnetId,
          0, // EVM
          verifier.address
        )
      ).to.emit(hvm, "VerifierRegistered");

      const registeredVerifier = await hvm.getVerifier(subnetId, 0);
      expect(registeredVerifier).to.equal(verifier.address);
    });

    it("Should reject registration from non-governance", async function () {
      await expect(
        hvm.connect(verifier).registerVerifier(
          subnetId,
          0,
          verifier.address
        )
      ).to.be.revertedWith("Only governance");
    });
  });

  describe("Light Client Headers", function () {
    it("Should update light client header", async function () {
      const header = {
        blockHash: ethers.id("block1"),
        stateRoot: ethers.id("state1"),
        previousBlockHash: ethers.ZeroHash,
        blockNumber: 1,
        timestamp: Math.floor(Date.now() / 1000),
        validatorSetHash: "0x1234",
      };

      await expect(
        hvm.connect(owner).updateLightClientHeader(subnetId, header)
      ).to.emit(hvm, "LightClientHeaderUpdated");

      const stored = await hvm.getLightClientHeader(subnetId);
      expect(stored.blockHash).to.equal(header.blockHash);
    });

    it("Should reject older header", async function () {
      const header1 = {
        blockHash: ethers.id("block1"),
        stateRoot: ethers.id("state1"),
        previousBlockHash: ethers.ZeroHash,
        blockNumber: 1,
        timestamp: Math.floor(Date.now() / 1000),
        validatorSetHash: "0x1234",
      };

      await hvm.connect(owner).updateLightClientHeader(subnetId, header1);

      const header2 = {
        blockHash: ethers.id("block2"),
        stateRoot: ethers.id("state2"),
        previousBlockHash: ethers.id("block1"),
        blockNumber: 2,
        timestamp: Math.floor(Date.now() / 1000),
        validatorSetHash: "0x1234",
      };

      await hvm.connect(owner).updateLightClientHeader(subnetId, header2);

      // Try to add older header
      await expect(
        hvm.connect(owner).updateLightClientHeader(subnetId, header1)
      ).to.be.revertedWith("Header not newer");
    });
  });

  describe("State Proof Submission", function () {
    beforeEach(async function () {
      // Register verifier
      await hvm.connect(owner).registerVerifier(
        subnetId,
        0, // EVM
        verifier.address
      );

      // Update header
      const header = {
        blockHash: ethers.id("block1"),
        stateRoot: ethers.id("state1"),
        previousBlockHash: ethers.ZeroHash,
        blockNumber: 1,
        timestamp: Math.floor(Date.now() / 1000),
        validatorSetHash: "0x1234",
      };
      await hvm.connect(owner).updateLightClientHeader(subnetId, header);
    });

    it("Should submit state proof", async function () {
      await expect(
        hvm.submitStateProof(
          subnetId,
          0, // EVM
          ethers.id("state1"),
          ethers.ZeroHash,
          ethers.id("block1"),
          1,
          "0x5678",
          ethers.id("merkle")
        )
      ).to.emit(hvm, "StateProofSubmitted");
    });
  });
});



