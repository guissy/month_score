import * as Lint from 'tslint/lib';
import * as ts from 'typescript';
import { IOptions } from 'tslint';
const path = require('path');
import { flatten, map, lowerCase, words, intersection } from 'lodash/fp';

const aliasDict = {
  manage: 'management',
  info: 'infomation',
  setting: 'set,config',
};

const canS = ['pages', 'components', 'routes', 'utils', 'typings', 'rules'];

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile) {
    return this.applyWithWalker(
      new JsxFileSameNameWalker(sourceFile, this.getOptions())
    );
  }
}

class JsxFileSameNameWalker extends Lint.RuleWalker {

  constructor(sourceFile: ts.SourceFile, options: IOptions) {
    super(sourceFile, options);
    // 文件长度
    const fileName = sourceFile.fileName;
    const basename = path.basename(fileName);
    const fileFirstName = basename.split('.').shift();
    const [limit = 21, limitDir = 72, ...allowS] = options.ruleArguments;
    const over = fileFirstName.length - limit;
    if (over > 0) {
      this.addFailureAt(0, 1, `文件名 ${fileFirstName} 限${limit}字符，已超出${over}！`);
    }
    const relative = path.relative(process.cwd(), fileName);
    const dirNames = relative.split(path.sep).slice(0, -1);
    const overDir = relative.length - limitDir;
    if (relative.length > limitDir) {
      this.addFailureAt(0, 1, `路径 ${relative} 限${limitDir}字符，已超出${overDir}！`);
    }

    // 更好的词
    const fileWords = map(lowerCase)(words(fileFirstName));
    const dirWords = map(lowerCase)(flatten(map(words)(dirNames)));
    if (fileName.endsWith('tsx')) {
      this.hasBetterWord(fileWords, dirWords);
    }

    // 不能复数
    const canSAll = canS.concat(allowS);
    const noSErr = fileWords.concat(dirWords).filter((word) =>
      word.length > 3 && word.endsWith('s') && !canSAll.includes(word))
      .map(word => `文件路径单词 ${word} 不要复数`);
    Array.from(new Set(noSErr)).forEach((aliasErr) => {
      this.addFailureAt(0, 1, aliasErr);
    });
  }

  // 更好的词
  private hasBetterWord(fileWords: string[], dirWords: string[]) {
    const errAlias = Object.entries(aliasDict).map(([nameOk, nameErr]) => {
      const pathWords = intersection(nameErr.split(','), fileWords.concat(dirWords));
      return [nameOk, pathWords];
    })
      .filter(([nameOk, pathWords]) => pathWords.length > 0)
      .map(([nameOk, pathWords]) => `业务模块的组件不要使用 ${pathWords}, 请使用 ${nameOk} `);
    Array.from(new Set(errAlias)).forEach((aliasErr) => {
      this.addFailureAt(0, 1, aliasErr);
    });
  }
}
