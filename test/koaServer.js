var app = require('koa')()
  , conf = require('../lib/config')
  ;
process.title = "koaServer"
app.use(function *(next) {
   this.body = "hello koa";
});

app.listen(3000,function(){
  console.log('app running on port '+conf.server.port);
  //open ("http:127.0.0.1:"+conf.server.port);
});