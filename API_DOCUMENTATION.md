# API Documentation - Private Marketplace

Complete API reference for the PrivateMarketplace smart contract.

## Table of Contents

1. [Admin Functions](#admin-functions)
2. [Product Management](#product-management)
3. [Order Processing](#order-processing)
4. [Refund Mechanism](#refund-mechanism)
5. [Privacy Operations](#privacy-operations)
6. [View Functions](#view-functions)
7. [Events](#events)
8. [Error Codes](#error-codes)

---

## Admin Functions

### `setPaused(bool _paused)`

Emergency pause/unpause contract operations.

**Parameters:**
- `_paused` (bool): `true` to pause, `false` to unpause

**Returns:** None

**Requirements:**
- Only owner
- No reentrancy during pause

**Example:**
```solidity
// Pause contract in emergency
await contract.setPaused(true);

// Resume operations
await contract.setPaused(false);
```

**Events Emitted:**
- `EmergencyPause(bool paused)`

---

### `setOperatorAuthorization(address _operator, bool _authorized)`

Authorize/revoke Gateway operators for callback processing.

**Parameters:**
- `_operator` (address): Operator address (typically Gateway service address)
- `_authorized` (bool): `true` to authorize, `false` to revoke

**Returns:** None

**Requirements:**
- Only owner
- `_operator` must not be zero address

**Example:**
```solidity
const GATEWAY_ADDRESS = "0x...";

// Authorize Gateway
await contract.setOperatorAuthorization(GATEWAY_ADDRESS, true);

// Revoke authorization
await contract.setOperatorAuthorization(GATEWAY_ADDRESS, false);
```

**Events Emitted:**
- `OperatorAuthorized(address indexed operator, bool authorized)`

---

## Product Management

### `createProduct(uint64 _price, uint32 _stock, string memory _metadataHash)`

Create a new product with encrypted price.

**Parameters:**
- `_price` (uint64): Base price in wei (will be encrypted)
- `_stock` (uint32): Initial stock quantity
- `_metadataHash` (string): IPFS hash for product metadata (e.g., "QmXxxx...")

**Returns:**
- `uint256`: New product ID

**Requirements:**
- Contract not paused
- `_price > 0`
- `_stock > 0`
- `_metadataHash` length > 0

**Example:**
```javascript
const tx = await contract.createProduct(
  ethers.parseEther("0.1"),      // 0.1 ETH
  100,                            // 100 items
  "QmXxxxxxxxxxxxxxxxxxxx",       // IPFS hash
  { from: sellerAddress }
);

const receipt = await tx.wait();
const productId = receipt.events[0].args.productId;
```

**Events Emitted:**
- `ProductCreated(uint256 indexed productId, address indexed seller, string metadataHash)`

---

### `updateProductStock(uint256 _productId, uint32 _newStock)`

Update product stock quantity.

**Parameters:**
- `_productId` (uint256): Product to update
- `_newStock` (uint32): New stock quantity

**Returns:** None

**Requirements:**
- Contract not paused
- Product exists and is active
- Caller is the product seller

**Example:**
```solidity
// Seller restocks product
await contract.updateProductStock(1, 150);
```

**Events Emitted:**
- `ProductUpdated(uint256 indexed productId, uint32 newStock)`

---

### `getProductInfo(uint256 _productId)`

View product information.

**Parameters:**
- `_productId` (uint256): Product ID

**Returns:**
- `address seller`: Product seller address
- `uint256 createdAt`: Timestamp when product was created
- `bool isActive`: Whether product is currently active
- `string memory metadataHash`: IPFS hash for product details

**Example:**
```javascript
const info = await contract.getProductInfo(1);

console.log({
  seller: info.seller,
  createdAt: new Date(info.createdAt * 1000),
  isActive: info.isActive,
  metadataHash: info.metadataHash
});
```

---

## Order Processing

### `createOrder(uint256 _productId, externalEuint64 _encryptedQuantity, bytes calldata _inputProof)`

Create order with encrypted quantity. **Automatically requests Gateway decryption.**

**Parameters:**
- `_productId` (uint256): Product to purchase
- `_encryptedQuantity` (externalEuint64): Encrypted quantity as external type
- `_inputProof` (bytes): Input proof for verification

**Value (msg.value):**
- ETH amount for payment (must be > 0)

**Returns:**
- `uint256`: New order ID

**Requirements:**
- Contract not paused
- Product exists and is active
- Caller is not the seller
- Payment > 0
- Product has not departed (for time-sensitive products)

**Example (using fhevmjs):**
```javascript
import { FhenixClient } from 'fhevmjs';

const client = new FhenixClient();

// Encrypt quantity
const quantity = 10;
const encryptedQuantity = await client.encrypt_uint64(quantity);

// Get input proof
const encryptionProof = encryptedQuantity.inputProof;

// Create order
const tx = await contract.createOrder(
  1,                                      // Product ID
  encryptedQuantity.data,                 // Encrypted quantity
  encryptionProof,                        // Input proof
  {
    value: ethers.parseEther("1.0"),      // Payment: 1 ETH
    from: buyerAddress
  }
);

const receipt = await tx.wait();
const orderId = receipt.events[0].args.orderId;
```

**Order State After Creation:**
- Status: `Pending` (awaiting Gateway decryption)
- Timeout deadline: Current time + 24 hours

**Events Emitted:**
- `OrderCreated(uint256 indexed orderId, uint256 indexed productId, address indexed buyer)`
- `DecryptionRequested(uint256 indexed requestId, uint256 indexed orderId)`
- `AuditLogEntry(uint256 indexed orderId, string action, uint256 timestamp)`

---

### `fulfillOrderCallback(uint256 _requestId, bytes memory _cleartexts, bytes memory _decryptionProof)`

**[GATEWAY ONLY]** Callback function called by Gateway with decrypted order values.

**Parameters:**
- `_requestId` (uint256): Decryption request ID from `createOrder`
- `_cleartexts` (bytes): ABI-encoded decrypted values `(uint64 quantity, uint64 totalPrice)`
- `_decryptionProof` (bytes): Signature proof from Gateway

**Returns:** None

**Requirements:**
- Caller is authorized operator (Gateway)
- Order is in `DecryptionRequested` state
- Timeout not exceeded
- Signature verification passes

**Security:**
- Validates Gateway signatures using `FHE.checkSignatures()`
- Validates decrypted values are non-zero
- Validates payment is sufficient
- Prevents reentrancy

**Behavior:**
- **Success**: Updates order to `Confirmed`, transfers payment to seller
- **Failure**: Updates order to `Failed`, stores refund for buyer

**Events Emitted:**
- `OrderConfirmed(uint256 indexed orderId, uint64 revealedQuantity, uint64 revealedPrice)` (on success)
- `OrderFailed(uint256 indexed orderId, string reason)` (on failure)
- `RefundInitiated(uint256 indexed orderId, address indexed buyer, uint256 amount)` (on failure)

---

### `extendTimeout(uint256 _orderId, uint256 _extensionSeconds)`

Extend timeout deadline for order awaiting decryption.

**Parameters:**
- `_orderId` (uint256): Order ID
- `_extensionSeconds` (uint256): Seconds to extend (max 7 days)

**Returns:** None

**Requirements:**
- Caller is the order buyer
- Order is in `DecryptionRequested` state
- Extension ≤ 7 days

**Example:**
```solidity
// Extend timeout by 24 hours if Gateway is delayed
await contract.extendTimeout(1, 86400); // 24 hours in seconds
```

**Events Emitted:**
- `TimeoutExtended(uint256 indexed orderId, uint256 newDeadline)`
- `AuditLogEntry(...)`

---

### `getOrderInfo(uint256 _orderId)`

View order information.

**Parameters:**
- `_orderId` (uint256): Order ID

**Returns:**
- `uint256 productId`: Associated product ID
- `address buyer`: Buyer address
- `address seller`: Seller address
- `OrderStatus status`: Current order status
- `uint256 createdAt`: Order creation timestamp
- `uint256 timeoutDeadline`: Timeout deadline
- `bool refundProcessed`: Whether refund has been processed

**Status Enum:**
- `0` = `Pending`: Order created, awaiting decryption
- `1` = `DecryptionRequested`: Gateway is processing
- `2` = `Confirmed`: Successfully processed
- `3` = `Failed`: Decryption or validation failed
- `4` = `Refunded`: Refund processed
- `5` = `TimedOut`: Timeout exceeded

**Example:**
```javascript
const order = await contract.getOrderInfo(1);

const statuses = [
  "Pending", "DecryptionRequested", "Confirmed",
  "Failed", "Refunded", "TimedOut"
];

console.log({
  product: order.productId,
  buyer: order.buyer,
  seller: order.seller,
  status: statuses[order.status],
  createdAt: new Date(order.createdAt * 1000),
  timeoutDeadline: new Date(order.timeoutDeadline * 1000),
  refundProcessed: order.refundProcessed
});
```

---

## Refund Mechanism

### `claimRefund()`

Claim pending refund for failed or timed-out order.

**Parameters:** None

**Returns:** None

**Value (msg.value):** Not used

**Requirements:**
- Caller has pending refund > 0
- Reentrancy guard: No recursive calls

**Example:**
```solidity
// Check if refund available
const refundAmount = await contract.getPendingRefund(buyerAddress);

if (refundAmount > 0) {
  // Claim refund
  await contract.claimRefund({ from: buyerAddress });
}
```

**Events Emitted:**
- `RefundProcessed(uint256 indexed orderId, address indexed buyer, uint256 amount)`

---

### `requestTimeoutRefund(uint256 _orderId)`

Request refund for order that exceeded timeout deadline.

**Parameters:**
- `_orderId` (uint256): Order ID

**Returns:** None

**Value (msg.value):** Not used

**Requirements:**
- Caller is the order buyer
- Order is in `Pending` or `DecryptionRequested` state
- Current time > timeout deadline
- Refund not already processed

**Example:**
```solidity
// Check if order timed out
const order = await contract.getOrderInfo(1);
const now = Math.floor(Date.now() / 1000);

if (now > order.timeoutDeadline && order.status < 4) {
  // Request timeout refund
  await contract.requestTimeoutRefund(1);
}
```

**Events Emitted:**
- `OrderTimedOut(uint256 indexed orderId)`
- `RefundInitiated(uint256 indexed orderId, address indexed buyer, uint256 amount)`
- `AuditLogEntry(...)`

---

### `getPendingRefund(address _user)`

Check pending refund amount for user.

**Parameters:**
- `_user` (address): User address

**Returns:**
- `uint256`: Pending refund amount in wei

**Example:**
```javascript
const refundAmount = await contract.getPendingRefund(buyerAddress);
console.log("Pending refund:", ethers.formatEther(refundAmount), "ETH");
```

---

## Privacy Operations

### `computePrivateDivision(euint64 _numerator, euint64 _denominator, euint64 _multiplier)`

Perform encrypted division with privacy protection using random multiplier.

**Parameters:**
- `_numerator` (euint64): Encrypted dividend
- `_denominator` (euint64): Encrypted divisor
- `_multiplier` (euint64): Random multiplier for privacy

**Returns:**
- `euint64`: Encrypted result

**Purpose:**
- Prevent information leakage from division patterns
- Protect price calculations from analysis

**Example:**
```solidity
// Calculate: (price * multiplier) / (quantity * multiplier)
euint64 price = FHE.asEuint64(1000);
euint64 quantity = FHE.asEuint64(10);
euint64 multiplier = FHE.asEuint64(256);

euint64 unitPrice = contract.computePrivateDivision(price, quantity, multiplier);
```

---

## View Functions

### `getProductInfo(uint256 _productId)`
*See [Product Management](#getproductinfouint256-_productid) above*

### `getOrderInfo(uint256 _orderId)`
*See [Order Processing](#getorderinfouint256-_orderid) above*

### `getDecryptionRequestInfo(uint256 _requestId)`

Get decryption request details.

**Parameters:**
- `_requestId` (uint256): Decryption request ID

**Returns:**
- `uint256 orderId`: Associated order ID
- `address requester`: Address that requested decryption
- `uint256 requestedAt`: Timestamp of request
- `bool isProcessed`: Whether Gateway has processed

**Example:**
```javascript
const request = await contract.getDecryptionRequestInfo(1);
console.log({
  orderId: request.orderId,
  requester: request.requester,
  requestedAt: new Date(request.requestedAt * 1000),
  isProcessed: request.isProcessed
});
```

---

### `getPendingRefund(address _user)`
*See [Refund Mechanism](#getpendingrefundaddress-_user) above*

---

### `getAuditLog(uint256 _orderId)`

Retrieve audit log for order.

**Parameters:**
- `_orderId` (uint256): Order ID

**Returns:**
- `string memory`: Concatenated audit log entries

**Example:**
```javascript
const log = await contract.getAuditLog(1);
console.log("Audit trail:", log);
// Output: "Order created at 1234567890"
```

---

## Events

### `ProductCreated`
```solidity
event ProductCreated(
    uint256 indexed productId,
    address indexed seller,
    string metadataHash
)
```

**Emitted when:** New product is created

**Indexed parameters:** `productId`, `seller`

---

### `ProductUpdated`
```solidity
event ProductUpdated(
    uint256 indexed productId,
    uint32 newStock
)
```

**Emitted when:** Product stock is updated

---

### `OrderCreated`
```solidity
event OrderCreated(
    uint256 indexed orderId,
    uint256 indexed productId,
    address indexed buyer
)
```

**Emitted when:** New order is created (automatic decryption request follows)

**Indexed parameters:** `orderId`, `productId`, `buyer`

---

### `DecryptionRequested`
```solidity
event DecryptionRequested(
    uint256 indexed requestId,
    uint256 indexed orderId
)
```

**Emitted when:** Gateway decryption is requested

**Indexed parameters:** `requestId`, `orderId`

---

### `OrderConfirmed`
```solidity
event OrderConfirmed(
    uint256 indexed orderId,
    uint64 revealedQuantity,
    uint64 revealedPrice
)
```

**Emitted when:** Order is successfully confirmed after Gateway callback

**Contains:** Decrypted quantity and price (for reference only)

---

### `OrderFailed`
```solidity
event OrderFailed(
    uint256 indexed orderId,
    string reason
)
```

**Emitted when:** Order fails validation or decryption

**Reasons:**
- `"Invalid decrypted values"` - Quantity or price is zero
- `"Insufficient payment"` - Buyer payment < price
- Other validation errors

---

### `RefundInitiated`
```solidity
event RefundInitiated(
    uint256 indexed orderId,
    address indexed buyer,
    uint256 amount
)
```

**Emitted when:** Refund is queued for buyer

---

### `RefundProcessed`
```solidity
event RefundProcessed(
    uint256 indexed orderId,
    address indexed buyer,
    uint256 amount
)
```

**Emitted when:** Refund is transferred to buyer via `claimRefund()`

---

### `TimeoutExtended`
```solidity
event TimeoutExtended(
    uint256 indexed orderId,
    uint256 newDeadline
)
```

**Emitted when:** Timeout deadline is extended

---

### `OrderTimedOut`
```solidity
event OrderTimedOut(
    uint256 indexed orderId
)
```

**Emitted when:** Order timeout refund is requested

---

### `EmergencyPause`
```solidity
event EmergencyPause(bool paused)
```

**Emitted when:** Contract is paused/unpaused

---

### `OperatorAuthorized`
```solidity
event OperatorAuthorized(
    address indexed operator,
    bool authorized
)
```

**Emitted when:** Operator authorization is changed

---

### `AuditLogEntry`
```solidity
event AuditLogEntry(
    uint256 indexed orderId,
    string action,
    uint256 timestamp
)
```

**Emitted when:** Critical action is logged for audit

---

## Error Codes

### Access Control Errors
```
"Not authorized: owner only" - Function requires owner
"Not authorized" - Function requires authorized operator
"Not the seller" - Only product seller can perform action
"Not the buyer" - Only order buyer can perform action
```

### Input Validation Errors
```
"Price must be positive" - Price must be > 0
"Stock must be positive" - Stock must be > 0
"Metadata hash required" - Metadata hash cannot be empty
"Payment required" - Payment (msg.value) must be > 0
"Invalid product ID" - Product does not exist
"Invalid order ID" - Order does not exist
"Invalid operator address" - Zero address provided
```

### State Errors
```
"Contract is paused" - Contract is in emergency pause
"Product not active" - Product is inactive/deactivated
"Cannot buy own product" - Seller cannot buy their product
"Order not in pending state" - Order state mismatch
"Order not in refundable state" - Cannot refund current order state
"Timeout not reached" - Deadline not yet exceeded
"Refund already processed" - Duplicate refund request
"No pending refund" - No refund available for user
```

### Payment Errors
```
"Payment transfer failed" - ETH transfer to seller failed
"Excess refund failed" - ETH transfer to buyer failed
"Refund transfer failed" - ETH transfer failed
```

### Security Errors
```
"Reentrant call detected" - Reentrancy protection triggered
```

---

## Integration Examples

### JavaScript/ethers.js

```javascript
const ethers = require('ethers');
const contract = require('./PrivateMarketplaceABI.json');

const provider = new ethers.JsonRpcProvider('https://sepolia.rpc...');
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const marketplace = new ethers.Contract(
  MARKETPLACE_ADDRESS,
  contract,
  wallet
);

// Create product
const productTx = await marketplace.createProduct(
  ethers.parseEther("1.0"),
  100,
  "QmXxxx..."
);
await productTx.wait();

// Create order with encrypted quantity
// (See createOrder example above)
```

### Ethers v6 with TypeChain

```typescript
import { PrivateMarketplace } from './typechain-types';
import { FhenixClient } from 'fhevmjs';

const marketplace: PrivateMarketplace = ...;
const client = new FhenixClient();

async function purchaseProduct(productId: number, quantity: number) {
  // Encrypt quantity
  const encrypted = await client.encrypt_uint64(quantity);

  // Create order
  const tx = await marketplace.createOrder(
    productId,
    encrypted.data,
    encrypted.inputProof,
    { value: ethers.parseEther("1.0") }
  );

  return await tx.wait();
}
```

---

## Testing

See [test/](../test/) directory for comprehensive test examples including:
- Product creation
- Order placement
- Gateway callback simulation
- Refund flows
- Timeout scenarios

---

## Security Considerations

1. **Gateway Authorization**: Only authorize trusted Gateway operators
2. **Timeout Management**: Monitor orders approaching timeout
3. **Refund Checks**: Verify pending refunds before claiming
4. **Signature Verification**: Never bypass `FHE.checkSignatures()`
5. **Encrypted Data**: Store sensitive values only in encrypted forms

---

## Support

For API questions or issues, please open a GitHub issue or contact the development team.
