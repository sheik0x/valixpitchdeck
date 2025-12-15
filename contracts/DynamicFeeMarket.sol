// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SecurityLeasingRegistry.sol";

/**
 * @title Dynamic Fee Market
 * @notice Market where subnets bid for Quality of Service (QoS) of leased security
 * @dev Creates sustainable economic model with direct revenue stream for validators
 * 
 * Groundbreaking Feature: Sustainable Economic Model
 * Creates a continuous, direct revenue stream for Main Chain validators,
 * aligning their financial incentive with securing the subnet ecosystem.
 */
contract DynamicFeeMarket {
    SecurityLeasingRegistry public registry;
    
    // ============ Structs ============
    
    struct QoSRequirement {
        uint256 minUptime;           // Minimum uptime percentage (basis points)
        uint256 maxLatency;          // Maximum latency in milliseconds
        uint256 minValidatorCount;   // Minimum number of validators
        uint256 securityLevel;       // Security level (1-10)
        uint256 geographicDiversity; // Required geographic diversity (basis points)
    }
    
    struct SecurityBid {
        bytes32 bidId;
        bytes32 subnetId;
        uint256 requiredStake;       // Total stake required
        uint256 duration;            // Lease duration
        QoSRequirement qos;          // QoS requirements
        address paymentToken;        // Subnet native token address
        uint256 bidPrice;            // Price per unit of stake per second
        address bidder;              // Subnet owner
        uint256 startTime;
        uint256 endTime;
        BidStatus status;
        uint256 matchedStake;        // Amount of stake matched
    }
    
    struct ValidatorOffer {
        bytes32 offerId;
        address validator;
        uint256 availableStake;     // Available stake to lease
        uint256 minPrice;            // Minimum price per unit per second
        uint256 maxDuration;         // Maximum lease duration
        QoSRequirement supportedQoS; // Supported QoS level
        uint256 startTime;
        uint256 endTime;
        OfferStatus status;
    }
    
    enum BidStatus {
        Active,
        Matched,
        Expired,
        Cancelled
    }
    
    enum OfferStatus {
        Active,
        Matched,
        Expired,
        Cancelled
    }
    
    struct Match {
        bytes32 matchId;
        bytes32 bidId;
        bytes32 offerId;
        bytes32 leaseId;
        uint256 matchedStake;
        uint256 price;
        uint256 timestamp;
    }
    
    // ============ State Variables ============
    
    mapping(bytes32 => SecurityBid) public bids;
    mapping(bytes32 => ValidatorOffer) public offers;
    mapping(bytes32 => Match) public matches;
    mapping(bytes32 => bytes32[]) public bidMatches; // bidId => matchIds
    mapping(bytes32 => bytes32[]) public offerMatches; // offerId => matchIds
    
    bytes32[] public bidList;
    bytes32[] public offerList;
    bytes32[] public matchList;
    
    address public governance;
    address public paymentRouter;    // Router for handling different payment tokens
    
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public minBidDuration = 86400; // 1 day
    uint256 public maxBidDuration = 31536000; // 1 year
    
    // ============ Events ============
    
    event SecurityBidCreated(
        bytes32 indexed bidId,
        bytes32 indexed subnetId,
        uint256 requiredStake,
        uint256 bidPrice
    );
    
    event ValidatorOfferCreated(
        bytes32 indexed offerId,
        address indexed validator,
        uint256 availableStake,
        uint256 minPrice
    );
    
    event MatchCreated(
        bytes32 indexed matchId,
        bytes32 indexed bidId,
        bytes32 indexed offerId,
        uint256 matchedStake,
        uint256 price
    );
    
    event BidMatched(
        bytes32 indexed bidId,
        bytes32 indexed leaseId,
        uint256 totalMatchedStake
    );
    
    event BidExpired(bytes32 indexed bidId);
    event OfferExpired(bytes32 indexed offerId);
    
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
    
    // ============ Bid Management ============
    
    /**
     * @notice Create a security bid from a subnet
     * @param _subnetId Subnet identifier
     * @param _requiredStake Total stake required
     * @param _duration Lease duration
     * @param _qos QoS requirements
     * @param _paymentToken Address of payment token (0x0 for native)
     * @param _bidPrice Price per unit of stake per second
     * @return bidId Unique bid identifier
     */
    function createSecurityBid(
        bytes32 _subnetId,
        uint256 _requiredStake,
        uint256 _duration,
        QoSRequirement memory _qos,
        address _paymentToken,
        uint256 _bidPrice
    ) external returns (bytes32) {
        require(_requiredStake > 0, "Stake must be > 0");
        require(_duration >= minBidDuration, "Duration too short");
        require(_duration <= maxBidDuration, "Duration too long");
        require(_bidPrice > 0, "Price must be > 0");
        
        // Verify subnet exists
        SecurityLeasingRegistry.Subnet memory subnet = registry.getSubnet(_subnetId);
        require(subnet.isActive, "Subnet not found");
        require(subnet.subnetOwner == msg.sender, "Not subnet owner");
        
        bytes32 bidId = keccak256(
            abi.encodePacked(
                _subnetId,
                _requiredStake,
                _duration,
                _bidPrice,
                block.timestamp,
                block.number
            )
        );
        
        SecurityBid storage bid = bids[bidId];
        bid.bidId = bidId;
        bid.subnetId = _subnetId;
        bid.requiredStake = _requiredStake;
        bid.duration = _duration;
        bid.qos = _qos;
        bid.paymentToken = _paymentToken;
        bid.bidPrice = _bidPrice;
        bid.bidder = msg.sender;
        bid.startTime = block.timestamp;
        bid.endTime = block.timestamp + _duration;
        bid.status = BidStatus.Active;
        bid.matchedStake = 0;
        
        bidList.push(bidId);
        
        emit SecurityBidCreated(bidId, _subnetId, _requiredStake, _bidPrice);
        
        // Try to match immediately
        _tryMatchBid(bidId);
        
        return bidId;
    }
    
    /**
     * @notice Cancel a security bid
     * @param _bidId Bid identifier
     */
    function cancelBid(bytes32 _bidId) external {
        SecurityBid storage bid = bids[_bidId];
        require(bid.bidder == msg.sender, "Not bidder");
        require(bid.status == BidStatus.Active, "Bid not active");
        
        bid.status = BidStatus.Cancelled;
    }
    
    // ============ Offer Management ============
    
    /**
     * @notice Create a validator offer
     * @param _availableStake Available stake to lease
     * @param _minPrice Minimum price per unit per second
     * @param _maxDuration Maximum lease duration
     * @param _supportedQoS Supported QoS level
     * @return offerId Unique offer identifier
     */
    function createValidatorOffer(
        uint256 _availableStake,
        uint256 _minPrice,
        uint256 _maxDuration,
        QoSRequirement memory _supportedQoS
    ) external returns (bytes32) {
        require(_availableStake > 0, "Stake must be > 0");
        require(_minPrice > 0, "Price must be > 0");
        
        // Verify validator is registered
        SecurityLeasingRegistry.Validator memory validator = registry.getValidator(msg.sender);
        require(validator.isActive, "Validator not registered");
        require(_availableStake <= validator.availableStake, "Exceeds available stake");
        
        bytes32 offerId = keccak256(
            abi.encodePacked(
                msg.sender,
                _availableStake,
                _minPrice,
                _maxDuration,
                block.timestamp
            )
        );
        
        ValidatorOffer storage offer = offers[offerId];
        offer.offerId = offerId;
        offer.validator = msg.sender;
        offer.availableStake = _availableStake;
        offer.minPrice = _minPrice;
        offer.maxDuration = _maxDuration;
        offer.supportedQoS = _supportedQoS;
        offer.startTime = block.timestamp;
        offer.endTime = block.timestamp + 30 days; // Offer expires in 30 days
        offer.status = OfferStatus.Active;
        
        offerList.push(offerId);
        
        emit ValidatorOfferCreated(offerId, msg.sender, _availableStake, _minPrice);
        
        // Try to match with active bids
        _tryMatchOffers(offerId);
        
        return offerId;
    }
    
    /**
     * @notice Cancel a validator offer
     * @param _offerId Offer identifier
     */
    function cancelOffer(bytes32 _offerId) external {
        ValidatorOffer storage offer = offers[_offerId];
        require(offer.validator == msg.sender, "Not validator");
        require(offer.status == OfferStatus.Active, "Offer not active");
        
        offer.status = OfferStatus.Cancelled;
    }
    
    // ============ Matching Logic ============
    
    /**
     * @notice Try to match a bid with available offers
     * @param _bidId Bid identifier
     */
    function _tryMatchBid(bytes32 _bidId) internal {
        SecurityBid storage bid = bids[_bidId];
        if (bid.status != BidStatus.Active) return;
        if (bid.matchedStake >= bid.requiredStake) return;
        
        uint256 remainingStake = bid.requiredStake - bid.matchedStake;
        
        // Find matching offers
        for (uint i = 0; i < offerList.length; i++) {
            if (remainingStake == 0) break;
            
            bytes32 offerId = offerList[i];
            ValidatorOffer memory offer = offers[offerId];
            
            if (offer.status != OfferStatus.Active) continue;
            if (offer.minPrice > bid.bidPrice) continue; // Price mismatch
            if (offer.maxDuration < bid.duration) continue; // Duration mismatch
            if (!_qosCompatible(offer.supportedQoS, bid.qos)) continue; // QoS mismatch
            
            uint256 matchAmount = remainingStake < offer.availableStake 
                ? remainingStake 
                : offer.availableStake;
            
            _createMatch(_bidId, offerId, matchAmount, bid.bidPrice);
            
            remainingStake -= matchAmount;
            bid.matchedStake += matchAmount;
        }
        
        // Check if bid is fully matched
        if (bid.matchedStake >= bid.requiredStake) {
            bid.status = BidStatus.Matched;
            _finalizeBid(_bidId);
        }
    }
    
    /**
     * @notice Try to match an offer with active bids
     * @param _offerId Offer identifier
     */
    function _tryMatchOffers(bytes32 _offerId) internal {
        ValidatorOffer memory offer = offers[_offerId];
        if (offer.status != OfferStatus.Active) return;
        
        for (uint i = 0; i < bidList.length; i++) {
            bytes32 bidId = bidList[i];
            SecurityBid storage bid = bids[bidId];
            
            if (bid.status != BidStatus.Active) continue;
            if (bid.bidPrice < offer.minPrice) continue;
            if (bid.duration > offer.maxDuration) continue;
            if (!_qosCompatible(offer.supportedQoS, bid.qos)) continue;
            
            uint256 remainingStake = bid.requiredStake - bid.matchedStake;
            if (remainingStake == 0) continue;
            
            uint256 matchAmount = remainingStake < offer.availableStake 
                ? remainingStake 
                : offer.availableStake;
            
            _createMatch(bidId, _offerId, matchAmount, bid.bidPrice);
            
            bid.matchedStake += matchAmount;
            if (bid.matchedStake >= bid.requiredStake) {
                bid.status = BidStatus.Matched;
                _finalizeBid(bidId);
            }
        }
    }
    
    /**
     * @notice Create a match between bid and offer
     */
    function _createMatch(
        bytes32 _bidId,
        bytes32 _offerId,
        uint256 _matchedStake,
        uint256 _price
    ) internal {
        bytes32 matchId = keccak256(
            abi.encodePacked(_bidId, _offerId, _matchedStake, block.timestamp)
        );
        
        Match storage match_ = matches[matchId];
        match_.matchId = matchId;
        match_.bidId = _bidId;
        match_.offerId = _offerId;
        match_.matchedStake = _matchedStake;
        match_.price = _price;
        match_.timestamp = block.timestamp;
        
        matchList.push(matchId);
        bidMatches[_bidId].push(matchId);
        offerMatches[_offerId].push(matchId);
        
        emit MatchCreated(matchId, _bidId, _offerId, _matchedStake, _price);
    }
    
    /**
     * @notice Finalize a bid and create leases
     */
    function _finalizeBid(bytes32 _bidId) internal {
        SecurityBid memory bid = bids[_bidId];
        bytes32[] memory matchIds = bidMatches[_bidId];
        
        for (uint i = 0; i < matchIds.length; i++) {
            Match memory match_ = matches[matchIds[i]];
            ValidatorOffer memory offer = offers[match_.offerId];
            
            // Create lease via registry
            // In production, this would call registry.createLease()
            // For now, we emit an event
            emit BidMatched(_bidId, bytes32(0), match_.matchedStake);
        }
    }
    
    /**
     * @notice Check if QoS requirements are compatible
     */
    function _qosCompatible(
        QoSRequirement memory _supported,
        QoSRequirement memory _required
    ) internal pure returns (bool) {
        return (
            _supported.minUptime >= _required.minUptime &&
            _supported.maxLatency <= _required.maxLatency &&
            _supported.minValidatorCount >= _required.minValidatorCount &&
            _supported.securityLevel >= _required.securityLevel
        );
    }
    
    // ============ View Functions ============
    
    function getBid(bytes32 _bidId) external view returns (SecurityBid memory) {
        return bids[_bidId];
    }
    
    function getOffer(bytes32 _offerId) external view returns (ValidatorOffer memory) {
        return offers[_offerId];
    }
    
    function getMatch(bytes32 _matchId) external view returns (Match memory) {
        return matches[_matchId];
    }
    
    function getBidMatches(bytes32 _bidId) external view returns (bytes32[] memory) {
        return bidMatches[_bidId];
    }
    
    // ============ Governance Functions ============
    
    function setBidDurationLimits(
        uint256 _min,
        uint256 _max
    ) external onlyGovernance {
        minBidDuration = _min;
        maxBidDuration = _max;
    }
    
    function setPaymentRouter(address _router) external onlyGovernance {
        paymentRouter = _router;
    }
}