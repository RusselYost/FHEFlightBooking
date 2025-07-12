/**
 * Configuration file for ConfidentialFlightBooking DApp
 * Updated to reflect fhevm breaking changes
 *
 * Key Changes:
 * - KMS_MANAGEMENT → KMS_GENERATION
 * - Gateway API changes (check... → is... functions)
 * - PauserSet contract support
 * - Transaction input re-randomization (transparent to users)
 */

const CONFIG = {
    // Main contract address
    CONTRACT_ADDRESS: "0xfdf50F46FDD1e307F80C89d5fa5c7c1E49ddae7C",

    // Network configuration
    NETWORK: {
        NAME: "Sepolia",
        CHAIN_ID: 11155111,
        RPC_URL: "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
        EXPLORER_URL: "https://sepolia.etherscan.io"
    },

    // KMS Configuration (Updated naming)
    KMS: {
        // New: KMS Generation address (formerly KMS Management)
        GENERATION_ADDRESS: "0xYourKMSGenerationContractAddress",

        // Connector configuration
        CONNECTOR: {
            GENERATION_CONTRACT_ADDRESS: "0xYourKMSGenerationContractAddress"
        },

        // Deprecated - Do not use:
        // MANAGEMENT_ADDRESS: (replaced by GENERATION_ADDRESS)
    },

    // Gateway Configuration
    GATEWAY: {
        CONTRACT_ADDRESS: "0xYourGatewayContractAddress",
        API_URL: "https://gateway.zama.ai",

        // PauserSet configuration
        PAUSER_SET: {
            // Number of pausers = n_kms + n_copro
            NUM_PAUSERS: 2,
            ADDRESSES: [
                "0xYourFirstPauserAddress",
                "0xYourSecondPauserAddress"
                // Add more as needed based on NUM_PAUSERS
            ]
        },

        // API version (reflects check... → is... changes)
        API_VERSION: "v2",

        // Features
        FEATURES: {
            // Transaction input re-randomization
            // Provides sIND-CPAD security
            // Transparent to users - no code changes needed
            AUTO_RERANDOMIZATION: true,

            // Gateway function changes
            USE_IS_FUNCTIONS: true, // Use is... instead of check...

            // Decryption handling
            PUBLIC_DECRYPT_ALLOWED: true
        }
    },

    // Host Contract Configuration
    HOST: {
        CONTRACT_ADDRESS: "0xYourHostContractAddress",

        // PauserSet configuration for host
        PAUSER_SET: {
            NUM_PAUSERS: 2,
            ADDRESSES: [
                "0xYourFirstHostPauserAddress",
                "0xYourSecondHostPauserAddress"
            ]
        }
    },

    // Decryption Contract Configuration
    // Note: PublicDecryptNotAllowed error moved from Gateway to Decryption contract
    DECRYPTION: {
        CONTRACT_ADDRESS: "0xYourDecryptionContractAddress"
    },

    // Contract ABIs
    ABI: {
        // Main contract ABI
        FLIGHT_BOOKING: [
            "function addFlight(string memory _origin, string memory _destination, uint256 _departureTime, uint256 _arrivalTime, uint16 _totalSeats, uint16 _basePrice) external",
            "function getFlightInfo(uint32 _flightId) external view returns (string memory origin, string memory destination, uint256 departureTime, uint256 arrivalTime, uint16 totalSeats, uint16 availableSeats, bool isActive, address airline)",
            "function updateFlightStatus(uint32 _flightId, bool _isActive) external",
            "function bookFlight(uint32 _flightId, uint32 _passportNumber, string memory _encryptedName, uint16 _age, uint32 _preferredSeat, bool _hasSpecialNeeds) external payable",
            "function confirmBooking(uint32 _bookingId) external",
            "function cancelBooking(uint32 _bookingId) external",
            "function getBookingInfo(uint32 _bookingId) external view returns (uint32 flightId, address passenger, uint256 bookingTime, bool isConfirmed, bool isCancelled)",
            "function getPassengerBookings(address _passenger) external view returns (uint32[] memory)",
            "function checkSeatAvailability(uint32 _flightId, uint32 _seatNumber) external view returns (bool)",
            "function nextFlightId() external view returns (uint32)",
            "function nextBookingId() external view returns (uint32)",
            "event FlightAdded(uint32 indexed flightId, string origin, string destination, address airline)",
            "event BookingCreated(uint32 indexed bookingId, uint32 indexed flightId, address indexed passenger)",
            "event BookingConfirmed(uint32 indexed bookingId)",
            "event BookingCancelled(uint32 indexed bookingId)",
            "event PaymentProcessed(uint32 indexed bookingId, address indexed passenger)"
        ],

        // PauserSet contract ABI
        PAUSER_SET: [
            "function isAuthorizedPauser(address _address) external view returns (bool)",
            "function getAllPausers() external view returns (address[] memory)",
            "function getPauserAt(uint256 _index) external view returns (address)",
            "function getPauserCount() external view returns (uint256)",
            "event PauserSetInitialized(address[] pausers)"
        ],

        // Gateway contract ABI (updated with new is... functions)
        GATEWAY: [
            // New: is... functions that return boolean instead of reverting
            "function isPublicDecryptAllowed(bytes32 ciphertext) external view returns (bool)",
            "function isDecryptionRequestValid(uint256 requestId) external view returns (bool)",

            // Standard gateway functions
            "function requestDecryption(bytes32[] memory ciphertexts, bytes4 callbackSelector) external returns (uint256)",
            "function fulfillDecryption(uint256 requestId, bytes memory decryptedValues) external",

            // Deprecated: check... functions (do not use)
            // "function checkPublicDecryptAllowed(...)" - REMOVED
        ]
    },

    // Application settings
    APP: {
        AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
        TRANSACTION_TIMEOUT: 120000, // 2 minutes
        MAX_RETRIES: 3,

        // Privacy settings
        PRIVACY: {
            ENCRYPT_CLIENT_SIDE: true,
            USE_FHE: true,
            AUTO_RERANDOMIZE_INPUTS: true // Handled by fhevm automatically
        }
    },

    // Migration notes
    MIGRATION_NOTES: {
        VERSION: "v0.5.0",
        BREAKING_CHANGES: [
            "KMS_MANAGEMENT renamed to KMS_GENERATION",
            "Gateway check... functions replaced with is... functions",
            "PauserSet contract introduced for multiple pausers",
            "Transaction input re-randomization added (transparent)",
            "PublicDecryptNotAllowed error moved to Decryption contract"
        ],
        DEPRECATED: [
            "PAUSER_ADDRESS (single) - use PAUSER_ADDRESS_[0-N] array",
            "KMS_MANAGEMENT_ADDRESS - use KMS_GENERATION_ADDRESS",
            "Gateway check... functions - use is... functions"
        ]
    }
};

