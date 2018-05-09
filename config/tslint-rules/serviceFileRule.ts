import * as Lint from 'tslint/lib';
import * as ts from 'typescript';
import { IOptions } from 'tslint';
import * as utils from 'tsutils';
const path = require('path');

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile) {
    if (sourceFile.fileName.endsWith('.service.ts')) {
      return this.applyWithWalker(
        new ServiceFileWalker(sourceFile, this.getOptions())
      );
    } else if (sourceFile.fileName.endsWith('.model.ts')) {
      return this.applyWithWalker(
        new ModelFileWalker(sourceFile, this.getOptions())
      );
    } else {
      return [];
    }
  }
}

class ModelFileWalker extends Lint.RuleWalker {
  ts
  public visitCallExpression(node: ts.CallExpression) {
    const imports = utils.findImports(this.getSourceFile(), utils.ImportOptions.ImportDeclaration);
    const fileName = imports.map(file => file.text.toString())
      .find(fileNameTxt => fileNameTxt.endsWith('.service'));
    const serviceFileName = path.resolve(path.dirname(this.getSourceFile().fileName), fileName);

  }
}

class ServiceFileWalker extends Lint.RuleWalker {
  public visitFunctionDeclaration(node: ts.FunctionDeclaration) {
    if (node.name) {
      const name = node.name.escapedText;
      if (utils.hasModifier(node.modifiers, ts.SyntaxKind.ExportKeyword)
        && utils.hasModifier(node.modifiers, ts.SyntaxKind.AsyncKeyword)
        && !name.toString().endsWith('Http')
      ) {
        const err = '函数名必须有 Http 后缀';
        const { pos, end } = node.name;
        const fix = this.createReplacement(pos + 1, end - pos - 1, `${name}Http`);
        this.addFailureAtNode(node, err, fix);
      }
    }
  }
}
