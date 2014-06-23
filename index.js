"use strict";

var path = require('path'),
    async = require('utile').async,
    forever = require('forever'),
    config = require('./lib/config');

// Array config data
var script = path.join(__dirname, './lib/index.js'),
    ports = config.server.port;

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

