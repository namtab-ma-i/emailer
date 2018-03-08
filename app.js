const express = require('express');

const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);
const mongo = require('mongodb').MongoClient;
const nodemailer = require('nodemailer');
const path = require('path');
const mailgunTransport = require('nodemailer-mailgun-transport');

const config = require(path.join(__dirname, '/config/conf.json'));
const SocketOnMessage = require(path.join(__dirname, '/controllers/socket.js')).onMessage;
let collections;

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
  SocketOnMessage(socket, collections, transport);
});

app.get('/*', (req, res) => {
  res.render('index.ejs');
});
