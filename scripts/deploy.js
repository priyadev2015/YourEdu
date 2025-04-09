const hre = require("hardhat");

async function main() {
  // Deploy EducationalNFT contract
  const EducationalNFT = await hre.ethers.getContractFactory("EducationalNFT");
  const educationalNFT = await EducationalNFT.deploy();
  await educationalNFT.deployed();

  console.log("EducationalNFT deployed to:", educationalNFT.address);

  // For testing, authorize the deployer as an issuer
  const [deployer] = await hre.ethers.getSigners();
  await educationalNFT.authorizeIssuer(deployer.address);
  console.log("Deployer authorized as issuer:", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 