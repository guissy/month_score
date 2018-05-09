const { Database } = require('mongorito');
const mongodb = new Database('localhost/month_plan', {
  reconnectTries: 5
});
mongodb.connect();
module.exports = mongodb;