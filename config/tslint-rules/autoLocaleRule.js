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
var utils = require("tsutils");
var locales = new Map();
function getLocaleKeys(file) {
    if (locales.has(file)) {
        return locales.get(file);
    }
    else {
        var comma_1 = true;
        var locale = ts.createProgram([file], {});
        var zhCN = locale.getSourceFile(file);
        var keys_1 = [];
        var endPos_1 = 0;
        var transformer = function (context) {
            return function (rootNode) {
                function visit(node) {
                    if (ts.isPropertyAssignment(node) && node.name) {
                        // if (node.name) {
                        keys_1.push(utils.getIdentifierText(node.name));
                        // }
                    }
                    else if (ts.isObjectLiteralExpression(node)) {
                        comma_1 = !!node.properties.hasTrailingComma;
                        endPos_1 = node.getEnd();
                    }
                    return ts.visitEachChild(node, visit, context);
                }
                return ts.visitNode(rootNode, visit);
            };
        };
        if (zhCN) {
            ts.transform(zhCN, [transformer]);
        }
        return { keys: keys_1, zhCN: zhCN, endPos: endPos_1, comma: comma_1 };
    }
}
function hasNonLetter(word) {
    var regZh = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/;
    var regEn = /[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?]/;
    return regEn.test(word) || regZh.test(word);
}
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        var _this = this;
        var sourceCode = sourceFile.getText();
        var sites = sourceCode.match(/site\(\'[^']+/g) || [];
        var menus = sourceCode.match(/name:\s*\'[^']+/g) || [];
        var siteWords = sites.map(function (site) { return site.slice(6); }).filter(Boolean);
        var menuWords = menus.map(function (menu) { return menu.slice(7); }).filter(function (w) { return /[^\x00-\xff]/.test(w); });
        var files = ['src/locale/zh_CN.ts', 'src/locale/zh_HK.ts', 'src/locale/en_US.ts'];
        var walkers = [];
        files.forEach(function (file) {
            var _a = getLocaleKeys(path.resolve(process.cwd(), file)), keys = _a.keys, zhCN = _a.zhCN, endPos = _a.endPos, comma = _a.comma;
            var words = siteWords.concat(menuWords).filter(function (w) { return !keys.includes(w); });
            words = Array.from(new Set(words));
            words = words.map(function (v) {
                v = v.replace(/\'/, '\\\'');
                return v;
            });
            if (zhCN) {
                if (words.length > 0) {
                    var opt = _this.getOptions();
                    opt.ruleArguments = [file, keys, endPos, words, comma];
                    _this.applyWithWalker(new AutoLocale(zhCN, opt));
                    walkers = walkers.concat(_this.applyWithWalker(new AutoLocale(zhCN, opt)));
                }
            }
        });
        return walkers;
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var AutoLocale = /** @class */ (function (_super) {
    __extends(AutoLocale, _super);
    function AutoLocale(sourceFile, options) {
        var _this = _super.call(this, sourceFile, options) || this;
        var _a = options.ruleArguments, file = _a[0], keys = _a[1], endPos = _a[2], words = _a[3], comma = _a[4];
        var keysNewer = [];
        var text = words.map(function (word) {
            var key = hasNonLetter(word) ? "'" + word + "'" : word;
            keysNewer.push(key);
            return "  " + key + ": '" + word + "',";
        }).join('\n');
        text = comma ? text + '\n' : ',\n' + text;
        var fix = _this.createReplacement(comma ? endPos - 1 : endPos - 2, 0, text);
        _this.addFailureAt(0, 1, '多语言缺少字段:' + words, fix);
        locales.set(file, { keys: keys.concat(keysNewer), sourceFile: sourceFile, endPos: endPos + text.length, comma: true });
        return _this;
    }
    return AutoLocale;
}(Lint.RuleWalker));
