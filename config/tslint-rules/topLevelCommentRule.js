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
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
exports.__esModule = true;
var ts = require("typescript");
var Lint = require("tslint");
/**
 * Rule to allow only a single export per file
 */
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Implements the walker
     * @param sourceFile
     */
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new TopLevelCommentWalker(sourceFile, this.getOptions()));
    };
    /**
     * Meta data around the rule
     */
    Rule.metadata = {
        ruleName: 'top-level-comment',
        description: 'All top level exports must have comments',
        descriptionDetails: 'for discoverability each file needs to have detail attached to it at the top level',
        rationale: Lint.Utils.dedent(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n            Any exported file should have a description for what it is \n            used for in order to speed up discoverability, as well\n            an understanding on whether or not the class can be reused"], ["\n            Any exported file should have a description for what it is \n            used for in order to speed up discoverability, as well\n            an understanding on whether or not the class can be reused"]))),
        optionsDescription: 'Not configurable.',
        options: [4, true],
        type: 'maintainability',
        typescriptOnly: false
    };
    /**
     * Failure string
     */
    Rule.FAILURE_BLANK_STRING = 'JSDoc 注释不要留白';
    /**
     * Failure string
     */
    Rule.FAILURE_SHORT_STRING = 'Top level implementations must have a JSDoc comment of meaningful length';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
// The walker takes care of all the work.
var TopLevelCommentWalker = /** @class */ (function (_super) {
    __extends(TopLevelCommentWalker, _super);
    /**
     * Creation
     * @param sourceFile
     * @param options
     */
    function TopLevelCommentWalker(sourceFile, options) {
        var _this = _super.call(this, sourceFile, options) || this;
        _this._enabled = true;
        var internalOptions = _this.getOptions();
        if (internalOptions) {
            _this.commentMinimumLength = internalOptions[0];
            _this.noEmptyComment = internalOptions[1];
        }
        var extList = ['.service.ts', '.model.ts', '.d.ts'];
        var extMatch = extList.some(function (ext) {
            return _this.getSourceFile().fileName.endsWith(ext);
        });
        if (extMatch) {
            _this._enabled = false;
        }
        return _this;
    }
    /**
     * Visit each identifier given export assignment does not pickup those that are also identifiers
     * @param node
     */
    TopLevelCommentWalker.prototype.visitIdentifier = function (node) {
        if (!this._enabled) {
            return;
        }
        /// Find the node that contains the export declaration
        var targetNode = node;
        while (targetNode.kind === ts.SyntaxKind.Identifier ||
            targetNode.kind === ts.SyntaxKind.VariableDeclaration ||
            targetNode.kind === ts.SyntaxKind.VariableDeclarationList) {
            targetNode = targetNode.parent; // tslint:disable-line
        }
        /// Match it for export with a space as long as it's not a module declaration
        if (targetNode.kind !== ts.SyntaxKind.ModuleDeclaration && targetNode.getText().match(/export\s/)) {
            /// Increase count and validate
            this.validate(targetNode);
        }
        /// Super and move along
        _super.prototype.visitIdentifier.call(this, node);
    };
    /**
     * Validates to see if we have broken the rule
     * @param node
     */
    TopLevelCommentWalker.prototype.validate = function (node) {
        /// Validate that we have a doc
        if (!node.jsDoc) {
            var name_1 = '';
            var fn = node; // tslint:disable-line:no-any
            if (fn.name && fn.name.escapedText) {
                name_1 = fn.name.escapedText;
            }
            var word = '对象';
            if (ts.isClassDeclaration(node)) {
                word = '类';
            }
            if (ts.isFunctionDeclaration(node)) {
                word = '方法';
            }
            if (ts.isInterfaceDeclaration(node)) {
                word = '接口';
            }
            this.addFailureAtNode(node, "\u5BFC\u51FA\u7684" + word + " " + name_1 + " \u987B\u52A0 JSDoc");
        }
        else {
            /// blank comment -> error
            if (this.noEmptyComment && !node.jsDoc[0].comment) {
                this.addFailureAtNode(node, Rule.FAILURE_BLANK_STRING);
                // tslint:disable-next-line
            }
            else if (this.commentMinimumLength && node.jsDoc[0].comment.length < this.commentMinimumLength) {
                this.addFailureAtNode(node, Rule.FAILURE_SHORT_STRING + " (" + this.commentMinimumLength + " characters)");
            }
        }
    };
    TopLevelCommentWalker.SInit = (function () {
        TopLevelCommentWalker.prototype.commentMinimumLength = 0;
        TopLevelCommentWalker.prototype.noEmptyComment = false;
    })();
    return TopLevelCommentWalker;
}(Lint.RuleWalker));
var templateObject_1;
