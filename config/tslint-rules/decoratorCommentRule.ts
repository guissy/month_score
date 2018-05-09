import * as Lint from 'tslint/lib';
import * as ts from 'typescript';
import { IOptions } from 'tslint';
import * as utils from 'tsutils';
const path = require('path');

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile) {
    return this.applyWithWalker(
      new DecoratorCommentRule(sourceFile, this.getOptions())
    );
  }
}

class DecoratorCommentRule extends Lint.RuleWalker {
  nodeImport: ts.ImportDeclaration;
  private needFix: boolean;

  constructor(sourceFile: ts.SourceFile, options: IOptions) {
    super(sourceFile, options);
    const fileName = sourceFile.fileName;
    const basename = path.basename(fileName);
    if (basename.endsWith('.tsx')) {
      this.needFix = true;
    }
  }

  protected visitImportDeclaration(node: ts.ImportDeclaration): void {
    const text = node.getText();
    if (text && text.includes('connect')) {
      this.nodeImport = node;
    }
  }

  protected visitClassDeclaration(node: ts.ClassDeclaration): void {
    if (!this.needFix) {
      return;
    }
    if (node.decorators && node.decorators.length > 0) {
      const nodeConnect = node.decorators.find(item => item.getText().includes('connect'));
      if (nodeConnect) {
        const [ns = ''] = nodeConnect.getText().match(/(?<=\{)[^}]+/g) || [];
        const namespaces = ns.split(',').map(v => v.trim());
        if (namespaces.length > 0) {
          let args = namespaces.length === 1
            ? `'${namespaces[0]}'`
            : JSON.stringify(namespaces).replace(/,/g, ', ').replace(/\"/g, '\'');
          const fix = Lint.Replacement.replaceNode(
            nodeConnect,
            `@select(${args})`,
            this.getSourceFile(),
          );
          this.addFailureAtNode(nodeConnect, '使用 @select 代替 @connect', fix);
          // connect:添加导入
          const pathOk = path.relative(process.cwd(), this.getSourceFile().fileName);
          const level = pathOk.split(path.sep).length - 2;
          const pathname = '../'.repeat(level);
          const start = this.nodeImport.getStart();
          const width = this.nodeImport.getWidth();
          const fix2 = Lint.Replacement.appendText(
            start,
            `import { select } from '${pathname}utils/model';\n`,
          );
          this.addFailureAt(start, width, '使用 @select 代替 @connect', fix2);
          // connect:移除注释
          this.removeNoAny(nodeConnect);
        }
      }

      const nodeForm = node.decorators.find(item => item.getText().includes('Form.create()'));
      if (nodeForm) {
        const fix = Lint.Replacement.replaceNode(
          nodeForm,
          `@Form.create()`,
          this.getSourceFile(),
        );
        this.addFailureAtNode(nodeForm, '@Form.create() 不用使用any', fix);
        // connect:移除注释
        this.removeNoAny(nodeForm);
      }

      const nodeWithLocale = node.decorators.find(item => item.getText().includes('withLocale'));
      if (nodeWithLocale) {
        const fix = Lint.Replacement.replaceNode(
          nodeWithLocale,
          `@withLocale`,
          this.getSourceFile(),
        );
        this.addFailureAtNode(nodeWithLocale, '@withLocale 不用使用any', fix);
        // connect:移除注释
        this.removeNoAny(nodeWithLocale);
      }
    }
  }

  private removeNoAny(node: ts.Node) {
    utils.forEachComment(node, (text, commentRange) => {
      const start = commentRange.pos;
      const width = commentRange.end - start;
      const comment = text.slice(start, start + width);
      // this.addFailureAt(start, width, comment);
      if (comment.includes('tslint:disable-')) {
        const breakLineWidth = comment.includes('-next-line') ? 2 : 0;
        const fix = Lint.Replacement.deleteText(start, width + breakLineWidth);
        this.addFailureAt(start, width, '移除不必要的no-any', fix);
      }
    });
  }
}
