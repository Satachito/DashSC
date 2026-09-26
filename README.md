# DashSC  

## Overview  
DashSC is a **smart contract development platform** that interacts with a **Node.js backend** to:  
✅ Compile Solidity smart contracts using `solc`  

It also connects with wallets (MetaMask, Coinbase, etc.) to:  
✅ Deploy contracts to the blockchain  
✅ Interact with deployed contracts by interpreting the ABI  

## Features  
- 🛠 **On-the-fly Solidity Compilation** via `solc`  
- 🌍 **Web-based Interface** for contract management  
- 🔗 **Automatic ABI Parsing** for seamless interaction  
- 🚀 **Smart Contract Deployment & Execution**  

## Requirements

- Node.js 18 or later
- A Chromium-based browser (Chrome, Edge, Brave, …).
  DashSC uses the File System Access API and customized built-in elements (`<button is=…>`), which Safari and Firefox do not support.
- A wallet extension that supports [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963) (MetaMask, Coinbase Wallet, …)

## Installation  

Clone the repository **with its submodule** and install dependencies:  

```sh
git clone --recursive https://github.com/Satachito/DashSC.git
cd DashSC
npm install
```

If you already cloned without `--recursive`, run `git submodule update --init`.

## Usage  

### 1. Start the Backend (Node.js)  
Run the Node.js server that compiles Solidity sources:  

```sh
npm start
```

The server listens on `127.0.0.1:3000` only, because `/solc` has no authentication.
Use the `HOST` and `PORT` environment variables to change this.

### 2. Open the Frontend  
Access the frontend in your browser:  

```
http://localhost:3000
```

### 3. Compile and Deploy  
- Click **+ source** and write your Solidity contract (imports of `@openzeppelin/…` and of other sources on the page are resolved)  
- Click **COMPILE↓** to generate the ABI and bytecode  
- Enter constructor arguments as a JSON array (`["name", 100, [1,2]]`) or comma separated (`name, 100`), then click **DEPLOY→**  

### 4. Interact with the Contract  
- The frontend reads the ABI and lists available contract functions  
- Enter arguments and click **exec**. Arrays and tuples are written as JSON, `bool` as `true` / `false`, and the value of `payable` functions in Wei  
- `view` / `pure` functions show their return values; other functions send a transaction and show its hash and status  

### 5. Save and Load  
- The page state is kept in `localStorage` and restored on reload  
- **SAVE** / **LOAD** write and read a `.dsc` file. Only load `.dsc` files you trust  

## License  
This project is licensed under the **MIT License**. See [LICENSE](LICENSE).  

