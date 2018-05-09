import * as Lint from 'tslint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new PreferLiteralWalker(sourceFile, this.getOptions()));
    }
}

class PreferLiteralWalker extends Lint.RuleWalker {
    protected visitConditionalExpression(node: ts.ConditionalExpression) {

        [node.whenFalse, node.whenTrue]
          .forEach((clause) => {
          const childCondition = ts.isConditionalExpression(clause);
          const inner = (clause as ts.ParenthesizedExpression).expression;
          const childConditionParen = inner && ts.isConditionalExpression(inner);
          if (childCondition || childConditionParen) {
            this.addFailureAtNode(clause, '不要在三元操作符再嵌三元操作符！');
          }
        });

        this.walkChildren(node);
    }
}
