var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.listen(8080);

// express でFORMデータを受け取る
app.post('/', function(req, res) {
    /*
    # 想定される入力
    curl -X POST \
        -H 'Content-Type: application/json' \
        -d '{"name":["Yamada","Taro"],"Age":36}' \
        http://localhost:8080/    
    */
    for (key in req.body) {
        console.log(key, '====', req.body[key],);
    };
    res.end();
});
