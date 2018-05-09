import * as Lint from 'tslint/lib';
import * as ts from 'typescript';
const path = require('path');

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile) {
    return this.applyWithWalker(
      new NoSassInPageWalker(sourceFile, this.getOptions())
    );
  }
}

class NoSassInPageWalker extends Lint.RuleWalker {

  public visitImportDeclaration(node: ts.ImportDeclaration) {
    const { moduleSpecifier } = node;
    const { text }  = moduleSpecifier as ts.StringLiteral;
    if (ts.isStringLiteral(moduleSpecifier)) {
      let hasStyle = (text.includes('.less') || text.includes('.scss'))
        && text.startsWith('./')
      const fileName = this.getSourceFile().fileName;
        // this.addFailureAtNode(node, `${this.getSourceFile().fileName} + ${fileName} + ${hasStyle}`);
      if (hasStyle && /\w*pages(\\|\/)(?!components)/i.test(fileName)) {
        this.addFailureAtNode(node, `页面和组件样式使用 styled-components`);
      }
    }

    super.visitImportDeclaration(node);
  }
}
