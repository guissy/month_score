import * as Lint from 'tslint/lib';
import * as ts from 'typescript';
import { words } from 'lodash/fp';
import { IOptions } from 'tslint/lib/language/rule/rule';

/**
 * @example
 * "no-css-important": [true, "float:", "var("]
 *
 */
export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile) {
    return this.applyWithFunction(sourceFile, walk, this.getOptions());
  }
}

function walk(ctx: Lint.WalkContext<IOptions>) {
  const keywords = ctx.options.ruleArguments;
  ts.forEachChild(ctx.sourceFile, function cb(node: ts.Node): void {
    if (ts.isTaggedTemplateExpression(node)) {
      let index = node.getText().indexOf('!important');
      if (index > 0) {
        const start = node.getStart() + index;
        ctx.addFailureAt(start, '!important'.length, `样式不能使用 !important `);
      }
      if (/z-index:\s+[0-9]*[1-9]{2}/.test(node.getText())) {
        ctx.addFailureAtNode(node, `样式 z-index 要整百起`);
      }
      keywords
        .filter(word =>
          new RegExp('(?<!\\/\\/\\s*)' + word).test(node.getText()))
        .forEach(word => {
          const wordOk = words(word)[0];
          const start = node.getStart() + node.getText().indexOf(word);
          ctx.addFailureAt(start, wordOk.length, `样式不能使用 ${wordOk} `);
        });
    }
    return ts.forEachChild(node, cb);
  });
}
