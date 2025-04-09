// commenting out web3 usage

// import Web3 from 'web3';
// import EducationalNFT from '../contracts/artifacts/contracts/EducationalNFT.sol/EducationalNFT.json';

// // Initialize web3
// export const initWeb3 = async () => {
//   // Modern dapp browsers
//   if (window.ethereum) {
//     const web3 = new Web3(window.ethereum);
//     try {
//       // Request account access
//       await window.ethereum.request({ method: 'eth_requestAccounts' });
//       return web3;
//     } catch (error) {
//       throw new Error('User denied account access');
//     }
//   }
//   // Legacy dapp browsers
//   else if (window.web3) {
//     return new Web3(window.web3.currentProvider);
//   }
//   // Fallback to local node if no injected provider
//   else {
//     const provider = new Web3.providers.HttpProvider(process.env.REACT_APP_NETWORK_RPC_URL || 'http://127.0.0.1:8545');
//     return new Web3(provider);
//   }
// };

// // Get contract instance
// export const getContractInstance = async (web3) => {
//   if (!web3) {
//     throw new Error('Web3 not initialized');
//   }

//   const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

//   if (!contractAddress) {
//     throw new Error('Contract address not found in environment variables');
//   }

//   try {
//     console.log('Environment variables loaded:', {
//       contractAddress,
//       networkRPC: process.env.REACT_APP_NETWORK_RPC_URL,
//       networkId: process.env.REACT_APP_NETWORK_ID,
//       chainId: process.env.REACT_APP_CHAIN_ID
//     });

//     console.log('Creating contract instance at address:', contractAddress);
//     const contract = new web3.eth.Contract(
//       EducationalNFT.abi,
//       contractAddress
//     );

//     // Verify the contract is deployed
//     console.log('Checking contract code at address:', contractAddress);
//     const code = await web3.eth.getCode(contractAddress);
//     console.log('Contract code:', code);

//     if (code === '0x' || code === '0x0') {
//       throw new Error('No contract deployed at the specified address');
//     }

//     // Test a simple view function to verify the contract interface
//     try {
//       console.log('Testing contract interface...');
//       await contract.methods.name().call();
//       console.log('Contract interface test successful');
//     } catch (error) {
//       console.error('Contract interface test failed:', error);
//       throw new Error('Contract interface verification failed. Please check the ABI and contract address.');
//     }

//     console.log('Contract instance created successfully');
//     return contract;
//   } catch (error) {
//     console.error('Error creating contract instance:', error);
//     throw new Error(`Failed to create contract instance: ${error.message}`);
//   }
// };

// // Issue new credential
// export const issueCredential = async (contract, studentAddress, metadataURI, account) => {
//   try {
//     const result = await contract.methods
//       .issueCredential(studentAddress, metadataURI)
//       .send({ from: account });
//     return result;
//   } catch (error) {
//     throw new Error(`Failed to issue credential: ${error.message}`);
//   }
// };

// // Get credential details
// export const getCredentialDetails = async (contract, tokenId) => {
//   try {
//     const tokenURI = await contract.methods.tokenURI(tokenId).call();
//     const issuer = await contract.methods.getTokenIssuer(tokenId).call();
//     const owner = await contract.methods.ownerOf(tokenId).call();

//     // Instead of fetching from IPFS, create mock metadata
//     const metadata = {
//       name: "Mock Credential",
//       description: "This is a mock credential for demo purposes",
//       type: "certification",
//       difficulty: "intermediate",
//       duration: "3 months",
//       skills: ["Blockchain", "Smart Contracts"],
//       properties: {
//         issueDate: new Date().toISOString(),
//         issuer: {
//           name: "YourEDU Platform",
//           address: issuer
//         },
//         score: 95,
//         creditsEarned: 30
//       }
//     };

//     return {
//       tokenId,
//       issuer,
//       owner,
//       metadata,
//       tokenURI
//     };
//   } catch (error) {
//     console.error('Error getting credential details:', error);
//     throw new Error(`Failed to get credential details: ${error.message}`);
//   }
// };

// // Upload metadata to IPFS using Pinata
// export const uploadMetadataToIPFS = async (metadata) => {
//   try {
//     // For demo purposes, we'll create a mock IPFS hash and return a fake IPFS URI
//     const mockIpfsHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
//     console.log('Mock IPFS Upload Successful:', {
//       metadata,
//       ipfsHash: mockIpfsHash
//     });
//     return `ipfs://${mockIpfsHash}`;
//   } catch (error) {
//     console.error('Error uploading to IPFS:', error);
//     throw new Error(`Failed to upload metadata: ${error.message}`);
//   }
// };

