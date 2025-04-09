// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract EducationalNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mapping from token ID to issuer address
    mapping(uint256 => address) private _tokenIssuers;
    
    // Mapping of authorized issuers (educational institutions)
    mapping(address => bool) private _authorizedIssuers;

    // Events
    event CredentialIssued(uint256 indexed tokenId, address indexed student, address indexed issuer);
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);

    constructor() ERC721("YourEDU Credentials", "YEDU") {}

    // Modifier to check if sender is authorized issuer
    modifier onlyAuthorizedIssuer() {
        require(_authorizedIssuers[msg.sender], "Caller is not an authorized issuer");
        _;
    }

    // Add a new authorized issuer
    function authorizeIssuer(address issuer) public onlyOwner {
        _authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }

    // Revoke an issuer's authorization
    function revokeIssuer(address issuer) public onlyOwner {
        _authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }

    // Check if an address is an authorized issuer
    function isAuthorizedIssuer(address issuer) public view returns (bool) {
        return _authorizedIssuers[issuer];
    }

    // Mint new educational credential
    function issueCredential(address student, string memory tokenURI)
        public
        onlyAuthorizedIssuer
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(student, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        _tokenIssuers[newTokenId] = msg.sender;

        emit CredentialIssued(newTokenId, student, msg.sender);

        return newTokenId;
    }

    // Get the issuer of a token
    function getTokenIssuer(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenIssuers[tokenId];
    }

    // Override required functions
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
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