// Helper functions for configuration
const ConfigHelper = {
    /**
     * Get the current network configuration
     */
    getNetwork() {
        return CONFIG.NETWORK;
    },

    /**
     * Check if a feature is enabled
     */
    isFeatureEnabled(feature) {
        return CONFIG.GATEWAY.FEATURES[feature] || false;
    },

    /**
     * Get pauser addresses for gateway
     */
    getGatewayPausers() {
        return CONFIG.GATEWAY.PAUSER_SET.ADDRESSES;
    },

    /**
     * Get pauser addresses for host
     */
    getHostPausers() {
        return CONFIG.HOST.PAUSER_SET.ADDRESSES;
    },

    /**
     * Check if using new gateway API (is... functions)
     */
    useNewGatewayAPI() {
        return CONFIG.GATEWAY.FEATURES.USE_IS_FUNCTIONS;
    },

    /**
     * Get contract address by name
     */
    getContractAddress(contractName) {
        switch(contractName) {
            case 'main':
            case 'flightBooking':
                return CONFIG.CONTRACT_ADDRESS;
            case 'gateway':
                return CONFIG.GATEWAY.CONTRACT_ADDRESS;
            case 'kms':
            case 'kmsGeneration':
                return CONFIG.KMS.GENERATION_ADDRESS;
            case 'host':
                return CONFIG.HOST.CONTRACT_ADDRESS;
            case 'decryption':
                return CONFIG.DECRYPTION.CONTRACT_ADDRESS;
            default:
                return null;
        }
    },

    /**
     * Get ABI by contract name
     */
    getABI(contractName) {
        switch(contractName) {
            case 'main':
            case 'flightBooking':
                return CONFIG.ABI.FLIGHT_BOOKING;
            case 'pauserSet':
                return CONFIG.ABI.PAUSER_SET;
            case 'gateway':
                return CONFIG.ABI.GATEWAY;
            default:
                return null;
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, ConfigHelper };
}
