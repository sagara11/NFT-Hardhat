const { expect } = require("chai");
const { ethers } = require("hardhat");

const simple_token_uri = [
  "https://ipfs.io/ipfs/Qmd9MCGtdVz2miNumBHDbvj8bigSgTwnr4SbyH6DNnpWdt?filename=0-PUG.json",
  "https://ipfs.io/ipfs/Qmd9MCGtdVz2miNumBHDbvj8bigSgTwnr4SbyH6DNnpWdt?filename=1-SHIBA_INU.json",
  "https://ipfs.io/ipfs/Qmd9MCGtdVz2miNumBHDbvj8bigSgTwnr4SbyH6DNnpWdt?filename=2-ST_BERNARD.json",
  "https://ipfs.io/ipfs/Qmd9MCGtdVz2miNumBHDbvj8bigSgTwnr4SbyH6DNnpWdt?filename=2-ST_BERNARD.json",
];

const _bidNumber = ethers.utils.parseEther("8.0");
const _autionId = 1;

describe("StanNFT", () => {
  let stanNFTInstance;
  let client1;
  let client2;
  let artist;

  before(async () => {
    [signer, client1, client2, artist] = await ethers.getSigners();

    const StanToken = await ethers.getContractFactory("StanToken");
    stanToken = await StanToken.deploy();
    await stanToken.deployed();

    const StanNFT = await ethers.getContractFactory("StanNFT");
    const stanNFT = await StanNFT.deploy(stanToken.address);
    await stanNFT.deployed();

    // Signer tranfer to each client some Tokens
    await stanToken.transfer(client1.address, ethers.utils.parseEther("20.0"));
    await stanToken.transfer(client2.address, ethers.utils.parseEther("30.0"));
    await stanToken.transfer(artist.address, ethers.utils.parseEther("40.0"));

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

    stanNFTInstance = stanNFT;
  });

  describe("Aution", function () {
    beforeEach(async () => {
      // Client 1 approve 10 Token for StanNFT
      await stanToken
        .connect(client1)
        .approve(stanNFTInstance.address, ethers.utils.parseEther("10.0"));

      // Backend proceed service aution
      await stanNFTInstance.aution(client1.address, _autionId, _bidNumber);
    });

    describe("if balance of client 1 is larger or equal to bidnumber", function () {
      it("Balance of user should equal to bidnumber", async function () {
        const balanceOfClient1 = (
          await stanNFTInstance.balanceOfFan(client1.address)
        ).toString();

        expect(balanceOfClient1).to.equal(_bidNumber);
      });

      it("Should receive event Aution", async function () {
        await expect(
          await stanNFTInstance.aution(client1.address, _autionId, _bidNumber)
        )
          .to.emit(stanNFTInstance, "Aution")
          .withArgs(client1.address, _bidNumber, _autionId);
      });
    });

    describe("if balance of client 1 is smaller than bidnumber", function () {
      beforeEach(async () => {
        await stanNFTInstance.aution(client1.address, _autionId, _bidNumber);
      });
      it("Balance of user should equal to bidnumber", async function () {
        const balanceOfClient1 = (
          await stanNFTInstance.balanceOfFan(client1.address)
        ).toString();

        expect(balanceOfClient1).to.equal(_bidNumber);
      });

      it("Should receive event Aution", async function () {
        await expect(
          await stanNFTInstance.aution(client1.address, _autionId, _bidNumber)
        )
          .to.emit(stanNFTInstance, "Aution")
          .withArgs(client1.address, _bidNumber, _autionId);
      });

      it("Should raise exception when client 1 do not have enought money to bid", async function () {
        expect(
          stanNFTInstance.aution(client1.address, _autionId, _bidNumber)
        ).to.be.revertedWith("Not enough money to bid");
      });
    });
  });
});
