
/*
 Example :

var fakeData = {
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

/**
 * 校验两个json文件的key
 * @param  {json} fake  假数据
 * @param  {json} data  api数据
 * @return {json} json
 *         json.isSame {boolean} 是否相同
 *         json.result {arr} 校验详细结果
 *
 */
module.exports = function (fake, data){
  var allK = allK || []
  , reslults =[]
  , _isSame = true
  ;

  //排错
  if(fake == null){
    console.log("fake")
    return {
      isSame:false,
      reslults:["fakeData is null"]
    }
  }else if(data == null){
    console.log("api data")
    return {
      isSame:false,
      reslults:["apiData is null"]
    }
  }

  function type(el){
    return Object.prototype.toString.call(el).slice(8,-1);
  }
  (function(_fake, _data, _reslult){
    console.log("_verify _fake",_fake);
    console.log("_verify _data",_data);
    var _self = arguments.callee;
    var currK = "";
    if(type(_fake)=="Object"){
      Object.keys(_fake).forEach(function(k,i,keys){

        if(!_data[k]){
          _reslult.push(k+" is not exits");
          _isSame = false;
        }else{
          _reslult.push(k);
        }
        reslults = _reslult;
        _self(_fake[k], _data[k]?_data[k]:"", _reslult);
      });
    }
    reslults = _reslult;
  })(fake, data, reslults);

  return {
    isSame: _isSame,
    reslults : reslults
  };
};

