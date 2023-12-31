const { getSelectors, FacetCutAction } = require('./libraries/diamond.js');
const hre = require('hardhat');

const upgradeExample = async () => {

    const FacetName = "CraftFacet"
    const Facet = await ethers.getContractFactory(FacetName)
    const facet = await Facet.deploy()
    await facet.deployed()
    console.log(`${FacetName} deployed: ${facet.address}`);

    //await verifyContract(facet, FacetName);

    const diamondAddress = "0x55Fd95F322ED24705441806b73dD969558f5E9E5"; //current v3 mantletest
    //const diamondAddress = "0x5517607D21409833917F48b0826F9793a354f68F"; //current v2 mantle
    const newFacetAddress = facet.address;

    const diamondCutFacet = await ethers.getContractAt(
        "DiamondCutFacet",
        diamondAddress
    );

    const NewFacet = await ethers.getContractFactory(FacetName);
    const selectorsToAdd = getSelectors(NewFacet);

    const tx = await diamondCutFacet.diamondCut(
        [
        {
            facetAddress: newFacetAddress,
            action: FacetCutAction.Add,
            functionSelectors: selectorsToAdd,
        },
        ],
        ethers.constants.AddressZero,
        "0x",
        { gasLimit: 800000 }
    );

    const receipt = await tx.wait();
    if (!receipt.status) {
        throw Error(`Diamond upgrade failed: ${tx.hash}`);
    } else {
        console.log("Diamond upgrade success");
    }
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
upgradeExample()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });
}


// async function verifyContract (diamond, FacetName, constructorArguments = []) {
//     // const liveNetworks = ['mainnet', 'goerli', 'mumbai', 'scroll'];
//     // if (!liveNetworks.includes(hre.network.name)) {
//     //   return; // Don't verify on test networks
//     // }
  
//     try {
//       console.log("Waiting for 10 blocks to be mined...");
//       //await diamond.deployTransaction.wait(10);
//       console.log("Running verification");
//       await hre.run("verify:verify", {
//         address: diamond.address,
//         contract: `contracts/facets/${FacetName}.sol:${FacetName}`,
//         network: hardhatArguments.network,
//         arguments: constructorArguments ? constructorArguments : [],
//       });
//     } catch (e) {
//       console.log("Verification failed: ", JSON.stringify(e, null, 2));
//     }    
// }

async function verifyContract(diamond, FacetName, constructorArguments = []) {
    const liveNetworks = [
      "mainnet",
      "goerli",
      "mumbai",
      "scroll",
      "arbitrumGoerli",
      "fuji",
      "mantle"
    ];
    if (!liveNetworks.includes(hre.network.name)) {
      return; // Don't verify on test networks
    }
  
    try {
      console.log("Waiting for 10 blocks to be mined...");
      await diamond.deployTransaction.wait(10);
      console.log("Running verification");
      await hre.run("verify:verify", {
        address: diamond.address,
        contract: `contracts/facets/${FacetName}.sol:${FacetName}`,
        network: hardhatArguments.network,
        arguments: constructorArguments ? constructorArguments : [],
      });
    } catch (e) {
      console.log("Verification failed: ", JSON.stringify(e, null, 2));
      console.log(e);
    }
}