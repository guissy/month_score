import React, { ErrorInfo } from 'react';
import { select } from '../../../utils/model';

interface Props {
  type?: string;
  placeholder?: React.ReactNode;
}

/** 错误边界 */
@select('error')
export default class ErrorBoundary extends React.PureComponent<Props, {}> {
  state = {
    hasError: false,
    error: {} as Error,
    errorInfo: {} as ErrorInfo
  };

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      hasError: true
    });
    // console.error(error);
    console.log('\u2665 componentDidCatch 25', '\u2665'.repeat(88));
    console.error(errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    const { hasError } = this.state;
    const { type, placeholder } = this.props;
    if (hasError) {
      switch (type) {
        case 'placeholder':
          return placeholder;
        case 'skip':
          return null;
        default:
          return this.props.children;
      }
    }
    return this.props.children;
  }
}
