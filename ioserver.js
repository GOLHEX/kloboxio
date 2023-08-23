<<<<<<< HEAD

// const { readFileSync } = require("fs");
// const { createSecureServer } = require("http2");
// const { Server } = require("socket.io");

// const httpServer = createSecureServer({
//   allowHTTP1: true,
//   key: readFileSync("./ssl/server_key.pem"),
//   cert: readFileSync("./ssl/server_crt.pem")
// });

// const io = new Server(httpServer, { /* options */ });

// io.on("connection", (socket) => {
//   // ...
// });

// httpServer.listen(3000);




/* const { createServer } = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io","http://yarn.ddns.net"],
    credentials: true
  }
});

instrument(io, {
  auth: false
});

httpServer.listen(3000); */


/* const app = require("express")();
const server = require("http").createServer(app);
const port = process.env.PORT || 3000;

const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const sessionMiddleware = session({ secret: "changeit", resave: false, saveUninitialized: false });
app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

const DUMMY_USER = {
  id: 1,
  username: "john",
};

passport.use(
  new LocalStrategy((username, password, done) => {
    if (username === "john" && password === "doe") {
      console.log("authentication OK");
      return done(null, DUMMY_USER);
    } else {
      console.log("wrong credentials");
      return done(null, false);
    }
  })
);

app.get("/", (req, res) => {
  const isAuthenticated = !!req.user;
  if (isAuthenticated) {
    console.log(`user is authenticated, session is ${req.session.id}`);
  } else {
    console.log("unknown user");
  }
  res.sendFile(isAuthenticated ? "index.html" : "login.html", { root: __dirname });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

app.post("/logout", (req, res) => {
  console.log(`logout ${req.session.id}`);
  const socketId = req.session.socketId;
  if (socketId && io.of("/").sockets.get(socketId)) {
    console.log(`forcefully closing socket ${socketId}`);
    io.of("/").sockets.get(socketId).disconnect(true);
  }
  req.logout();
  res.cookie("connect.sid", "", { expires: new Date() });
  res.redirect("/");
});

passport.serializeUser((user, cb) => {
  console.log(`serializeUser ${user.id}`);
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  console.log(`deserializeUser ${id}`);
  cb(null, DUMMY_USER);
});

const io = require('socket.io')(server);

// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
  if (socket.request.user) {
    next();
  } else {
    next(new Error('unauthorized'))
  }
});

io.on('connect', (socket) => {
  console.log(`new connection ${socket.id}`);
  socket.on('whoami', (cb) => {
    cb(socket.request.user ? socket.request.user.username : '');
  });

  const session = socket.request.session;
  console.log(`saving sid ${socket.id} in session ${session.id}`);
  session.socketId = socket.id;
  session.save();
});

server.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
}); */

/* const { Server } = require("socket.io");
const eiows = require("eiows");

const io = new Server(3000, {
  wsEngine: eiows.Server
});

 */








const express = require('express');
const fs = require( 'fs' );
const { createServer } = require("https");
const { Server } = require("socket.io");
//const { instrument } = require("@socket.io/admin-ui");

const privateKey  = fs.readFileSync('./ssl/server.key');
const certificate = fs.readFileSync('./ssl/server.crt');
const ca = fs.readFileSync('./ssl/rootCA.crt');
const credentials = {key: privateKey, cert: certificate, ca: ca};

//console.log(credentials);

const httpServer = createServer(credentials);
//console.log(httpServer);

const port = 8443;

//console.log(Server.Namespace);

const io = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io","https://yarn.ddns.net/","https://yarn.ddns.net"],
    credentials: true
  }
});
let lastColor;
io.on('connection', socket => {
  console.log('New client id: '+socket.id+' connected to https server ')
  //Send lact color to user
  // if(lastColor){
  //   io.to(`${socket.id}`).emit('rnd', lastColor);
  // }else{
  //   io.sockets.emit('rnd', '#F44336')
  // }

  // socket.on('cc', (cd) => {
  //   lastColor = cd;
  //   console.log('User id: '+socket.id+' Changed Color to: ', cd)
  //   console.log(socket.handshake.headers.host)
  //   io.sockets.emit('rnd', cd)
  // });

  // // disconnect is fired when a client leaves the server
  // socket.on('disconnect', () => {
  //   console.log('User disconnected, id:' + socket.id)
  //   io.clients((error, clients) => {
  //     if (error) throw error;
  //     console.log(clients); 
  //   });
  // })
});


/* 

instrument(io, {
  auth: false
}); */

