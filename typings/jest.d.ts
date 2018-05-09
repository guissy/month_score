// tslint:disable-line
/** 带样式的Props */
export interface JestStyleProps {
  style?: Partial<CSSStyleDeclaration>;
  className?: string;
  [prop: string]: any; // tslint:disable-line
}
declare global {
  namespace jest {
    interface Matchers<R> {
      /**
       * 支持样式 style 和 className
       */
      toHaveStyle(expected: JestStyleProps): R;
    }
  }
}