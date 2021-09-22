var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.text({type:'*/*'}));

app.listen(8080);

app.get('/test1', function(req, res) {
    res.send('TEST1111\n');
});

app.post('/test2', function(req, res) {
    res.send('TEST2222\n');
});

app.post('/', function(req, res) {
    console.log(req.body);
    res.end();
}); 

