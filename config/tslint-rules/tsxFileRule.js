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
        return this.applyWithWalker(new TsxFileWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var TsxFileWalker = /** @class */ (function (_super) {
    __extends(TsxFileWalker, _super);
    function TsxFileWalker(sourceFile, options) {
        var _this = _super.call(this, sourceFile, options) || this;
        _this._enable = false;
        var fileName = sourceFile.fileName;
        var extName = path.extname(fileName);
        if (extName === '.tsx') {
            _this._enable = true;
        }
        var sourceCode = sourceFile.getText();
        _this.linesLimit(sourceCode, options, fileName);
        var _a = (sourceCode.match(/message\.(success|error|info)\(/) || {}).index, index = _a === void 0 ? NaN : _a;
        if (!fileName.includes('showMessage') && index) {
            _this.addFailureAt(index, 'message.success'.length, '请使用 showMessage.ts 里的方法');
        }
        return _this;
    }
    TsxFileWalker.prototype.linesLimit = function (sourceCode, options, fileName) {
        var _a = options.ruleArguments, _b = _a[0], fileMaxRows = _b === void 0 ? 300 : _b, _c = _a[1], commentMaxRows = _c === void 0 ? 5 : _c;
        var commentRows = 0;
        var prevIsComment = false;
        var pos300 = 0;
        var posComment = 0;
        var widthComment = 0;
        var maxComment = 0;
        var totalRows = sourceCode.split('\n').filter(function (line) {
            var codeline = /[a-zA-z]/.test(line);
            var isJsdoc = /^\s*(\*|\/\/|\/\*)/.test(line);
            var isComment = /^\s*\/\//.test(line);
            if (isComment) {
                if (prevIsComment) {
                    commentRows += 1;
                }
                else {
                    maxComment = Math.max(maxComment, commentRows);
                    commentRows = 0;
                    posComment = pos300;
                    widthComment += line.length + 2;
                }
                prevIsComment = true;
            }
            else {
                prevIsComment = false;
            }
            pos300 += line.length + 2;
            return codeline && !isJsdoc;
        }).length;
        var allowBigFiles = ['.data.', 'locale'];
        if (!allowBigFiles.some(function (file) { return fileName.includes(file); })
            && totalRows > fileMaxRows) {
            var err = "\u4EE3\u7801\u884C\u6570\u9650" + fileMaxRows + "\u884C\uFF0C\u5DF2\u8D85\u51FA" + (totalRows - fileMaxRows) + "\u884C";
            this.addFailureAt(sourceCode.length - 4, 4, err);
        }
        var allowCommentFiles = ['Routes.tsx', 'index.tsx'];
        if (!allowCommentFiles.some(function (file) { return fileName.includes(file); })
            && maxComment > commentMaxRows) {
            var err = "\u5927\u6BB5\u6CE8\u91CA\u4E0D\u8981\u591A\u4E8E" + commentMaxRows + "\u884C\uFF0C\u5DF2\u8D85\u51FA" + (maxComment - commentMaxRows) + "\u884C";
            this.addFailureAt(posComment, widthComment, err);
        }
    };
    TsxFileWalker.prototype.visitClassDeclaration = function (node) {
        if (!this._enable) {
            return;
        }
        if (Array.isArray(node.modifiers)) {
            var isDefault = node.modifiers.some(function (modifier) {
                return modifier.kind === ts.SyntaxKind.DefaultKeyword;
            });
            if (isDefault) {
                if (node.name && node.name.escapedText) {
                    var className = node.name.escapedText;
                    var fileName = path.basename(this.getSourceFile().fileName, '.tsx');
                    if (className !== fileName) {
                        this.addFailureAtNode(node, "\u6587\u4EF6\u540D " + fileName + " \u5FC5\u987B\u4E0E\u7EC4\u4EF6\u7C7B\u540D " + className + " \u4E00\u81F4\uFF01");
                    }
                }
            }
        }
    };
    return TsxFileWalker;
}(Lint.RuleWalker));
