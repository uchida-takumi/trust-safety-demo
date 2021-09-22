// 簡単なwebサイトを作成する
// 事前に >>yarn add jquery でjquery にインストール

var http = require('http');
var url = require('url');

var server = http.createServer(function(req, res) {
    var url_parse = url.parse(req.url, true);
    if (req.method == 'GET') {
        console.log(url_parse);
        res.end();
    };
    if (req.method == 'POST') {
        var body = '';
        // data の受信時の挙動
        req.on('data', function(chunk) {
            body += chunk;
        });
        // 受信終了時の挙動
        req.on('end', function() {
            console.log(body);
            res.end();
        });
    };
}).listen(8080);

