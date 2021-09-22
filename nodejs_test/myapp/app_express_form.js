var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:true}));
app.listen(8080);

// express でFORMデータを受け取る
app.post('/form', function(req, res) {
    for (key in req.body) {
        console.log(key, '====', req.body[key],);
    };
    res.end();
});
