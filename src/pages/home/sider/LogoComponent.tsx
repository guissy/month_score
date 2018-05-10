import * as React from 'react';
import styled from 'styled-components';
import { Link } from 'dva/router';
import { select } from '../../../utils/model';
import environment from '../../../utils/environment';

const Wrap = styled(Link)`
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  background: #002140;
  padding: 0 12px;
  overflow: hidden;

  &:focus {
    text-decoration: none;
  }

  img {
    max-width: 35px;
  }

  h1 {
    color: #fff;
    font-size: 17px;
    font-weight: 700;
    margin: 0 0 0 12px;
    display: inline-block;
    vertical-align: middle;
    white-space: nowrap;
  }
`;

/** logo */
export default class LogoComponent extends React.PureComponent<Props, {}> {
  render() {
    return (
      <Wrap to="/">
        <img src={`${environment.imgHost}${environment.logo}`} alt="logo" />
        <h1>{environment.title}</h1>
      </Wrap>
    );
  }
}

interface Props {}
