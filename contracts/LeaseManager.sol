// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SecurityLeasingRegistry.sol";
import "../adapters/ISubnetAdapter.sol";

/**
 * @title LeaseManager
 * @notice Manages the lifecycle of security leases and coordinates with subnet adapters
 * @dev Handles lease activation, validator registration on subnets, and lease expiration
 */
contract LeaseManager {
    SecurityLeasingRegistry public registry;
    
    // ============ State Variables ============
    
    mapping(bytes32 => address) public subnetAdapters; // subnetId => adapter address
    mapping(bytes32 => bool) public leaseActivated;   // leaseId => activated
    
    address public governance;
    
    // ============ Events ============
    
    event SubnetAdapterSet(bytes32 indexed subnetId, address indexed adapter);
    event LeaseActivatedOnSubnet(
        bytes32 indexed leaseId,
        bytes32 indexed subnetId,
        address indexed validator
    );
    event ValidatorRegisteredOnSubnet(
        bytes32 indexed subnetId,
        address indexed validator,
        uint256 stakeAmount
    );
    
    // ============ Modifiers ============
    
    modifier onlyGovernance() {
        require(msg.sender == governance, "Only governance");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _registry, address _governance) {
        registry = SecurityLeasingRegistry(_registry);
        governance = _governance;
    }
    
    // ============ Subnet Adapter Management ============
    
    /**
     * @notice Set subnet adapter for a subnet
     * @param _subnetId Subnet identifier
     * @param _adapter Address of subnet adapter contract
     */
    function setSubnetAdapter(
        bytes32 _subnetId,
        address _adapter
    ) external onlyGovernance {
        require(_adapter != address(0), "Invalid adapter");
        
        // Verify adapter implements ISubnetAdapter
        // In production, use interface check
        // require(ISubnetAdapter(_adapter).getSubnetType() != "", "Invalid adapter");
        
        subnetAdapters[_subnetId] = _adapter;
        
        emit SubnetAdapterSet(_subnetId, _adapter);
    }
    
    // ============ Lease Activation ============
    
    /**
     * @notice Activate a lease and register validator on subnet
     * @param _leaseId Lease identifier
     */
    function activateLeaseOnSubnet(bytes32 _leaseId) external {
        SecurityLeasingRegistry.Lease memory lease = registry.getLease(_leaseId);
        require(lease.isActive, "Lease not found");
        require(lease.status == SecurityLeasingRegistry.LeaseStatus.Pending, "Lease not pending");
        require(!leaseActivated[_leaseId], "Lease already activated");
        
        // Get subnet adapter
        address adapter = subnetAdapters[lease.subnetId];
        require(adapter != address(0), "Adapter not set");
        
        // Register validator on subnet via adapter
        ISubnetAdapter subnetAdapter = ISubnetAdapter(adapter);
        bool success = subnetAdapter.registerValidator(
            lease.validator,
            lease.leasedStake
        );
        require(success, "Registration failed");
        
        // Activate lease in registry
        registry.activateLease(_leaseId);
        
        leaseActivated[_leaseId] = true;
        
        emit LeaseActivatedOnSubnet(_leaseId, lease.subnetId, lease.validator);
        emit ValidatorRegisteredOnSubnet(lease.subnetId, lease.validator, lease.leasedStake);
    }
    
    /**
     * @notice Batch activate multiple leases
     * @param _leaseIds Array of lease identifiers
     */
    function activateLeasesBatch(bytes32[] memory _leaseIds) external {
        for (uint i = 0; i < _leaseIds.length; i++) {
            activateLeaseOnSubnet(_leaseIds[i]);
        }
    }
    
    /**
     * @notice Handle lease expiration - remove validator from subnet
     * @param _leaseId Lease identifier
     */
    function handleLeaseExpiration(bytes32 _leaseId) external {
        SecurityLeasingRegistry.Lease memory lease = registry.getLease(_leaseId);
        require(lease.status == SecurityLeasingRegistry.LeaseStatus.Expired, "Lease not expired");
        require(leaseActivated[_leaseId], "Lease not activated");
        
        // Get subnet adapter
        address adapter = subnetAdapters[lease.subnetId];
        if (adapter != address(0)) {
            ISubnetAdapter subnetAdapter = ISubnetAdapter(adapter);
            subnetAdapter.removeValidator(lease.validator);
        }
        
        leaseActivated[_leaseId] = false;
    }
    
    /**
     * @notice Report violation from subnet adapter
     * @param _leaseId Lease identifier
     * @param _violationType Type of violation
     * @param _evidence Evidence of violation
     */
    function reportViolationFromSubnet(
        bytes32 _leaseId,
        uint8 _violationType,
        bytes memory _evidence
    ) external {
        SecurityLeasingRegistry.Lease memory lease = registry.getLease(_leaseId);
        require(lease.isActive, "Lease not found");
        
        // Verify caller is the subnet adapter
        address adapter = subnetAdapters[lease.subnetId];
        require(msg.sender == adapter, "Not subnet adapter");
        
        // Report to slashing engine (would need slashing engine address)
        // For now, this is a placeholder
        // SlashingEngine(slashingEngine).reportViolation(_leaseId, _violationType, 100, "");
    }
    
    // ============ View Functions ============
    
    function isLeaseActivated(bytes32 _leaseId) external view returns (bool) {
        return leaseActivated[_leaseId];
    }
    
    function getSubnetAdapter(bytes32 _subnetId) external view returns (address) {
        return subnetAdapters[_subnetId];
    }
}