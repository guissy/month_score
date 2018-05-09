import React from 'react';
import ErrorBoundary from './ErrorBoundary';

// tslint:disable-next-line:no-any
const placeholderOnError = <T extends any, C extends React.ComponentClass<T>>(
  placeholder: React.ReactNode
) =>
  ((WrappedComponent: C) => (props: T) => (
    <ErrorBoundary type="placeholder" placeholder={placeholder}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  )) as any; // tslint:disable-line:no-any

/** 渲染占位符 */
export default placeholderOnError;
