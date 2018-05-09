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
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var Lint = require("tslint");
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
    };
    Rule.metadata = {
        ruleName: 'non-null-operator',
        type: 'typescript',
        description: "Ensure the NonNull operator (!) can be used or not.",
        rationale: 'strictNullChecks are meant to avoid issues, which the non-null operator removes '
            + 'if used too frequently. Please use the non-null operator responsibly.',
        options: null,
        optionsDescription: "Not configurable.",
        typescriptOnly: false
    };
    Rule.FAILURE_STRING = 'The Non-Null operator `!` is illegal.';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var Walker = /** @class */ (function (_super) {
    __extends(Walker, _super);
    function Walker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Walker.prototype.visitNonNullExpression = function (node) {
        var word = node.expression.getText();
        if (!(/\b(dispatch|form|site)\b/.test(word))) {
            this.addFailureAtNode(node.parent, Rule.FAILURE_STRING); // tslint:disable-line
        }
    };
    return Walker;
}(Lint.RuleWalker));
