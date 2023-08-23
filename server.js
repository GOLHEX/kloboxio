const express = require('express');
const fs = require('fs');
const cors = require('cors');
const https = require('https');
const socketIO = require('socket.io');

const privateKey = fs.readFileSync('./ssl/server.key');
const certificate = fs.readFileSync('./ssl/server.crt');
const ca = fs.readFileSync('./ssl/rootCA.crt');
const credentials = { key: privateKey, cert: certificate, ca: ca };

const port = 8443;
let lastColor;
const app = express(); // Внесено исправление здесь
const server = https.createServer(credentials, app);
const io = socketIO(server);

io.on('connection', socket => {
  console.log('New client id: ' + socket.id + ' connected to https server ');
  //Send lact color to user
  if (lastColor) {
    io.to(`${socket.id}`).emit('rnd', lastColor);
  } else {
    io.sockets.emit('rnd', '#F44336');
  }

  socket.on('cc', cd => {
    lastColor = cd;
    console.log('User id: ' + socket.id + ' Changed Color to: ', cd);
    console.log(socket.handshake.headers.host);
    io.sockets.emit('rnd', cd);
  });

  // disconnect is fired when a client leaves the server
  socket.on('disconnect', () => {
    console.log('User disconnected, id:' + socket.id);
    io.clients((error, clients) => {
      if (error) throw error;
      console.log(clients);
    });
  });
});

server.listen(port, function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log('RIO HTTPS server start ', host, port);
  //console.log(credentials)
});

const backendSettings = {
  "scheme": "https", // Изменено на "https" или "http" в зависимости от вашего веб-сайта
  "host": "Your website url",
  "port": 49165, // port number
  'sslKeyPath': 'Path for key',
  'sslCertPath': 'path for SSL certificate',
  'sslCAPath': '',
  "resource": "/socket.io",
  "baseAuthPath": '/nodejs/',
  "publishUrl": "publish",
  "serviceKey": "",
  "backend": {
    "port": 443,
    "scheme": 'https', // Изменено на "https" или "http" в зависимости от вашего веб-сайта
    "host": "host name",
    "messagePath": "/nodejs/message/"
  },
  "clientsCanWriteToChannels": false,
  "clientsCanWriteToClients": false,
  "extensions": "",
  "debug": false,
  "addUserToChannelUrl": 'user/channel/add/:channel/:uid',
  "publishMessageToContentChannelUrl": 'content/token/message',
  "transports": ["websocket", "flashsocket", "htmlfile", "xhr-polling", "jsonp-polling"],
  "jsMinification": true,
  "jsEtag": true,
  "logLevel": 1
};
