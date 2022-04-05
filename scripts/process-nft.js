const hre = require("hardhat");
const ethers = hre.ethers;

const simple_token_uri =
  "https://ipfs.io/ipfs/Qmd9MCGtdVz2miNumBHDbvj8bigSgTwnr4SbyH6DNnpWdt?filename=0-PUG.json";

async function main() {
  const [owner, client1, client2] = await ethers.getSigners();
  const SimpleCollectible = await hre.ethers.getContractFactory(
    "SimpleCollectible"
  );
  const simpleCollectible = await SimpleCollectible.deploy();

  await simpleCollectible.deployed();

  console.log("SimpleCollectible deployed to:", simpleCollectible.address);
  // Mint NFT
  const tx = await simpleCollectible.createCollectible(simple_token_uri);
  const rc = await tx.wait(1);
  const tokenId = (await simpleCollectible.tokenCounter()).toString() - 1;
  console.log(
    `Awesome, you can use your NFT at https://testnets.opensea.io/assets/${simpleCollectible.address}/${tokenId}`
  );
  console.log(
    "Please wait up to 20 minutes, and hit the refresh metadata button. "
  );

  // Buy NFT
  const txPurchaseNFT = await simpleCollectible
    .connect(client1)
    .purchaseNFT(0, { value: ethers.utils.parseEther("1.0") });
  const rcPurchaseNFT = await txPurchaseNFT.wait(1);
  const eventPurchaseNFT = rcPurchaseNFT.events.find(
    (event) => event.event === "Purchase"
  );
  const [_from, _to, _tokenId, _amount] = eventPurchaseNFT.args;
  console.log(_from, _to, _tokenId.toString(), _amount.toString());

  console.log((await simpleCollectible.ownerOf(0)))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
