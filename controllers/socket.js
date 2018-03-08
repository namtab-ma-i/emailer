const path = require('path');

const Emails = require(path.join(__dirname, '../models/Emails.js'));
const Users = require(path.join(__dirname, '../models/Users.js'));
let activeUser;

module.exports = {
  onMessage: (socket, mongo, transport) => {
    socket.on('createemail', (email) => {
      Emails.send({
        user: activeUser,
        transport,
        mongo,
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
        user: activeUser,
        mongo,
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
      Users.register(mongo, user, (err) => {
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
      Users.login(mongo, user, (err, emails) => {
        if (err) {
          console.log(err);
          socket.emit('err', err.message);
        } else {
          activeUser = user;
          socket.emit('login', user, emails);
        }
      });
    });
  },
};
