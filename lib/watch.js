exports.onChange = function(){
  var self = arguments.callee;
  setTimeOut(function(){
    console.log("process.env.changedFiles");
    self();
  },500);
}
