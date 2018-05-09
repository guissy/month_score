// tslint:disable1
declare module 'react-intl' {
  import React from 'react';
  // export const IntlProvider: any;
  export const FormattedMessage: any;

  export function injectIntl<P, C extends React.ComponentType<P>,
  CS extends C & React.ComponentType<{ intl: IntlFormat, children: React.ReactNode }>>
  (WrappedComponent: C,
   options?: {
             intlPropName?: string;
             withRef?: boolean;
           }): C;

  export interface IntlProviderProps extends Partial<IntlConfig> {
    // textComponent: any;
  }

  export class IntlProvider extends React.Component<IntlProviderProps, any> {
    static defaultProps: IntlProviderProps;
    render(): JSX.Element;
  }
  type MessageDescriptor = {
    id: string,
    defaultMessage?: string,
    description?: string | object,
  };
  type IntlConfig = {
    locale: string;
    formats: object;
    messages: { [id: string]: string };

    defaultLocale: string;
    defaultFormats: object;
  };

  export type IntlFormat = {
    formatDate: (value: any, options?: object) => string,
    formatTime: (value: any, options?: object) => string,
    formatRelative: (value: any, options?: object) => string,
    formatNumber: (value: any, options?: object) => string,
    formatPlural: (value: any, options?: object) => string,
    formatMessage: (messageDescriptor: MessageDescriptor, values?: object) => string,
    formatHTMLMessage: (messageDescriptor: MessageDescriptor, values?: object) => string,
  };

  export type IntlShape = IntlConfig & IntlFormat & { now: () => number };

  type LocaleData = {
    locale: string,
    [key: string]: any,
  };

  export function addLocaleData(data: LocaleData | Array<LocaleData>): void;
  const _: any;
  export default _;
}

declare module 'react-intl/locale-data/en' {
  const _: any;
  export default _;
}
declare module 'react-intl/locale-data/zh' {
  const _: any;
  export default _;
}
