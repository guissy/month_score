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
var path = require('path');
var fp_1 = require("lodash/fp");
var aliasDict = {
    manage: 'management',
    info: 'infomation',
    setting: 'set,config'
};
var canS = ['pages', 'components', 'routes', 'utils', 'typings', 'rules'];
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new JsxFileSameNameWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var JsxFileSameNameWalker = /** @class */ (function (_super) {
    __extends(JsxFileSameNameWalker, _super);
    function JsxFileSameNameWalker(sourceFile, options) {
        var _this = _super.call(this, sourceFile, options) || this;
        // 文件长度
        var fileName = sourceFile.fileName;
        var basename = path.basename(fileName);
        var fileFirstName = basename.split('.').shift();
        var _a = options.ruleArguments, _b = _a[0], limit = _b === void 0 ? 21 : _b, _c = _a[1], limitDir = _c === void 0 ? 72 : _c, allowS = _a.slice(2);
        var over = fileFirstName.length - limit;
        if (over > 0) {
            _this.addFailureAt(0, 1, "\u6587\u4EF6\u540D " + fileFirstName + " \u9650" + limit + "\u5B57\u7B26\uFF0C\u5DF2\u8D85\u51FA" + over + "\uFF01");
        }
        var relative = path.relative(process.cwd(), fileName);
        var dirNames = relative.split(path.sep).slice(0, -1);
        var overDir = relative.length - limitDir;
        if (relative.length > limitDir) {
            _this.addFailureAt(0, 1, "\u8DEF\u5F84 " + relative + " \u9650" + limitDir + "\u5B57\u7B26\uFF0C\u5DF2\u8D85\u51FA" + overDir + "\uFF01");
        }
        // 更好的词
        var fileWords = fp_1.map(fp_1.lowerCase)(fp_1.words(fileFirstName));
        var dirWords = fp_1.map(fp_1.lowerCase)(fp_1.flatten(fp_1.map(fp_1.words)(dirNames)));
        if (fileName.endsWith('tsx')) {
            _this.hasBetterWord(fileWords, dirWords);
        }
        // 不能复数
        var canSAll = canS.concat(allowS);
        var noSErr = fileWords.concat(dirWords).filter(function (word) {
            return word.length > 3 && word.endsWith('s') && !canSAll.includes(word);
        })
            .map(function (word) { return "\u6587\u4EF6\u8DEF\u5F84\u5355\u8BCD " + word + " \u4E0D\u8981\u590D\u6570"; });
        Array.from(new Set(noSErr)).forEach(function (aliasErr) {
            _this.addFailureAt(0, 1, aliasErr);
        });
        return _this;
    }
    // 更好的词
    JsxFileSameNameWalker.prototype.hasBetterWord = function (fileWords, dirWords) {
        var _this = this;
        var errAlias = Object.entries(aliasDict).map(function (_a) {
            var nameOk = _a[0], nameErr = _a[1];
            var pathWords = fp_1.intersection(nameErr.split(','), fileWords.concat(dirWords));
            return [nameOk, pathWords];
        })
            .filter(function (_a) {
            var nameOk = _a[0], pathWords = _a[1];
            return pathWords.length > 0;
        })
            .map(function (_a) {
            var nameOk = _a[0], pathWords = _a[1];
            return "\u4E1A\u52A1\u6A21\u5757\u7684\u7EC4\u4EF6\u4E0D\u8981\u4F7F\u7528 " + pathWords + ", \u8BF7\u4F7F\u7528 " + nameOk + " ";
        });
        Array.from(new Set(errAlias)).forEach(function (aliasErr) {
            _this.addFailureAt(0, 1, aliasErr);
        });
    };
    return JsxFileSameNameWalker;
}(Lint.RuleWalker));
