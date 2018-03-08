const config = require('../config/conf.json');

module.exports = {
  send: (options, callback) => {
    const { email } = options;
    email.from = options.user.email;
    email.text = email.text ? email.text : '';
    options.transport.sendMail(email, (err) => {
      if (err) {
        return callback(err);
      }
      return options.mongo.collection(config.emails).insertOne(email, callback);
    });
  },
  delete: (options, callback) => {
    const { email } = options;
    email.from = options.user.email;
    email.text = email.text ? email.text : '';
    delete email.$$hashKey;
    delete email._id;
    return options.mongo.collection(config.emails).deleteOne(email, callback);
  },
};
