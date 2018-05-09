import * as Lint from 'tslint/lib';
import * as ts from 'typescript';
import { IOptions } from 'tslint';
const path = require('path');
import * as utils from 'tsutils';
const locales = new Map();
function getLocaleKeys(file: string) {
  if (locales.has(file)) {
    return locales.get(file);
  } else {
    let comma: boolean = true;
    const locale = ts.createProgram([file], {});
    const zhCN = locale.getSourceFile(file);
    const keys = [] as string[];
    let endPos = 0;
    const transformer = <T extends ts.Node>(context: ts.TransformationContext) =>
      (rootNode: T) => {
        function visit(node: ts.Node): ts.Node {
          if (ts.isPropertyAssignment(node) && node.name) {
            // if (node.name) {
            keys.push(utils.getIdentifierText((node as any).name));
            // }
          } else if (ts.isObjectLiteralExpression(node)) {
            comma = !!node.properties.hasTrailingComma;
            endPos = node.getEnd();
          }
          return ts.visitEachChild(node, visit, context);
        }

        return ts.visitNode(rootNode, visit);
      };
    if (zhCN) {
      ts.transform(zhCN, [transformer]);
    }
    return { keys, zhCN, endPos, comma };
  }
}

function hasNonLetter(word) {
  const regZh = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/;
  const regEn = /[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?]/;
  return regEn.test(word) || regZh.test(word);
}

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile) {
    const sourceCode = sourceFile.getText();
    const sites = sourceCode.match(/site\(\'[^']+/g) || [];
    const menus = sourceCode.match(/name:\s*\'[^']+/g) || [];
    const siteWords = sites.map(site => site.slice(6)).filter(Boolean);
    const menuWords = menus.map(menu => menu.slice(7)).filter(w => /[^\x00-\xff]/.test(w));
    const files = ['src/locale/zh_CN.ts', 'src/locale/zh_HK.ts', 'src/locale/en_US.ts'];
    let walkers = [] as any;
    files.forEach((file) => {
      const { keys, zhCN, endPos, comma } = getLocaleKeys(path.resolve(process.cwd(), file));
      let words = siteWords.concat(menuWords).filter(w => !keys.includes(w));
      words = Array.from(new Set(words));
      words = words.map(v => {
        v = v.replace(/\'/, '\\\'');
        return v;
      });
      if (zhCN) {
        if (words.length > 0) {
          const opt = this.getOptions();
          opt.ruleArguments = [file, keys, endPos, words, comma];
          this.applyWithWalker(new AutoLocale(zhCN, opt));
          walkers = walkers.concat(this.applyWithWalker(new AutoLocale(zhCN, opt)));
        }
      }
    });
    return walkers;
  }
}

class AutoLocale extends Lint.RuleWalker {

  constructor(sourceFile: ts.SourceFile, options: IOptions) {
    super(sourceFile, options);
    const [file, keys, endPos, words, comma] = options.ruleArguments;
    const keysNewer = [] as string[];
    let text = words.map((word: string) => {
      const key = hasNonLetter(word) ? `'${word}'` : word;
      keysNewer.push(key);
      return `  ${key}: '${word}',`;
    }).join('\n');
    text = comma ? text + '\n' : ',\n' + text;
    const fix = this.createReplacement(comma ? endPos - 1 : endPos - 2, 0, text);
    this.addFailureAt(0, 1, '多语言缺少字段:' + words, fix);
    locales.set(file, { keys: keys.concat(keysNewer), sourceFile, endPos:  endPos + text.length, comma: true });
  }

}