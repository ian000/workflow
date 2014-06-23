"use strict" ;

var request = require('request')
  , router = require('koa-route')
  , logger = require('koa-logger')
  , open = require('open')
  , URL = require('url')
  , thunkify = require('thunkify')
  , request  = thunkify(request)
  , koa = require('koa')
  , path = require('path')
  , livereload = require('koa-livereload')
  , app = koa()
  , conf = require('./config')
  , complie = require('./complie')
  , dataApi = "http://10.210.226.88/tmpl/aj"
  , jade = require('./runtime')
  , argv = require('optimist').argv
  , nodeServerPort  = argv.p || argv.port || conf.server.port[0]
  ;

process.title = conf.processtitle;

function getDebugInfo(opts){
  var render = opts.render
    , fakeData = opts.fakeData
    , request = opts.request
    , infoTpl = ""
    ;

  infoTpl = "<div>--------------------------debuggerinfo--------------------------</div>\
        <div>renderTime is :"+render+"ms</div>\
        <div>requestTime is :"+request+"ms</div>\
        <div>fakeData is :"+JSON.stringify(fakeData)+"</div>";

  return infoTpl;
}



//TODO :
/*
koa-redis
koa-combo ：资源合并
koa-jsonp
koa-cluster
koa-params
koa-limit
koa-fresh :决定每个请求是否走缓存
koa-routing :提供Rest型接口
 */

//大胆使用全局变量，性能待测
global.complieFns = {};

//使用中间件
app.use(logger());
app.use(livereload());


//预编译
//todo:获取所有jade文件数组
complie.all();

//TODO ： 订阅文件change事件，收到以后就重新编译所有jade
function *render(uri){
  var compileFn =""
    , _data=""
    , query = URL.parse(uri,1).query
    , pathName =URL.parse(uri,1).pathname
    , info = ""
    , html = ""
    , stime=""
    , etime=""
    , requestSpan =""
    , renderTimeSpan = ""
    ;

  pathName = pathName.replace(/^\/(.*)|\.jade$/,"$1");
  (!pathName)&&(pathName = "index");
  (!global.complieFns[pathName])&&(pathName = 404);
  compileFn = global.complieFns[pathName];
  console.time("evalcompileFn");
  eval("compileFn = "+compileFn);
  console.timeEnd("evalcompileFn");

  stime = new Date().getTime();
  _data = yield {
      'data':request(dataApi)
  };
  etime = new Date().getTime();
  requestSpan = etime - stime;
  console.time('render');
  stime = new Date().getTime();

  html = compileFn({
    data: ""
  });
  etime = new Date().getTime();
  renderTimeSpan = etime - stime;
  console.timeEnd('render');
  /*
    show debugger info
   */
   if(query["debug"]){
    info = getDebugInfo({
      render:renderTimeSpan,
      fakeData:"",
      request: requestSpan
    });
   }
  return html+info;
}

app.use(router.get('/onfilechanged', function *(){
  var queryData = URL.parse(this.url,1).query;
  var filepath = queryData["filepath"];
  console.log("filepath", filepath);
  filepath&&(filepath = queryData["filepath"].replace(/^views\//,"").replace(/\.jade$/,""));
  complie.all();
  this.body = this.body = this.url;
}));

app.use(function *(next) {
   this.body =  yield render(this.url);
});

app.listen(nodeServerPort,function(){
  console.log('app running on port '+nodeServerPort);
  //open ("http:127.0.0.1:"+nodeServerPort);
});
