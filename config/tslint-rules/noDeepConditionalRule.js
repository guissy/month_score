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
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new PreferLiteralWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var PreferLiteralWalker = /** @class */ (function (_super) {
    __extends(PreferLiteralWalker, _super);
    function PreferLiteralWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PreferLiteralWalker.prototype.visitConditionalExpression = function (node) {
        var _this = this;
        [node.whenFalse, node.whenTrue]
            .forEach(function (clause) {
            var childCondition = ts.isConditionalExpression(clause);
            var inner = clause.expression;
            var childConditionParen = inner && ts.isConditionalExpression(inner);
            if (childCondition || childConditionParen) {
                _this.addFailureAtNode(clause, '不要在三元操作符再嵌三元操作符！');
            }
        });
        this.walkChildren(node);
    };
    return PreferLiteralWalker;
}(Lint.RuleWalker));
