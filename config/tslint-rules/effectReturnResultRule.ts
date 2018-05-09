import * as Lint from 'tslint';
import * as ts from 'typescript';

const FAILURE_NO_RESULT: string = '返回类型必须是 Result';

export class Rule extends Lint.Rules.AbstractRule {
    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(
            new EffectReturnResultWalker(sourceFile, this.getOptions())
        );
    }
}

class EffectReturnResultWalker extends Lint.RuleWalker {
    public visitMethodDeclaration(node: ts.MethodDeclaration): void {
        this.checkReturnResult(node);
    }

    public visitFunctionDeclaration(node: ts.FunctionDeclaration): void {
        this.checkReturnResult(node);
    }

    private checkReturnResult(node: ts.MethodDeclaration | ts.FunctionDeclaration) {
        const isModel = this.getSourceFile().fileName.indexOf('model.ts') !== -1;
        if (isModel && node.body) {
            let hasReturnResult = false;
            const returnStatement = node.body.statements.slice().pop() as ts.ReturnStatement;
            if (ts.isReturnStatement(returnStatement)) {
                const expression = returnStatement.expression;
                if (expression && ts.isIdentifier(expression)) {
                    if (/result/i.test(expression.text)) {
                        hasReturnResult = true;
                    }
                } else if (expression && ts.isObjectLiteralExpression(expression)) {
                    hasReturnResult = true;
                }
            }
            if (!hasReturnResult) {
                this.addFailureAtNode(
                    returnStatement,
                    FAILURE_NO_RESULT
                );
            }
        }
    }

}
