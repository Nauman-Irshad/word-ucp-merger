const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const DocxMerger = require("docx-merger");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("public")); // for index.html

app.post("/merge", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("Please upload at least one .docx file.");
    }

    // Load all uploaded docs as buffers
    let buffers = req.files.map((f) => fs.readFileSync(f.path));

    // Merge with section/page breaks
    let merger = new DocxMerger({ pageBreak: true }, buffers);

    // Generate merged buffer
    merger.save("nodebuffer", (data) => {
      const output = path.join(__dirname, "merged_output.docx");
      fs.writeFileSync(output, data);
      res.download(output, "merged_output.docx", () => {
        // cleanup
        req.files.forEach((f) => fs.unlinkSync(f.path));
        fs.unlinkSync(output);
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error merging documents.");
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
