// npm start는 json에서 main으로 지정해뒀기 때문에
// cmd창에서 경로 입력 후 node fileread.js 하면 됨

var fs = require("fs");
fs.readFile("sample.txt", "utf-8", function (err, data) {
  // 읽고싶은 파일 명 = sample.txt
  console.log(data);
});
