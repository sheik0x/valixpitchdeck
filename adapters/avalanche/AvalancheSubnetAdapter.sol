// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../ISubnetAdapter.sol";

/**
 * @title AvalancheSubnetAdapter
 * @notice Adapter for Avalanche subnets
 * @dev Implements ISubnetAdapter for Avalanche subnet integration
 */
contract AvalancheSubnetAdapter is ISubnetAdapter {
    // ============ Structs ============
    
    struct AvalancheValidator {
        address validatorAddress;
        uint256 stakeAmount;
        bool isActive;
        uint256 registrationTime;
    }
    
    // ============ State Variables ============
    
    mapping(address => AvalancheValidator) public validators;
    address[] public validatorList;
    
    bytes32 public subnetId;
    address public subnetManager; // Address that manages this subnet
    uint256 public totalStake;
    
    // ============ Modifiers ============
    
    modifier onlySubnetManager() {
        require(msg.sender == subnetManager, "Only subnet manager");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(bytes32 _subnetId, address _subnetManager) {
        subnetId = _subnetId;
        subnetManager = _subnetManager;
    }
    
    // ============ ISubnetAdapter Implementation ============
    
    function registerValidator(
        address _validator,
        uint256 _stakeAmount
    ) external override onlySubnetManager returns (bool) {
        require(_validator != address(0), "Invalid validator");
        require(_stakeAmount > 0, "Stake must be > 0");
        
        AvalancheValidator storage validator = validators[_validator];
        
        if (!validator.isActive) {
            validatorList.push(_validator);
        }
        
        validator.validatorAddress = _validator;
        validator.stakeAmount = _stakeAmount;
        validator.isActive = true;
        validator.registrationTime = block.timestamp;
        
        totalStake += _stakeAmount;
        
        emit ValidatorRegistered(_validator, subnetId);
        
        return true;
    }
    
    function removeValidator(address _validator) external override onlySubnetManager returns (bool) {
        AvalancheValidator storage validator = validators[_validator];
        require(validator.isActive, "Validator not active");
        
        validator.isActive = false;
        totalStake -= validator.stakeAmount;
        
        // Remove from list (simplified - in production, use mapping)
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
        
        // In production, this would trigger slashing logic
        // For now, we just return the violation ID
        
        return violationId;
    }
    
    function getSubnetType() external pure override returns (string memory) {
        return "avalanche";
    }
    
    function getValidatorSet() external view override returns (address[] memory) {
        return validatorList;
    }
    
    function getTotalStake() external view override returns (uint256) {
        return totalStake;
    }
}