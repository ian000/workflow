'use strict';

/*
  1. 预编译单个文件
  2. 批量编译指定文件夹下的jade
  3. 指定存储介质
*/
var fs = require('fs')
  , conf = require('./config')
  , jade = require('jade')
  , path = require('path')
  , walker = require("./dirWalker")
  , views = conf.site.views;

/**
 * 预编译单个文件
 * @param  {array} pathFile   [views以后的路径]
 * @return {function}
 */
function single(pathFile){
  var relPathFile = views+"/"+pathFile+".jade";
  //var relPathFile = views+"/myIndex.jade";
  var compileFn;

  console.time("compile");
  try{
    compileFn = jade.compileClient(fs.readFileSync(path.resolve(relPathFile)), {
          "filename":path.resolve(views+'/'+pathFile)
        , "compileDebug":true
      });
  }catch(err){
    // 将出错信息以更好看的格式push编译错误数组中，以便显示
    global.complieError.push(err.toString().replace(/(\d*)\|/g,"<br>line $1"));
    console.log("err-------------------------------", global.complieError);
  }

  global.complieFns[pathFile] = compileFn;

    //TODO: 存储在redis里
  console.timeEnd("compile");
  return compileFn
};


/**
 * 寻找指定路径下的jade文件进行渲染并储存成json,格式如
 *  {
 *    "file1/a":fn,             //a.jade
 *    "file1/file2/b.jade":fn,  //b.jade
 *   }
 * ！！建议开发目录不要设置层次太深
 * [TODO] 支持多级
 *
 * @param  {string} opt.path
 * @return {[type]}
 */
function all(basepath){
  basepath = basepath || "./views";
  console.log(__dirname);
  global.complieFns = {};
  global.complieError = [];
  console.time("complieAll");
  walker(basepath, "",function(uri, files){
      if(path.extname(uri) == '.jade'){
        uri = uri.replace(/^.*views\/(.*)\.jade$/,"$1")
        files.jade.push(uri);
        single(uri);
      }
      return files;
  });
  console.timeEnd("complieAll");
  // console.log("global.complieError", global.complieError);
}

exports.single = single;
exports.all = all;