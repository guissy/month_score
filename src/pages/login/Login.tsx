import * as React from 'react';
import { select } from '../../utils/model';
import { connect, Dispatch } from 'dva';
import { LoginState } from './Login.model';
import LoginComponent from '../components/login/LoginComponent';

/** 登录 */
@select('login')
export default class Login extends React.PureComponent<LoginProps, {}> {
  constructor(props: LoginProps) {
    super(props);
  }

  render() {
    const { login } = this.props;
    return <LoginComponent login={login} height={'100vh'} actionType={'login/login'} />;
  }
}

interface LoginProps {
  dispatch?: Dispatch;
  login?: LoginState;
}
