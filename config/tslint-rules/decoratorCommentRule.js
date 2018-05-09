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
var utils = require("tsutils");
var path = require('path');
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new DecoratorCommentRule(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var DecoratorCommentRule = /** @class */ (function (_super) {
    __extends(DecoratorCommentRule, _super);
    function DecoratorCommentRule(sourceFile, options) {
        var _this = _super.call(this, sourceFile, options) || this;
        var fileName = sourceFile.fileName;
        var basename = path.basename(fileName);
        if (basename.endsWith('.tsx')) {
            _this.needFix = true;
        }
        return _this;
    }
    DecoratorCommentRule.prototype.visitImportDeclaration = function (node) {
        var text = node.getText();
        if (text && text.includes('connect')) {
            this.nodeImport = node;
        }
    };
    DecoratorCommentRule.prototype.visitClassDeclaration = function (node) {
        if (!this.needFix) {
            return;
        }
        if (node.decorators && node.decorators.length > 0) {
            var nodeConnect = node.decorators.find(function (item) { return item.getText().includes('connect'); });
            if (nodeConnect) {
                var _a = (nodeConnect.getText().match(/(?<=\{)[^}]+/g) || [])[0], ns = _a === void 0 ? '' : _a;
                var namespaces = ns.split(',').map(function (v) { return v.trim(); });
                if (namespaces.length > 0) {
                    var args = namespaces.length === 1
                        ? "'" + namespaces[0] + "'"
                        : JSON.stringify(namespaces).replace(/,/g, ', ').replace(/\"/g, '\'');
                    var fix = Lint.Replacement.replaceNode(nodeConnect, "@select(" + args + ")", this.getSourceFile());
                    this.addFailureAtNode(nodeConnect, '使用 @select 代替 @connect', fix);
                    // connect:添加导入
                    var pathOk = path.relative(process.cwd(), this.getSourceFile().fileName);
                    var level = pathOk.split(path.sep).length - 2;
                    var pathname = '../'.repeat(level);
                    var start = this.nodeImport.getStart();
                    var width = this.nodeImport.getWidth();
                    var fix2 = Lint.Replacement.appendText(start, "import { select } from '" + pathname + "utils/model';\n");
                    this.addFailureAt(start, width, '使用 @select 代替 @connect', fix2);
                    // connect:移除注释
                    this.removeNoAny(nodeConnect);
                }
            }
            var nodeForm = node.decorators.find(function (item) { return item.getText().includes('Form.create()'); });
            if (nodeForm) {
                var fix = Lint.Replacement.replaceNode(nodeForm, "@Form.create()", this.getSourceFile());
                this.addFailureAtNode(nodeForm, '@Form.create() 不用使用any', fix);
                // connect:移除注释
                this.removeNoAny(nodeForm);
            }
            var nodeWithLocale = node.decorators.find(function (item) { return item.getText().includes('withLocale'); });
            if (nodeWithLocale) {
                var fix = Lint.Replacement.replaceNode(nodeWithLocale, "@withLocale", this.getSourceFile());
                this.addFailureAtNode(nodeWithLocale, '@withLocale 不用使用any', fix);
                // connect:移除注释
                this.removeNoAny(nodeWithLocale);
            }
        }
    };
    DecoratorCommentRule.prototype.removeNoAny = function (node) {
        var _this = this;
        utils.forEachComment(node, function (text, commentRange) {
            var start = commentRange.pos;
            var width = commentRange.end - start;
            var comment = text.slice(start, start + width);
            // this.addFailureAt(start, width, comment);
            if (comment.includes('tslint:disable-')) {
                var breakLineWidth = comment.includes('-next-line') ? 2 : 0;
                var fix = Lint.Replacement.deleteText(start, width + breakLineWidth);
                _this.addFailureAt(start, width, '移除不必要的no-any', fix);
            }
        });
    };
    return DecoratorCommentRule;
}(Lint.RuleWalker));
