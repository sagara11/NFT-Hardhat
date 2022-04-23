// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../interface/StanTokenInterface.sol";

contract StanNFT is ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => uint256) TokenIdToPrice;
    mapping(address => uint256) public balanceOfFan;
    mapping(uint160 => mapping(address => uint256)) private autionInformation;
    address public tokenStanAddress;
    StanTokenInterface private tokenStan;

    event Purchase(
        address _from,
        address _to,
        uint256 _tokenId,
        uint256 _amounty
    );

    event Winner(
        address _winner,
        uint256 _tokenId,
        address _artist,
        uint256 _bidNumber
    );

    event Aution(address _sender, uint256 _bidnumer, uint160 _autionId);

    constructor(address _tokenStan) ERC721("Stan", "STAN") {
        tokenStan = StanTokenInterface(_tokenStan);
    }

    function Decimals() public pure returns (uint256) {
        return uint256(10**18);
    }

    function createCollectible(string memory _tokenURI)
        external
        onlyOwner
        returns (uint256)
    {
        uint256 newTokenId = _tokenIds.current();
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        TokenIdToPrice[newTokenId] =
            ((1 * Decimals()) / (1000 * Decimals())) *
            Decimals();
        _tokenIds.increment();
        return newTokenId;
    }

    function settokenStan(address _tokenStan) external onlyOwner {
        tokenStan = StanTokenInterface(_tokenStan);
    }

    function aution(
        address _user,
        uint160 _autionId,
        uint256 _bidNumber
    ) external onlyOwner {
        if (balanceOfFan[_user] < _bidNumber) {
            uint256 additionalFee = _bidNumber - balanceOfFan[_user];
            require(
                tokenStan.transferFrom(_user, address(this), additionalFee),
                "Not enough money to bid"
            );
            balanceOfFan[_user] += additionalFee;
        }

        autionInformation[_autionId][_user] = _bidNumber;
        emit Aution(_user, _bidNumber, _autionId);
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
        require(
            _isApprovedOrOwner(address(this), _tokenId),
            "The artist didn't approve the NFT to StanNFT smart contract"
        );

        // minus winner balance
        balanceOfFan[_winner] -= _bidNumber;
        // transfer NFT to winner
        _transfer(address(this), _winner, _tokenId);
        // transfer token to artist
        tokenStan.transfer(_artist, _bidNumber);

        emit Winner(_winner, _tokenId, _artist, _bidNumber);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
