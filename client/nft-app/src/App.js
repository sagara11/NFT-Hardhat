import "./App.css";
import Header from "./components/header";
import { ethers } from "ethers";
import artifacts from "./contracts/SimpleCollectible.json";
import axios from "axios";
import { useEffect, useState } from "react";

const init = async (setNFTs) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = await provider.getSigner();
  const myAddress = await signer.getAddress();
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
    let object = await axios.get(NFTTokenURIs);

    object.data = { ...object.data, ownerAddress: ownerOf };
    NFTs.push(object.data);
  }
  setNFTs(NFTs);
  console.log(NFTs);
};

function App() {
  const [NFTs, setNFTs] = useState([]);

  useEffect(() => {
    init(setNFTs);
  }, []);

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
              <p>{item.ownerAddress}</p>
              <p className="item-price">
                <strike>5ETH</strike> <b>0.1ETH</b>
              </p>
              <a href="#" className="btn btn-primary">
                Buy
              </a>
            </div>
          </div>
        </div>
      );
    });
  };
  return (
    <div>
      <Header></Header>
      <section classname="section-products">
        <div classname="container">
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
