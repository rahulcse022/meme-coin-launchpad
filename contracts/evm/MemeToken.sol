// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MemeToken is ERC20, Ownable {
    uint8 private immutable _tokenDecimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 totalSupply_,
        address creator_,
        address feeRecipient_
    ) ERC20(name_, symbol_) Ownable(creator_) payable {
        require(decimals_ <= 18, "MemeToken: decimals");
        require(totalSupply_ > 0, "MemeToken: supply");
        require(creator_ != address(0), "MemeToken: creator");
        require(feeRecipient_ != address(0), "MemeToken: recipient");

        _tokenDecimals = decimals_;
        _mint(creator_, totalSupply_);

        if (msg.value > 0) {
            (bool ok, ) = payable(feeRecipient_).call{value: msg.value}("");
            require(ok, "MemeToken: fee");
        }
    }

    function decimals() public view override returns (uint8) {
        return _tokenDecimals;
    }
}
