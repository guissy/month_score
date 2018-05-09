const chalk = require('chalk');
const fs = require("fs");
const path = require("path");

const gitPath = path.join(__dirname, '../', process.env.GIT_PARAMS || '');
const commitMsg = fs.readFileSync(gitPath, 'utf-8');
const keywords = new Map();
const example = `
[C] Comment: 一般注释
[D] Docs: 修改了文档
[D] Release: 发布注释
[F] Fixed #2245: 修复一项 BUG
[A] Feature #1190: 添加了一项新功能
[A] Added #2108: 添加了一项新功能
[R] Removed #985: 移除
[D] Deprecated #1138: 一项功能过时/弃用
[I] Improved #186: 改进/提升
[X] Debug: 调试 /file/path:12
[-] Misc: 其它/杂项
[~] Initial.`.replace(/\s#\d+/g, '');
function okMsg(commitMsg) {

    const template = example.split('\n').filter(Boolean).map(v => {
        let s = v.split(':').shift();
        const k = s.replace(/\[[A-Z]\]\s|\s#\d+/g, '');
        keywords.set(k, v);
        // s = s.replace(/\s#\d+/, '( #\\d+)?');
        s = s.replace(/\s#\d+/, '');
        s = s.replace(/(\[|\])/g, '\\$1');
        return s + ': .+';
    });
    return template.some(v => new RegExp(v).test(commitMsg));
}

if (!okMsg(commitMsg)) {
    if (/：/.test(commitMsg)) {
        console.log(chalk.red('请使用英文的冒号'));
    } else {
        const k = Array.from(keywords.keys()).find(k => commitMsg.includes(k));
        if (k) {
            console.log(chalk.red('请使用以下格式写日志！！！'));
            console.log(chalk.red('================================================='));
            console.log(chalk.red(keywords.get(k)));
            console.log(chalk.red('================================================='));
        } else {
            console.log(chalk.red(example));
        }
    }
    process.exit(1);
} else {
    process.exit(0);
}
