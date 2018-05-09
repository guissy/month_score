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
var fp_1 = require("lodash/fp");
/**
 * @example
 * "no-css-important": [true, "float:", "var("]
 *
 */
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithFunction(sourceFile, walk, this.getOptions());
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
function walk(ctx) {
    var keywords = ctx.options.ruleArguments;
    ts.forEachChild(ctx.sourceFile, function cb(node) {
        if (ts.isTaggedTemplateExpression(node)) {
            var index = node.getText().indexOf('!important');
            if (index > 0) {
                var start = node.getStart() + index;
                ctx.addFailureAt(start, '!important'.length, "\u6837\u5F0F\u4E0D\u80FD\u4F7F\u7528 !important ");
            }
            if (/z-index:\s+[0-9]*[1-9]{2}/.test(node.getText())) {
                ctx.addFailureAtNode(node, "\u6837\u5F0F z-index \u8981\u6574\u767E\u8D77");
            }
            keywords
                .filter(function (word) {
                return new RegExp('(?<!\\/\\/\\s*)' + word).test(node.getText());
            })
                .forEach(function (word) {
                var wordOk = fp_1.words(word)[0];
                var start = node.getStart() + node.getText().indexOf(word);
                ctx.addFailureAt(start, wordOk.length, "\u6837\u5F0F\u4E0D\u80FD\u4F7F\u7528 " + wordOk + " ");
            });
        }
        return ts.forEachChild(node, cb);
    });
}
