// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../ISubnetAdapter.sol";

/**
 * @title GenericSubnetAdapter
 * @notice Generic adapter for any subnet type
 * @dev Provides a flexible interface for custom subnet implementations
 */
contract GenericSubnetAdapter is ISubnetAdapter {
    // ============ Structs ============
    
    struct GenericValidator {
        address validatorAddress;
        uint256 stakeAmount;
        bool isActive;
        uint256 registrationTime;
        bytes customData; // For subnet-specific data
    }
    
    // ============ State Variables ============
    
    mapping(address => GenericValidator) public validators;
    address[] public validatorList;
    
    bytes32 public subnetId;
    string public subnetType;
    address public subnetManager;
    address public customLogic;        // Optional custom logic contract
    uint256 public totalStake;
    
    // ============ Modifiers ============
    
    modifier onlySubnetManager() {
        require(msg.sender == subnetManager, "Only subnet manager");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        bytes32 _subnetId,
        string memory _subnetType,
        address _subnetManager,
        address _customLogic
    ) {
        subnetId = _subnetId;
        subnetType = _subnetType;
        subnetManager = _subnetManager;
        customLogic = _customLogic;
    }
    
    // ============ ISubnetAdapter Implementation ============
    
    function registerValidator(
        address _validator,
        uint256 _stakeAmount
    ) external override onlySubnetManager returns (bool) {
        require(_validator != address(0), "Invalid validator");
        require(_stakeAmount > 0, "Stake must be > 0");
        
        GenericValidator storage validator = validators[_validator];
        
        if (!validator.isActive) {
            validatorList.push(_validator);
        }
        
        validator.validatorAddress = _validator;
        validator.stakeAmount = _stakeAmount;
        validator.isActive = true;
        validator.registrationTime = block.timestamp;
        
        totalStake += _stakeAmount;
        
        // Call custom logic if provided
        if (customLogic != address(0)) {
            // In production, use interface call
            // ICustomLogic(customLogic).onValidatorRegistered(_validator, _stakeAmount);
        }
        
        emit ValidatorRegistered(_validator, subnetId);
        
        return true;
    }
    
    function registerValidatorWithData(
        address _validator,
        uint256 _stakeAmount,
        bytes memory _customData
    ) external onlySubnetManager returns (bool) {
        require(_validator != address(0), "Invalid validator");
        require(_stakeAmount > 0, "Stake must be > 0");
        
        GenericValidator storage validator = validators[_validator];
        
        if (!validator.isActive) {
            validatorList.push(_validator);
        }
        
        validator.validatorAddress = _validator;
        validator.stakeAmount = _stakeAmount;
        validator.isActive = true;
        validator.registrationTime = block.timestamp;
        validator.customData = _customData;
        
        totalStake += _stakeAmount;
        
        emit ValidatorRegistered(_validator, subnetId);
        
        return true;
    }
    
    function removeValidator(address _validator) external override onlySubnetManager returns (bool) {
        GenericValidator storage validator = validators[_validator];
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
    
    function getValidatorData(address _validator) external view returns (bytes memory) {
        return validators[_validator].customData;
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
        
        return violationId;
    }
    
    function getSubnetType() external view override returns (string memory) {
        return subnetType;
    }
    
    function getValidatorSet() external view override returns (address[] memory) {
        return validatorList;
    }
    
    function getTotalStake() external view override returns (uint256) {
        return totalStake;
    }
    
    function setCustomLogic(address _customLogic) external onlySubnetManager {
        customLogic = _customLogic;
    }
}