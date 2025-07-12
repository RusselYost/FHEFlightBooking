// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PauserSet
 * @notice Immutable contract that manages a set of authorized pauser addresses
 * @dev Used by Gateway and Host contracts to determine who can pause/unpause the system
 *
 * Key Features:
 * - Immutable set of pauser addresses (set at deployment)
 * - Supports multiple pausers (KMS nodes + coprocessors)
 * - Gas-efficient pauser verification
 */
contract PauserSet {

    // Array of authorized pauser addresses (immutable after deployment)
    address[] public pausers;

    // Mapping for O(1) pauser verification
    mapping(address => bool) public isPauser;

    // Total number of pausers
    uint256 public pauserCount;

    event PauserSetInitialized(address[] pausers);

    /**
     * @notice Initialize the PauserSet with authorized addresses
     * @param _pausers Array of pauser addresses (KMS nodes + coprocessors)
     * @dev Can only be called once during deployment
     *
     * Example usage:
     * NUM_PAUSERS = n_kms + n_copro
     * where n_kms = number of registered KMS nodes
     * and n_copro = number of registered coprocessors
     */
    constructor(address[] memory _pausers) {
        require(_pausers.length > 0, "PauserSet: At least one pauser required");

        for (uint256 i = 0; i < _pausers.length; i++) {
            require(_pausers[i] != address(0), "PauserSet: Invalid pauser address");
            require(!isPauser[_pausers[i]], "PauserSet: Duplicate pauser address");

            pausers.push(_pausers[i]);
            isPauser[_pausers[i]] = true;
        }

        pauserCount = _pausers.length;

        emit PauserSetInitialized(_pausers);
    }

    /**
     * @notice Check if an address is authorized to pause
     * @param _address Address to check
     * @return bool True if address is an authorized pauser
     */
    function isAuthorizedPauser(address _address) external view returns (bool) {
        return isPauser[_address];
    }

    /**
     * @notice Get all pauser addresses
     * @return address[] Array of all pauser addresses
     */
    function getAllPausers() external view returns (address[] memory) {
        return pausers;
    }

    /**
     * @notice Get pauser address at specific index
     * @param _index Index in pausers array
     * @return address Pauser address at given index
     */
    function getPauserAt(uint256 _index) external view returns (address) {
        require(_index < pauserCount, "PauserSet: Index out of bounds");
        return pausers[_index];
    }

    /**
     * @notice Get total number of pausers
     * @return uint256 Number of authorized pausers
     */
    function getPauserCount() external view returns (uint256) {
        return pauserCount;
    }
}

/**
 * @title Pausable
 * @notice Abstract contract that implements pause/unpause functionality using PauserSet
 * @dev Inherit this contract to add pausable functionality to Gateway or Host contracts
 */
abstract contract Pausable {

    // Reference to the PauserSet contract
    PauserSet public pauserSet;

    // Current pause state
    bool public paused;

    event Paused(address indexed pauser);
    event Unpaused(address indexed pauser);

    modifier onlyPauser() {
        require(
            pauserSet.isAuthorizedPauser(msg.sender),
            "Pausable: Caller is not authorized pauser"
        );
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Pausable: Contract is paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "Pausable: Contract is not paused");
        _;
    }

    /**
     * @notice Initialize pausable functionality with PauserSet
     * @param _pauserSet Address of the deployed PauserSet contract
     */
    constructor(address _pauserSet) {
        require(_pauserSet != address(0), "Pausable: Invalid PauserSet address");
        pauserSet = PauserSet(_pauserSet);
        paused = false;
    }

    /**
     * @notice Pause the contract
     * @dev Can only be called by authorized pausers
     */
    function pause() external onlyPauser whenNotPaused {
        paused = true;
        emit Paused(msg.sender);
    }

    /**
     * @notice Unpause the contract
     * @dev Can only be called by authorized pausers
     */
    function unpause() external onlyPauser whenPaused {
        paused = false;
        emit Unpaused(msg.sender);
    }

    /**
     * @notice Check if contract is currently paused
     * @return bool True if paused, false otherwise
     */
    function isPaused() external view returns (bool) {
        return paused;
    }
}
