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

    event Winner(
        address _winner,
        uint256 _tokenId,
        address _artist,
        uint256 _bidNumber
    );

    event Purchase(
        address _buyer,
        address _seller,
        uint160 _tokenId,
        uint256 _price
    );

    event Buy(address _buyer, uint160 _tokenId, uint256 _tokenIdToPrice);
    event Aution(address _sender, uint256 _bidnumer, uint160 _autionId);

    constructor(address _tokenStan) ERC721("Stan", "STAN") {
        tokenStan = StanTokenInterface(_tokenStan);
    }

    modifier checkMoneyToProceed(
        address _from,
        address _to,
        uint256 _amount
    ) {
        require(
            tokenStan.transferFrom(_from, _to, _amount),
            "Not enough money to proceed"
        );
        _;
    }

    modifier checkNFTOwnerShip(address _owner, uint160 _tokenId) {
        require(
            _isApprovedOrOwner(address(this), _tokenId),
            "The caller didn't transfer the NFT to StanNFT smart contract"
        );
        _;
    }

    function Decimals() public pure returns (uint256) {
        return uint256(10**18);
    }

    function createCollectible(string memory _tokenURI, uint256 _price)
        external
        onlyOwner
        returns (uint256)
    {
        uint256 newTokenId = _tokenIds.current();
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        TokenIdToPrice[newTokenId] = _price;
        _tokenIds.increment();
        return newTokenId;
    }

    function checkBalance(address _user, uint256 _amount) internal {
        if (balanceOfFan[_user] < _amount) {
            uint256 additionalFee = _amount - balanceOfFan[_user];
            require(
                tokenStan.transferFrom(_user, address(this), additionalFee),
                "Not enough money to proceed"
            );
            balanceOfFan[_user] += additionalFee;
        }
    }

    function purchase(
        address _buyer,
        address _seller,
        uint256 _amount,
        uint160 _tokenId
    )
        external
        onlyOwner
        checkMoneyToProceed(_buyer, address(this), _amount)
        checkNFTOwnerShip(address(this), _tokenId)
    {
        _transfer(address(this), _buyer, _tokenId);
        tokenStan.transfer(_seller, _amount);
        emit Purchase(_buyer, _seller, _tokenId, TokenIdToPrice[_tokenId]);
    }

    function aution(
        address _user,
        uint160 _autionId,
        uint256 _bidNumber
    ) external onlyOwner {
        checkBalance(_user, _bidNumber);
        autionInformation[_autionId][_user] = _bidNumber;
        emit Aution(_user, _bidNumber, _autionId);
    }

    function buy(
        address _user,
        uint160 _tokenId,
        address _artist
    ) external onlyOwner checkNFTOwnerShip(address(this), _tokenId) {
        checkBalance(_user, TokenIdToPrice[_tokenId]);
        balanceOfFan[_user] = 0;
        _transfer(address(this), _user, _tokenId);
        tokenStan.transfer(_artist, TokenIdToPrice[_tokenId]);
        emit Buy(_user, _tokenId, TokenIdToPrice[_tokenId]);
    }

    function settokenStan(address _tokenStan) external onlyOwner {
        tokenStan = StanTokenInterface(_tokenStan);
    }

    function getWinner(
        address _winner,
        address _artist,
        uint256 _bidNumber,
        uint160 _tokenId,
        uint160 _autionId
    ) external onlyOwner checkNFTOwnerShip(address(this), _tokenId) {
        require(
            autionInformation[_autionId][_winner] > 0 &&
                autionInformation[_autionId][_winner] == _bidNumber,
            "Invalid winner"
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
