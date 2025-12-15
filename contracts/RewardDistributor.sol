// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SecurityLeasingRegistry.sol";

/**
 * @title RewardDistributor
 * @notice Distributes rewards to validators for providing security leasing
 * @dev Handles reward calculation, distribution, and fee collection
 */
contract RewardDistributor {
    SecurityLeasingRegistry public registry;
    
    // ============ Structs ============
    
    struct RewardRate {
        bytes32 subnetId;
        uint256 ratePerSecond;         // Reward rate per second per unit of stake
        uint256 lastUpdateTime;
        bool isActive;
    }
    
    struct ValidatorReward {
        address validator;
        bytes32 leaseId;
        uint256 accumulatedReward;
        uint256 lastClaimTime;
        uint256 totalClaimed;
    }
    
    struct FeeStructure {
        uint256 protocolFeePercentage;  // Protocol fee (basis points)
        uint256 subnetFeePercentage;    // Subnet fee (basis points)
        address protocolFeeRecipient;
    }
    
    // ============ State Variables ============
    
    mapping(bytes32 => RewardRate) public rewardRates;
    mapping(bytes32 => ValidatorReward) public validatorRewards; // leaseId => reward
    mapping(address => uint256) public totalValidatorRewards;
    
    FeeStructure public feeStructure;
    
    address public governance;
    address public rewardToken;        // ERC20 token for rewards (0x0 for native)
    
    uint256 public constant BASIS_POINTS = 10000;
    
    // ============ Events ============
    
    event RewardRateSet(
        bytes32 indexed subnetId,
        uint256 ratePerSecond
    );
    
    event RewardsAccumulated(
        bytes32 indexed leaseId,
        address indexed validator,
        uint256 amount
    );
    
    event RewardsClaimed(
        address indexed validator,
        bytes32 indexed leaseId,
        uint256 amount
    );
    
    event FeeStructureUpdated(
        uint256 protocolFee,
        uint256 subnetFee
    );
    
    // ============ Modifiers ============
    
    modifier onlyGovernance() {
        require(msg.sender == governance, "Only governance");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        address _registry,
        address _governance,
        address _rewardToken
    ) {
        registry = SecurityLeasingRegistry(_registry);
        governance = _governance;
        rewardToken = _rewardToken;
        
        // Default fee structure: 5% protocol, 5% subnet
        feeStructure = FeeStructure({
            protocolFeePercentage: 500,
            subnetFeePercentage: 500,
            protocolFeeRecipient: _governance
        });
    }
    
    // ============ Reward Rate Management ============
    
    /**
     * @notice Set reward rate for a subnet
     * @param _subnetId Subnet identifier
     * @param _ratePerSecond Reward rate per second per unit of stake
     */
    function setRewardRate(
        bytes32 _subnetId,
        uint256 _ratePerSecond
    ) external onlyGovernance {
        RewardRate storage rate = rewardRates[_subnetId];
        rate.subnetId = _subnetId;
        rate.ratePerSecond = _ratePerSecond;
        rate.lastUpdateTime = block.timestamp;
        rate.isActive = true;
        
        emit RewardRateSet(_subnetId, _ratePerSecond);
    }
    
    // ============ Reward Accumulation ============
    
    /**
     * @notice Accumulate rewards for a lease
     * @param _leaseId Lease identifier
     */
    function accumulateRewards(bytes32 _leaseId) public {
        SecurityLeasingRegistry.Lease memory lease = registry.getLease(_leaseId);
        require(lease.status == SecurityLeasingRegistry.LeaseStatus.Active, "Lease not active");
        
        RewardRate memory rate = rewardRates[lease.subnetId];
        require(rate.isActive, "Reward rate not set");
        
        ValidatorReward storage reward = validatorRewards[_leaseId];
        
        if (reward.lastClaimTime == 0) {
            reward.validator = lease.validator;
            reward.leaseId = _leaseId;
            reward.lastClaimTime = lease.startTime;
        }
        
        uint256 timeElapsed = block.timestamp - reward.lastClaimTime;
        uint256 newReward = (lease.leasedStake * rate.ratePerSecond * timeElapsed) / 1e18;
        
        reward.accumulatedReward += newReward;
        reward.lastClaimTime = block.timestamp;
        
        emit RewardsAccumulated(_leaseId, lease.validator, newReward);
    }
    
    /**
     * @notice Accumulate rewards for multiple leases
     * @param _leaseIds Array of lease identifiers
     */
    function accumulateRewardsBatch(bytes32[] memory _leaseIds) external {
        for (uint i = 0; i < _leaseIds.length; i++) {
            accumulateRewards(_leaseIds[i]);
        }
    }
    
    // ============ Reward Claiming ============
    
    /**
     * @notice Claim accumulated rewards for a lease
     * @param _leaseId Lease identifier
     */
    function claimRewards(bytes32 _leaseId) external {
        accumulateRewards(_leaseId);
        
        ValidatorReward storage reward = validatorRewards[_leaseId];
        require(reward.validator == msg.sender, "Not validator");
        require(reward.accumulatedReward > 0, "No rewards");
        
        uint256 totalReward = reward.accumulatedReward;
        reward.accumulatedReward = 0;
        reward.totalClaimed += totalReward;
        
        // Calculate fees
        uint256 protocolFee = (totalReward * feeStructure.protocolFeePercentage) / BASIS_POINTS;
        uint256 subnetFee = (totalReward * feeStructure.subnetFeePercentage) / BASIS_POINTS;
        uint256 validatorReward = totalReward - protocolFee - subnetFee;
        
        // Update total validator rewards
        totalValidatorRewards[msg.sender] += validatorReward;
        
        // Distribute rewards
        SecurityLeasingRegistry.Lease memory lease = registry.getLease(_leaseId);
        SecurityLeasingRegistry.Subnet memory subnet = registry.getSubnet(lease.subnetId);
        
        _transferReward(msg.sender, validatorReward);
        _transferReward(feeStructure.protocolFeeRecipient, protocolFee);
        _transferReward(subnet.subnetOwner, subnetFee);
        
        emit RewardsClaimed(msg.sender, _leaseId, validatorReward);
    }
    
    /**
     * @notice Claim rewards for multiple leases
     * @param _leaseIds Array of lease identifiers
     */
    function claimRewardsBatch(bytes32[] memory _leaseIds) external {
        for (uint i = 0; i < _leaseIds.length; i++) {
            accumulateRewards(_leaseIds[i]);
        }
        
        uint256 totalClaimable = 0;
        for (uint i = 0; i < _leaseIds.length; i++) {
            ValidatorReward storage reward = validatorRewards[_leaseIds[i]];
            require(reward.validator == msg.sender, "Not validator");
            totalClaimable += reward.accumulatedReward;
            reward.totalClaimed += reward.accumulatedReward;
            reward.accumulatedReward = 0;
        }
        
        require(totalClaimable > 0, "No rewards");
        
        // Calculate fees
        uint256 protocolFee = (totalClaimable * feeStructure.protocolFeePercentage) / BASIS_POINTS;
        uint256 subnetFee = (totalClaimable * feeStructure.subnetFeePercentage) / BASIS_POINTS;
        uint256 validatorReward = totalClaimable - protocolFee - subnetFee;
        
        totalValidatorRewards[msg.sender] += validatorReward;
        
        // For batch, distribute fees proportionally (simplified)
        _transferReward(msg.sender, validatorReward);
        _transferReward(feeStructure.protocolFeeRecipient, protocolFee);
        
        emit RewardsClaimed(msg.sender, bytes32(0), validatorReward);
    }
    
    /**
     * @notice Transfer reward (native or ERC20)
     */
    function _transferReward(address _to, uint256 _amount) internal {
        if (_amount == 0) return;
        
        if (rewardToken == address(0)) {
            // Native token transfer
            (bool success, ) = _to.call{value: _amount}("");
            require(success, "Transfer failed");
        } else {
            // ERC20 transfer
            // In production, use SafeERC20
            // IERC20(rewardToken).transfer(_to, _amount);
            // For now, this is a placeholder
            require(false, "ERC20 not implemented");
        }
    }
    
    // ============ View Functions ============
    
    function getValidatorReward(bytes32 _leaseId) external view returns (ValidatorReward memory) {
        return validatorRewards[_leaseId];
    }
    
    function getPendingReward(bytes32 _leaseId) external view returns (uint256) {
        SecurityLeasingRegistry.Lease memory lease = registry.getLease(_leaseId);
        if (lease.status != SecurityLeasingRegistry.LeaseStatus.Active) {
            return 0;
        }
        
        RewardRate memory rate = rewardRates[lease.subnetId];
        if (!rate.isActive) {
            return 0;
        }
        
        ValidatorReward memory reward = validatorRewards[_leaseId];
        uint256 lastUpdate = reward.lastClaimTime > 0 ? reward.lastClaimTime : lease.startTime;
        uint256 timeElapsed = block.timestamp - lastUpdate;
        uint256 newReward = (lease.leasedStake * rate.ratePerSecond * timeElapsed) / 1e18;
        
        return reward.accumulatedReward + newReward;
    }
    
    // ============ Governance Functions ============
    
    function updateFeeStructure(
        uint256 _protocolFee,
        uint256 _subnetFee,
        address _protocolFeeRecipient
    ) external onlyGovernance {
        require(_protocolFee + _subnetFee <= BASIS_POINTS, "Fees exceed 100%");
        feeStructure.protocolFeePercentage = _protocolFee;
        feeStructure.subnetFeePercentage = _subnetFee;
        feeStructure.protocolFeeRecipient = _protocolFeeRecipient;
        
        emit FeeStructureUpdated(_protocolFee, _subnetFee);
    }
    
    function setRewardToken(address _rewardToken) external onlyGovernance {
        rewardToken = _rewardToken;
    }
    
    // ============ Receive Function ============
    
    receive() external payable {
        // Accept native tokens for rewards
    }
}