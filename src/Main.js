const express = require("express");
var app = express();
const fs = require("fs");
const path = require("path");

const multer = require("multer");
const cors = require("cors");

const ppm = require("./PPM");
const crypto = require("./RSA_NPM");

app.use(cors({ credentials: true, origin: true }));

// ----------------------------------------------------

var filePath;
var encryptedText;

var privateKey = "";
var publicKey = "";

var tempFileDir = "files/temp_file";
var compressedFileDir = "files/compressed_file";

var compress_encrypt_start;
var compress_encrypt_end;
var compress_encrypt_total;
var decompress_decrypt_start;
var decompress_decrypt_end;
var decompress_decrypt_total;

// store uploaded files to folder
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempFileDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const mul = multer({ storage: storage });

// generate public & private key
app.get("/generate_key", (req, res) => {
  if (privateKey && publicKey) console.log("keys exist");
  else crypto.generate_key();
});

// read public and private key
app.get("/get_key", (req, res) => {
  try {
    publicKey = fs.readFileSync("./files/keys/public-key").toString();
    privateKey = fs.readFileSync("./files/keys/private-key").toString();

    removePublicStart = publicKey.replace("-----BEGIN PUBLIC KEY-----\n", "");
    publicKey = removePublicStart.replace("\n-----END PUBLIC KEY-----\n", "");

    removePrivateStart = privateKey.replace(
      "-----BEGIN PRIVATE KEY-----\n",
      ""
    );
    privateKey = removePrivateStart.replace(
      "\n-----END PRIVATE KEY-----\n",
      ""
    );
  } catch (error) {
    res.send("No Keys");
  }

  res.send({
    public_key: publicKey,
    private_key: privateKey,
  });
});

// post uploaded data, compress, and encrypt file
app.post("/upload_file", mul.single("file"), (req, res) => {
  filePath = req.file.filename;
  compress_encrypt_start = performance.now();

  ppm.compress(filePath);
  encryptedText = crypto.encrypt(compressedFileDir);

  compress_encrypt_end = performance.now();
  compress_encrypt_total =
    (compress_encrypt_end - compress_encrypt_start) / 1000;

  res.send(encryptedText);
});

// get data
app.get("/get_file", (req, res) => {
  ppm.getFile(filePath, function (response) {
    res.send({
      encrypted_file: encryptedText,
      compressed_file: response,
      runtime: compress_encrypt_total.toString().slice(0, 4),
    });
  });

  ppm.removeFiles();
});

// get download file, decompress, and decrypt file
app.get("/download_file", mul.single("image"), (req, res) => {
  decompress_decrypt_start = performance.now();

  var decrypted = crypto.decrypt(encryptedText, function (response) {
    ppm.decompress(response);
  });

  decompress_decrypt_end = performance.now();
  decompress_decrypt_total =
    (decompress_decrypt_end - decompress_decrypt_start) / 1000;

  // runtime doesn't make sense
  res.send({
    runtime: decompress_decrypt_total,
  });
});

// ----------------------------------------------------

const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log(`Server started on port ${PORT}`));
