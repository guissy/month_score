---
to: src/pages/<%= name %>/<%= Name %>.tsx
---
import * as React from 'react';
import { Dispatch } from 'dva';
import styled from 'styled-components';
import { select } from '../../utils/model';

interface Hoc {
  dispatch: Dispatch;
}

interface Props extends Partial<Hoc> {
}

/** <%= Name %> */
@select('<%= name %>')
export default class <%= Name %> extends React.PureComponent<Props, {}> {
  state = {}

  render() {
    return (
    );
  }
}