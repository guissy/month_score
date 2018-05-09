import React from 'react';
import ErrorBoundary from './ErrorBoundary';

// tslint:disable-next-line:no-any
const skipOnError = <T extends any>(WrappedComponent: React.ComponentType<T>) =>
  ((props: T) => (
    <ErrorBoundary type="skip">
      <WrappedComponent {...props} />
    </ErrorBoundary>
  )) as any; // tslint:disable-line:no-any

/** 不渲染组件 */
export default skipOnError;
