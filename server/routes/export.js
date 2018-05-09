const fs = require("fs");
const path = require('path');
const ejsExcel = require("ejsexcel");
const express = require('express');
const router = express.Router();

const temp = "../public/assets/xlsx/template.xlsx";
const exlBuf = fs.readFileSync(path.resolve(__dirname, temp));

const { Login } = require('./graphql_login');
const { Score } = require('./graphql_score');

// 渲染Excel模板
function exportXlsx(score, login) {
  score.header = `被考核者：${login.truename}             职位：${login.job}               所属部门：${login.part}  .`
  score.header2 = `直接主管：${login.parent||''}            考核年度：${score.date}    （□月度   □季度    □半年度）`;
  // console.log('☞☞☞ 9527 export 13', score);
  return ejsExcel.renderExcel(exlBuf, score)
    .then(function(exlBuf2) {
      const xlsx = `../public/assets/xlsx/${score.date}/${score.uid}.xlsx`;
      const filePath = path.resolve(__dirname, xlsx);
      const arr = filePath.split(path.sep);
      arr.pop();
      const folder = arr.join(path.sep);
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }
      console.log(filePath, score);
      fs.writeFileSync(filePath, exlBuf2);
      return filePath;
    }).catch(function(err) {
      console.error(err);
    });
}

router.get('/xlsx/:date/:uid/:time.xlsx', async (req, res) => {
  const scoreDb = await Score.findOne({uid: Number(req.params.uid), date: req.params.date});
  const loginDb = await Login.findOne({id: Number(req.params.uid)});
  if (scoreDb && loginDb) {
    const file = await exportXlsx(scoreDb.store.getState().fields, loginDb.store.getState().fields);
    console.log(file)
    res.sendFile(file);
  } else {
    res.status(404);
    res.send('文件找不到！！！');
  }
});

module.exports = router;

