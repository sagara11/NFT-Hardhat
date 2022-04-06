import React from "react";
import Cookies from "js-cookie";
function Header() {
  const checkWalletIsConnected = async (profile) => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("pls add metmask");
    }

    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      Cookies.set("UserAddress", accounts[0]);
      // Cookies.get('UserAddress')

      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div id="header">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="#">
          Navbar
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item active">
              <a className="nav-link" href="#">
                Home <span className="sr-only">(current)</span>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                My NFT
              </a>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Dropdown
              </a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                <a className="dropdown-item" href="#">
                  Action
                </a>
                <a className="dropdown-item" href="#">
                  Another action
                </a>
                <div className="dropdown-divider" />
                <a className="dropdown-item" href="#">
                  Something else here
                </a>
              </div>
            </li>
            <li className="nav-item">
              <a className="nav-link disabled" href="#">
                Disabled
              </a>
            </li>
          </ul>
          <form className="form-inline my-2 my-lg-0">
            <button
              onClick={() => {
                checkWalletIsConnected();
              }}
              className="btn btn-outline-success my-2 my-sm-0"
              type="submit"
            >
              Connect wallet
            </button>
          </form>
        </div>
      </nav>
    </div>
  );
}
export default Header;
