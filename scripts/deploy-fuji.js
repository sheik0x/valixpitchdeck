const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts to Fuji Testnet with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy SecurityLeasingRegistry
  console.log("\n[1/8] Deploying SecurityLeasingRegistry...");
  const SecurityLeasingRegistry = await hre.ethers.getContractFactory("SecurityLeasingRegistry");
  const registry = await SecurityLeasingRegistry.deploy(
    deployer.address, // governance
    hre.ethers.parseEther("1000"), // minValidatorStake
    86400, // minLeaseDuration (1 day)
    31536000 // maxLeaseDuration (1 year)
  );
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("✓ SecurityLeasingRegistry deployed to:", registryAddress);

  // Deploy Heterogeneous Verification Module (HVM)
  console.log("\n[2/8] Deploying Heterogeneous Verification Module...");
  const HVM = await hre.ethers.getContractFactory("HeterogeneousVerificationModule");
  const hvm = await HVM.deploy(deployer.address);
  await hvm.waitForDeployment();
  const hvmAddress = await hvm.getAddress();
  console.log("✓ HVM deployed to:", hvmAddress);

  // Deploy Atomic Cross-Chain Slashing (ACCS)
  console.log("\n[3/8] Deploying Atomic Cross-Chain Slashing...");
  const ACCS = await hre.ethers.getContractFactory("AtomicCrossChainSlashing");
  const accs = await ACCS.deploy(
    registryAddress,
    hvmAddress,
    deployer.address // governance
  );
  await accs.waitForDeployment();
  const accsAddress = await accs.getAddress();
  console.log("✓ ACCS deployed to:", accsAddress);

  // Deploy SlashingEngine
  console.log("\n[4/8] Deploying SlashingEngine...");
  const SlashingEngine = await hre.ethers.getContractFactory("SlashingEngine");
  const slashingEngine = await SlashingEngine.deploy(
    registryAddress,
    deployer.address, // governance
    accsAddress // ACCS
  );
  await slashingEngine.waitForDeployment();
  const slashingEngineAddress = await slashingEngine.getAddress();
  console.log("✓ SlashingEngine deployed to:", slashingEngineAddress);

  // Deploy RewardDistributor
  console.log("\n[5/8] Deploying RewardDistributor...");
  const RewardDistributor = await hre.ethers.getContractFactory("RewardDistributor");
  const rewardDistributor = await RewardDistributor.deploy(
    registryAddress,
    deployer.address, // governance
    "0x0000000000000000000000000000000000000000" // rewardToken (native for now)
  );
  await rewardDistributor.waitForDeployment();
  const rewardDistributorAddress = await rewardDistributor.getAddress();
  console.log("✓ RewardDistributor deployed to:", rewardDistributorAddress);

  // Deploy Dynamic Fee Market
  console.log("\n[6/8] Deploying Dynamic Fee Market...");
  const FeeMarket = await hre.ethers.getContractFactory("DynamicFeeMarket");
  const feeMarket = await FeeMarket.deploy(
    registryAddress,
    deployer.address // governance
  );
  await feeMarket.waitForDeployment();
  const feeMarketAddress = await feeMarket.getAddress();
  console.log("✓ Dynamic Fee Market deployed to:", feeMarketAddress);

  // Deploy LeaseManager
  console.log("\n[7/8] Deploying LeaseManager...");
  const LeaseManager = await hre.ethers.getContractFactory("LeaseManager");
  const leaseManager = await LeaseManager.deploy(
    registryAddress,
    deployer.address // governance
  );
  await leaseManager.waitForDeployment();
  const leaseManagerAddress = await leaseManager.getAddress();
  console.log("✓ LeaseManager deployed to:", leaseManagerAddress);

  // Configure contracts
  console.log("\n[8/8] Configuring contracts...");
  
  // Update registry with new contract addresses
  await registry.setFeeMarket(feeMarketAddress);
  await registry.setACCS(accsAddress);
  console.log("✓ Registry configured");

  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY - FUJI TESTNET");
  console.log("=".repeat(60));
  console.log("SecurityLeasingRegistry:", registryAddress);
  console.log("HeterogeneousVerificationModule (HVM):", hvmAddress);
  console.log("AtomicCrossChainSlashing (ACCS):", accsAddress);
  console.log("SlashingEngine:", slashingEngineAddress);
  console.log("RewardDistributor:", rewardDistributorAddress);
  console.log("DynamicFeeMarket:", feeMarketAddress);
  console.log("LeaseManager:", leaseManagerAddress);
  console.log("=".repeat(60));
  
  console.log("\n📝 Next Steps:");
  console.log("1. Verify contracts on Snowtrace:");
  console.log("   npx hardhat verify --network fuji", registryAddress, deployer.address, "1000000000000000000000", "86400", "31536000");
  console.log("\n2. Update frontend .env.local with these addresses");
  console.log("\n3. Test all functionality on testnet");
  console.log("\n4. Monitor contract interactions");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



