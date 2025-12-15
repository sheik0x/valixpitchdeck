// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Governance
 * @notice Governance contract for Security Leasing Protocol
 * @dev Handles protocol upgrades, parameter changes, and emergency controls
 */
contract Governance {
    // ============ Structs ============
    
    struct Proposal {
        uint256 proposalId;
        address proposer;
        string description;
        bytes callData;
        address target;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        ProposalStatus status;
    }
    
    enum ProposalStatus {
        Pending,
        Active,
        Succeeded,
        Defeated,
        Executed,
        Cancelled
    }
    
    struct Vote {
        bool support;
        uint256 weight;
        bool hasVoted;
    }
    
    // ============ State Variables ============
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(address => bool) public governors;
    mapping(address => uint256) public votingPower;
    
    uint256 public proposalCount;
    uint256 public votingPeriod = 3 days;
    uint256 public quorumThreshold = 1000; // basis points (10%)
    uint256 public majorityThreshold = 5000; // basis points (50%)
    
    address public emergencyPause;
    bool public paused;
    
    // ============ Events ============
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string description
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );
    
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);
    
    event GovernorAdded(address indexed governor);
    event GovernorRemoved(address indexed governor);
    event VotingPowerUpdated(address indexed governor, uint256 newPower);
    
    // ============ Modifiers ============
    
    modifier onlyGovernor() {
        require(governors[msg.sender], "Not a governor");
        _;
    }
    
    modifier onlyEmergencyPause() {
        require(msg.sender == emergencyPause, "Not emergency pause");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address[] memory _initialGovernors, address _emergencyPause) {
        for (uint i = 0; i < _initialGovernors.length; i++) {
            governors[_initialGovernors[i]] = true;
            votingPower[_initialGovernors[i]] = 1; // Equal voting power initially
            emit GovernorAdded(_initialGovernors[i]);
        }
        emergencyPause = _emergencyPause;
    }
    
    // ============ Proposal Functions ============
    
    /**
     * @notice Create a new proposal
     * @param _description Description of the proposal
     * @param _target Target contract address
     * @param _callData Calldata for the proposal execution
     */
    function createProposal(
        string memory _description,
        address _target,
        bytes memory _callData
    ) external onlyGovernor whenNotPaused returns (uint256) {
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.proposalId = proposalId;
        proposal.proposer = msg.sender;
        proposal.description = _description;
        proposal.target = _target;
        proposal.callData = _callData;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + votingPeriod;
        proposal.status = ProposalStatus.Active;
        
        emit ProposalCreated(proposalId, msg.sender, _description);
        
        return proposalId;
    }
    
    /**
     * @notice Vote on a proposal
     * @param _proposalId Proposal identifier
     * @param _support True for yes, false for no
     */
    function vote(uint256 _proposalId, bool _support) external onlyGovernor {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(block.timestamp < proposal.endTime, "Voting ended");
        
        Vote storage voteData = votes[_proposalId][msg.sender];
        require(!voteData.hasVoted, "Already voted");
        
        uint256 power = votingPower[msg.sender];
        voteData.support = _support;
        voteData.weight = power;
        voteData.hasVoted = true;
        
        if (_support) {
            proposal.forVotes += power;
        } else {
            proposal.againstVotes += power;
        }
        
        emit VoteCast(_proposalId, msg.sender, _support, power);
    }
    
    /**
     * @notice Execute a successful proposal
     * @param _proposalId Proposal identifier
     */
    function executeProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(block.timestamp >= proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        
        // Check quorum
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        uint256 totalPower = _getTotalVotingPower();
        require(
            (totalVotes * 10000) / totalPower >= quorumThreshold,
            "Quorum not met"
        );
        
        // Check majority
        if (proposal.forVotes > proposal.againstVotes) {
            proposal.status = ProposalStatus.Succeeded;
            
            // Execute proposal
            (bool success, ) = proposal.target.call(proposal.callData);
            require(success, "Execution failed");
            
            proposal.executed = true;
            proposal.status = ProposalStatus.Executed;
            
            emit ProposalExecuted(_proposalId);
        } else {
            proposal.status = ProposalStatus.Defeated;
        }
    }
    
    /**
     * @notice Cancel a proposal (only proposer or emergency)
     */
    function cancelProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        require(
            msg.sender == proposal.proposer || msg.sender == emergencyPause,
            "Not authorized"
        );
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        
        proposal.status = ProposalStatus.Cancelled;
        
        emit ProposalCancelled(_proposalId);
    }
    
    // ============ Governance Functions ============
    
    /**
     * @notice Add a new governor
     * @param _governor Address of new governor
     * @param _votingPower Voting power to assign
     */
    function addGovernor(address _governor, uint256 _votingPower) external onlyGovernor {
        require(_governor != address(0), "Invalid governor");
        require(!governors[_governor], "Already a governor");
        
        governors[_governor] = true;
        votingPower[_governor] = _votingPower;
        
        emit GovernorAdded(_governor);
        emit VotingPowerUpdated(_governor, _votingPower);
    }
    
    /**
     * @notice Remove a governor
     * @param _governor Address of governor to remove
     */
    function removeGovernor(address _governor) external onlyGovernor {
        require(governors[_governor], "Not a governor");
        
        governors[_governor] = false;
        votingPower[_governor] = 0;
        
        emit GovernorRemoved(_governor);
        emit VotingPowerUpdated(_governor, 0);
    }
    
    /**
     * @notice Update voting power
     * @param _governor Governor address
     * @param _newPower New voting power
     */
    function updateVotingPower(address _governor, uint256 _newPower) external onlyGovernor {
        require(governors[_governor], "Not a governor");
        
        votingPower[_governor] = _newPower;
        
        emit VotingPowerUpdated(_governor, _newPower);
    }
    
    /**
     * @notice Update protocol parameters
     */
    function setVotingPeriod(uint256 _newPeriod) external onlyGovernor {
        votingPeriod = _newPeriod;
    }
    
    function setQuorumThreshold(uint256 _newThreshold) external onlyGovernor {
        require(_newThreshold <= 10000, "Invalid threshold");
        quorumThreshold = _newThreshold;
    }
    
    // ============ Emergency Functions ============
    
    /**
     * @notice Pause the protocol (emergency only)
     */
    function pause() external onlyEmergencyPause {
        paused = true;
    }
    
    /**
     * @notice Unpause the protocol
     */
    function unpause() external onlyEmergencyPause {
        paused = false;
    }
    
    // ============ View Functions ============
    
    function getProposal(uint256 _proposalId) external view returns (Proposal memory) {
        return proposals[_proposalId];
    }
    
    function getVote(uint256 _proposalId, address _voter) external view returns (Vote memory) {
        return votes[_proposalId][_voter];
    }
    
    function _getTotalVotingPower() internal view returns (uint256) {
        uint256 total = 0;
        // In production, maintain a running total or iterate through governors
        // For simplicity, we'll use a fixed approach
        return total;
    }
}