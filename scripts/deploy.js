const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy SecurityLeasingRegistry
  console.log("\nDeploying SecurityLeasingRegistry...");
  const SecurityLeasingRegistry = await hre.ethers.getContractFactory("SecurityLeasingRegistry");
  const registry = await SecurityLeasingRegistry.deploy(
    deployer.address, // governance
    hre.ethers.parseEther("1000"), // minValidatorStake
    86400, // minLeaseDuration (1 day)
    31536000 // maxLeaseDuration (1 year)
  );
  await registry.waitForDeployment();
  console.log("SecurityLeasingRegistry deployed to:", await registry.getAddress());

  // Deploy SlashingEngine (will be updated with ACCS after ACCS deployment)
  console.log("\nDeploying SlashingEngine...");
  const SlashingEngine = await hre.ethers.getContractFactory("SlashingEngine");
  const slashingEngine = await SlashingEngine.deploy(
    await registry.getAddress(),
    deployer.address, // governance
    "0x0000000000000000000000000000000000000000" // ACCS (will be set later)
  );
  await slashingEngine.waitForDeployment();
  console.log("SlashingEngine deployed to:", await slashingEngine.getAddress());

  // Deploy RewardDistributor
  console.log("\nDeploying RewardDistributor...");
  const RewardDistributor = await hre.ethers.getContractFactory("RewardDistributor");
  const rewardDistributor = await RewardDistributor.deploy(
    await registry.getAddress(),
    deployer.address, // governance
    "0x0000000000000000000000000000000000000000" // rewardToken (native for now)
  );
  await rewardDistributor.waitForDeployment();
  console.log("RewardDistributor deployed to:", await rewardDistributor.getAddress());

  // Deploy Heterogeneous Verification Module (HVM)
  console.log("\nDeploying Heterogeneous Verification Module...");
  const HVM = await hre.ethers.getContractFactory("HeterogeneousVerificationModule");
  const hvm = await HVM.deploy(deployer.address);
  await hvm.waitForDeployment();
  console.log("HVM deployed to:", await hvm.getAddress());

  // Deploy Atomic Cross-Chain Slashing (ACCS)
  console.log("\nDeploying Atomic Cross-Chain Slashing...");
  const ACCS = await hre.ethers.getContractFactory("AtomicCrossChainSlashing");
  const accs = await ACCS.deploy(
    await registry.getAddress(),
    await hvm.getAddress(),
    deployer.address // governance
  );
  await accs.waitForDeployment();
  console.log("ACCS deployed to:", await accs.getAddress());

  // Deploy Dynamic Fee Market
  console.log("\nDeploying Dynamic Fee Market...");
  const FeeMarket = await hre.ethers.getContractFactory("DynamicFeeMarket");
  const feeMarket = await FeeMarket.deploy(
    await registry.getAddress(),
    deployer.address // governance
  );
  await feeMarket.waitForDeployment();
  console.log("Dynamic Fee Market deployed to:", await feeMarket.getAddress());

  // Update registry to allow slashing engine to slash
  console.log("\nUpdating registry permissions...");
  // Note: In production, you'd set up proper access control
  // For now, we'll use governance address

  // Update registry with new contract addresses
  console.log("\nConfiguring registry...");
  await registry.setFeeMarket(await feeMarket.getAddress());
  await registry.setACCS(await accs.getAddress());

  // Update slashing engine with ACCS
  console.log("\nConfiguring slashing engine...");
  await slashingEngine.setACCS(await accs.getAddress());

  console.log("\n=== Deployment Summary ===");
  console.log("SecurityLeasingRegistry:", await registry.getAddress());
  console.log("SlashingEngine:", await slashingEngine.getAddress());
  console.log("RewardDistributor:", await rewardDistributor.getAddress());
  console.log("LeaseManager:", await leaseManager.getAddress());
  console.log("Heterogeneous Verification Module (HVM):", await hvm.getAddress());
  console.log("Atomic Cross-Chain Slashing (ACCS):", await accs.getAddress());
  console.log("Dynamic Fee Market:", await feeMarket.getAddress());
  console.log("\nSave these addresses for configuration!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });