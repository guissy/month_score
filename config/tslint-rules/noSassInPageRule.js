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
var Lint = require("tslint/lib");
var ts = require("typescript");
var path = require('path');
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new NoSassInPageWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var NoSassInPageWalker = /** @class */ (function (_super) {
    __extends(NoSassInPageWalker, _super);
    function NoSassInPageWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoSassInPageWalker.prototype.visitImportDeclaration = function (node) {
        var moduleSpecifier = node.moduleSpecifier;
        var text = moduleSpecifier.text;
        if (ts.isStringLiteral(moduleSpecifier)) {
            var hasStyle = (text.includes('.less') || text.includes('.scss'))
                && text.startsWith('./');
            var fileName = this.getSourceFile().fileName;
            // this.addFailureAtNode(node, `${this.getSourceFile().fileName} + ${fileName} + ${hasStyle}`);
            if (hasStyle && /\w*pages(\\|\/)(?!components)/i.test(fileName)) {
                this.addFailureAtNode(node, "\u9875\u9762\u548C\u7EC4\u4EF6\u6837\u5F0F\u4F7F\u7528 styled-components");
            }
        }
        _super.prototype.visitImportDeclaration.call(this, node);
    };
    return NoSassInPageWalker;
}(Lint.RuleWalker));
