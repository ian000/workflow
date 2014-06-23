var path = require('path')
  , fs = require('fs')

function walk(uri, filter, files, handler) {
  var stat = fs.lstatSync(uri);
  if(filter(uri)){
    if(stat.isFile()){
      files = handler(uri, files);
    }
    if(stat.isDirectory()){
      fs.readdirSync(uri).forEach(function(part){
        walk(path.join(uri, part), filter, files, handler);
      });
    }
  }
  stat = null;
}

//排除basename以.或者_开头的目录|文件(如.svn,_html,_psd, _a.psd等)
function defaultFilter(uri){
  var start = path.basename(uri).charAt(0);
  if((start === '.' || start === '_') && path.extname(uri) !== '.js'){
    start = null;
    return false;
  }
  return true;
}
function defaultHandler(uri, files){
  //转换成绝对路径
      uri = path.resolve(uri);
      switch(path.extname(uri)){
        case '.jade':
          files.jade.push(uri);
          break;
        case '.js':
          files.js.push(uri);
          break;
        case '.css':
          files.css.push(uri);
          break;
        case '.json':
          files.json.push(uri);
          break;
        default:
          files.other.push(uri);
      }

      return files;
}
/**
 * 递归遍历目录文件,获取所有文件路径;并且分成 "js|css|other" 三组.
 * @param{String}rootDir
 * @param{Function}filter:过滤函数,返回false就排除目录|文件
 * @return{Object}
 * */
module.exports = function(rootDir, filter, handler) {
  filter = filter || defaultFilter;
  handler = handler || defaultHandler;

  var files = {
    jade:[],
    css:[],
    js:[],
    json:[],
    other:[]
  };

  walk(rootDir, filter, files, handler);

  return files;
};