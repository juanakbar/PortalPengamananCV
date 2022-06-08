const NodeRSA = require("encrypt-rsa").default;
const fs = require("fs");
const path = require("path");

const nodeRSA = new NodeRSA();

// encrypt file
function encrypt(file_path) {
  // read compressed file in compressed folder
  const encryptedText = nodeRSA.encryptStringWithRsaPublicKey({
    text: file_path,
    keyPath: path.join(__dirname, "../files/keys/public-key"),
  });

  return encryptedText;
}

// decyrpt file
function decrypt(encryptedText, fn) {
  const decryptedText = nodeRSA.decryptStringWithRsaPrivateKey({
    text: encryptedText,
    keyPath: path.join(__dirname, "../files/keys/private-key"),
  });

  fs.readdir(decryptedText, (err) => {
    if (err) console.log(err);

    return fn(decryptedText);
  });
}

// create public and private keys

function generate_key() {
  const { privateKey, publicKey } = nodeRSA.createPrivateAndPublicKeys();

  fs.writeFileSync("./files/keys/private-key", privateKey);
  fs.writeFileSync("./files/keys/public-key", publicKey);
}

module.exports = {
  encrypt: encrypt,
  decrypt: decrypt,
  generate_key: generate_key,
};
