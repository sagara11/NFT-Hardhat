const { expect } = require("chai");
const { ethers } = require("hardhat");

const simple_token_uri = [
  "https://ipfs.io/ipfs/Qmd9MCGtdVz2miNumBHDbvj8bigSgTwnr4SbyH6DNnpWdt?filename=0-PUG.json",
  "https://ipfs.io/ipfs/Qmd9MCGtdVz2miNumBHDbvj8bigSgTwnr4SbyH6DNnpWdt?filename=1-SHIBA_INU.json",
  "https://ipfs.io/ipfs/Qmd9MCGtdVz2miNumBHDbvj8bigSgTwnr4SbyH6DNnpWdt?filename=2-ST_BERNARD.json",
  "https://ipfs.io/ipfs/Qmd9MCGtdVz2miNumBHDbvj8bigSgTwnr4SbyH6DNnpWdt?filename=2-ST_BERNARD.json",
  "https://ipfs.io/ipfs/Qmd9MCGtdVz2miNumBHDbvj8bigSgTwnr4SbyH6DNnpWdt?filename=2-ST_BERNARD.json",
];

const _bidNumber = ethers.utils.parseEther("8.0");
const _autionId = 1;
const _price = ethers.utils.parseEther("1.0");
const _artistTokenId = 2;

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
    const tx_0 = await stanNFT.createCollectible(simple_token_uri[0], _price);
    await tx_0.wait(1);
    const tx_1 = await stanNFT.createCollectible(simple_token_uri[1], _price);
    await tx_1.wait(1);
    const tx_2 = await stanNFT.createCollectible(simple_token_uri[2], _price);
    await tx_2.wait(1);
    const tx_3 = await stanNFT.createCollectible(simple_token_uri[3], _price);
    await tx_3.wait(1);
    const tx_4 = await stanNFT.createCollectible(simple_token_uri[4], _price);
    await tx_4.wait(1);

    // Signer transfer NFT has tokenId = 1 to artist
    await stanNFT.transferFrom(signer.address, stanNFT.address, 0);
    await stanNFT.transferFrom(signer.address, artist.address, 1);
    await stanNFT.transferFrom(signer.address, artist.address, 2);
    await stanNFT.transferFrom(signer.address, stanNFT.address, 3);
    await stanNFT.transferFrom(signer.address, artist.address, 4);

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
      it("Balance of user should equal to bidnumber", async function () {
        await stanNFTInstance.aution(client1.address, _autionId, _bidNumber);
        const balanceOfClient1 = (
          await stanNFTInstance.balanceOfFan(client1.address)
        ).toString();

        expect(balanceOfClient1).to.equal(_bidNumber);
      });

      it("Should receive event Aution", async function () {
        await stanNFTInstance.aution(client1.address, _autionId, _bidNumber);
        await expect(
          await stanNFTInstance.aution(client1.address, _autionId, _bidNumber)
        )
          .to.emit(stanNFTInstance, "Aution")
          .withArgs(client1.address, _bidNumber, _autionId);
      });

      it("Should raise exception when client 1 do not have enought money to bid", async function () {
        expect(
          stanNFTInstance.aution(
            client1.address,
            _autionId,
            ethers.utils.parseEther("50.0")
          )
        ).to.be.revertedWith("Not enough money to proceed");
      });
    });
  });

  describe("GetWinner", function () {
    let beforeBalanceOfWinner;
    let beforeTokenArtist;

    before(async () => {
      await stanNFTInstance
        .connect(artist)
        .transferFrom(artist.address, stanNFTInstance.address, 1);

      beforeBalanceOfWinner = await stanNFTInstance.balanceOfFan(
        client1.address
      );

      beforeTokenArtist = await stanToken.balanceOf(artist.address);

      await stanNFTInstance.getWinner(
        client1.address,
        artist.address,
        _bidNumber,
        1,
        _autionId
      );
    });

    describe("if the winner is invalid", function () {
      it("Invalid winner should be reverted with exception", async function () {
        expect(
          stanNFTInstance.getWinner(
            client2.address,
            _autionId,
            _bidNumber,
            1,
            _autionId
          )
        ).to.be.revertedWith("Invalid winner");
      });

      it("Should raise exception if artist didn't transfer NFT to StanNFT", async function () {
        expect(
          stanNFTInstance.getWinner(
            client2.address,
            _autionId,
            _bidNumber,
            2,
            _autionId
          )
        ).to.be.revertedWith(
          "The artist didn't transfer the NFT to StanNFT smart contract"
        );
      });
    });

    describe("if the winner is valid", function () {
      it("The balance of winner should be subtracted properly", async function () {
        const afterBalanceOfWinner = await stanNFTInstance.balanceOfFan(
          client1.address
        );

        expect(
          parseInt(ethers.utils.formatEther(afterBalanceOfWinner)) +
            parseInt(ethers.utils.formatEther(_bidNumber))
        ).to.equal(parseInt(ethers.utils.formatEther(beforeBalanceOfWinner)));
      });

      it("The winner shoudl own NFT has tokenId = 1", async function () {
        expect(await stanNFTInstance.ownerOf(1)).to.equal(client1.address);
      });

      it("The artist should receive bidnumber tokens", async function () {
        const afterTokenArtist = await stanToken.balanceOf(artist.address);
        expect(
          parseInt(ethers.utils.formatEther(beforeTokenArtist)) +
            parseInt(ethers.utils.formatEther(_bidNumber))
        ).to.equal(parseInt(ethers.utils.formatEther(afterTokenArtist)));
      });
    });
  });

  describe("Buy", function () {
    let beforeTokenArtist;
    before(async () => {
      // Client 1 approve 10 Token for StanNFT
      await stanToken
        .connect(client1)
        .approve(stanNFTInstance.address, ethers.utils.parseEther("1.0"));

      await stanNFTInstance
        .connect(artist)
        .transferFrom(artist.address, stanNFTInstance.address, _artistTokenId);

      beforeTokenArtist = await stanToken.balanceOf(artist.address);

      await stanNFTInstance.buy(
        client1.address,
        _artistTokenId,
        artist.address
      );
    });

    describe("if balance of client 1 is larger or equal to price", function () {
      it("Balance of user should equal to price", async function () {
        const balanceOfClient1 = await stanNFTInstance.balanceOfFan(
          client1.address
        );

        expect(balanceOfClient1).to.equal(0);
      });

      it("The NFT has token_id = 2 should be belonged to buyer", async function () {
        expect(await stanNFTInstance.ownerOf(_artistTokenId)).to.equal(
          client1.address
        );
      });

      it("The artist should receive price tokens", async function () {
        const afterTokenArtist = await stanToken.balanceOf(artist.address);
        expect(
          parseInt(ethers.utils.formatEther(beforeTokenArtist)) +
            parseInt(ethers.utils.formatEther(_price))
        ).to.equal(parseInt(ethers.utils.formatEther(afterTokenArtist)));
      });
    });

    describe("if balance of client 1 is smaller than price", function () {
      it("Balance of user should equal to price", async function () {
        const balanceOfClient1 = await stanNFTInstance.balanceOfFan(
          client1.address
        );

        expect(balanceOfClient1).to.equal(0);
      });

      it("The NFT has token_id = 2 should be belonged to buyer", async function () {
        expect(await stanNFTInstance.ownerOf(_artistTokenId)).to.equal(
          client1.address
        );
      });

      it("The artist should receive price tokens", async function () {
        const afterTokenArtist = await stanToken.balanceOf(artist.address);
        expect(
          parseInt(ethers.utils.formatEther(beforeTokenArtist)) +
            parseInt(ethers.utils.formatEther(_price))
        ).to.equal(parseInt(ethers.utils.formatEther(afterTokenArtist)));
      });

      it("Should raise exception when client 1 do not have enought money to bid", async function () {
        expect(
          stanNFTInstance.buy(client1.address, _artistTokenId, artist.address)
        ).to.be.revertedWith("Not enough money to proceed");
      });
    });
  });

  describe("Purchase", function () {
    let beforeTokenBuyer;
    let beforeTokenArtist;

    before(async () => {
      await stanNFTInstance
        .connect(artist)
        .transferFrom(artist.address, stanNFTInstance.address, 4);

      await stanToken
        .connect(client2)
        .approve(stanNFTInstance.address, ethers.utils.parseEther("20.0"));

      beforeTokenArtist = await stanToken.balanceOf(artist.address);
      beforeTokenBuyer = await stanToken.balanceOf(client2.address);

      await stanNFTInstance.purchase(
        client2.address,
        artist.address,
        ethers.utils.parseEther("20.0"),
        4
      );
    });

    describe("Client 2 want to buy NFT that has tokenId = 4 from artist with 20 Tokens", function () {
      it("The balance of buyer should be subtracted properly", async function () {
        afterTokenBuyer = await stanToken.balanceOf(client2.address);

        expect(
          parseInt(ethers.utils.formatEther(afterTokenBuyer)) + parseInt(20)
        ).to.equal(parseInt(ethers.utils.formatEther(beforeTokenBuyer)));
      });

      it("The buyer should own NFT has tokenId = 4", async function () {
        expect(await stanNFTInstance.ownerOf(4)).to.equal(client2.address);
      });

      it("The artist should receive 20 tokens", async function () {
        const afterTokenArtist = await stanToken.balanceOf(artist.address);

        expect(
          parseInt(ethers.utils.formatEther(beforeTokenArtist)) + parseInt(20)
        ).to.equal(parseInt(ethers.utils.formatEther(afterTokenArtist)));
      });
    });
  });
});
