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
var utils = require("tsutils");
var path = require('path');
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ServiceFileWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var ServiceFileWalker = /** @class */ (function (_super) {
    __extends(ServiceFileWalker, _super);
    function ServiceFileWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ServiceFileWalker.prototype.visitFunctionDeclaration = function (node) {
        if (node.name) {
            var name_1 = node.name.escapedText;
            if (utils.hasModifier(node.modifiers, ts.SyntaxKind.ExportKeyword)
                && utils.hasModifier(node.modifiers, ts.SyntaxKind.AsyncKeyword)
                && !name_1.toString().endsWith('Http')) {
                var err = '函数名必须有 Http 后缀';
                var _a = node.name, pos = _a.pos, end = _a.end;
                var fix = this.createReplacement(pos + 1, end - pos - 1, name_1 + "Http");
                this.addFailureAtNode(node, err, fix);
            }
        }
    };
    return ServiceFileWalker;
}(Lint.RuleWalker));