httpServer.listen(port, function () {
	 console.log(io);
       let host = httpServer.address().address;
       let port = httpServer.address().port;
       console.log('Yarn HTTPS server start ', host, port);
       console.log('________________℃℉℃℉__________________');
       console.log(credentials);
  });




// io.on('connection', socket => {
//   console.log('New client id: '+socket.id+' connected to https server ')
//   //Send lact color to user
//   if(lastColor){
//     io.to(`${socket.id}`).emit('rnd', lastColor);
//   }else{
//     io.sockets.emit('rnd', '#F44336')
//   }

//   socket.on('cc', (cd) => {
//     lastColor = cd;
//     console.log('User id: '+socket.id+' Changed Color to: ', cd)
//     console.log(socket.handshake.headers.host)
//     io.sockets.emit('rnd', cd)
//   });

//   // disconnect is fired when a client leaves the server
//   socket.on('disconnect', () => {
//     console.log('User disconnected, id:' + socket.id)
//     io.clients((error, clients) => {
//       if (error) throw error;
//       console.log(clients); 
//     });
//   })
// });


// server.listen(port, function () {
//      let host = server.address().address;
//      let port = server.address().port;
//      console.log('RIO HTTPS server start ', host, port);
//      //console.log(credentials)
// });



// const backendSettings = {
//   "scheme":"https / http ",
//   "host":"Your website url",
//   "port":49165, //port number 
//   'sslKeyPath': 'Path for key',
//   'sslCertPath': 'path for SSL certificate',
//   'sslCAPath': '',
//   "resource":"/socket.io",
//   "baseAuthPath": '/nodejs/',
//   "publishUrl":"publish",
//   "serviceKey":"",
//   "backend":{
//   "port":443,
//   "scheme": 'https / http', //whatever is your website scheme
//   "host":"host name",
//   "messagePath":"/nodejs/message/"},
//   "clientsCanWriteToChannels":false,
//   "clientsCanWriteToClients":false,
//   "extensions":"",
//   "debug":false,
//   "addUserToChannelUrl": 'user/channel/add/:channel/:uid',
//   "publishMessageToContentChannelUrl": 'content/token/message',
//   "transports":["websocket",
//   "flashsocket",
//   "htmlfile",
//   "xhr-polling",
//   "jsonp-polling"],
//   "jsMinification":true,
//   "jsEtag":true,
//   "logLevel":1
// };
 











=======

// const { readFileSync } = require("fs");
// const { createSecureServer } = require("http2");
// const { Server } = require("socket.io");

// const httpServer = createSecureServer({
//   allowHTTP1: true,
//   key: readFileSync("./ssl/server_key.pem"),
//   cert: readFileSync("./ssl/server_crt.pem")
// });

// const io = new Server(httpServer, { /* options */ });

// io.on("connection", (socket) => {
//   // ...
// });

// httpServer.listen(3000);




/* const { createServer } = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io","http://yarn.ddns.net"],
    credentials: true
  }
});

instrument(io, {
  auth: false
});

httpServer.listen(3000); */


/* const app = require("express")();
const server = require("http").createServer(app);
const port = process.env.PORT || 3000;

const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const sessionMiddleware = session({ secret: "changeit", resave: false, saveUninitialized: false });
app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

const DUMMY_USER = {
  id: 1,
  username: "john",
};

passport.use(
  new LocalStrategy((username, password, done) => {
    if (username === "john" && password === "doe") {
      console.log("authentication OK");
      return done(null, DUMMY_USER);
    } else {
      console.log("wrong credentials");
      return done(null, false);
    }
  })
);

app.get("/", (req, res) => {
  const isAuthenticated = !!req.user;
  if (isAuthenticated) {
    console.log(`user is authenticated, session is ${req.session.id}`);
  } else {
    console.log("unknown user");
  }
  res.sendFile(isAuthenticated ? "index.html" : "login.html", { root: __dirname });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

app.post("/logout", (req, res) => {
  console.log(`logout ${req.session.id}`);
  const socketId = req.session.socketId;
  if (socketId && io.of("/").sockets.get(socketId)) {
    console.log(`forcefully closing socket ${socketId}`);
    io.of("/").sockets.get(socketId).disconnect(true);
  }
  req.logout();
  res.cookie("connect.sid", "", { expires: new Date() });
  res.redirect("/");
});

passport.serializeUser((user, cb) => {
  console.log(`serializeUser ${user.id}`);
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  console.log(`deserializeUser ${id}`);
  cb(null, DUMMY_USER);
});

const io = require('socket.io')(server);

// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
  if (socket.request.user) {
    next();
  } else {
    next(new Error('unauthorized'))
  }
});

io.on('connect', (socket) => {
  console.log(`new connection ${socket.id}`);
  socket.on('whoami', (cb) => {
    cb(socket.request.user ? socket.request.user.username : '');
  });

  const session = socket.request.session;
  console.log(`saving sid ${socket.id} in session ${session.id}`);
  session.socketId = socket.id;
  session.save();
});

server.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
}); */

