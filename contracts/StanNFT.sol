// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../interface/wethToken.sol";

contract StanNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => uint256) TokenIdToPrice;
    address public wethTokenAddress;
    WethTokenInterface private wethToken;
    mapping(address => uint256) public balanceOfFan;
    mapping(uint160 => mapping(address => uint256)) private autionInformation;

    event Purchase(
        address _from,
        address _to,
        uint256 _tokenId,
        uint256 _amounty
    );

    event Aution(address _sender, uint256 _bidnumer, uint256 _balanceOf);

    constructor(address _wethToken) public ERC721("Stan", "STAN") {
        wethToken = WethTokenInterface(_wethToken);
    }

    function Decimals() public pure returns (uint256) {
        return uint256(10**18);
    }

    function createCollectible(string memory tokenURI)
        external
        onlyOwner
        returns (uint256)
    {
        uint256 newTokenId = _tokenIds.current();
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        TokenIdToPrice[newTokenId] =
            ((1 * Decimals()) / (1000 * Decimals())) *
            Decimals();
        _tokenIds.increment();
        return newTokenId;
    }

    function setWethToken(address _wethToken) external onlyOwner {
        wethToken = WethTokenInterface(_wethToken);
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

    function aution(
        address _user,
        uint160 _autionId,
        uint256 _bidNumber
    ) external onlyOwner {
        if (balanceOfFan[_user] < _bidNumber) {
            uint256 additionalFee = _bidNumber - balanceOfFan[_user];
            require(
                wethToken.transferFrom(_user, address(this), additionalFee),
                "Not enough money to bid"
            );
            balanceOfFan[_user] += additionalFee;
        }

        autionInformation[_autionId][_user] = _bidNumber;
        emit Aution(_user, _bidNumber, balanceOfFan[_user]);
    }

    function getWinner(
        address _winner,
        address _artist,
        uint256 _bidNumber,
        uint256 _tokenId,
        uint160 _autionId
    ) external onlyOwner {
        require(
            autionInformation[_autionId][_winner] > 0 &&
                autionInformation[_autionId][_winner] == _bidNumber,
            "Invalid winner"
        );

        // minus winner balance
        balanceOfFan[_winner] -= _bidNumber;
        // transfer NFT to winner
        // transfer token to artist
    }
}
