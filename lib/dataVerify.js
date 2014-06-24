
/*var fakeData = {
  a:{
    c: 3,
    d:{
      e:{
        ee:44
      }
    },
    b:4,
    bbb:3
  },
  b:{
    bb:{
      ccc:222
    },
    ff:{
      gg:111
    }
  }
};

var data2 = {
  a:{
    b:2
  },
  b:{}
};
*/

//console.log(loop(fakeData, data2));
module.exports = function (fake, data){
  var allK = allK || [];
  var reslults =[];
  function type(el){
    return Object.prototype.toString.call(el).slice(8,-1);
  }
  (function(_fake, _data, _reslult){
    var _self = arguments.callee;
    var currK = "";
    if(type(_fake)=="Object"){
      Object.keys(_fake).forEach(function(k,i,keys){
        if(!_data[k]){
          _reslult.push(k+" is not exits");
        }else{
          _reslult.push(k);
        }
        reslults = _reslult;
        _self(_fake[k], _data[k]?_data[k]:"", _reslult);
      });
    }
    reslults = _reslult;
  })(fake, data, reslults);
  return reslults;
};

