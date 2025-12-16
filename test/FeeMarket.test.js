const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Dynamic Fee Market", function () {
  let feeMarket, registry;
  let owner, validator1, subnetOwner;
  let subnetId;

  beforeEach(async function () {
    [owner, validator1, subnetOwner] = await ethers.getSigners();

    // Deploy Registry
    const SecurityLeasingRegistry = await ethers.getContractFactory("SecurityLeasingRegistry");
    registry = await SecurityLeasingRegistry.deploy(
      owner.address,
      ethers.parseEther("1000"),
      86400,
      31536000
    );

    // Deploy Fee Market
    const FeeMarket = await ethers.getContractFactory("DynamicFeeMarket");
    feeMarket = await FeeMarket.deploy(
      await registry.getAddress(),
      owner.address
    );

    subnetId = ethers.id("test-subnet-1");

    // Register subnet
    await registry.connect(subnetOwner).registerSubnet(
      subnetId,
      "avalanche",
      ethers.Wallet.createRandom().address,
      ethers.parseEther("1000")
    );
  });

  describe("Security Bids", function () {
    it("Should create a security bid", async function () {
      const qos = {
        minUptime: 9950, // 99.5%
        maxLatency: 100,
        minValidatorCount: 10,
        securityLevel: 8,
        geographicDiversity: 5000, // 50%
      };

      await expect(
        feeMarket.connect(subnetOwner).createSecurityBid(
          subnetId,
          ethers.parseEther("10000"),
          86400 * 30, // 30 days
          qos,
          ethers.ZeroAddress, // Native token
          ethers.parseEther("0.05")
        )
      ).to.emit(feeMarket, "SecurityBidCreated");
    });

    it("Should reject bid with invalid duration", async function () {
      const qos = {
        minUptime: 9950,
        maxLatency: 100,
        minValidatorCount: 10,
        securityLevel: 8,
        geographicDiversity: 5000,
      };

      await expect(
        feeMarket.connect(subnetOwner).createSecurityBid(
          subnetId,
          ethers.parseEther("10000"),
          3600, // Too short
          qos,
          ethers.ZeroAddress,
          ethers.parseEther("0.05")
        )
      ).to.be.revertedWith("Duration too short");
    });
  });

  describe("Validator Offers", function () {
    beforeEach(async function () {
      // Register validator
      await registry.connect(validator1).registerValidator(
        ethers.parseEther("10000"),
        ethers.parseEther("5000"),
        ["avalanche"],
        86400,
        31536000
      );
    });

    it("Should create a validator offer", async function () {
      const supportedQoS = {
        minUptime: 9980,
        maxLatency: 80,
        minValidatorCount: 5,
        securityLevel: 9,
        geographicDiversity: 6000,
      };

      await expect(
        feeMarket.connect(validator1).createValidatorOffer(
          ethers.parseEther("5000"),
          ethers.parseEther("0.04"),
          86400 * 90,
          supportedQoS
        )
      ).to.emit(feeMarket, "ValidatorOfferCreated");
    });

    it("Should reject offer with insufficient stake", async function () {
      const supportedQoS = {
        minUptime: 9980,
        maxLatency: 80,
        minValidatorCount: 5,
        securityLevel: 9,
        geographicDiversity: 6000,
      };

      await expect(
        feeMarket.connect(validator1).createValidatorOffer(
          ethers.parseEther("6000"), // Exceeds available
          ethers.parseEther("0.04"),
          86400 * 90,
          supportedQoS
        )
      ).to.be.revertedWith("Exceeds available stake");
    });
  });

  describe("Matching", function () {
    let bidId, offerId;

    beforeEach(async function () {
      // Register validator
      await registry.connect(validator1).registerValidator(
        ethers.parseEther("10000"),
        ethers.parseEther("5000"),
        ["avalanche"],
        86400,
        31536000
      );

      // Create bid
      const qos = {
        minUptime: 9950,
        maxLatency: 100,
        minValidatorCount: 10,
        securityLevel: 8,
        geographicDiversity: 5000,
      };

      const bidTx = await feeMarket.connect(subnetOwner).createSecurityBid(
        subnetId,
        ethers.parseEther("5000"),
        86400 * 30,
        qos,
        ethers.ZeroAddress,
        ethers.parseEther("0.05")
      );
      const bidReceipt = await bidTx.wait();
      const bidEvent = bidReceipt.logs.find(
        log => log.topics[0] === ethers.id("SecurityBidCreated(bytes32,bytes32,uint256,uint256)")
      );
      bidId = bidEvent.topics[1];

      // Create offer
      const supportedQoS = {
        minUptime: 9980,
        maxLatency: 80,
        minValidatorCount: 5,
        securityLevel: 9,
        geographicDiversity: 6000,
      };

      const offerTx = await feeMarket.connect(validator1).createValidatorOffer(
        ethers.parseEther("5000"),
        ethers.parseEther("0.04"),
        86400 * 90,
        supportedQoS
      );
      const offerReceipt = await offerTx.wait();
      const offerEvent = offerReceipt.logs.find(
        log => log.topics[0] === ethers.id("ValidatorOfferCreated(bytes32,address,uint256,uint256)")
      );
      offerId = offerEvent.topics[1];
    });

    it("Should match bid and offer", async function () {
      const bid = await feeMarket.getBid(bidId);
      expect(bid.matchedStake).to.be.gt(0);
    });
  });
});



