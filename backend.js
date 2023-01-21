const express = require("express");
const app = express();
const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const contractABI = require("./contractABI"); // ABI of the smart contract
const contractAddress = "0x123456789abcdef..."; // Address of the deployed smart contract
const privateKey = "0x123456789abcdef..."; // Private key of the account that deploys the contract

app.use(express.json()); // Parse JSON request body

app.post("/bet", (req, res) => {
  const web3 = new Web3("http://localhost:8545"); // Connect to local blockchain node
  const contract = new web3.eth.Contract(contractABI, contractAddress);
  const amount = web3.utils.toWei(req.body.amount, "ether"); // Convert bet amount to wei

  // Get the current nonce for the account
  web3.eth.getTransactionCount(web3.eth.accounts.privateKeyToAccount(privateKey).address)
    .then(nonce => {
      // Build the transaction object
      const txObject = {
        nonce: web3.utils.toHex(nonce),
        to: contractAddress,
        value: web3.utils.toHex(amount),
        gasLimit: web3.utils.toHex(210000),
        gasPrice: web3.utils.toHex(web3.utils.toWei("10", "gwei")),
        data: contract.methods.flip().encodeABI()
      };

      // Sign the transaction
      const tx = new Tx(txObject, { chain: 'ropsten' });
      tx.sign(Buffer.from(privateKey.substring(2), "hex"));

      // Send the transaction to the blockchain
      const serializedTx = tx.serialize();
      web3.eth.sendSignedTransaction("0x" + serializedTx.toString("hex"))
        .on("receipt", receipt => {
          res.json({ success: true });
        })
        .on("error", error => {
          res.status(500).json({ error: error.message });
        });
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
