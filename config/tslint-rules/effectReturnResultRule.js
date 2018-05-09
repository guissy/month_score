"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var Lint = require("tslint");
var ts = require("typescript");
var FAILURE_NO_RESULT = '返回类型必须是 Result';
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new EffectReturnResultWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var EffectReturnResultWalker = /** @class */ (function (_super) {
    __extends(EffectReturnResultWalker, _super);
    function EffectReturnResultWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EffectReturnResultWalker.prototype.visitMethodDeclaration = function (node) {
        this.checkReturnResult(node);
    };
    EffectReturnResultWalker.prototype.visitFunctionDeclaration = function (node) {
        this.checkReturnResult(node);
    };
    EffectReturnResultWalker.prototype.checkReturnResult = function (node) {
        var isModel = this.getSourceFile().fileName.indexOf('model.ts') !== -1;
        if (isModel && node.body) {
            var hasReturnResult = false;
            var returnStatement = node.body.statements.slice().pop();
            if (ts.isReturnStatement(returnStatement)) {
                var expression = returnStatement.expression;
                if (expression && ts.isIdentifier(expression)) {
                    if (/result/i.test(expression.text)) {
                        hasReturnResult = true;
                    }
                }
                else if (expression && ts.isObjectLiteralExpression(expression)) {
                    hasReturnResult = true;
                }
            }
            if (!hasReturnResult) {
                this.addFailureAtNode(returnStatement, FAILURE_NO_RESULT);
            }
        }
    };
    return EffectReturnResultWalker;
}(Lint.RuleWalker));
