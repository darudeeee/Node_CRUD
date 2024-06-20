// var template을 지우고 module.exports을 쓴다.
// 모듈을 불러올 때에는 파일 이 름이 template.js라 지워도 된다.

module.exports = {
  HTML: function (title, list, body, control) {
    return `<!doctype html>
            <html>
            <head>
              <title>WEB1 - ${title}</title>
              <meta charset="utf-8">
            </head>
            <body>
              <h1><a href="/">WEB</a></h1>
              ${list}
              ${control}
              ${body}
            </body>
            </html>
        `;
  },

  list: function (filelist) {
    var list = "<ul>";
    var i = 0;
    while (i < filelist.length) {
      list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
      i = i + 1;
    }
    list = list + "</ul>";
    return list;
  },
};

/* 여기에 쓸 것이면 
module.exports = {
  HTML: HTML,
  list: list
}; */
