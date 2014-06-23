var path = require("path")
  , walker = require("./lib/dirWalker")
  , fs = require('fs')
  , data ="";
var handler = function(uri, files){
    var _data = {};
    var inputdir = 'views/';
    var outdir = 'temp/';
    uri = path.resolve(uri);
          switch(path.extname(uri)){
            case '.jade':
              files.jade.push(uri);
              break;
            case '.json':
              files.json.push(uri);
              break;
            default:
              files.other.push(uri);
          }
  //转换成绝对路径
    if(path.extname(uri) == '.jade'){
      uri = uri.replace(/^.*views\/(.*)\.jade$/,"$1")
        if(!files.jadejson){
          files["jadejson"] = {};
        }
        files.jadejson[outdir+uri+'.html'] = [inputdir+uri+'.jade']
    }
    return files;
};
var views = walker("views/",'',handler);
var jadejson = views.jadejson;
var temp = {};
for(var i in jadejson){
    var datafile =jadejson[i][0].replace(/\.jade$/,".json").replace(/^views/,"data");
   console.log(datafile, fs.existsSync(datafile));
   if(fs.existsSync(datafile)){
      temp[datafile] = true;
   }
}
console.log(temp);

