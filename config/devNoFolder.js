const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const chalk = require('chalk')
const getAllFiles = dir =>
    fs.readdirSync(dir).reduce((files, file) => {
        const name = path.join(dir, file);
        const isDirectory = fs.statSync(name).isDirectory();
        return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name];
    }, []);

function noCreateFolderInDev(addedLinterPaths) {
    try {
        const status = execSync('git status');
        if (status.includes('On branch dev')) {
            const addedAllStr = execSync('git diff origin/dev --name-only --diff-filter A');
            const addedAll = addedAllStr.toString().split('\n').map(v => path.dirname(v.split('src').pop()));
            const older = execSync('git ls-tree HEAD -r --name-only');
            const addedLinter = addedLinterPaths.map(v => path.dirname(v.split('src').pop()).replace(/\\/g, '/'));
            const added = _.intersection(addedAll, addedLinter);
            const srcAdd = added.filter(Boolean);
            const srcOld = older.toString().split('\n').map(v => path.dirname(v.split('src').pop())).filter(Boolean);
            const folder = _.difference(srcAdd, srcOld);
            if (folder && folder.length > 0) {
                // throw new Error('不能在dev分支下直接添加目录 ' + folder);
                console.log(chalk.red('不能在', chalk.bold('dev') + ' 分支下直接添加目录!'));
                console.log(chalk.red('开发新功能请在新分支上开发，并由小组负责人合并到 dev 分支'));
                process.exit(1);
            }
        }
    } catch (e) {
    }
}

noCreateFolderInDev(process.argv.slice(2));
