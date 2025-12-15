// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../ISubnetAdapter.sol";

/**
 * @title CosmosSubnetAdapter
 * @notice Adapter for Cosmos app-chains
 * @dev Implements ISubnetAdapter for Cosmos chain integration
 * Note: In production, this would interface with Cosmos SDK via IBC or bridge
 */
contract CosmosSubnetAdapter is ISubnetAdapter {
    // ============ Structs ============
    
    struct CosmosValidator {
        address validatorAddress;      // Ethereum address (bridged)
        bytes32 cosmosValidatorAddress; // Cosmos validator address
        uint256 stakeAmount;
        bool isActive;
        uint256 registrationTime;
    }
    
    // ============ State Variables ============
    
    mapping(address => CosmosValidator) public validators;
    mapping(bytes32 => address) public cosmosToEth; // Cosmos address => Ethereum address
    address[] public validatorList;
    
    bytes32 public subnetId;
    address public subnetManager;
    address public cosmosBridge;       // Bridge contract for Cosmos communication
    uint256 public totalStake;
    
    // ============ Modifiers ============
    
    modifier onlySubnetManager() {
        require(msg.sender == subnetManager, "Only subnet manager");
        _;
    }
    
    modifier onlyBridge() {
        require(msg.sender == cosmosBridge || msg.sender == subnetManager, "Only bridge");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        bytes32 _subnetId,
        address _subnetManager,
        address _cosmosBridge
    ) {
        subnetId = _subnetId;
        subnetManager = _subnetManager;
        cosmosBridge = _cosmosBridge;
    }
    
    // ============ ISubnetAdapter Implementation ============
    
    function registerValidator(
        address _validator,
        uint256 _stakeAmount
    ) external override onlySubnetManager returns (bool) {
        require(_validator != address(0), "Invalid validator");
        require(_stakeAmount > 0, "Stake must be > 0");
        
        CosmosValidator storage validator = validators[_validator];
        
        if (!validator.isActive) {
            validatorList.push(_validator);
        }
        
        validator.validatorAddress = _validator;
        validator.stakeAmount = _stakeAmount;
        validator.isActive = true;
        validator.registrationTime = block.timestamp;
        
        totalStake += _stakeAmount;
        
        // In production, this would trigger a cross-chain message to Cosmos
        // For now, we store the mapping locally
        
        emit ValidatorRegistered(_validator, subnetId);
        
        return true;
    }
    
    /**
     * @notice Register validator from Cosmos side (called by bridge)
     * @param _ethAddress Ethereum address
     * @param _cosmosAddress Cosmos validator address
     * @param _stakeAmount Stake amount
     */
    function registerValidatorFromCosmos(
        address _ethAddress,
        bytes32 _cosmosAddress,
        uint256 _stakeAmount
    ) external onlyBridge returns (bool) {
        CosmosValidator storage validator = validators[_ethAddress];
        
        if (!validator.isActive) {
            validatorList.push(_ethAddress);
        }
        
        validator.validatorAddress = _ethAddress;
        validator.cosmosValidatorAddress = _cosmosAddress;
        validator.stakeAmount = _stakeAmount;
        validator.isActive = true;
        validator.registrationTime = block.timestamp;
        
        cosmosToEth[_cosmosAddress] = _ethAddress;
        totalStake += _stakeAmount;
        
        emit ValidatorRegistered(_ethAddress, subnetId);
        
        return true;
    }
    
    function removeValidator(address _validator) external override onlySubnetManager returns (bool) {
        CosmosValidator storage validator = validators[_validator];
        require(validator.isActive, "Validator not active");
        
        validator.isActive = false;
        totalStake -= validator.stakeAmount;
        
        // Remove from list
        for (uint i = 0; i < validatorList.length; i++) {
            if (validatorList[i] == _validator) {
                validatorList[i] = validatorList[validatorList.length - 1];
                validatorList.pop();
                break;
            }
        }
        
        emit ValidatorRemoved(_validator, subnetId);
        
        return true;
    }
    
    function isValidatorActive(address _validator) external view override returns (bool) {
        return validators[_validator].isActive;
    }
    
    function getValidatorStake(address _validator) external view override returns (uint256) {
        return validators[_validator].stakeAmount;
    }
    
    function reportViolation(
        address _validator,
        uint8 _violationType,
        bytes memory _evidence
    ) external override returns (bytes32) {
        require(validators[_validator].isActive, "Validator not active");
        
        bytes32 violationId = keccak256(
            abi.encodePacked(_validator, _violationType, _evidence, block.timestamp)
        );
        
        // In production, this would report to Cosmos chain via bridge
        
        return violationId;
    }
    
    function getSubnetType() external pure override returns (string memory) {
        return "cosmos";
    }
    
    function getValidatorSet() external view override returns (address[] memory) {
        return validatorList;
    }
    
    function getTotalStake() external view override returns (uint256) {
        return totalStake;
    }
    
    function getCosmosAddress(address _ethAddress) external view returns (bytes32) {
        return validators[_ethAddress].cosmosValidatorAddress;
    }
}