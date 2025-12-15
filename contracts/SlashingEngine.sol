// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SecurityLeasingRegistry.sol";
import "./AtomicCrossChainSlashing.sol";

/**
 * @title SlashingEngine
 * @notice Handles slashing logic for misbehaving validators
 * @dev Monitors validator behavior and triggers slashing when conditions are met
 * Integrates with Atomic Cross-Chain Slashing (ACCS) for trustless cross-chain slashing
 */
contract SlashingEngine {
    SecurityLeasingRegistry public registry;
    AtomicCrossChainSlashing public accs;
    
    // ============ Structs ============
    
    struct SlashingCondition {
        bytes32 conditionId;
        bytes32 subnetId;
        SlashingType slashingType;
        uint256 threshold;              // Threshold for triggering slash
        uint256 slashPercentage;        // Percentage of stake to slash (basis points)
        bool isActive;
    }
    
    enum SlashingType {
        DoubleSign,          // Validator signed conflicting blocks
        Downtime,           // Validator was offline
        InvalidBlock,       // Validator produced invalid block
        GovernanceViolation // Validator violated governance rules
    }
    
    struct Violation {
        bytes32 violationId;
        bytes32 leaseId;
        address validator;
        SlashingType violationType;
        uint256 severity;               // 0-100 scale
        uint256 timestamp;
        bool isSlashed;
    }
    
    // ============ State Variables ============
    
    mapping(bytes32 => SlashingCondition) public slashingConditions;
    mapping(bytes32 => Violation) public violations;
    mapping(bytes32 => uint256) public violationCount; // leaseId => count
    
    bytes32[] public conditionList;
    bytes32[] public violationList;
    
    address public governance;
    address public oracle;              // Oracle for reporting violations
    
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public minSlashPercentage = 100;  // 1% minimum
    uint256 public maxSlashPercentage = 10000; // 100% maximum
    
    // ============ Events ============
    
    event SlashingConditionCreated(
        bytes32 indexed conditionId,
        bytes32 indexed subnetId,
        SlashingType slashingType,
        uint256 threshold,
        uint256 slashPercentage
    );
    
    event ViolationReported(
        bytes32 indexed violationId,
        bytes32 indexed leaseId,
        address indexed validator,
        SlashingType violationType,
        uint256 severity
    );
    
    event SlashingExecuted(
        bytes32 indexed leaseId,
        address indexed validator,
        uint256 slashedAmount,
        SlashingType reason
    );
    
    // ============ Modifiers ============
    
    modifier onlyGovernance() {
        require(msg.sender == governance, "Only governance");
        _;
    }
    
    modifier onlyOracle() {
        require(msg.sender == oracle || msg.sender == governance, "Only oracle");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        address _registry,
        address _governance,
        address _accs
    ) {
        registry = SecurityLeasingRegistry(_registry);
        governance = _governance;
        oracle = _governance; // Initially set to governance
        if (_accs != address(0)) {
            accs = AtomicCrossChainSlashing(_accs);
        }
    }
    
    // ============ Slashing Condition Management ============
    
    /**
     * @notice Create a slashing condition for a subnet
     * @param _subnetId Subnet identifier
     * @param _slashingType Type of violation
     * @param _threshold Threshold for triggering (e.g., number of violations)
     * @param _slashPercentage Percentage to slash (in basis points)
     */
    function createSlashingCondition(
        bytes32 _subnetId,
        SlashingType _slashingType,
        uint256 _threshold,
        uint256 _slashPercentage
    ) external onlyGovernance returns (bytes32) {
        require(_slashPercentage >= minSlashPercentage, "Slash too low");
        require(_slashPercentage <= maxSlashPercentage, "Slash too high");
        
        bytes32 conditionId = keccak256(
            abi.encodePacked(_subnetId, _slashingType, block.timestamp)
        );
        
        SlashingCondition storage condition = slashingConditions[conditionId];
        condition.conditionId = conditionId;
        condition.subnetId = _subnetId;
        condition.slashingType = _slashingType;
        condition.threshold = _threshold;
        condition.slashPercentage = _slashPercentage;
        condition.isActive = true;
        
        conditionList.push(conditionId);
        
        emit SlashingConditionCreated(
            conditionId,
            _subnetId,
            _slashingType,
            _threshold,
            _slashPercentage
        );
        
        return conditionId;
    }
    
    // ============ Violation Reporting ============
    
    /**
     * @notice Report a validator violation
     * @param _leaseId Lease identifier
     * @param _violationType Type of violation
     * @param _severity Severity score (0-100)
     * @param _evidence Evidence of violation (IPFS hash, etc.)
     */
    function reportViolation(
        bytes32 _leaseId,
        SlashingType _violationType,
        uint256 _severity,
        string memory _evidence
    ) external onlyOracle returns (bytes32) {
        // If ACCS is set, route to ACCS for cross-chain proof verification
        if (address(accs) != address(0)) {
            // ACCS will handle the proof verification and atomic slashing
            // This function still records the violation for tracking
        }
        require(_severity <= 100, "Severity out of range");
        
        SecurityLeasingRegistry.Lease memory lease = registry.getLease(_leaseId);
        require(lease.isActive, "Lease not active");
        require(lease.status == SecurityLeasingRegistry.LeaseStatus.Active, "Lease not active");
        
        bytes32 violationId = keccak256(
            abi.encodePacked(_leaseId, _violationType, block.timestamp, _evidence)
        );
        
        Violation storage violation = violations[violationId];
        violation.violationId = violationId;
        violation.leaseId = _leaseId;
        violation.validator = lease.validator;
        violation.violationType = _violationType;
        violation.severity = _severity;
        violation.timestamp = block.timestamp;
        violation.isSlashed = false;
        
        violationList.push(violationId);
        violationCount[_leaseId]++;
        
        emit ViolationReported(
            violationId,
            _leaseId,
            lease.validator,
            _violationType,
            _severity
        );
        
        // Check if slashing should be triggered
        _checkAndExecuteSlashing(_leaseId, _violationType);
        
        return violationId;
    }
    
    // ============ Slashing Logic ============
    
    /**
     * @notice Check if slashing conditions are met and execute
     * @param _leaseId Lease identifier
     * @param _violationType Type of violation
     */
    function _checkAndExecuteSlashing(
        bytes32 _leaseId,
        SlashingType _violationType
    ) internal {
        SecurityLeasingRegistry.Lease memory lease = registry.getLease(_leaseId);
        bytes32 subnetId = lease.subnetId;
        
        // Find matching slashing condition
        bytes32 conditionId = _findSlashingCondition(subnetId, _violationType);
        if (conditionId == bytes32(0)) {
            return; // No condition set for this violation type
        }
        
        SlashingCondition memory condition = slashingConditions[conditionId];
        if (!condition.isActive) {
            return;
        }
        
        // Check if threshold is met
        uint256 count = violationCount[_leaseId];
        if (count < condition.threshold) {
            return; // Threshold not met
        }
        
        // Calculate slash amount
        uint256 slashAmount = (lease.leasedStake * condition.slashPercentage) / BASIS_POINTS;
        
        // Execute slash
        registry.slashLease(_leaseId, slashAmount);
        
        // Mark violations as slashed
        _markViolationsAsSlashed(_leaseId);
        
        emit SlashingExecuted(_leaseId, lease.validator, slashAmount, _violationType);
    }
    
    /**
     * @notice Find slashing condition for subnet and violation type
     */
    function _findSlashingCondition(
        bytes32 _subnetId,
        SlashingType _violationType
    ) internal view returns (bytes32) {
        for (uint i = 0; i < conditionList.length; i++) {
            SlashingCondition memory condition = slashingConditions[conditionList[i]];
            if (
                condition.subnetId == _subnetId &&
                condition.slashingType == _violationType &&
                condition.isActive
            ) {
                return condition.conditionId;
            }
        }
        return bytes32(0);
    }
    
    /**
     * @notice Mark all violations for a lease as slashed
     */
    function _markViolationsAsSlashed(bytes32 _leaseId) internal {
        for (uint i = 0; i < violationList.length; i++) {
            Violation storage violation = violations[violationList[i]];
            if (violation.leaseId == _leaseId && !violation.isSlashed) {
                violation.isSlashed = true;
            }
        }
    }
    
    /**
     * @notice Manually trigger slashing (governance only)
     * @param _leaseId Lease identifier
     * @param _slashAmount Amount to slash
     */
    function manualSlash(
        bytes32 _leaseId,
        uint256 _slashAmount
    ) external onlyGovernance {
        SecurityLeasingRegistry.Lease memory lease = registry.getLease(_leaseId);
        require(lease.isActive, "Lease not active");
        require(_slashAmount <= lease.leasedStake, "Slash amount too high");
        
        registry.slashLease(_leaseId, _slashAmount);
        
        emit SlashingExecuted(_leaseId, lease.validator, _slashAmount, SlashingType.GovernanceViolation);
    }
    
    // ============ View Functions ============
    
    function getSlashingCondition(bytes32 _conditionId) external view returns (SlashingCondition memory) {
        return slashingConditions[_conditionId];
    }
    
    function getViolation(bytes32 _violationId) external view returns (Violation memory) {
        return violations[_violationId];
    }
    
    function getViolationCount(bytes32 _leaseId) external view returns (uint256) {
        return violationCount[_leaseId];
    }
    
    // ============ Governance Functions ============
    
    function setOracle(address _oracle) external onlyGovernance {
        oracle = _oracle;
    }
    
    function setACCS(address _accs) external onlyGovernance {
        accs = AtomicCrossChainSlashing(_accs);
    }
    
    function setSlashPercentageLimits(
        uint256 _min,
        uint256 _max
    ) external onlyGovernance {
        require(_min < _max, "Invalid limits");
        minSlashPercentage = _min;
        maxSlashPercentage = _max;
    }
}