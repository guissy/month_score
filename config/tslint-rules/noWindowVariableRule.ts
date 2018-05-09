import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = '在connect(someModel)组件中使用 this.props.someModel';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new NoWindowVariableWalker(sourceFile, this.getOptions()));
  }
}

class NoWindowVariableWalker extends Lint.RuleWalker {
  public visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
    const globals = [
      'window.sessionStorage',
      'window.localStorage',
      'window.location',
      'location.pathname',
      'location.search'
    ];
    if (globals.includes(node.getText())) {
      this.addFailureAt(node.pos, node.getWidth(), Rule.FAILURE_STRING);
    }
  }
}
