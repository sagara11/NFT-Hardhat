// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SimpleCollectible is ERC721 {
    uint256 public tokenCounter;
    mapping(uint256 => uint256) TokenIdToPrice;

    event Purchase(
        address _from,
        address _to,
        uint256 _tokenId,
        uint256 _amounty
    );

    constructor() public ERC721("Savvycom", "SCN") {
        tokenCounter = 0;
    }

    function Decimals() public pure returns (uint256) {
        return uint256(10**18);
    }

    function createCollectible(string memory tokenURI)
        public
        returns (uint256)
    {
        uint256 newTokenId = tokenCounter;
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        TokenIdToPrice[newTokenId] =
            ((1 * Decimals()) / (100 * Decimals())) *
            Decimals();
        tokenCounter += 1;
        return newTokenId;
    }

    function purchaseNFT(uint256 _tokenId) external payable {
        require(
            msg.value >= TokenIdToPrice[_tokenId],
            "Not enough fee to buy this NFT"
        );

        address owner = ownerOf(_tokenId);
        _transfer(owner, msg.sender, _tokenId);
        payable(owner).transfer(msg.value);

        emit Purchase(owner, msg.sender, _tokenId, msg.value);
    }
}
