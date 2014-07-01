/**
 * 调整路由时请注意路由的先后顺序
 */
"use strict" ;

var app = require('koa')()
  , router = require('koa-route')
  , logger = require('koa-logger')
  , livereload = require('koa-livereload')
  , conf = require('./config')
  , argv = require('optimist').argv
  , nodeServerPort  = argv.p || argv.port || conf.server.port[0]
  , handler = require("./requestHander")
  ;

//进程标签
process.title = conf.processtitle;
process.env.isDev = conf.isDev;


//开发环境使用全局变量代替redis存储
global.complieFns = {};
global.complieError = [];
global.dataError = [];

//使用中间件
//app.use(router(app));
app.use(livereload());
app.use(logger());

//listen jade file changed
app.use(router.get('/onfilechanged', handler.onfilechanged));

//url routers
app.use(function *(next) {
   this.body =  yield handler.render(this.url);
});

//server start
app.listen(nodeServerPort,function(){
  handler.init();
  console.log('app running on port '+nodeServerPort);
});