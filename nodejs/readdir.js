var testFolder = "./data"; // = "data"
var fs = require("fs");

fs.readdir(testFolder, function (error, filelist) {
  console.log(filelist); // data에 있는 파일 목록을 찾음
});
