import { css } from "@emotion/css";
import { useContext } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import Link from "next/link";
import { AccountContext } from "../context";

/* import contract address and contract owner address */
import { contractAddress, ownerAddress } from "../config";

/* import Application Binary Interface (ABI) */
import FIR from "../artifacts/contracts/FIR.sol/FIR.json";

export default function Home(props) {
  /* Complaints are fetched server side and passed in as props */
  /* see getServerSideProps */
  const { Complaints } = props;
  const account = useContext(AccountContext);

  const router = useRouter();
  async function navigate() {
    router.push("/create-fir");
  }

  return (
    <div>
      <div className={ComplaintList}>
        {
          /* map over the Complaints array and render a button with the Complaint title */
          Complaints.map((Complaint, index) => (
            <Link href={`/Complaint/${Complaint[2]}`} key={index}>
              <a>
                <div className={linkStyle}>
                  <p className={ComplaintTitle}>{Complaint[1]}</p>
                  <div className={arrowContainer}>
                    <img
                      src="/right-arrow.svg"
                      alt="Right arrow"
                      className={smallArrow}
                    />
                  </div>
                </div>
              </a>
            </Link>
          ))
        }
      </div>
      <div className={container}>
        {account === ownerAddress && Complaints && !Complaints.length && (
          /* if the signed in user is the account owner, render a button */
          /* to create the first Complaint */
          <button className={buttonStyle} onClick={navigate}>
            No complaints yet .... File first complaint
            <img src="/right-arrow.svg" alt="Right arrow" className={arrow} />
          </button>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  /* here we check to see the current environment variable */
  /* and render a provider based on the environment we're in */
  let provider;
  if (process.env.ENVIRONMENT === "local") {
    provider = new ethers.providers.JsonRpcProvider();
  } else if (process.env.ENVIRONMENT === "testnet") {
    provider = new ethers.providers.JsonRpcProvider(
      "https://rpc-mumbai.matic.today"
    );
  } else {
    provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com/");
  }

  const contract = new ethers.Contract(contractAddress, FIR.abi, provider);
  const data = await contract.fetchComplaints();
  return {
    props: {
      Complaints: JSON.parse(JSON.stringify(data)),
    },
  };
}

const arrowContainer = css`
  display: flex;
  flex: 1;
  justify-content: flex-end;
  padding-right: 20px;
`;

const ComplaintTitle = css`
  font-size: 30px;
  font-weight: bold;
  cursor: pointer;
  margin: 0;
  padding: 20px;
`;

const linkStyle = css`
  border: 2px solid #000;
  margin-top: 20px;
  border-radius: 8px;
  display: flex;
`;

const ComplaintList = css`
  width: 700px;
  margin: 0 auto;
  padding-top: 50px;
`;

const container = css`
  display: flex;
  justify-content: center;
`;

const buttonStyle = css`
  margin-top: 100px;
  background-color: #fafafa;
  outline: none;
  border: none;
  font-size: 44px;
  padding: 20px 70px;
  border-radius: 15px;
  cursor: pointer;
  box-shadow: 7px 7px rgba(0, 0, 0, 0.1);
`;

const arrow = css`
  width: 35px;
  margin-left: 30px;
`;

const smallArrow = css`
  width: 25px;
`;
