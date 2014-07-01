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
koa-etag
koa-gzip
koa-session
koa-compress
koa-jsonp
 */

 /**
   * 获取调试信息
   * @param  {[type]} opts [description]
   * @return {[type]}      [description]
   */
  function getDebugInfo(opts){
    var render = opts.render
      , fakeData = opts.fakeData
      , complieError = opts.complieError
      , dataError = opts.dataError
      , request = opts.request
      , infoTpl = ""
      ;
    infoTpl = '<script>'+
            'console.log("renderTime is :",'+render+'+"ms");'+
            'console.log("requestTime is :",'+request+'+"ms");'+
            'console.log("fakeData is :",'+JSON.stringify(fakeData)+');'+
            'console.log("hasCompileError is :",'+JSON.stringify(complieError)+');'+
            'console.log("hasDataError is :",'+JSON.stringify(dataError)+');'+
            '</script>';
    return infoTpl;
  }

  function renderBody(strHTML){
      return '<html><body>'+strHTML+'</body></html>';
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
        (!global.complieFns[pathName]&&global.complieError.length==0)&&(pathName = 404);
        compileFn = global.complieFns[pathName];
        // evalcompileFn time logger
        console.time("evalcompileFn");
        try{
          eval("compileFn = "+compileFn);
        }catch(e){
          console.log(e);
        }
        console.timeEnd("evalcompileFn");

        stime = new Date().getTime();


        // get data via api
        /* _data = yield {
            'data':request(dataApi)
        };
        */
        function *getFakeData(pathName){
          console.log("pathName", pathName);
          try{
           return require('../data/'+pathName+'.json');
         }catch(err){
            console.log("err",err);
            return {};
         }
        }
        // TODO : findFakeData();
        _data = yield getFakeData(pathName);

        etime = new Date().getTime();
        requestSpan = etime - stime;

        //render Time logger
        console.time('render');
        stime = new Date().getTime();
        if(compileFn){
          try{
            html = compileFn(_data);
          }catch(err){
            html = renderBody('数据渲染错误: <br><br>'+err.toString().replace(/(\d*)\|/g,"<br>line $1"));
          }
        }else{
          html = renderBody('jade语法编译错误: <br><br>'+global.complieError);
        }


        //compute the rander time
        etime = new Date().getTime();
        renderTimeSpan = etime - stime;
        console.timeEnd('render');

        /*
          if show debugger info
         */
        console.log("process.env.isDev",process.env.isDev);
         if(!!process.env.isDev){
          info = getDebugInfo({
            render:renderTimeSpan,
            fakeData:_data,
            request: requestSpan,
            complieError:global.complieError||[],
            dataError:global.dataError||[]
          });
         }
        return html+info;
      }
  }
