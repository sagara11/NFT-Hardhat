const hre = require("hardhat");
const ethers = hre.ethers;

const simple_token_uri = [
  "https://ipfs.io/ipfs/Qmd9MCGtdVz2miNumBHDbvj8bigSgTwnr4SbyH6DNnpWdt?filename=0-PUG.json",
  "https://ipfs.io/ipfs/Qmd9MCGtdVz2miNumBHDbvj8bigSgTwnr4SbyH6DNnpWdt?filename=1-SHIBA_INU.json",
  "https://ipfs.io/ipfs/Qmd9MCGtdVz2miNumBHDbvj8bigSgTwnr4SbyH6DNnpWdt?filename=2-ST_BERNARD.json",
  "https://ipfs.io/ipfs/Qmd9MCGtdVz2miNumBHDbvj8bigSgTwnr4SbyH6DNnpWdt?filename=2-ST_BERNARD.json",
];

async function main() {
  const [signer, client1, client2, client3] = await ethers.getSigners();
  const SimpleCollectible = await hre.ethers.getContractFactory(
    "SimpleCollectible"
  );
  const simpleCollectible = await SimpleCollectible.deploy();

  await simpleCollectible.deployed();

  console.log("SimpleCollectible deployed to:", simpleCollectible.address);
  // Mint NFT
  const tx_0 = await simpleCollectible.createCollectible(simple_token_uri[0]);
  await tx_0.wait(1);
  const tx_1 = await simpleCollectible.createCollectible(simple_token_uri[1]);
  await tx_1.wait(1);
  const tx_2 = await simpleCollectible.createCollectible(simple_token_uri[2]);
  await tx_2.wait(1);
  const tx_3 = await simpleCollectible.createCollectible(simple_token_uri[3]);
  await tx_3.wait(1);
  // const tokenId = (await simpleCollectible.tokenCounter()).toString() - 1;
  // console.log(
  //   `Awesome, you can use your NFT at https://testnets.opensea.io/assets/${simpleCollectible.address}/${tokenId}`
  // );
  // console.log(
  //   "Please wait up to 20 minutes, and hit the refresh metadata button. "
  // );

  // Get all token ownen by owner
  const balanceOf = (
    await simpleCollectible.balanceOf(signer.address)
  ).toString();
  const tokenIdsOfOwner = [];
  for (let i = 0; i < balanceOf; i++) {
    const tokenId = await simpleCollectible.tokenOfOwnerByIndex(
      signer.address,
      i
    );
    tokenIdsOfOwner.push(tokenId.toString());
  }
  console.log(tokenIdsOfOwner);

  // Get all tokenId
  const totalSupply = await simpleCollectible.totalSupply();
  const allTokenIds = [];
  for (let i = 0; i < totalSupply; i++) {
    const tokenId = await simpleCollectible.tokenByIndex(i);
    allTokenIds.push(tokenId.toString());
  }
  console.log(allTokenIds);

  // Buy NFT
  const txPurchaseNFT = await simpleCollectible
    .connect(client1)
    .purchaseNFT(0, { value: ethers.utils.parseEther("0.01") });
  const rcPurchaseNFT = await txPurchaseNFT.wait(1);
  const eventPurchaseNFT = rcPurchaseNFT.events.find(
    (event) => event.event === "Purchase"
  );
  const [_from, _to, _tokenId, _amount] = eventPurchaseNFT.args;
  console.log(_from, _to, _tokenId.toString(), _amount.toString());
  console.log("Client 1 Bought the NFT has tokenId = ", _tokenId.toString());

  // Sell NFT
  const txSellSolely = await simpleCollectible.transferFrom(
    signer.address,
    client3.address,
    2
  );
  await txSellSolely.wait(1);
  console.log("Owner sell Client3 the tokenId =", 2);

  // Owner approve Client 2 to manage tokenId = 1
  const txApproveNFT = await simpleCollectible.approve(client2.address, 1);
  const rcApproveNFT = await txApproveNFT.wait(1);
  const eventApproveNFT = rcApproveNFT.events.find(
    (event) => event.event === "Approval"
  );
  const [owner, approved, tokenId] = eventApproveNFT.args;
  console.log(owner, approved, tokenId.toString());
  console.log(
    "Owner approve Client 2 to manage the NFT has tokenId = ",
    tokenId.toString()
  );

  // Client 2 sell tokenId = 1 to Client 3 through authorization of signer
  const txSellNFT = await simpleCollectible
    .connect(client2)
    .transferFrom(signer.address, client3.address, 1);
  const rcSellNFT = await txSellNFT.wait(1);
  const eventSellNFT = rcSellNFT.events.find(
    (event) => event.event === "Transfer"
  );
  const [from, to] = eventSellNFT.args;
  console.log(from, to, 1);
  console.log("Client 2 sold Client 3 the NFT has tokenId = ", 1);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
