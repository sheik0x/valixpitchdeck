// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Heterogeneous Verification Module (HVM)
 * @notice Standardized interface for verifying state proofs from different VM types
 * @dev Enables support for EVM, Move VM, Cosmos SDK, and custom VMs
 * 
 * Groundbreaking Feature: Generalized Interoperability
 * Moves beyond only supporting homogeneous subnets to truly heterogeneous chains.
 */
contract HeterogeneousVerificationModule {
    // ============ Structs ============
    
    struct StateProof {
        bytes32 proofId;
        bytes32 subnetId;
        VMType vmType;
        bytes32 stateRoot;           // State root being proven
        bytes32 previousStateRoot;    // Previous state root
        bytes32 blockHash;
        uint256 blockNumber;
        bytes proofData;             // VM-specific proof data
        bytes32 merkleRoot;          // Merkle root of proof
        bool verified;
    }
    
    struct LightClientHeader {
        bytes32 blockHash;
        bytes32 stateRoot;
        bytes32 previousBlockHash;
        uint256 blockNumber;
        uint256 timestamp;
        bytes validatorSetHash;      // Hash of validator set
    }
    
    enum VMType {
        EVM,
        MoveVM,
        CosmosSDK,
        Substrate,
        Custom
    }
    
    // ============ State Variables ============
    
    mapping(bytes32 => StateProof) public stateProofs;
    mapping(bytes32 => LightClientHeader) public lightClientHeaders; // subnetId => latest header
    mapping(bytes32 => mapping(VMType => address)) public verifiers; // subnetId => vmType => verifier
    
    bytes32[] public proofList;
    
    address public governance;
    
    // ============ Events ============
    
    event StateProofSubmitted(
        bytes32 indexed proofId,
        bytes32 indexed subnetId,
        VMType vmType,
        bytes32 stateRoot
    );
    
    event StateProofVerified(
        bytes32 indexed proofId,
        bytes32 indexed subnetId,
        bool isValid
    );
    
    event LightClientHeaderUpdated(
        bytes32 indexed subnetId,
        bytes32 blockHash,
        uint256 blockNumber
    );
    
    event VerifierRegistered(
        bytes32 indexed subnetId,
        VMType vmType,
        address verifier
    );
    
    // ============ Modifiers ============
    
    modifier onlyGovernance() {
        require(msg.sender == governance, "Only governance");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _governance) {
        governance = _governance;
    }
    
    // ============ Verifier Registration ============
    
    /**
     * @notice Register a verifier contract for a specific subnet and VM type
     * @param _subnetId Subnet identifier
     * @param _vmType VM type
     * @param _verifier Address of verifier contract
     */
    function registerVerifier(
        bytes32 _subnetId,
        VMType _vmType,
        address _verifier
    ) external onlyGovernance {
        require(_verifier != address(0), "Invalid verifier");
        verifiers[_subnetId][_vmType] = _verifier;
        
        emit VerifierRegistered(_subnetId, _vmType, _verifier);
    }
    
    // ============ Light Client Header Management ============
    
    /**
     * @notice Update light client header for a subnet
     * @param _subnetId Subnet identifier
     * @param _header Light client header
     */
    function updateLightClientHeader(
        bytes32 _subnetId,
        LightClientHeader memory _header
    ) external onlyGovernance {
        LightClientHeader storage stored = lightClientHeaders[_subnetId];
        
        // Verify header is newer
        if (stored.blockNumber > 0) {
            require(_header.blockNumber > stored.blockNumber, "Header not newer");
            require(_header.previousBlockHash == stored.blockHash, "Invalid chain");
        }
        
        lightClientHeaders[_subnetId] = _header;
        
        emit LightClientHeaderUpdated(_subnetId, _header.blockHash, _header.blockNumber);
    }
    
    // ============ State Proof Submission ============
    
    /**
     * @notice Submit a state proof from a subnet
     * @param _subnetId Subnet identifier
     * @param _vmType VM type
     * @param _stateRoot State root being proven
     * @param _previousStateRoot Previous state root
     * @param _blockHash Block hash
     * @param _blockNumber Block number
     * @param _proofData VM-specific proof data
     * @param _merkleRoot Merkle root of proof
     * @return proofId Unique proof identifier
     */
    function submitStateProof(
        bytes32 _subnetId,
        VMType _vmType,
        bytes32 _stateRoot,
        bytes32 _previousStateRoot,
        bytes32 _blockHash,
        uint256 _blockNumber,
        bytes memory _proofData,
        bytes32 _merkleRoot
    ) external returns (bytes32) {
        bytes32 proofId = keccak256(
            abi.encodePacked(
                _subnetId,
                _vmType,
                _stateRoot,
                _blockHash,
                _blockNumber,
                _merkleRoot,
                block.timestamp
            )
        );
        
        StateProof storage proof = stateProofs[proofId];
        proof.proofId = proofId;
        proof.subnetId = _subnetId;
        proof.vmType = _vmType;
        proof.stateRoot = _stateRoot;
        proof.previousStateRoot = _previousStateRoot;
        proof.blockHash = _blockHash;
        proof.blockNumber = _blockNumber;
        proof.proofData = _proofData;
        proof.merkleRoot = _merkleRoot;
        proof.verified = false;
        
        proofList.push(proofId);
        
        emit StateProofSubmitted(proofId, _subnetId, _vmType, _stateRoot);
        
        // Auto-verify if verifier is registered
        _verifyStateProof(proofId);
        
        return proofId;
    }
    
    // ============ State Proof Verification ============
    
    /**
     * @notice Verify a state proof using the appropriate verifier
     * @param _proofId Proof identifier
     * @return isValid Whether proof is valid
     */
    function verifyStateProof(bytes32 _proofId) external returns (bool) {
        return _verifyStateProof(_proofId);
    }
    
    function _verifyStateProof(bytes32 _proofId) internal returns (bool) {
        StateProof storage proof = stateProofs[_proofId];
        require(proof.proofId != bytes32(0), "Proof not found");
        require(!proof.verified, "Proof already verified");
        
        address verifier = verifiers[proof.subnetId][proof.vmType];
        require(verifier != address(0), "Verifier not registered");
        
        // Call verifier contract
        // In production, use interface call
        // IVerifier(verifier).verify(proof);
        
        // For now, simplified verification
        // Check that state root matches light client header
        LightClientHeader memory header = lightClientHeaders[proof.subnetId];
        if (header.blockNumber > 0 && header.blockNumber >= proof.blockNumber) {
            // Verify state root matches
            bool isValid = (proof.stateRoot == header.stateRoot || 
                          proof.blockHash == header.blockHash);
            
            if (isValid) {
                proof.verified = true;
                emit StateProofVerified(_proofId, proof.subnetId, true);
            } else {
                emit StateProofVerified(_proofId, proof.subnetId, false);
            }
            
            return isValid;
        }
        
        return false;
    }
    
    // ============ VM-Specific Verification Interfaces ============
    
    /**
     * @notice Verify EVM state proof
     * @dev Calls EVM-specific verifier
     */
    function verifyEVMProof(
        bytes32 _stateRoot,
        bytes memory _proofData
    ) external view returns (bool) {
        // In production, implement EVM-specific verification
        // Would verify Merkle Patricia Trie proofs
        return _proofData.length > 0;
    }
    
    /**
     * @notice Verify Move VM state proof
     * @dev Calls Move-specific verifier
     */
    function verifyMoveVMProof(
        bytes32 _stateRoot,
        bytes memory _proofData
    ) external view returns (bool) {
        // In production, implement Move-specific verification
        return _proofData.length > 0;
    }
    
    /**
     * @notice Verify Cosmos SDK state proof
     * @dev Calls Cosmos-specific verifier (IBC)
     */
    function verifyCosmosSDKProof(
        bytes32 _stateRoot,
        bytes memory _proofData
    ) external view returns (bool) {
        // In production, implement Cosmos/IBC verification
        return _proofData.length > 0;
    }
    
    /**
     * @notice Verify Substrate state proof
     * @dev Calls Substrate-specific verifier
     */
    function verifySubstrateProof(
        bytes32 _stateRoot,
        bytes memory _proofData
    ) external view returns (bool) {
        // In production, implement Substrate-specific verification
        return _proofData.length > 0;
    }
    
    // ============ View Functions ============
    
    function getStateProof(bytes32 _proofId) external view returns (StateProof memory) {
        return stateProofs[_proofId];
    }
    
    function getLightClientHeader(bytes32 _subnetId) external view returns (LightClientHeader memory) {
        return lightClientHeaders[_subnetId];
    }
    
    function getVerifier(bytes32 _subnetId, VMType _vmType) external view returns (address) {
        return verifiers[_subnetId][_vmType];
    }
}

/**
 * @title IVerifier
 * @notice Interface for VM-specific verifiers
 */
interface IVerifier {
    function verify(
        bytes32 stateRoot,
        bytes32 previousStateRoot,
        bytes32 blockHash,
        uint256 blockNumber,
        bytes memory proofData,
        bytes32 merkleRoot
    ) external view returns (bool);
}