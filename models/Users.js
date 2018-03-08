const config = require('../config/conf.json');

module.exports = {
  register: (mongo, user, callback) =>
    mongo.collection(config.users).find({ email: user.email }).toArray((err, res) => {
      if (err) {
        return callback(err);
      }
      if (res.length > 0) {
        return callback('User exists');
      }
      return mongo.collection(config.users).insertOne(user, callback);
    }),
  login: (mongo, user, callback) =>
    mongo.collection(config.users).find(user).toArray((err, res) => {
      if (err) {
        return callback(err);
      }
      if (res.length === 0) {
        return callback('User not found');
      }
      return mongo.collection(config.emails).find({ from: user.email }).toArray(callback);
    }),
};
