# DashSC  

## Overview  
DashSC is a **smart contract development platform** which interacts with a **Node.js backend** to:  
✅ Compile Solidity smart contracts using `solc`

And intaract with wallet( Metamask, Coinbase, etc...) to:  
✅ Deploy contracts to the blockchain  
✅ Interact with deployed contracts by interpreting the ABI  

## Features  
- 🛠 **On-the-fly Solidity Compilation** via `solc`  
- 🌍 **Web-based Interface** for contract management  
- 🔗 **Automatic ABI Parsing** for seamless interaction  
- 🚀 **Smart Contract Deployment & Execution**  

## Installation  

Clone the repository and install dependencies:  

```sh
git clone https://github.com/Satachito/DashSC.git
cd DashSC
npm install
```

## Usage  

### 1. Start the Backend (Node.js)  
Run the Node.js server to handle compilation and deployment:  

```sh
node server.js
```

### 2. Open the Frontend  
Access the frontend in your browser:  

```
http://localhost:3000
```

### 3. Compile and Deploy  
- Upload or write your Solidity contract  
- Click "Compile" to generate the ABI  
- Deploy the contract to the configured network  

### 4. Interact with the Contract  
- The frontend reads the ABI and lists available contract methods  
- Users can call contract functions directly from the web UI  

## License  
This project is licensed under the **MIT License**.  

