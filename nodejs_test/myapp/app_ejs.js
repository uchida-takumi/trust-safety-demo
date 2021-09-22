/*
ejs テンプレートエンジンを使って HTML サーバーを作成する。
事前に >> yarn add ejs を実行しておくこと.

予め、views フォルダを作成して、以下のtest.ejs ファイルを格納しておく。
``` views/test.ejs
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title><%=title %></title>
</head>
<body>
<h1><%=title %></h1>
<p><%-content %></p>
</body>
</html>
```
*/

var ejs = require('ejs');
//var fs = require('fs');
//var template = fs.readFileSync('./views/test.ejs', 'utf8');

var express = require('express');
var app = express();
app.engine('ejs', ejs.renderFile);

/* //即時実行関数
var buf = ejs.render(template, {
    title: "EJS Sample Code",
    content: "This is EJS Sample ..."
});
console.log(buf);
*/
app.get('/', function(req, res) {
    res.render('test.ejs', {
        title: "EJS Sample Code 2",
        content: "This is EJS Sample ...2"
        });
});
app.listen(8080);