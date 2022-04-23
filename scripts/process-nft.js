const hre = require("hardhat");
const ethers = hre.ethers;

const simple_token_uri = [
  "https://ipfs.io/ipfs/Qmd9MCGtdVz2miNumBHDbvj8bigSgTwnr4SbyH6DNnpWdt?filename=0-PUG.json",
  "https://ipfs.io/ipfs/Qmd9MCGtdVz2miNumBHDbvj8bigSgTwnr4SbyH6DNnpWdt?filename=1-SHIBA_INU.json",
  "https://ipfs.io/ipfs/Qmd9MCGtdVz2miNumBHDbvj8bigSgTwnr4SbyH6DNnpWdt?filename=2-ST_BERNARD.json",
  "https://ipfs.io/ipfs/Qmd9MCGtdVz2miNumBHDbvj8bigSgTwnr4SbyH6DNnpWdt?filename=2-ST_BERNARD.json",
];

LINKTOKEN = "0xa36085F69e2889c224210F603D836748e7dC0088";

async function main() {
  const [signer, client1, client2, artist] = await ethers.getSigners();

  const StanToken = await ethers.getContractFactory("StanToken");
  const stanToken = await StanToken.deploy();
  await stanToken.deployed();
  console.log("StanToken deployed to:", stanToken.address);

  const StanNFT = await ethers.getContractFactory("StanNFT");
  const stanNFT = await StanNFT.deploy(stanToken.address);
  await stanNFT.deployed();
  console.log("StanNFT deployed to:", stanNFT.address);

  // Signer tranfer to each client some Tokens
  await stanToken.transfer(client1.address, ethers.utils.parseEther("20.0"));
  console.log(
    `Balance Of ${client1.address}:`,
    (await stanToken.balanceOf(client1.address)).toString()
  );
  await stanToken.transfer(client2.address, ethers.utils.parseEther("30.0"));
  console.log(
    `Balance Of ${client2.address}:`,
    (await stanToken.balanceOf(client2.address)).toString()
  );
  await stanToken.transfer(artist.address, ethers.utils.parseEther("40.0"));
  console.log(
    `Balance Of ${artist.address}:`,
    (await stanToken.balanceOf(artist.address)).toString()
  );

  // Mint NFT
  const tx_0 = await stanNFT.createCollectible(simple_token_uri[0]);
  await tx_0.wait(1);
  const tx_1 = await stanNFT.createCollectible(simple_token_uri[1]);
  await tx_1.wait(1);
  const tx_2 = await stanNFT.createCollectible(simple_token_uri[2]);
  await tx_2.wait(1);
  const tx_3 = await stanNFT.createCollectible(simple_token_uri[3]);
  await tx_3.wait(1);

  // Signer transfer NFT has tokenId = 1 to artist
  await stanNFT.transferFrom(signer.address, stanNFT.address, 0);
  await stanNFT.transferFrom(signer.address, artist.address, 1);
  await stanNFT.transferFrom(signer.address, stanNFT.address, 2);
  await stanNFT.transferFrom(signer.address, stanNFT.address, 3);

  // Get all NFTs owned by stanNFT
  const totalNFTstanNFT = (await stanNFT.balanceOf(stanNFT.address)).toString();
  const NFTstanNFT = [];
  for (let i = 0; i < totalNFTstanNFT; i++) {
    const tokenId = await stanNFT.tokenOfOwnerByIndex(stanNFT.address, i);
    const token = await stanNFT.tokenURI(tokenId);
    NFTstanNFT.push(token);
  }
  console.log("Signer NFTs owns these NFTs:", NFTstanNFT);

  // Get all NFTs
  const totalNFTs = (await stanNFT.totalSupply()).toString();
  const NFTs = [];
  for (let i = 0; i < totalNFTs; i++) {
    const tokenId = await stanNFT.tokenByIndex(i);
    const token = await stanNFT.tokenURI(tokenId);
    NFTs.push(token);
  }
  console.log("All NFT of the contract is", NFTs);

  // Script #1: Client 1 aution in Aution having autionId = 1 with 0.1 Token
  // Client 1 approve 10 Token for StanNFT
  await stanToken
    .connect(client1)
    .approve(stanNFT.address, ethers.utils.parseEther("10.0"));
  console.log(
    "Client 1 has approved stanNFT the money is",
    (await stanToken.allowance(client1.address, stanNFT.address)).toString()
  );
  
  // Backend proceed service aution
  const txAution = await stanNFT.aution(
    client1.address,
    1,
    ethers.utils.parseEther("8.0")
  );

  console.log(
    "The new balance of stanNFT is",
    (await stanToken.balanceOf(stanNFT.address)).toString()
  );

  const rcAution = await txAution.wait(1);
  const eventApproveNFT = rcAution.events.find(
    // Catch event Aution
    (event) => event.event === "Aution"
  );
  const [_sender, _bidnumer, _autionId] = eventApproveNFT.args;
  console.log(
    `${_sender} aution successfully ${_bidnumer} with AutionId ${_autionId}`
  );

  // Script #2: Backend inform client 1 is the winner
  // Artist approve NFT has tokenId = 1 to stanNFT
  await stanNFT
    .connect(artist)
    .transferFrom(artist.address, stanNFT.address, 1);
  // GetWinner
  const txGetWinner = await stanNFT.getWinner(
    client1.address,
    artist.address,
    ethers.utils.parseEther("8.0"),
    1,
    1
  );

  const rcGetWinner = await txGetWinner.wait(1);
  const eventGetWinner = rcGetWinner.events.find(
    // Catch event Aution
    (event) => event.event === "Winner"
  );
  const [_winner, _tokenId, _artist, _bidNumber] = eventGetWinner.args;
  const balanceOfWinner = await stanToken.balanceOf(client1.address);

  console.log(
    `The winner is ${_winner} has won the NFT has id ${_tokenId} from ${_artist} artist with ${_bidNumber} bidding money and the balance remain of winner is ${balanceOfWinner}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
