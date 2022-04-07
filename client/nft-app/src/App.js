import "./App.css";
import Header from "./components/header";
import { ethers } from "ethers";
import artifacts from "./contracts/SimpleCollectible.json";
import axios from "axios";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const init = async (setNFTs, setContract, setSigner) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = await provider.getSigner();

  // const myAddress = await signer.getAddress();
  // await provider.getBlockNumber()
  const simpleCollectibleAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const simpleCollectibleABI = artifacts.abi;
  const simpleCollectibleContract = new ethers.Contract(
    simpleCollectibleAddress,
    simpleCollectibleABI,
    provider
  );

  const tokenCounter = (
    await simpleCollectibleContract.tokenCounter()
  ).toString();
  let NFTs = [];

  for (let i = 0; i < tokenCounter; i++) {
    const tokenId = await simpleCollectibleContract.tokenByIndex(i);
    const NFTTokenURIs = await simpleCollectibleContract.tokenURI(
      tokenId.toString()
    );
    const ownerOf = await simpleCollectibleContract.ownerOf(tokenId.toString());
    const authorization = await simpleCollectibleContract.getApproved(
      tokenId.toString()
    );
    let object = await axios.get(NFTTokenURIs);

    object.data = {
      ...object.data,
      ownerAddress: ownerOf,
      tokenId: tokenId.toString(),
      authorization: authorization,
    };
    NFTs.push(object.data);
  }
  setNFTs(NFTs);
  setContract(simpleCollectibleContract);
  setSigner(signer);
};

function App() {
  const [NFTs, setNFTs] = useState([]);
  const [contract, setContract] = useState("");
  const [signer, setSigner] = useState("");
  const [signerAddress, setSignerAddress] = useState(
    Cookies.get("UserAddress")
  );

  useEffect(() => {
    init(setNFTs, setContract, setSigner);
  }, []);

  window.ethereum.on("accountsChanged", function (accounts) {
    setSignerAddress(accounts[0]);
    Cookies.set("UserAddress", accounts[0]);
  });

  const handleBuyNFT = async (tokenId) => {
    const eth = ethers.utils.parseEther("1.0");
    const tx = await contract
      .connect(signer)
      .purchaseNFT(tokenId, { value: eth });
    await tx.wait(1);
    window.location.reload();
  };

  const handleSellNFT = async (
    tokenId,
    signer,
    signerAddress,
    ownerAddress
  ) => {
    let tx;
    if (signerAddress.toLowerCase() === ownerAddress.toLowerCase()) {
      tx = await contract
        .connect(signer)
        .transferFrom(
          signerAddress,
          "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
          tokenId
        );
    } else {
      tx = await contract
        .connect(signer)
        .transferFrom(
          ownerAddress,
          "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
          tokenId
        );
    }
    await tx.wait(1);
    window.location.reload();
  };

  const handleAuthorize = async (tokenId, signer) => {
    const tx = await contract
      .connect(signer)
      .approve("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", tokenId);
    await tx.wait(1);
    console.log(
      "Owner approve Client 2 to manage the NFT has tokenId = ",
      tokenId
    );
    window.location.reload();
  };

  const renderAuthorize = (signerAddress, signer, ownerAddress, item) => {
    if (signerAddress.toLowerCase() === ownerAddress.toLowerCase()) {
      return (
        <a
          href="#"
          className="btn btn-primary"
          onClick={() => {
            handleAuthorize(item.tokenId, signer);
          }}
        >
          Authorize
        </a>
      );
    }
  };

  const renderSend = (signerAddress, signer, ownerAddress, item) => {
    if (
      signerAddress.toLowerCase() === ownerAddress.toLowerCase() ||
      item.authorization !== "0x0000000000000000000000000000000000000000"
    ) {
      return (
        <a
          href="#"
          className="btn btn-primary"
          onClick={() => {
            handleSellNFT(item.tokenId, signer, signerAddress, ownerAddress);
          }}
        >
          Sell
        </a>
      );
    } else {
      return (
        <a
          href="#"
          className="btn btn-primary"
          onClick={() => {
            handleBuyNFT(item.tokenId);
          }}
        >
          Buy
        </a>
      );
    }
  };

  const renderCard = () => {
    return NFTs.map((item, index) => {
      return (
        <div key={index} className="col-sm-3">
          <div className="thumb-wrapper">
            <span className="wish-icon">
              <i className="fa fa-heart-o" />
            </span>
            <div className="img-box">
              <img
                src={`${item.image}`}
                className="img-fluid"
                alt={`${item.image}`}
              />
            </div>
            <div className="thumb-content">
              <h4>{item.name}</h4>
              <div className="star-rating">
                <ul className="list-inline">
                  <li className="list-inline-item">
                    <i className="fa fa-star" />
                  </li>
                  <li className="list-inline-item">
                    <i className="fa fa-star" />
                  </li>
                  <li className="list-inline-item">
                    <i className="fa fa-star" />
                  </li>
                  <li className="list-inline-item">
                    <i className="fa fa-star" />
                  </li>
                  <li className="list-inline-item">
                    <i className="fa fa-star-o" />
                  </li>
                </ul>
              </div>
              <p>{item.description}</p>
              <p className="owner-address">{item.ownerAddress}</p>
              <p className="item-price">
                <strike>5ETH</strike> <b>0.1ETH</b>
              </p>
              {renderAuthorize(signerAddress, signer, item.ownerAddress, item)}
              {renderSend(signerAddress, signer, item.ownerAddress, item)}
              <div className="authorization">
                <label>Authorize</label>
                <p className="owner-address">{item.authorization}</p>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div>
      <Header></Header>
      <section className="section-products">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h2>
                Featured <b>Products</b>
              </h2>
              <div
                id="myCarousel"
                className="carousel slide"
                data-ride="carousel"
                data-interval={0}
              >
                {/* Carousel indicators */}
                <ol className="carousel-indicators">
                  <li
                    data-target="#myCarousel"
                    data-slide-to={0}
                    className="active"
                  />
                  <li data-target="#myCarousel" data-slide-to={1} />
                  <li data-target="#myCarousel" data-slide-to={2} />
                </ol>
                {/* Wrapper for carousel items */}
                <div className="carousel-inner">
                  <div className="item carousel-item active">
                    <div className="row">{renderCard()}</div>
                  </div>
                </div>
                {/* Carousel controls */}
                <a
                  className="carousel-control-prev"
                  href="#myCarousel"
                  data-slide="prev"
                >
                  <i className="fa fa-angle-left" />
                </a>
                <a
                  className="carousel-control-next"
                  href="#myCarousel"
                  data-slide="next"
                >
                  <i className="fa fa-angle-right" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
