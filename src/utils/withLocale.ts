import React from 'react';
import invariant from 'invariant';
import PropTypes from 'prop-types';

function getDisplayName(Component: React.ComponentType) {
  return Component.displayName || Component.name || 'Component';
}

type Intl = { intl: object };
// tslint:disable-next-line
function withLocale<P>(WrappedComponent: any) {
  // tslint:disable-line
  /**
   * 这个类作用是 类似于 InjectIntl，不同是 InjectIntl 是注入的props内容： intl: {formatMessage: () => string}
   * 更改为新的props内容： site: () => string
   */
  // 只能是Component，原因context发生变化不会更新pureComponent
  class Locale extends React.Component<P> {
    static displayName = `WithLocale(${getDisplayName(WrappedComponent)})`;
    static WrappedComponent = WrappedComponent;
    static contextTypes = {
      intl: PropTypes.object.isRequired
    };

    // context.intl 是从<IntlProvider />注入进来的
    constructor(props: P, { intl }: Intl = {} as Intl) {
      super(props, { intl });
      invariant(
        intl,
        '[React Intl] Could not find required `intl` object. ' +
          '<IntlProvider> needs to exist in the component ancestry.'
      );
    }
    render() {
      const siteOk = (id: string, values?: object) =>
        this.context.intl.formatMessage({ id, defaultMessage: id }, values);
      withLocale.site = siteOk; // tslint:disable-line
      const { children, ...props } = this.props as any; // tslint:disable-line:no-any
      return React.createElement(
        WrappedComponent,
        {
          ...props,
          // values 用于将值替换译文中的变量
          site: siteOk
        },
        children
      );
    }
  }
  return Locale as any; // tslint:disable-line:no-any
}

// 静态方法：用于 util 的弹消息，先初始化，在 render 中的 context 更新多语言
namespace withLocale {
  /** 多语言，静态方法 */
  export let site = (words: string, values?: object) => words;
}

/** 多语言，注入组件props.site */
export default withLocale;

/** 用于组件Props声明 */
export interface SiteProps {
  site?: (id: string, values?: object) => string;
}
/** 用于site的声明 */
export type siteFunction = (id: string, values?: object) => string;
