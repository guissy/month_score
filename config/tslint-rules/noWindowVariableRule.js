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
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new NoWindowVariableWalker(sourceFile, this.getOptions()));
    };
    Rule.FAILURE_STRING = '在connect(someModel)组件中使用 this.props.someModel';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var NoWindowVariableWalker = /** @class */ (function (_super) {
    __extends(NoWindowVariableWalker, _super);
    function NoWindowVariableWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoWindowVariableWalker.prototype.visitPropertyAccessExpression = function (node) {
        var globals = [
            'window.sessionStorage',
            'window.localStorage',
            'window.location',
            'location.pathname',
            'location.search'
        ];
        if (globals.includes(node.getText())) {
            this.addFailureAt(node.pos, node.getWidth(), Rule.FAILURE_STRING);
        }
    };
    return NoWindowVariableWalker;
}(Lint.RuleWalker));
