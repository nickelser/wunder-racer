var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    io = require('../socket.io'),
    sys = require('sys'),
    path = require('path'),
    paperboy = require('../node-paperboy'),
    logic = require('./server_logic'),
    c = require('./config').get_config(),
    server;
    
var PORT = 8003,
    WEBROOT = path.join(path.dirname(__filename), 'client');
      
server = http.createServer(function(req, res) {
  var ip = req.connection.remoteAddress;
  paperboy
    .deliver(WEBROOT, req, res)
    .addHeader('Expires', 300)
    .addHeader('X-PaperRoute', 'Node')
    .addHeader('X-WhoIsTheUltimateBadass', 'hehheh')
    .before(function() {
      sys.log('Received Request');
    })
    .after(function(statCode) {
      log(statCode, req.url, ip);
    })
    .error(function(statCode, msg) {
      res.writeHead(statCode, {'Content-Type': 'text/plain'});
      res.end("Error " + statCode);
      log(statCode, req.url, ip, msg);
    })
    .otherwise(function(err) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end("Error 404: File not found");
      log(404, req.url, ip, err);
    });
});

function log(statCode, url, ip, err) {
  var logStr = statCode + ' - ' + url + ' - ' + ip;
  if (err)
    logStr += ' - ' + err;
  //sys.log(logStr);
}

server.listen(c.port);
io = io.listen(server);

logic.init();

io.on('connection', function(client) {
  logic.player_connected(client);
  
  client.on('message', function(data) {
    logic.dispatch_message(client, data);
  });
  
  client.on('disconnect', function() {
    logic.remove_client(client);
  });
});
