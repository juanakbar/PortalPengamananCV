const fs = require("fs");
const compressjs = require("compressjs");
const path = require("path");
const AdmZip = require("adm-zip");
var algorithm = compressjs.PPM;

var tempFileDir = "files/temp_file";
var downloadedFileDir = "files/downloaded_file/";

const zip = new AdmZip();

// compress file
function compress(fileName) {
  // read uploaded file
  var file = fs.readFileSync(tempFileDir + "/" + fileName);
  var compressed = algorithm.compressFile(file);
  var bufferedCompress = new Buffer.from(compressed);

  // write compressed file to folder
  zip.addFile(path.parse(fileName).name + ".txt", bufferedCompress);

  // zip the file
  fs.writeFileSync(
    "files/compressed_file/" + "cvs.zip",
    zip.toBuffer(),
    (err) => {
      if (!err) console.log("Compress Data written");
    }
  );
}

// decompress file
function decompress(file_path) {
  decompress_decrypt_start = performance.now();

  zip.extractAllTo(file_path, true);

  // read directory
  fs.readdir(file_path, (err, files) => {
    if (err) console.log(err);

    // foreach (loop) each file in directory
    for (const file of files) {
      console.log(file);
      if (file === "cvs.zip") {
        console.log("skip");
      } else {
        var readDecryptedFile = fs.readFileSync(file_path + "/" + file);
        var decompressed = algorithm.decompressFile(readDecryptedFile);
        var bufferedDecompress = new Buffer.from(decompressed);

        // write file (download)
        fs.writeFile(
          downloadedFileDir + file.replace(".txt", ""),
          bufferedDecompress,
          (err) => {
            if (!err) console.log("File downloaded!");
            else console.log(err);
          }
        );

        fs.unlink(path.join(file_path + "/", file), (err) => {
          if (err) console.log(err);
        });
      }
    }
  });

  decompress_decrypt_end = performance.now();
  decompress_decrypt_total =
    (decompress_decrypt_end - decompress_decrypt_start) / 1000;

  console.log(decompress_decrypt_total);
  return decompress_decrypt_total;
}

// extract then read file
function getFile(fileName, fn) {
  zip.extractAllTo(tempFileDir, true);

  fs.readdir(tempFileDir, (err, files) => {
    if (err) console.log(err);

    for (const file of files) {
      if (path.parse(fileName).name + ".txt" === file) {
        return fn(fs.readFileSync(tempFileDir + "/" + file).toString());
      }
    }
  });
}

function removeFiles() {
  // remove all uploaded files in folder
  fs.readdir(tempFileDir, (err, files) => {
    if (err) console.log(err);

    for (const file of files) {
      fs.unlink(path.join(tempFileDir, file), (err) => {
        if (err) console.log(err);
      });
    }
  });
}

module.exports = {
  compress: compress,
  decompress: decompress,
  getFile: getFile,
  removeFiles: removeFiles,
};
