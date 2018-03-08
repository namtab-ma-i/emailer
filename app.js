const express = require('express');

const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);
const mongo = require('mongodb').MongoClient;
const nodemailer = require('nodemailer');
const path = require('path');
const mailgunTransport = require('nodemailer-mailgun-transport');

const config = require(path.join(__dirname, '/config/conf.json'));
const Emails = require(path.join(__dirname, '/models/Emails.js'));
const Users = require(path.join(__dirname, '/models/Users.js'));
let collections;
let activeUser;

app.set('socketio', io);
app.set('server', server);

app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/public'));

const transport = nodemailer.createTransport(mailgunTransport({
  auth: {
    api_key: config.mailgunApiKey,
    domain: config.mailgunDomain,
  },
}));

mongo.connect(config.mongourl, (err, db) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  collections = db;

  server.listen(config.port, () => {
    console.log('Listening...');
  });
});

io.on('connection', (socket) => {
  socket.on('createemail', (email) => {
    Emails.send({
      mongo: collections,
      user: activeUser,
      transport,
      email,
    }, (err) => {
      if (err) {
        console.log(err);
        socket.emit('err', err.message);
      } else {
        socket.emit('emailsent', email);
      }
    });
  });
  socket.on('deleteemail', (email, index) => {
    Emails.delete({
      mongo: collections,
      user: activeUser,
      email,
    }, (err) => {
      if (err) {
        console.log(err);
        socket.emit('err', err.message);
      } else {
        socket.emit('emaildeleted', index);
      }
    });
  });
  socket.on('register', (user) => {
    Users.register(collections, user, (err) => {
      if (err) {
        console.log(err);
        socket.emit('err', err.message);
      } else {
        activeUser = user;
        socket.emit('login', user, []);
      }
    });
  });
  socket.on('login', (user) => {
    Users.login(collections, user, (err, emails) => {
      if (err) {
        console.log(err);
        socket.emit('err', err.message);
      } else {
        activeUser = user;
        socket.emit('login', user, emails);
      }
    });
  });
});

app.get('/*', (req, res) => {
  res.render('index.ejs');
});
