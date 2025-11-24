# Private Marketplace Architecture

## Overview

This document describes the architecture of a privacy-preserving marketplace built with Fully Homomorphic Encryption (FHE) using the FHEVM framework. The system enables confidential transactions while maintaining auditability and user protection.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Gateway Callback Pattern](#gateway-callback-pattern)
3. [Key Components](#key-components)
4. [Privacy Mechanisms](#privacy-mechanisms)
5. [Security Features](#security-features)
6. [Gas Optimization](#gas-optimization)
7. [User Flows](#user-flows)

---

## System Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                   (Web3 Frontend / DApp)                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Encrypted Inputs
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Smart Contract Layer                         │
│                  (PrivateMarketplace.sol)                       │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Product    │  │    Order     │  │   Refund     │        │
│  │  Management  │  │  Processing  │  │  Mechanism   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Decryption Request
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Gateway Layer                            │
│                  (FHEVM Gateway/KMS)                           │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Decryption  │  │  Signature   │  │   Callback   │        │
│  │   Oracle     │  │  Validation  │  │   Relayer    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Callback with Decrypted Data
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Blockchain State                            │
│               (Order Confirmed / Refunded)                      │
└─────────────────────────────────────────────────────────────────┘
```

### Component Interaction

```
User → Encrypt Data → Submit to Contract → Store Encrypted State
                                          ↓
                              Request Gateway Decryption
                                          ↓
Gateway → Decrypt → Sign → Callback Contract → Process Transaction
                                          ↓
                           Update State / Process Payment / Emit Events
```

---

## Gateway Callback Pattern

### Overview

The Gateway callback pattern is an asynchronous architecture for handling encrypted data:

**Flow:**
1. **User Submits** encrypted request to contract
2. **Contract Records** order and emits decryption request
3. **Gateway Processes** decryption off-chain
4. **Callback Completes** transaction with decrypted values

### Implementation

```solidity
// Step 1: User creates order with encrypted data
function createOrder(
    uint256 _productId,
    externalEuint64 _encryptedQuantity,
    bytes calldata _inputProof
) external payable {
    // Validate and store encrypted order
    euint64 quantity = FHE.fromExternal(_encryptedQuantity, _inputProof);

    // Store order in Pending state
    orders[nextOrderId] = Order({...});

    // Automatically request decryption
    _requestDecryption(nextOrderId);
}

// Step 2: Request Gateway decryption
function _requestDecryption(uint256 _orderId) private {
    bytes32[] memory cts = new bytes32[](2);
    cts[0] = FHE.toBytes32(order.encryptedQuantity);
    cts[1] = FHE.toBytes32(order.encryptedTotalPrice);

    // Gateway will call fulfillOrderCallback when ready
    uint256 requestId = FHE.requestDecryption(cts, this.fulfillOrderCallback.selector);

    order.status = OrderStatus.DecryptionRequested;
}

// Step 3: Gateway calls back with decrypted data
function fulfillOrderCallback(
    uint256 _requestId,
    bytes memory _cleartexts,
    bytes memory _decryptionProof
) external onlyAuthorized {
    // Verify Gateway signatures
    FHE.checkSignatures(_requestId, _cleartexts, _decryptionProof);

    // Decode and process
    (uint64 quantity, uint64 price) = abi.decode(_cleartexts, (uint64, uint64));

    // Complete transaction or refund
    _processOrder(orderId, quantity, price);
}
```

### Benefits

- **Async Processing**: No blocking on-chain computation
- **Privacy Preservation**: Only authorized Gateway can decrypt
- **Fail-Safe**: Automatic refunds on decryption failure
- **Gas Efficient**: Complex decryption happens off-chain

---

## Key Components

### 1. Product Management

**Purpose**: Create and manage products with encrypted pricing

**Key Features:**
- Encrypted prices using `euint64`
- Random multipliers for division protection
- IPFS metadata storage
- ACL permissions for data access

**Example:**
```solidity
struct Product {
    uint256 productId;
    address seller;
    euint64 encryptedPrice;        // Private price
    euint64 priceMultiplier;       // For division privacy
    euint32 stock;
    bool isActive;
    string metadataHash;           // IPFS link
}
```

### 2. Order Processing

**Purpose**: Handle order lifecycle with privacy and timeout protection

**Order States:**
- `Pending`: Initial state after creation
- `DecryptionRequested`: Waiting for Gateway
- `Confirmed`: Successfully processed
- `Failed`: Decryption or validation failed
- `Refunded`: Funds returned to buyer
- `TimedOut`: Exceeded timeout deadline

**Timeout Protection:**
```solidity
// 24-hour default timeout
uint256 public constant DECRYPTION_TIMEOUT = 24 hours;

// User can extend timeout if needed
function extendTimeout(uint256 _orderId, uint256 _extensionSeconds) external {
    order.timeoutDeadline += _extensionSeconds;
}

// Request refund after timeout
function requestTimeoutRefund(uint256 _orderId) external {
    require(block.timestamp > order.timeoutDeadline, "Timeout not reached");
    // Process refund
}
```

### 3. Refund Mechanism

**Purpose**: Protect users from failed transactions and Gateway delays

**Refund Triggers:**
- Invalid decrypted values
- Insufficient payment
- Out of stock
- Timeout exceeded

**Implementation:**
```solidity
function _handleOrderFailure(uint256 _orderId, string memory _reason) private {
    order.status = OrderStatus.Failed;

    // Store pending refund (prevents reentrancy)
    pendingRefunds[order.buyer] += msg.value;

    emit RefundInitiated(_orderId, order.buyer, msg.value);
}

// Separate refund claim (reentrancy protection)
function claimRefund() external nonReentrant {
    uint256 amount = pendingRefunds[msg.sender];
    pendingRefunds[msg.sender] = 0;

    (bool sent, ) = payable(msg.sender).call{value: amount}("");
    require(sent, "Refund failed");
}
```

---

## Privacy Mechanisms

### 1. Division Problem Solution

**Challenge**: Traditional FHE division can leak information through patterns

**Solution**: Random multiplier technique

```solidity
// Problem: price / quantity reveals price pattern
// Solution: (price * random) / (quantity * random) preserves privacy

function computePrivateDivision(
    euint64 _numerator,
    euint64 _denominator,
    euint64 _multiplier
) public returns (euint64) {
    euint64 scaledNum = FHE.mul(_numerator, _multiplier);
    euint64 scaledDenom = FHE.mul(_denominator, _multiplier);
    return FHE.div(scaledNum, scaledDenom);
}
```

**Multiplier Generation:**
```solidity
function _generateRandomMultiplier(uint256 _salt) private view returns (uint64) {
    uint256 random = uint256(keccak256(abi.encodePacked(
        block.timestamp,
        block.prevrandao,
        _salt,
        msg.sender
    )));

    // Range: 100-1000
    return uint64((random % 900) + 100);
}
```

### 2. Price Obfuscation

**Challenge**: Prevent exact price inference through timing or patterns

**Solution**: Add encrypted noise to prices

```solidity
function _addPriceNoise(euint64 _price, uint256 _salt) private view returns (euint64) {
    uint64 noise = _generateRandomMultiplier(_salt) % 100; // 0-99
    euint64 encryptedNoise = FHE.asEuint64(noise);

    // Add noise to obfuscate exact price
    return FHE.add(_price, encryptedNoise);
}
```

### 3. Access Control Lists (ACL)

**Purpose**: Control who can access encrypted data

```solidity
// Allow contract to operate on encrypted data
FHE.allowThis(encryptedPrice);

// Allow user to view their encrypted data
FHE.allow(encryptedPrice, msg.sender);

// Allow Gateway to decrypt (implicit in requestDecryption)
```

---

## Security Features

### 1. Input Validation

**All user inputs are validated before processing:**

```solidity
// Validate product creation
require(_price > 0, "Price must be positive");
require(_stock > 0, "Stock must be positive");
require(bytes(_metadataHash).length > 0, "Metadata required");

// Validate order creation
require(msg.value > 0, "Payment required");
require(product.seller != msg.sender, "Cannot buy own product");

// Validate encrypted input with proof
euint64 quantity = FHE.fromExternal(_encryptedQuantity, _inputProof);
```

### 2. Access Control (RBAC)

**Role-based permissions:**

```solidity
// Owner-only functions
modifier onlyOwner() {
    require(msg.sender == owner, "Not authorized: owner only");
    _;
}

// Authorized operators (Gateway)
modifier onlyAuthorized() {
    require(msg.sender == owner || authorizedOperators[msg.sender], "Not authorized");
    _;
}

// Seller-only functions
require(msg.sender == product.seller, "Not the seller");
```

### 3. Overflow Protection

**Safe arithmetic operations:**

```solidity
function safeMul(euint64 _a, euint64 _b) public returns (euint64) {
    euint64 result = FHE.mul(_a, _b);

    // Check for overflow
    ebool noOverflow = FHE.ge(result, _a);

    // Return max value if overflow
    euint64 maxValue = FHE.asEuint64(type(uint64).max);
    return FHE.select(noOverflow, result, maxValue);
}
```

### 4. Reentrancy Protection

**Guards on payment functions:**

```solidity
modifier nonReentrant() {
    require(!paused, "Reentrant call detected");
    paused = true;
    _;
    paused = false;
}

function claimRefund() external nonReentrant {
    // Safe from reentrancy attacks
}
```

### 5. Emergency Pause

**Circuit breaker for critical issues:**

```solidity
modifier whenNotPaused() {
    require(!paused, "Contract is paused");
    _;
}

function setPaused(bool _paused) external onlyOwner {
    paused = _paused;
    emit EmergencyPause(_paused);
}
```

### 6. Audit Trail

**Immutable logging for compliance:**

```solidity
function _addAuditLog(uint256 _orderId, string memory _action) private {
    string memory logEntry = string(abi.encodePacked(
        _action,
        " at ",
        _uint2str(block.timestamp)
    ));

    orderAuditLog[_orderId] = logEntry;
    emit AuditLogEntry(_orderId, _action, block.timestamp);
}
```

---

## Gas Optimization

### 1. HCU Management

**Homomorphic Computation Units (HCU)** are the cost measure for FHE operations.

**Best Practices:**
- Batch operations when possible
- Use appropriate encrypted types (euint16 vs euint64)
- Minimize decryption requests
- Cache computed values

```solidity
// Limit HCU per operation
uint256 public constant MAX_HCU_PER_OPERATION = 100000;

// Use smaller types when possible
euint16 encryptedAge;    // Instead of euint64 for age
euint32 seatNumber;      // Instead of euint64 for seats
```

### 2. Storage Optimization

**Minimize storage writes:**

```solidity
// Pack related values
struct Order {
    uint256 orderId;          // Single slot
    uint256 productId;        // Single slot
    address buyer;            // 20 bytes
    address seller;           // 20 bytes (share slot)
    // ...
}
```

### 3. Event Efficiency

**Use indexed parameters for filtering:**

```solidity
event OrderCreated(
    uint256 indexed orderId,    // Filterable
    uint256 indexed productId,  // Filterable
    address indexed buyer       // Filterable
);
```

---

## User Flows

### Flow 1: Create Product

```
Seller
  │
  ├─> Prepare product data (price, stock, metadata)
  │
  ├─> Call createProduct(price, stock, metadataHash)
  │
  └─> Contract encrypts price and stores product
       │
       └─> Emit ProductCreated event
```

### Flow 2: Create Order (Happy Path)

```
Buyer
  │
  ├─> Browse products (view metadata via IPFS)
  │
  ├─> Encrypt desired quantity with fhevmjs
  │
  ├─> Call createOrder(productId, encryptedQuantity, proof) + payment
  │
  └─> Contract stores encrypted order (Status: Pending)
       │
       ├─> Automatically call _requestDecryption()
       │    │
       │    └─> Emit DecryptionRequested event
       │
       ├─> Gateway monitors events
       │    │
       │    ├─> Decrypt quantity and price off-chain
       │    │
       │    └─> Call fulfillOrderCallback(requestId, cleartexts, proof)
       │
       └─> Contract validates and confirms order
            │
            ├─> Transfer payment to seller
            │
            ├─> Update order (Status: Confirmed)
            │
            └─> Emit OrderConfirmed event
```

### Flow 3: Create Order (Timeout Path)

```
Buyer
  │
  ├─> Call createOrder() + payment
  │
  └─> Contract stores order (Status: Pending, Timeout: 24h)
       │
       ├─> Request decryption
       │
       ├─> Gateway is delayed or fails
       │    │
       │    └─> 24 hours pass
       │
       └─> Buyer calls requestTimeoutRefund(orderId)
            │
            ├─> Validate timeout exceeded
            │
            ├─> Update order (Status: TimedOut)
            │
            ├─> Store pending refund
            │
            └─> Buyer calls claimRefund() to receive funds
```

### Flow 4: Create Order (Failure Path)

```
Buyer
  │
  ├─> Call createOrder() + payment
  │
  └─> Contract requests decryption
       │
       ├─> Gateway decrypts successfully
       │
       ├─> Callback validates values
       │    │
       │    └─> Validation fails (e.g., insufficient stock)
       │
       └─> Contract handles failure
            │
            ├─> Update order (Status: Failed)
            │
            ├─> Store pending refund
            │
            ├─> Emit OrderFailed event
            │
            └─> Buyer calls claimRefund() to receive funds
```

---

## Technical Specifications

### Encrypted Data Types

| Type | Size | Use Case | Example |
|------|------|----------|---------|
| `euint16` | 16 bits | Small values (age, prices < 65k) | User age, base prices |
| `euint32` | 32 bits | Medium values (IDs, quantities) | Passport numbers, seat numbers |
| `euint64` | 64 bits | Large values (totals, points) | Total prices, loyalty points |
| `ebool` | 1 bit | Boolean flags | VIP status, insurance flag |

### Key Constants

```solidity
DECRYPTION_TIMEOUT = 24 hours         // Default timeout
MAX_TIMEOUT_EXTENSION = 7 days       // Maximum extension
MAX_HCU_PER_OPERATION = 100000       // Gas limit
MIN_PRICE_MULTIPLIER = 100           // Privacy multiplier range
MAX_PRICE_MULTIPLIER = 1000          // Privacy multiplier range
```

---

## Security Considerations

### Threat Model

| Threat | Mitigation |
|--------|------------|
| Front-running attacks | Encrypted inputs prevent value extraction |
| Price manipulation | Obfuscation with noise and multipliers |
| Denial of Service | Rate limiting, pause mechanism |
| Gateway compromise | Signature verification, multi-sig in production |
| Permanent fund lock | Timeout refunds, emergency pause |
| Reentrancy | NonReentrant modifier, checks-effects-interactions |
| Integer overflow | Safe arithmetic, overflow checks |

### Audit Recommendations

1. **External Security Audit**: Review by FHE security experts
2. **Gateway Security**: Multi-signature authorization for Gateway operators
3. **Formal Verification**: Prove correctness of critical functions
4. **Monitoring**: Real-time alerting for unusual patterns
5. **Bug Bounty**: Incentivize responsible disclosure

---

## Deployment Guide

### Prerequisites

```bash
# Install dependencies
npm install @fhevm/solidity hardhat

# Configure network
# Edit hardhat.config.ts with Sepolia/Mainnet settings
```

### Deployment Steps

1. **Deploy Contract**
```solidity
npx hardhat run scripts/deploy.ts --network sepolia
```

2. **Authorize Gateway Operator**
```solidity
await contract.setOperatorAuthorization(gatewayAddress, true);
```

3. **Verify Contract**
```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

4. **Test Integration**
```bash
npx hardhat test
```

---

## API Reference

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed function documentation.

---

## Future Enhancements

1. **Multi-Gateway Support**: Decentralize Gateway operations
2. **ZK Proofs Integration**: Additional privacy layer
3. **Cross-Chain Bridge**: Enable multi-chain marketplace
4. **Reputation System**: Encrypted seller ratings
5. **Escrow Services**: Dispute resolution mechanism
6. **Batch Operations**: Process multiple orders atomically

---

## References

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Gateway Callback Pattern](https://docs.zama.ai/fhevm/guides/decrypt)
- [Best Practices](https://docs.zama.ai/fhevm/guides/gas)
- [Security Guidelines](https://docs.zama.ai/fhevm/security)

---

## License

BSD-3-Clause-Clear

---

## Support

For questions or issues:
- GitHub Issues: [Your Repository]
- Documentation: [Your Docs Site]
- Community: [Discord/Telegram]
