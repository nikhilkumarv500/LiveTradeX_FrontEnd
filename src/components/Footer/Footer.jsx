import React from "react";
import "./style.css";

const authorPortfolioUrl = process.env.REACT_APP_AUTHOR_PORTFOLIO_URL;

const Footer = () => {
  // console.log(authorPortfolioUrl);

  return (
    <>
      <div className="FooterContainer">
        <div className="footerVisitAuthorPageContainer">
          <div
            className="footerVisitAuthorPageContainerLinkContainer"
            onClick={() => window.open(authorPortfolioUrl, "_blank")}
          >
            <div className="footerVisitAuthorPageContainerLinkContainerLabel">
              Explore Creator's Portfolio
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
