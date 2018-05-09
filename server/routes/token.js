const expressJWT = require('express-jwt');
const secretOrPrivateKey = '流动性比利润更重要！';

module.exports = expressJWT({
  secret: secretOrPrivateKey,
  isRevoked: (req, payload, done) => {
    req.locals = {};
    req.locals.__username = payload.username;
    req.locals.__uid = Number(payload.uid);
    let hasLogin = true;
    if (req.locals.__username) {
      hasLogin = req.app.get(req.locals.__username);
    }
    // 第二值为 false 表示验证通过
    done(null, !hasLogin);
  }}).unless({
  custom(req) {
    return req.body.operationName === "loginMutation"
      || req.body.operationName === "registerMutation";
  },
  path: []  //除了这个地址，其他的URL都需要验证
});

module.exports.secretOrPrivateKey = secretOrPrivateKey;