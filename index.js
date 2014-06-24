"use strict";

var path = require('path')
  , async = require('utile').async
  , forever = require('forever')
  , conf = require('./lib/config')
  , script = path.join(__dirname, './lib/router.js')
  , ports = conf.server.port
  ;

function startServer (port, next) {
  var child = new (forever.Monitor) (script, {
    command: 'node --harmony',
    options: [ '--port', port],
    silent: true
  });
  child.start();
  child.on('start', function (_, data) {
    console.log('Forever process running server.js on ' + port);
    next(null, child);
  });
}

async.map(ports, startServer, function (err, monitors) {

});

