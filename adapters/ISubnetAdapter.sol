// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISubnetAdapter
 * @notice Interface for subnet adapters to enable multi-chain support
 * @dev Each subnet type (Avalanche, Cosmos, etc.) implements this interface
 */
interface ISubnetAdapter {
    // ============ Events ============
    
    event ValidatorRegistered(address indexed validator, bytes32 indexed subnetId);
    event ValidatorRemoved(address indexed validator, bytes32 indexed subnetId);
    event ValidationPerformed(address indexed validator, bytes32 indexed blockHash);
    
    // ============ Functions ============
    
    /**
     * @notice Register a validator on the subnet
     * @param _validator Validator address
     * @param _stakeAmount Amount of stake being leased
     * @return success Whether registration was successful
     */
    function registerValidator(
        address _validator,
        uint256 _stakeAmount
    ) external returns (bool success);
    
    /**
     * @notice Remove a validator from the subnet
     * @param _validator Validator address
     * @return success Whether removal was successful
     */
    function removeValidator(address _validator) external returns (bool success);
    
    /**
     * @notice Check if validator is active on subnet
     * @param _validator Validator address
     * @return isActive Whether validator is active
     */
    function isValidatorActive(address _validator) external view returns (bool isActive);
    
    /**
     * @notice Get validator stake on subnet
     * @param _validator Validator address
     * @return stakeAmount Current stake amount
     */
    function getValidatorStake(address _validator) external view returns (uint256 stakeAmount);
    
    /**
     * @notice Report validator misbehavior
     * @param _validator Validator address
     * @param _violationType Type of violation
     * @param _evidence Evidence of violation
     * @return violationId Unique violation identifier
     */
    function reportViolation(
        address _validator,
        uint8 _violationType,
        bytes memory _evidence
    ) external returns (bytes32 violationId);
    
    /**
     * @notice Get subnet type identifier
     * @return subnetType String identifier (e.g., "avalanche", "cosmos")
     */
    function getSubnetType() external pure returns (string memory subnetType);
    
    /**
     * @notice Get current validator set
     * @return validators Array of active validator addresses
     */
    function getValidatorSet() external view returns (address[] memory validators);
    
    /**
     * @notice Get total staked amount on subnet
     * @return totalStake Total stake across all validators
     */
    function getTotalStake() external view returns (uint256 totalStake);
}