var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");
var template = require("./lib/template.js");
const path = require("path");
var sanitizeHtml = require("sanitize-html"); // sanitize는 외부에서 입력한 js를 살균

// http.createServer() = Node Module
// server.listen() = 요청에 대해 응답할 수 있도록 하는 API\
// http는 app에 담겨있음
// app.listen(3000) 3000번 포트를 귀 기울여 듣다가 응답
var app = http.createServer(function (request, response) {
  var _url = request.url; // 그냥 url은 모듈 url 의미
  var queryData = url.parse(_url, true).query; // true는 쿼리를 객체로 변환할지 여부
  var pathname = url.parse(_url, true).pathname;
  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./data", function (error, filelist) {
        var title = "Wellcome";
        var description = "Hello, Students";

        var list = template.list(filelist);
        var html = template.HTML(
          title,
          list,
          `<h2>${title}</h2><p>${description}</p>`,
          `<a href="/create">create</a>`
        );
        response.writeHead(200); // 200 = 성공
        response.end(html);
      });
    } else {
      fs.readdir("./data", function (error, filelist) {
        var filteredId = path.parse(queryData.id).base;
        // 외부에서 불러온 모듈(readFile)을 웹페이지에서 ../ 경로를 입력하여 찾을 수 없도록 해줌
        // 필터링 해주지 않으면 http://localhost:3000/?id=../password.js 했을 때 password.js의 정보가 출력 됨
        fs.readFile(`data/${filteredId}`, "utf-8", function (err, data) {
          // 경로 설정도 필터링 된 것으로 변경
          var title = queryData.id;
          var sanitizeTitle = sanitizeHtml(title);
          var description = data; // description = 본문
          var sanitizeDescription = sanitizeHtml(description, {
            allowedTags: ["h1"], // h1태그는 허용
          });
          var list = template.list(filelist);
          var html = template.HTML(
            sanitizeTitle,
            list,
            `<h2>${sanitizeTitle}</h2><p>${sanitizeDescription}</p>`,
            `<a href="/create">create</a> 
             <a href="/update?id=${sanitizeTitle}">update</a>
             
             <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${sanitizeTitle}">
                  <input type="submit" value="delete">
             </form>`
            // delete를 링크로 만들면, get방식(쿼리스트링 있는)으로 만들면 링크를 타고 들어가면 삭제됨
            // 반드시!! post 방식으로 보내야 한다
          );
          response.writeHead(200); // 200(서버가 브라우저에게 주면) = 성공
          response.end(html);
        });
      });
    }
  } else if (pathname === "/create") {
    fs.readdir("./data", function (error, filelist) {
      var title = "WEB - create";
      var description = "Create";
      var list = template.list(filelist);
      var html = template.HTML(
        title,
        list,
        ` 
        <form action="http://localhost:3000/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p><textarea name="description" placeholder="description"></textarea></p>
        <p><input type="submit"></p>
        </form>
        `,
        " "
      );
      response.writeHead(200); // 200 = 성공
      response.end(html);
    });
  } else if (pathname === "/create_process") {
    var body = "";
    // request가 데이터를 받을 대마다 호출되는 콜백 함수
    request.on("data", function (data) {
      body = body + data;
    });
    // request가 모든 데이터를 받은 후 호출되는 콜백 함수
    request.on("end", function () {
      // request를 끝내기 위한 콜백
      var post = qs.parse(body); // parse를 통하여 정보를 객체화
      var title = post.title;
      var description = post.description;
      // writeFile을 사용하여 파일 생성 및 쓰기
      fs.writeFile(`data/${title}`, description, "utf-8", function (err) {
        response.writeHead(302, { Location: `/?id=${title}` }); // 302 = 리다이렉션
        response.end(); // 리다이렉션(적절한 다른 페이지로 이동)
      });
      // console.log(post);
    });
  } else if (pathname === "/update") {
    fs.readdir("./data", function (error, filelist) {
      var filteredId = path.parse(queryData.id).base;
      fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
        var title = queryData.id;
        var list = template.list(filelist);
        var html = template.HTML(
          title,
          list,
          `
          <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p> 
            <p>
              <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if (pathname === "/update_process") {
    var body = "";
    request.on("data", function (data) {
      body = body + data;
    });
    request.on("end", function () {
      var post = qs.parse(body); // parse를 통하여 정보를 객체화
      var id = post.id;
      var title = post.title;
      var description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, function (error) {});
      console.log(post);
      fs.writeFile(`data/${title}`, description, "utf-8", function (err) {
        response.writeHead(302, { Location: `/?id=${title}` }); // 302 = 리다이렉션
        response.end();
      });
    });
  } else if (pathname === "/delete_process") {
    var body = "";
    request.on("data", function (data) {
      body = body + data;
    });
    request.on("end", function () {
      var post = qs.parse(body); // parse를 통하여 정보를 객체화
      var id = post.id;
      var filteredId = path.parse(id).base; // 이부분도 보안상 변경
      fs.unlink(`data/${filteredId}`, function (error) {
        response.writeHead(302, { Location: `/` }); // 302 = 리다이렉션
        response.end();
      });
    });
  } else {
    response.writeHead(404);
    response.end("Not Found");
  }
});
app.listen(3000);
