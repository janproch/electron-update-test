const fs = require("fs");

function adjustAppFile(file) {
  const json = JSON.parse(fs.readFileSync(file, { encoding: "utf-8" }));
  json.name = 'electron-update-test-pacjson-premium';
  json.build.artifactName = "eutest-premium-${version}-${os}_${arch}.${ext}";
  json.build.appId = "com.jenasoft.eutest.premium";
  json.build.productName = "EU TEST PREMIUM";
  fs.writeFileSync(file, JSON.stringify(json, null, 2), "utf-8");
}

adjustAppFile("package.json");
