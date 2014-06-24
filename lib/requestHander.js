"use strict" ;

var request = require('request')
  , logger = require('koa-logger')
  , URL = require('url')
  , thunkify = require('thunkify')
  , request  = thunkify(request)
  , koa = require('koa')
  , path = require('path')
  , app = koa()
  , conf = require('./config')
  , complie = require('./complie')
  , dataApi = "http://10.210.226.88/tmpl/aj"
  , jade = require('./runtime')
  ;

//TODO :
/*
koa-redis
koa-combo ：资源合并
koa-jsonp
koa-params
koa-limit
koa-fresh :决定每个请求是否走缓存
koa-routing :提供Rest型接口
 */

 /**
   * 获取调试信息
   * @param  {[type]} opts [description]
   * @return {[type]}      [description]
   */
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

module.exports = {

      /**
       * complie all jade file , default dir is "./views"
       * @return  [none]
       */
      init : function(){
          complie.all();
      },

      /**
       * 文件变化处理函数
       * @type {}
       */
      onfilechanged : function *(){
          var queryData = URL.parse(this.url,1).query;
          var filepath = queryData["filepath"];
          console.log("filepath", filepath);
          filepath&&(filepath = queryData["filepath"].replace(/^views\//,"").replace(/\.jade$/,""));
          complie.all();
          this.body = this.url;
      },

      /**
       * 主路由
       * @type {[type]}
       */
      render : function *(uri){
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

        //match the ".jade" file path
        pathName = pathName.replace(/^\/(.*)|\.jade$/,"$1");

        //match the root
        (!pathName)&&(pathName = "index");
        (!global.complieFns[pathName])&&(pathName = 404);
        compileFn = global.complieFns[pathName];

        // evalcompileFn time logger
        console.time("evalcompileFn");
        eval("compileFn = "+compileFn);
        console.timeEnd("evalcompileFn");

        stime = new Date().getTime();

        /*
        // get data via api
         _data = yield {
            'data':request(dataApi)
        };
        */

        etime = new Date().getTime();
        requestSpan = etime - stime;

        //render Time logger
        console.time('render');
        stime = new Date().getTime();

        html = compileFn({
          data: ""
        });

        //compute the rander time
        etime = new Date().getTime();
        renderTimeSpan = etime - stime;
        console.timeEnd('render');

        /*
          if show debugger info
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
  }
