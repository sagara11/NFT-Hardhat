// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract StanToken is ERC20, Ownable {
    constructor() ERC20("Stan", "STC") {
        _mint(msg.sender, 1000 * Decimals());
    }

    function Decimals() public returns (uint256) {
        return 10**18;
    }
}
