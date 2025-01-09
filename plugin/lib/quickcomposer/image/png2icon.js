const png2icons = require("png2icons");
const fs = require("fs");
const path = require("path");

const pngToIcon = (input, outputDir, type = "ico") => {
  if (input instanceof Array) {
    input.forEach((input) => {
      pngToIcon(input, outputDir, type);
    });
    return;
  }
  let icon, outputFile, basename;
  console.log(input);
  if (input.startsWith("data:image/png;base64,")) {
    input = Buffer.from(input.split(",")[1], "base64");
    basename = new Date().getTime().toString();
  } else {
    basename = path.basename(input, ".png");
    input = fs.readFileSync(input);
  }
  if (type == "ico") {
    icon = png2icons.createICO(input, png2icons.BICUBIC, 0, false);
    outputFile = path.join(outputDir, basename + ".ico");
  } else {
    icon = png2icons.createICNS(input, png2icons.BILINEAR, 0);
    outputFile = path.join(outputDir, basename + ".icns");
  }
  if (!icon) return;
  fs.writeFile(outputFile, icon, (err) => {
    if (err) throw err;
  });
};

module.exports = {
  pngToIcon,
};
