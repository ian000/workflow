"use strict" ;

var logger = require('koa-logger')
  , http = require('http')
  , URL = require('url')
  , thunkify = require('thunkify')
  , request = require('koa-request')
  , koa = require('koa')
  , path = require('path')
  , app = koa()
  , conf = require('./config')
  , dataMap = require('./dataMap')
  , complie = require('./complie')
  , dataApi = "http://10.210.226.88/tmpl/aj"
  , jade = require('./runtime')
  , dataVerify = require('./dataVerify')
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
      , data = opts.data
      , isApiData = opts.isApiData
      , complieError = opts.complieError
      , dataError = opts.dataError
      , request = opts.request
      , keysDiff = opts.keysDiff
      , requestApiSpan = opts.requestApiSpan
      , infoTpl = ""
      ;
    infoTpl = '<script>'+
              'console.log("renderTime is :",'+render+'+"ms");'+
              'console.log("requestApiSpan is :",'+requestApiSpan+'+"ms");'+
              'console.log("requestTime is :",'+request+'+"ms");'+
              'console.log("data is :",'+JSON.stringify(data)+');'+
              'console.log("isApiData is :",'+isApiData+');'+
              'console.log("hasCompileError is :",'+JSON.stringify(complieError)+');'+
              'console.log("hasDataError is :",'+JSON.stringify(dataError)+');'+
              'console.log("dataKeys diff is :",'+JSON.stringify(keysDiff)+');'+
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
          console.log("queryData",queryData);
          var filepath = queryData["filepath"];
          filepath&&(filepath = queryData["filepath"].replace(/^views\//,"").replace(/\.jade$/,""));
          complie.all();
          this.body = this.url;
      },
      /**
       * api接口
       * @type {[type]}
       */
      api : function *(url){
        console.log(url);
        var path = url.replace(/^\/api\//,"");
        var _data = {};
        console.log("path",path);
          if(path=="index"){
            _data = {
              title:"API Tile",
              content:"API content"
            };
          }
          return JSON.stringify(_data);
      },

      /**
       * 主路由
       * @type {[type]}
       */
      render : function *(uri){
        var compileFn =""
          , _isApiData = false
          , _data = null
          , _apiData = null
          , _fakeData = null
          , _keysDiff = []
          , query = URL.parse(uri,1).query
          , pathName =URL.parse(uri,1).pathname
          , info = ""
          , html = ""
          , stime=""
          , etime=""
          , requestSpan =""
          , renderTimeSpan = ""
          , requestApiSpan = ""
          ;

        //match the ".jade" file path
        pathName = pathName.replace(/^\/(.*)|\.jade$/,"$1");
        console.log("render pathName", pathName);
        //match the root
        (!pathName)&&(pathName = "index");
        (!global.complieFns[pathName]&&global.complieError.length==0)&&(pathName = 404);
        console.log("last pathName", pathName);
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

        /**
        * 根据jade文件路径 获取假数据
        * @pathName {string}  jade文件路径
        */
        function * getFakeData(pathName){
          try{
           return require('../data/'+pathName+'.json');
         }catch(err){
            console.log("err",err);
            return {};
         }
        }

        /**
        * 根据jade文件路径 从datamap获取api数据
        * @pathName {string}  jade文件路径
        */
        function * getAPIData(pathName){
          if(!dataMap[pathName]){
            throw new Error('this pai - '+pathName+' is not found in dataMap');
            return;
          }
          console.log("api url" , dataMap[pathName]);
          var options = {
              url: dataMap[pathName],
              headers: { "Content-Type": "application/json"}
          };

          var response = yield request(options); //Yay, HTTP requests with no callbacks!
          return JSON.parse(response.body);
        }

        /*
          数据选择策略
          1. 按路由取得相应的api数据，如果不存在，写log:isApiDta:false
          2. 取得api以后，比较api与假数据的key如果不一致，写logisApiDta:false
          3. 都通真假数据对比通过校验，用api渲染页面，写log:isApiDta:true
        */
        try{
          //请求api耗时
          var stimeRequestApi = new Date().getTime();
          _apiData = yield getAPIData(pathName);
          etime = new Date().getTime();
          requestApiSpan = etime - stimeRequestApi;
          _isApiData = true;
         }catch(err){
          _isApiData = false;
        }
        _fakeData = yield getFakeData(pathName);


        //检查 模拟数据与api数据key是否一致
        var checkDataResult = dataVerify(_fakeData,_apiData);
        console.log("checkDataResult",checkDataResult);
        if(checkDataResult.isSame){
          console.log("use _apiData");
          _data = _apiData;
        }else{
          console.log("use _fakeData");
          _data = _fakeData;
          _keysDiff = checkDataResult.reslults;
        }
        etime = new Date().getTime();
        requestSpan = etime - stime;

        //render Time logger
        console.time('render');
        stime = new Date().getTime();

        console.log("_data", _data);
        if(compileFn){
          try{
            html = compileFn({data : _data});
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
            data:_data,
            isApiData:_isApiData,
            request: requestSpan,
            requestApiSpan:requestApiSpan,
            complieError:global.complieError||[],
            dataError:global.dataError||[],
            keysDiff:_keysDiff
          });
         }
        return html+info;
      }
  }