// // Check if an address is an authorized issuer
// export const isAuthorizedIssuer = async (contract, address) => {
//   try {
//     return await contract.methods.isAuthorizedIssuer(address).call();
//   } catch (error) {
//     throw new Error(`Failed to check issuer status: ${error.message}`);
//   }
// };

// // Get all credentials for an address
// export const getAddressCredentials = async (contract, address) => {
//   if (!contract || !contract.methods) {
//     throw new Error('Contract not properly initialized');
//   }

//   try {
//     console.log('Getting balance for address:', address);
//     const balance = await contract.methods.balanceOf(address).call();
//     console.log('Balance:', balance);

//     const credentials = [];

//     for (let i = 0; i < balance; i++) {
//       try {
//         console.log(`Fetching token ${i + 1} of ${balance}`);
//         const tokenId = await contract.methods.tokenOfOwnerByIndex(address, i).call();
//         console.log('Token ID:', tokenId);
//         const details = await getCredentialDetails(contract, tokenId);
//         credentials.push(details);
//       } catch (error) {
//         console.error(`Error fetching token ${i}:`, error);
//         // Continue with the next token instead of failing completely
//         continue;
//       }
//     }

//     return credentials;
//   } catch (error) {
//     console.error('Error in getAddressCredentials:', error);
//     if (error.message.includes('Out of Gas')) {
//       throw new Error('Contract call failed: Out of Gas. Please check your network settings.');
//     } else if (error.message.includes('not fully synced')) {
//       throw new Error('Node not fully synced. Please wait for the node to sync.');
//     } else {
//       throw new Error(`Failed to get address credentials: ${error.message}`);
//     }
//   }
// };

// // Listen for credential events
// export const setupCredentialEventListeners = (contract, callback) => {
//   if (!contract || !contract.methods || !contract.events || !contract.events.CredentialIssued) {
//     console.warn('Contract not properly initialized for event listening');
//     return null;
//   }

//   try {
//     const eventEmitter = contract.events.CredentialIssued({
//       fromBlock: 'latest'
//     });

//     eventEmitter.on('data', (event) => {
//       callback({
//         type: 'CREDENTIAL_ISSUED',
//         tokenId: event.returnValues.tokenId,
//         student: event.returnValues.student,
//         issuer: event.returnValues.issuer
//       });
//     });

//     eventEmitter.on('error', (error) => {
//       console.error('Event listener error:', error);
//     });

//     return eventEmitter;
//   } catch (error) {
//     console.error('Error setting up event listeners:', error);
//     return null;
//   }
// };

// // Format credential data for display
// export const formatCredentialData = (credential) => {
//   return {
//     id: credential.tokenId,
//     title: credential.metadata.name,
//     description: credential.metadata.description,
//     type: credential.metadata.type,
//     verified: true, // All blockchain credentials are verified
//     score: credential.metadata.properties?.score || 0,
//     skills: credential.metadata.skills || [],
//     issuer: credential.issuer,
//     evidence: credential.tokenURI,
//     metadata: {
//       difficulty: credential.metadata.difficulty,
//       duration: credential.metadata.duration,
//       creditsEarned: credential.metadata.properties?.creditsEarned || 0
//     }
//   };
// };

// // Verify a credential
// export const verifyCredential = async (contract, tokenId) => {
//   try {
//     // Get the credential details
//     const tokenURI = await contract.methods.tokenURI(tokenId).call();
//     const issuer = await contract.methods.getTokenIssuer(tokenId).call();
//     const owner = await contract.methods.ownerOf(tokenId).call();

//     // Check if the issuer is authorized
//     const isAuthorized = await contract.methods.isAuthorizedIssuer(issuer).call();

//     // Get the metadata
//     const response = await fetch(tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/'));
//     const metadata = await response.json();

//     // Verify the credential
//     return {
//       isValid: isAuthorized,
//       tokenId,
//       issuer,
//       owner,
//       metadata,
//       tokenURI,
//       verificationDetails: {
//         issuedAt: metadata.properties?.issueDate,
//         issuerName: metadata.properties?.issuer?.name,
//         issuerAddress: issuer,
//         isIssuerAuthorized: isAuthorized,
//         blockchainProof: {
//           contract: contract._address,
//           tokenId,
//           owner,
//           issuer
//         }
//       }
//     };
//   } catch (error) {
//     throw new Error(`Failed to verify credential: ${error.message}`);
//   }
// };

// // Batch verify multiple credentials
// export const batchVerifyCredentials = async (contract, tokenIds) => {
//   try {
//     const verificationResults = await Promise.all(
//       tokenIds.map(tokenId => verifyCredential(contract, tokenId))
//     );
//     return verificationResults;
//   } catch (error) {
//     throw new Error(`Failed to batch verify credentials: ${error.message}`);
//   }
// };
