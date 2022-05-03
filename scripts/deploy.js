const hre = require("hardhat");
const fs = require("fs");

async function main() {
  /* these two lines deploy the contract to the network */
  const FIR = await hre.ethers.getContractFactory("FIR");
  const fir = await FIR.deploy("FIR Registry");

  await fir.deployed();
  console.log("FIR registry deployed to:", fir.address);

  /* this code writes the contract addresses to a local */
  /* file named config.js that we can use in the app */
  fs.writeFileSync(
    "./config.js",
    `
  export const contractAddress = "${fir.address}"
  export const ownerAddress = "${fir.signer.address}"
  `
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
