var util = require('util')
  , http = require('http')
  , argv = require('optimist').argv
  , app = require('koa')()
  ;

var port = argv.p || argv.port || 8000;

/*http.createServer(function (req, res) {
  console.log(req.method + ' request: ' + req.url);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('hello, i know nodejitsu.');
  res.end();
}).listen(port);
*/
/* server started */
//util.puts('> hello world running on port ' + port);


app.use(function *(next) {
   this.body =  this.url;
});

app.listen(port,function(){
  console.log('app running on port '+port);
});