/* const { Server } = require("socket.io");
const eiows = require("eiows");

const io = new Server(3000, {
  wsEngine: eiows.Server
});

 */








const express = require('express');
const fs = require( 'fs' );
const { createServer } = require("https");
const { Server } = require("socket.io");
//const { instrument } = require("@socket.io/admin-ui");

const privateKey  = fs.readFileSync('./ssl/server.key');
const certificate = fs.readFileSync('./ssl/server.crt');
const ca = fs.readFileSync('./ssl/rootCA.crt');
const credentials = {key: privateKey, cert: certificate, ca: ca};

//console.log(credentials);

const httpServer = createServer(credentials);
//console.log(httpServer);

const port = 8443;

//console.log(Server.Namespace);

const io = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io","https://yarn.ddns.net/","https://yarn.ddns.net"],
    credentials: true
  }
});
let lastColor;
io.on('connection', socket => {
  console.log('New client id: '+socket.id+' connected to https server ')
  //Send lact color to user
  // if(lastColor){
  //   io.to(`${socket.id}`).emit('rnd', lastColor);
  // }else{
  //   io.sockets.emit('rnd', '#F44336')
  // }

  // socket.on('cc', (cd) => {
  //   lastColor = cd;
  //   console.log('User id: '+socket.id+' Changed Color to: ', cd)
  //   console.log(socket.handshake.headers.host)
  //   io.sockets.emit('rnd', cd)
  // });

  // // disconnect is fired when a client leaves the server
  // socket.on('disconnect', () => {
  //   console.log('User disconnected, id:' + socket.id)
  //   io.clients((error, clients) => {
  //     if (error) throw error;
  //     console.log(clients); 
  //   });
  // })
});


/* 

instrument(io, {
  auth: false
}); */

httpServer.listen(port, function () {
	 console.log(io);
       let host = httpServer.address().address;
       let port = httpServer.address().port;
       console.log('Yarn HTTPS server start ', host, port);
       console.log('________________℃℉℃℉__________________');
       console.log(credentials);
  });




// io.on('connection', socket => {
//   console.log('New client id: '+socket.id+' connected to https server ')
//   //Send lact color to user
//   if(lastColor){
//     io.to(`${socket.id}`).emit('rnd', lastColor);
//   }else{
//     io.sockets.emit('rnd', '#F44336')
//   }

//   socket.on('cc', (cd) => {
//     lastColor = cd;
//     console.log('User id: '+socket.id+' Changed Color to: ', cd)
//     console.log(socket.handshake.headers.host)
//     io.sockets.emit('rnd', cd)
//   });

//   // disconnect is fired when a client leaves the server
//   socket.on('disconnect', () => {
//     console.log('User disconnected, id:' + socket.id)
//     io.clients((error, clients) => {
//       if (error) throw error;
//       console.log(clients); 
//     });
//   })
// });


// server.listen(port, function () {
//      let host = server.address().address;
//      let port = server.address().port;
//      console.log('RIO HTTPS server start ', host, port);
//      //console.log(credentials)
// });



// const backendSettings = {
//   "scheme":"https / http ",
//   "host":"Your website url",
//   "port":49165, //port number 
//   'sslKeyPath': 'Path for key',
//   'sslCertPath': 'path for SSL certificate',
//   'sslCAPath': '',
//   "resource":"/socket.io",
//   "baseAuthPath": '/nodejs/',
//   "publishUrl":"publish",
//   "serviceKey":"",
//   "backend":{
//   "port":443,
//   "scheme": 'https / http', //whatever is your website scheme
//   "host":"host name",
//   "messagePath":"/nodejs/message/"},
//   "clientsCanWriteToChannels":false,
//   "clientsCanWriteToClients":false,
//   "extensions":"",
//   "debug":false,
//   "addUserToChannelUrl": 'user/channel/add/:channel/:uid',
//   "publishMessageToContentChannelUrl": 'content/token/message',
//   "transports":["websocket",
//   "flashsocket",
//   "htmlfile",
//   "xhr-polling",
//   "jsonp-polling"],
//   "jsMinification":true,
//   "jsEtag":true,
//   "logLevel":1
// };
 











>>>>>>> b57422b57706cb718a7eed397e5edb4ac1a396e2
