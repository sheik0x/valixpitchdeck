// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SecurityLeasingRegistry
 * @notice Core registry for validators and their security leasing capabilities
 * @dev Manages validator registration, stake commitments, and availability
 */
contract SecurityLeasingRegistry {
    // ============ Structs ============
    
    struct Validator {
        address validatorAddress;
        uint256 totalStake;              // Total stake on main chain
        uint256 availableStake;         // Stake available for leasing
        uint256 leasedStake;            // Currently leased stake
        bool isActive;
        uint256 registrationTime;
        uint256 minLeaseDuration;       // Minimum lease duration in seconds
        uint256 maxLeaseDuration;       // Maximum lease duration in seconds
        string[] supportedSubnetTypes;  // e.g., ["avalanche", "cosmos"]
    }
    
    struct Subnet {
        bytes32 subnetId;               // Unique subnet identifier
        string subnetType;              // "avalanche", "cosmos", "generic"
        address subnetAddress;          // Subnet contract/address
        uint256 requiredStake;          // Minimum stake required
        uint256 currentLeasedStake;     // Currently leased stake
        bool isActive;
        address subnetOwner;
    }
    
    struct Lease {
        bytes32 leaseId;
        address validator;
        bytes32 subnetId;
        uint256 leasedStake;
        uint256 startTime;
        uint256 endTime;
        uint256 slashingAmount;         // Amount at risk for slashing
        bool isActive;
        LeaseStatus status;
    }
    
    enum LeaseStatus {
        Pending,
        Active,
        Expired,
        Slashed,
        Cancelled
    }
    
    // ============ State Variables ============
    
    mapping(address => Validator) public validators;
    mapping(bytes32 => Subnet) public subnets;
    mapping(bytes32 => Lease) public leases;
    mapping(address => bytes32[]) public validatorLeases;
    mapping(bytes32 => bytes32[]) public subnetLeases;
    
    address[] public validatorList;
    bytes32[] public subnetList;
    bytes32[] public leaseList;
    
    address public governance;
    address public feeMarket;        // Dynamic Fee Market address
    address public accs;             // Atomic Cross-Chain Slashing address
    uint256 public minValidatorStake;
    uint256 public minLeaseDuration;
    uint256 public maxLeaseDuration;
    
    // ============ Events ============
    
    event ValidatorRegistered(
        address indexed validator,
        uint256 totalStake,
        string[] supportedSubnetTypes
    );
    
    event ValidatorUpdated(
        address indexed validator,
        uint256 availableStake
    );
    
    event SubnetRegistered(
        bytes32 indexed subnetId,
        string subnetType,
        address subnetAddress,
        uint256 requiredStake
    );
    
    event LeaseCreated(
        bytes32 indexed leaseId,
        address indexed validator,
        bytes32 indexed subnetId,
        uint256 leasedStake,
        uint256 endTime
    );
    
    event LeaseActivated(bytes32 indexed leaseId);
    event LeaseExpired(bytes32 indexed leaseId);
    event LeaseSlashed(bytes32 indexed leaseId, uint256 slashedAmount);
    
    // ============ Modifiers ============
    
    modifier onlyGovernance() {
        require(msg.sender == governance, "Only governance");
        _;
    }
    
    modifier onlyValidator(address validator) {
        require(validators[validator].isActive, "Validator not active");
        _;
    }
    
    modifier onlySubnetOwner(bytes32 subnetId) {
        require(subnets[subnetId].subnetOwner == msg.sender, "Not subnet owner");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        address _governance,
        uint256 _minValidatorStake,
        uint256 _minLeaseDuration,
        uint256 _maxLeaseDuration
    ) {
        governance = _governance;
        minValidatorStake = _minValidatorStake;
        minLeaseDuration = _minLeaseDuration;
        maxLeaseDuration = _maxLeaseDuration;
    }
    
    // ============ Validator Functions ============
    
    /**
     * @notice Register a validator for security leasing
     * @param _totalStake Total stake available on main chain
     * @param _availableStake Stake available for leasing
     * @param _supportedSubnetTypes Array of supported subnet types
     * @param _minLeaseDuration Minimum lease duration in seconds
     * @param _maxLeaseDuration Maximum lease duration in seconds
     */
    function registerValidator(
        uint256 _totalStake,
        uint256 _availableStake,
        string[] memory _supportedSubnetTypes,
        uint256 _minLeaseDuration,
        uint256 _maxLeaseDuration
    ) external {
        require(_totalStake >= minValidatorStake, "Stake too low");
        require(_availableStake <= _totalStake, "Available exceeds total");
        require(_minLeaseDuration >= minLeaseDuration, "Min duration too low");
        require(_maxLeaseDuration <= maxLeaseDuration, "Max duration too high");
        
        Validator storage validator = validators[msg.sender];
        
        if (!validator.isActive) {
            validator.validatorAddress = msg.sender;
            validator.registrationTime = block.timestamp;
            validatorList.push(msg.sender);
        }
        
        validator.totalStake = _totalStake;
        validator.availableStake = _availableStake;
        validator.leasedStake = 0;
        validator.isActive = true;
        validator.minLeaseDuration = _minLeaseDuration;
        validator.maxLeaseDuration = _maxLeaseDuration;
        validator.supportedSubnetTypes = _supportedSubnetTypes;
        
        emit ValidatorRegistered(
            msg.sender,
            _totalStake,
            _supportedSubnetTypes
        );
    }
    
    /**
     * @notice Update validator's available stake
     * @param _availableStake New available stake amount
     */
    function updateAvailableStake(uint256 _availableStake) external {
        Validator storage validator = validators[msg.sender];
        require(validator.isActive, "Validator not registered");
        require(_availableStake <= validator.totalStake, "Exceeds total stake");
        require(
            _availableStake >= validator.leasedStake,
            "Must cover leased stake"
        );
        
        validator.availableStake = _availableStake;
        
        emit ValidatorUpdated(msg.sender, _availableStake);
    }
    
    // ============ Subnet Functions ============
    
    /**
     * @notice Register a subnet for security leasing
     * @param _subnetId Unique subnet identifier
     * @param _subnetType Type of subnet ("avalanche", "cosmos", "generic")
     * @param _subnetAddress Address of subnet contract
     * @param _requiredStake Minimum stake required for security
     */
    function registerSubnet(
        bytes32 _subnetId,
        string memory _subnetType,
        address _subnetAddress,
        uint256 _requiredStake
    ) external {
        require(_subnetId != bytes32(0), "Invalid subnet ID");
        require(_requiredStake > 0, "Required stake must be > 0");
        
        Subnet storage subnet = subnets[_subnetId];
        
        if (!subnet.isActive) {
            subnetList.push(_subnetId);
        }
        
        subnet.subnetId = _subnetId;
        subnet.subnetType = _subnetType;
        subnet.subnetAddress = _subnetAddress;
        subnet.requiredStake = _requiredStake;
        subnet.currentLeasedStake = 0;
        subnet.isActive = true;
        subnet.subnetOwner = msg.sender;
        
        emit SubnetRegistered(_subnetId, _subnetType, _subnetAddress, _requiredStake);
    }
    
    // ============ Lease Functions ============
    
    /**
     * @notice Create a security lease
     * @param _validator Validator address
     * @param _subnetId Subnet identifier
     * @param _leasedStake Amount of stake to lease
     * @param _duration Lease duration in seconds
     * @return leaseId Unique lease identifier
     */
    function createLease(
        address _validator,
        bytes32 _subnetId,
        uint256 _leasedStake,
        uint256 _duration
    ) external returns (bytes32) {
        Validator storage validator = validators[_validator];
        Subnet storage subnet = subnets[_subnetId];
        
        require(validator.isActive, "Validator not active");
        require(subnet.isActive, "Subnet not active");
        require(
            _leasedStake <= validator.availableStake - validator.leasedStake,
            "Insufficient available stake"
        );
        require(_duration >= validator.minLeaseDuration, "Duration too short");
        require(_duration <= validator.maxLeaseDuration, "Duration too long");
        
        // Verify subnet type is supported
        bool subnetTypeSupported = false;
        for (uint i = 0; i < validator.supportedSubnetTypes.length; i++) {
            if (
                keccak256(bytes(validator.supportedSubnetTypes[i])) ==
                keccak256(bytes(subnet.subnetType))
            ) {
                subnetTypeSupported = true;
                break;
            }
        }
        require(subnetTypeSupported, "Subnet type not supported");
        
        bytes32 leaseId = keccak256(
            abi.encodePacked(
                _validator,
                _subnetId,
                _leasedStake,
                block.timestamp,
                block.number
            )
        );
        
        Lease storage lease = leases[leaseId];
        lease.leaseId = leaseId;
        lease.validator = _validator;
        lease.subnetId = _subnetId;
        lease.leasedStake = _leasedStake;
        lease.startTime = block.timestamp;
        lease.endTime = block.timestamp + _duration;
        lease.slashingAmount = _leasedStake; // Full stake at risk
        lease.isActive = true;
        lease.status = LeaseStatus.Pending;
        
        // Update validator and subnet state
        validator.leasedStake += _leasedStake;
        subnet.currentLeasedStake += _leasedStake;
        
        // Track leases
        validatorLeases[_validator].push(leaseId);
        subnetLeases[_subnetId].push(leaseId);
        leaseList.push(leaseId);
        
        emit LeaseCreated(leaseId, _validator, _subnetId, _leasedStake, lease.endTime);
        
        return leaseId;
    }
    
    /**
     * @notice Activate a lease (called after validator confirms)
     * @param _leaseId Lease identifier
     */
    function activateLease(bytes32 _leaseId) external {
        Lease storage lease = leases[_leaseId];
        require(lease.isActive, "Lease not found");
        require(lease.status == LeaseStatus.Pending, "Lease not pending");
        require(
            msg.sender == lease.validator || msg.sender == governance,
            "Not authorized"
        );
        
        lease.status = LeaseStatus.Active;
        
        emit LeaseActivated(_leaseId);
    }
    
    /**
     * @notice Mark lease as expired
     * @param _leaseId Lease identifier
     */
    function expireLease(bytes32 _leaseId) external {
        Lease storage lease = leases[_leaseId];
        require(lease.isActive, "Lease not found");
        require(block.timestamp >= lease.endTime, "Lease not expired");
        require(lease.status == LeaseStatus.Active, "Lease not active");
        
        lease.status = LeaseStatus.Expired;
        lease.isActive = false;
        
        // Update validator and subnet state
        Validator storage validator = validators[lease.validator];
        Subnet storage subnet = subnets[lease.subnetId];
        
        validator.leasedStake -= lease.leasedStake;
        subnet.currentLeasedStake -= lease.leasedStake;
        
        emit LeaseExpired(_leaseId);
    }
    
    /**
     * @notice Slash a lease (called by slashing engine)
     * @param _leaseId Lease identifier
     * @param _slashedAmount Amount to slash
     */
    function slashLease(bytes32 _leaseId, uint256 _slashedAmount) external {
        // This should only be callable by the SlashingEngine contract
        // For now, we'll use a modifier that can be updated
        require(msg.sender == governance, "Only slashing engine");
        
        Lease storage lease = leases[_leaseId];
        require(lease.isActive, "Lease not found");
        require(lease.status == LeaseStatus.Active, "Lease not active");
        require(_slashedAmount <= lease.slashingAmount, "Slash amount too high");
        
        lease.status = LeaseStatus.Slashed;
        lease.isActive = false;
        
        // Update validator state
        Validator storage validator = validators[lease.validator];
        validator.leasedStake -= lease.leasedStake;
        validator.totalStake -= _slashedAmount; // Slash from total stake
        
        // Update subnet state
        Subnet storage subnet = subnets[lease.subnetId];
        subnet.currentLeasedStake -= lease.leasedStake;
        
        emit LeaseSlashed(_leaseId, _slashedAmount);
    }
    
    // ============ View Functions ============
    
    function getValidator(address _validator) external view returns (Validator memory) {
        return validators[_validator];
    }
    
    function getSubnet(bytes32 _subnetId) external view returns (Subnet memory) {
        return subnets[_subnetId];
    }
    
    function getLease(bytes32 _leaseId) external view returns (Lease memory) {
        return leases[_leaseId];
    }
    
    function getValidatorLeases(address _validator) external view returns (bytes32[] memory) {
        return validatorLeases[_validator];
    }
    
    function getSubnetLeases(bytes32 _subnetId) external view returns (bytes32[] memory) {
        return subnetLeases[_subnetId];
    }
    
    function getTotalValidators() external view returns (uint256) {
        return validatorList.length;
    }
    
    function getTotalSubnets() external view returns (uint256) {
        return subnetList.length;
    }
    
    function getTotalLeases() external view returns (uint256) {
        return leaseList.length;
    }
    
    // ============ Governance Functions ============
    
    function setMinValidatorStake(uint256 _minStake) external onlyGovernance {
        minValidatorStake = _minStake;
    }
    
    function setLeaseDurationLimits(
        uint256 _minDuration,
        uint256 _maxDuration
    ) external onlyGovernance {
        minLeaseDuration = _minDuration;
        maxLeaseDuration = _maxDuration;
    }
    
    function updateGovernance(address _newGovernance) external onlyGovernance {
        governance = _newGovernance;
    }
    
    function setFeeMarket(address _feeMarket) external onlyGovernance {
        feeMarket = _feeMarket;
    }
    
    function setACCS(address _accs) external onlyGovernance {
        accs = _accs;
    }
}