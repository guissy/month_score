const fs = require('fs');
const path = require('path');
const dictionary = require('dictionary-en-us');
const nspell = require('nspell');
const _ = require('lodash/fp');
const chalk = require('chalk');

dictionary((err, dict) => {
    const spell = nspell(dict);
    const files = process.argv.slice(2);
    const models = files.filter(file => file.includes('.model.ts'));
    // 抓取命名空间
    const words = models.reduce((errs, file) => {
        const namespace = fs.readFileSync(file, { encoding: 'utf-8' });
        if (namespace) {
            errs.push([file, namespace]);
        }
        return errs;
    }, []);
    const errs = words.filter(([file, word]) => {
        const arr = _.lowerCase(word).split(' ');
        const fileName = path.basename(file, '.model.ts');
        const isSameFileName = _.camelCase(fileName) === word;
        const isOkWord = _.every((v)=>spell.correct(v))(arr);
        return !(isOkWord && isSameFileName);
    }).map(([file, word]) =>
        chalk.blue(`文件 ${file}\n`) +
        chalk.blue('命名空间 ') + chalk.red.bold(word) + chalk.blue(' 拼写不正确！！！'));

    if (errs.length > 0) {
        console.log(errs.join('\n'));
        process.exit(1);
    } else {
        process.exit(0);
    }
});