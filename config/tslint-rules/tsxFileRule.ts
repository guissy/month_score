import * as Lint from 'tslint/lib';
import * as ts from 'typescript';
import { IOptions } from 'tslint';
const path = require('path');
import * as utils from 'tsutils';
import {message} from 'antd';

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile) {
    return this.applyWithWalker(
      new TsxFileWalker(sourceFile, this.getOptions())
    );
  }
}

class TsxFileWalker extends Lint.RuleWalker {

  _enable = false;

  constructor(sourceFile: ts.SourceFile, options: IOptions) {
    super(sourceFile, options);
    const fileName = sourceFile.fileName;
    const extName = path.extname(fileName);
    if (extName === '.tsx') {
      this._enable = true;
    }
    const sourceCode = sourceFile.getText();
    this.linesLimit(sourceCode, options, fileName);
    const { index = NaN } = sourceCode.match(/message\.(success|error|info)\(/) || {};
    if (!fileName.includes('showMessage') && index) {
      this.addFailureAt(index, 'message.success'.length, '请使用 showMessage.ts 里的方法');
    }
  }

  private linesLimit(sourceCode: string, options: IOptions, fileName: string) {
    const [fileMaxRows = 300, commentMaxRows = 5] = options.ruleArguments;
    let commentRows = 0;
    let prevIsComment = false;
    let pos300 = 0;
    let posComment = 0;
    let widthComment = 0;
    let maxComment = 0;
    const totalRows = sourceCode.split('\n').filter(line => {
      const codeline = /[a-zA-z]/.test(line);
      const isJsdoc = /^\s*(\*|\/\/|\/\*)/.test(line);
      const isComment = /^\s*\/\//.test(line);
      if (isComment) {
        if (prevIsComment) {
          commentRows += 1;
        } else {
          maxComment = Math.max(maxComment, commentRows);
          commentRows = 0;
          posComment = pos300;
          widthComment += line.length + 2;
        }
        prevIsComment = true;
      } else {
        prevIsComment = false;
      }
      pos300 += line.length + 2;
      return codeline && !isJsdoc;
    }).length;
    const allowBigFiles = ['.data.', 'locale'];
    if (!allowBigFiles.some(file => fileName.includes(file))
      && totalRows > fileMaxRows) {
      const err = `代码行数限${fileMaxRows}行，已超出${totalRows - fileMaxRows}行`;
      this.addFailureAt(sourceCode.length - 4, 4, err);
    }
    const allowCommentFiles = ['Routes.tsx', 'index.tsx'];
    if (!allowCommentFiles.some(file => fileName.includes(file))
      && maxComment > commentMaxRows) {
      const err = `大段注释不要多于${commentMaxRows}行，已超出${maxComment - commentMaxRows}行`;
      this.addFailureAt(posComment, widthComment, err);
    }
  }

  public visitClassDeclaration(node: ts.ClassDeclaration) {
    if (!this._enable) {
      return;
    }
    if (Array.isArray(node.modifiers)) {
      const isDefault = node.modifiers.some(modifier =>
        modifier.kind === ts.SyntaxKind.DefaultKeyword);
      if (isDefault) {
        if (node.name && node.name.escapedText) {
          const className = node.name.escapedText;
          const fileName = path.basename(this.getSourceFile().fileName, '.tsx');
          if (className !== fileName) {
            this.addFailureAtNode(node, `文件名 ${fileName} 必须与组件类名 ${className} 一致！`);
          }
        }
      }
    }
  }

}
