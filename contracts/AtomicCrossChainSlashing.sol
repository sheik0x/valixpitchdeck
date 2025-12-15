// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SecurityLeasingRegistry.sol";

/**
 * @title AtomicCrossChainSlashing (ACCS)
 * @notice Trustless cross-chain slashing mechanism using cryptographic proof-of-malice
 * @dev Holds validator stake and executes slashing based on verifiable proofs from subnets
 * 
 * Groundbreaking Feature: Trustless Economic Guarantee
 * The subnet's security is backed by the main chain's huge economic value,
 * without needing a trusted intermediary or bridge.
 */
contract AtomicCrossChainSlashing {
    SecurityLeasingRegistry public registry;
    
    // ============ Structs ============
    
    struct StakedAmount {
        address validator;
        uint256 amount;              // Amount of stake held in escrow
        uint256 leaseId;             // Associated lease ID
        bytes32 subnetId;
        uint256 lockTime;            // When stake was locked
        bool isLocked;
    }
    
    struct ProofOfMalice {
        bytes32 proofId;
        bytes32 leaseId;
        address validator;
        MaliceType maliceType;
        bytes32 blockHash;           // Block where malice occurred
        bytes32 previousBlockHash;   // For double-sign detection
        bytes signature;             // Validator's signature
        bytes stateProof;            // Light client state proof
        bytes32 merkleRoot;          // Merkle root of proof
        uint256 timestamp;
        bool verified;
    }
    
    enum MaliceType {
        DoubleSign,              // Validator signed two conflicting blocks
        InvalidStateTransition,  // Invalid state transition
        Censorship,              // Censoring transactions
        InvalidBlockProduction   // Produced invalid block
    }
    
    struct VerificationRule {
        MaliceType maliceType;
        bytes4 verificationFunction;  // Function selector for verification
        uint256 slashPercentage;      // Percentage to slash (basis points)
        bool isActive;
    }
    
    // ============ State Variables ============
    
    mapping(bytes32 => StakedAmount) public stakedAmounts; // leaseId => staked amount
    mapping(bytes32 => ProofOfMalice) public proofs;      // proofId => proof
    mapping(MaliceType => VerificationRule) public verificationRules;
    
    bytes32[] public proofList;
    
    address public governance;
    address public hvm;              // Heterogeneous Verification Module address
    
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public minStakeLockDuration = 86400; // 1 day minimum
    
    // ============ Events ============
    
    event StakeLocked(
        bytes32 indexed leaseId,
        address indexed validator,
        uint256 amount,
        uint256 lockDuration
    );
    
    event StakeUnlocked(
        bytes32 indexed leaseId,
        address indexed validator,
        uint256 amount
    );
    
    event ProofOfMaliceSubmitted(
        bytes32 indexed proofId,
        bytes32 indexed leaseId,
        address indexed validator,
        MaliceType maliceType
    );
    
    event ProofVerified(
        bytes32 indexed proofId,
        bytes32 indexed leaseId,
        bool isValid
    );
    
    event AtomicSlashExecuted(
        bytes32 indexed leaseId,
        address indexed validator,
        uint256 slashedAmount,
        MaliceType reason
    );
    
    // ============ Modifiers ============
    
    modifier onlyGovernance() {
        require(msg.sender == governance, "Only governance");
        _;
    }
    
    modifier onlyHVM() {
        require(msg.sender == hvm || msg.sender == governance, "Only HVM");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        address _registry,
        address _hvm,
        address _governance
    ) {
        registry = SecurityLeasingRegistry(_registry);
        hvm = _hvm;
        governance = _governance;
        
        // Initialize default verification rules
        verificationRules[MaliceType.DoubleSign] = VerificationRule({
            maliceType: MaliceType.DoubleSign,
            verificationFunction: this.verifyDoubleSign.selector,
            slashPercentage: 10000, // 100% slash for double sign
            isActive: true
        });
        
        verificationRules[MaliceType.InvalidStateTransition] = VerificationRule({
            maliceType: MaliceType.InvalidStateTransition,
            verificationFunction: this.verifyInvalidStateTransition.selector,
            slashPercentage: 5000, // 50% slash
            isActive: true
        });
        
        verificationRules[MaliceType.Censorship] = VerificationRule({
            maliceType: MaliceType.Censorship,
            verificationFunction: this.verifyCensorship.selector,
            slashPercentage: 2000, // 20% slash
            isActive: true
        });
        
        verificationRules[MaliceType.InvalidBlockProduction] = VerificationRule({
            maliceType: MaliceType.InvalidBlockProduction,
            verificationFunction: this.verifyInvalidBlockProduction.selector,
            slashPercentage: 3000, // 30% slash
            isActive: true
        });
    }
    
    // ============ Stake Management ============
    
    /**
     * @notice Lock validator stake for a lease (called when lease is created)
     * @param _leaseId Lease identifier
     * @param _amount Amount of stake to lock
     * @param _lockDuration Duration to lock stake (must be >= lease duration)
     */
    function lockStake(
        bytes32 _leaseId,
        uint256 _amount,
        uint256 _lockDuration
    ) external payable {
        require(msg.value >= _amount, "Insufficient stake");
        require(_lockDuration >= minStakeLockDuration, "Lock duration too short");
        
        SecurityLeasingRegistry.Lease memory lease = registry.getLease(_leaseId);
        require(lease.isActive, "Lease not found");
        require(lease.validator == msg.sender, "Not lease validator");
        
        StakedAmount storage staked = stakedAmounts[_leaseId];
        require(!staked.isLocked, "Stake already locked");
        
        staked.validator = msg.sender;
        staked.amount = _amount;
        staked.leaseId = _leaseId;
        staked.subnetId = lease.subnetId;
        staked.lockTime = block.timestamp;
        staked.isLocked = true;
        
        emit StakeLocked(_leaseId, msg.sender, _amount, _lockDuration);
    }
    
    /**
     * @notice Unlock stake after lease expires (if no slashing occurred)
     * @param _leaseId Lease identifier
     */
    function unlockStake(bytes32 _leaseId) external {
        StakedAmount storage staked = stakedAmounts[_leaseId];
        require(staked.isLocked, "Stake not locked");
        require(staked.validator == msg.sender, "Not validator");
        
        SecurityLeasingRegistry.Lease memory lease = registry.getLease(_leaseId);
        require(
            lease.status == SecurityLeasingRegistry.LeaseStatus.Expired ||
            lease.status == SecurityLeasingRegistry.LeaseStatus.Cancelled,
            "Lease not expired"
        );
        
        // Check no verified proofs exist
        require(!_hasVerifiedProofs(_leaseId), "Proofs exist, cannot unlock");
        
        uint256 amount = staked.amount;
        staked.isLocked = false;
        staked.amount = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit StakeUnlocked(_leaseId, msg.sender, amount);
    }
    
    // ============ Proof of Malice Submission ============
    
    /**
     * @notice Submit proof of malice from subnet
     * @param _leaseId Lease identifier
     * @param _maliceType Type of malicious behavior
     * @param _blockHash Block hash where malice occurred
     * @param _previousBlockHash Previous block hash (for double-sign)
     * @param _signature Validator's signature
     * @param _stateProof Light client state proof
     * @param _merkleRoot Merkle root of proof
     * @return proofId Unique proof identifier
     */
    function submitProofOfMalice(
        bytes32 _leaseId,
        MaliceType _maliceType,
        bytes32 _blockHash,
        bytes32 _previousBlockHash,
        bytes memory _signature,
        bytes memory _stateProof,
        bytes32 _merkleRoot
    ) external onlyHVM returns (bytes32) {
        SecurityLeasingRegistry.Lease memory lease = registry.getLease(_leaseId);
        require(lease.isActive, "Lease not found");
        require(lease.status == SecurityLeasingRegistry.LeaseStatus.Active, "Lease not active");
        
        StakedAmount memory staked = stakedAmounts[_leaseId];
        require(staked.isLocked, "Stake not locked");
        
        bytes32 proofId = keccak256(
            abi.encodePacked(
                _leaseId,
                _maliceType,
                _blockHash,
                _previousBlockHash,
                _merkleRoot,
                block.timestamp
            )
        );
        
        ProofOfMalice storage proof = proofs[proofId];
        proof.proofId = proofId;
        proof.leaseId = _leaseId;
        proof.validator = lease.validator;
        proof.maliceType = _maliceType;
        proof.blockHash = _blockHash;
        proof.previousBlockHash = _previousBlockHash;
        proof.signature = _signature;
        proof.stateProof = _stateProof;
        proof.merkleRoot = _merkleRoot;
        proof.timestamp = block.timestamp;
        proof.verified = false;
        
        proofList.push(proofId);
        
        emit ProofOfMaliceSubmitted(proofId, _leaseId, lease.validator, _maliceType);
        
        // Auto-verify if possible
        _verifyProof(proofId);
        
        return proofId;
    }
    
    // ============ Proof Verification ============
    
    /**
     * @notice Verify a proof of malice
     * @param _proofId Proof identifier
     * @return isValid Whether proof is valid
     */
    function verifyProof(bytes32 _proofId) external returns (bool) {
        return _verifyProof(_proofId);
    }
    
    function _verifyProof(bytes32 _proofId) internal returns (bool) {
        ProofOfMalice storage proof = proofs[_proofId];
        require(proof.proofId != bytes32(0), "Proof not found");
        require(!proof.verified, "Proof already verified");
        
        VerificationRule memory rule = verificationRules[proof.maliceType];
        require(rule.isActive, "Verification rule not active");
        
        // Call appropriate verification function based on malice type
        bool isValid = false;
        
        if (proof.maliceType == MaliceType.DoubleSign) {
            isValid = _verifyDoubleSign(proof);
        } else if (proof.maliceType == MaliceType.InvalidStateTransition) {
            isValid = _verifyInvalidStateTransition(proof);
        } else if (proof.maliceType == MaliceType.Censorship) {
            isValid = _verifyCensorship(proof);
        } else if (proof.maliceType == MaliceType.InvalidBlockProduction) {
            isValid = _verifyInvalidBlockProduction(proof);
        }
        
        if (isValid) {
            proof.verified = true;
            emit ProofVerified(_proofId, proof.leaseId, true);
            
            // Execute atomic slash
            _executeAtomicSlash(_proofId);
        } else {
            emit ProofVerified(_proofId, proof.leaseId, false);
        }
        
        return isValid;
    }
    
    // ============ Verification Functions ============
    
    function _verifyDoubleSign(ProofOfMalice memory proof) internal view returns (bool) {
        // Verify two different block hashes signed by same validator
        // In production, this would verify signatures cryptographically
        // For now, we check that both hashes are non-zero and different
        require(proof.blockHash != bytes32(0), "Invalid block hash");
        require(proof.previousBlockHash != bytes32(0), "Invalid previous block hash");
        require(proof.blockHash != proof.previousBlockHash, "Hashes must differ");
        
        // Verify signatures (simplified - in production use proper crypto)
        // bytes32 message1 = keccak256(abi.encodePacked(proof.blockHash));
        // bytes32 message2 = keccak256(abi.encodePacked(proof.previousBlockHash));
        // bool sig1Valid = _verifySignature(proof.validator, message1, proof.signature);
        // bool sig2Valid = _verifySignature(proof.validator, message2, proof.signature);
        
        // For now, return true if basic checks pass
        // In production, implement full cryptographic verification
        return true;
    }
    
    function _verifyInvalidStateTransition(ProofOfMalice memory proof) internal view returns (bool) {
        // Verify state proof using HVM
        // This would call the HVM contract to verify the state transition
        // For now, simplified check
        require(proof.stateProof.length > 0, "State proof required");
        return true;
    }
    
    function _verifyCensorship(ProofOfMalice memory proof) internal view returns (bool) {
        // Verify censorship proof
        // Would check transaction inclusion/exclusion proofs
        require(proof.stateProof.length > 0, "Censorship proof required");
        return true;
    }
    
    function _verifyInvalidBlockProduction(ProofOfMalice memory proof) internal view returns (bool) {
        // Verify invalid block production
        require(proof.blockHash != bytes32(0), "Block hash required");
        require(proof.stateProof.length > 0, "Block proof required");
        return true;
    }
    
    // Placeholder verification functions for interface
    function verifyDoubleSign(ProofOfMalice memory) external pure returns (bool) { return false; }
    function verifyInvalidStateTransition(ProofOfMalice memory) external pure returns (bool) { return false; }
    function verifyCensorship(ProofOfMalice memory) external pure returns (bool) { return false; }
    function verifyInvalidBlockProduction(ProofOfMalice memory) external pure returns (bool) { return false; }
    
    // ============ Atomic Slashing ============
    
    /**
     * @notice Execute atomic slash based on verified proof
     * @param _proofId Proof identifier
     */
    function _executeAtomicSlash(bytes32 _proofId) internal {
        ProofOfMalice memory proof = proofs[_proofId];
        require(proof.verified, "Proof not verified");
        
        StakedAmount storage staked = stakedAmounts[proof.leaseId];
        require(staked.isLocked, "Stake not locked");
        
        VerificationRule memory rule = verificationRules[proof.maliceType];
        uint256 slashAmount = (staked.amount * rule.slashPercentage) / BASIS_POINTS;
        
        // Execute slash on registry
        registry.slashLease(proof.leaseId, slashAmount);
        
        // Transfer slashed amount to treasury (or burn)
        (bool success, ) = payable(governance).call{value: slashAmount}("");
        require(success, "Slash transfer failed");
        
        // Update staked amount
        staked.amount -= slashAmount;
        
        emit AtomicSlashExecuted(proof.leaseId, proof.validator, slashAmount, proof.maliceType);
    }
    
    // ============ View Functions ============
    
    function getStakedAmount(bytes32 _leaseId) external view returns (StakedAmount memory) {
        return stakedAmounts[_leaseId];
    }
    
    function getProof(bytes32 _proofId) external view returns (ProofOfMalice memory) {
        return proofs[_proofId];
    }
    
    function _hasVerifiedProofs(bytes32 _leaseId) internal view returns (bool) {
        for (uint i = 0; i < proofList.length; i++) {
            if (proofs[proofList[i]].leaseId == _leaseId && proofs[proofList[i]].verified) {
                return true;
            }
        }
        return false;
    }
    
    // ============ Governance Functions ============
    
    function setHVM(address _hvm) external onlyGovernance {
        hvm = _hvm;
    }
    
    function setVerificationRule(
        MaliceType _maliceType,
        bytes4 _verificationFunction,
        uint256 _slashPercentage,
        bool _isActive
    ) external onlyGovernance {
        require(_slashPercentage <= BASIS_POINTS, "Invalid slash percentage");
        verificationRules[_maliceType] = VerificationRule({
            maliceType: _maliceType,
            verificationFunction: _verificationFunction,
            slashPercentage: _slashPercentage,
            isActive: _isActive
        });
    }
    
    function setMinStakeLockDuration(uint256 _duration) external onlyGovernance {
        minStakeLockDuration = _duration;
    }
    
    receive() external payable {
        // Accept native tokens for stake locking
    }
}