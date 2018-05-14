import * as React from 'react';
import { select } from '../../utils/model';
import { Dispatch } from 'dva';
import { Button, Col, Form, Icon, Input, Layout, Row } from 'antd';
import styled from 'styled-components';
import environment from '../../utils/environment';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import { compose, graphql, withApollo } from 'react-apollo';
import { LoginState } from '../login/Login.model';
import { MutationFn } from 'react-apollo/Mutation';
import { routerRedux } from 'dva/router';
import { messageResult } from '../../utils/showMessage';
import { Result } from '../../utils/result';
import { WrappedFormUtils } from 'antd/es/form/Form';
import ApolloClient from 'apollo-client/ApolloClient';
import { from, of, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { catchError } from 'rxjs/internal/operators';
import { getStoreKeyName } from 'apollo-utilities';
import { sha1 } from '../../utils/md5';

const PageLayout = styled(Layout)`
  background: none;
`;
const Fieldset = styled.fieldset`
  text-align: center;
  white-space: nowrap;
`;
const MainRow = styled(Row)``;
const MainCol = styled(Col)`
  width: 368px;
  min-width: 260px;
  box-shadow: 0 0 100px rgba(0, 0, 0, 0.08);
  padding: 38px;
  margin: 20px;
`;
const Submit = styled(Button)`
  width: 100%;
`;

/** login */
export const loginFrament = gql`
  fragment LoginUser on ResultLogin {
    state
    message
    data {
      token
      list {
        id
        username
        truename
        logintime
        role
        part
        job
        comment
      }
      role
      route {
        id
        name
        action
        path
        icon
        children {
          id
          name
          action
          path
          icon
        }
      }
      expire
    }
  }
`;
/** loginGql 登录状态 */
export const loginGql = gql`
  mutation loginMutation($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      ...LoginUser
    }
  }
  ${loginFrament}
`;
/** 登录表单 */
@select('')
@Form.create()
@compose(
  withApollo,
  graphql<{}, {}, {}>(loginGql, {
    alias: '登录表单',
    name: 'loginMutation'
    // fetchPolicy 对mutation无效，
  })
)
export default class LoginComponent extends React.PureComponent<Props, State> {
  state = {
    username: '',
    password: '',
    loading: false
  };
  login$$: Subscription;

  componentDidMount() {
    const localName = window.localStorage.getItem('username');
    const localPwd = window.localStorage.getItem('password');
    this.setState({
      username: localName ? localName : '',
      password: localPwd ? localPwd : ''
    });
  }

  onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { form, loginMutation } = this.props as Hoc;
    form.validateFields(async (err: object, values: { password: string }) => {
      if (!err) {
        values.password = await sha1(values.password);
        this.setState({ loading: true });
        const { client } = this.props as Hoc;
        this.login$$ = from(loginMutation({ variables: values }))
          .pipe(
            catchError((error: Error) => {
              // 无网时读缓存
              const loginKey = getStoreKeyName('$ROOT_MUTATION.login', values);
              window.localStorage.setItem('loginKey', loginKey);
              const login = client.readFragment({
                id: loginKey,
                fragment: loginFrament
              }) as Result<object>;
              if (error && error.message.includes('Network error') && login && login.state === 0) {
                return of({ data: { login } });
              } else {
                return of({ data: { login: { state: 1, message: '账号或密码错误！' } } });
              }
            }),
            tap(messageResult('login'))
          )
          .subscribe(
            ({ data: { login = {} } = {} }) => {
              const result = login as Result<LoginState>;
              if (result.state === 0) {
                this.props.dispatch!({ type: 'login/token', payload: result });
                const loginKey = getStoreKeyName('$ROOT_MUTATION.login', values);
                window.localStorage.setItem('loginKey', loginKey);
                window.localStorage.setItem('username', result.data.list.username);
                const lastestUrl = window.sessionStorage.getItem('lastestUrl') || '/month';
                this.props.dispatch!(routerRedux.push(`${lastestUrl}`));
              }
              console.log('☞☞☞ 9527 LoginComponent 156', client.cache.extract());
              return result;
            },
            () => {
              this.setState({ loading: false });
            },
            () => {
              this.setState({ loading: false });
            }
          );
      }
    });
  }

  componentWillUnmount() {
    if (this.login$$) {
      this.login$$.unsubscribe();
    }
  }

  render() {
    const {
      form: { getFieldDecorator }
    } = this.props as Hoc;
    const { username, password, loading } = this.state;
    return (
      <PageLayout>
        <Layout.Content>
          <MainRow type="flex" justify="space-around" align="middle">
            <MainCol>
              <Form onSubmit={this.onSubmit}>
                <Fieldset disabled={loading}>
                  <h1>
                    <svg className="icon" aria-hidden="true">
                      <use xlinkHref="#icon-37750" />
                    </svg>
                    {environment.title}
                  </h1>
                  <Form.Item hasFeedback={true}>
                    {getFieldDecorator('username', {
                      initialValue: username,
                      rules: [
                        {
                          required: true,
                          message: '请输入用户名'
                        }
                      ]
                    })(
                      <Input
                        prefix={<Icon type="user" />}
                        autoFocus={true}
                        autoComplete="off"
                        placeholder="用户名"
                      />
                    )}
                  </Form.Item>
                  <Form.Item hasFeedback={true}>
                    {getFieldDecorator('password', {
                      initialValue: password,
                      rules: [
                        {
                          required: true,
                          message: '请输入密码'
                        }
                      ]
                    })(
                      <Input
                        prefix={<Icon type="lock" />}
                        type="password"
                        autoComplete="off"
                        placeholder="密码"
                      />
                    )}
                  </Form.Item>
                  <Form.Item>
                    <Submit type="primary" htmlType="submit" loading={loading}>
                      登录
                    </Submit>
                  </Form.Item>
                  <Form.Item>
                    <Link to="/register">注册</Link>
                  </Form.Item>
                </Fieldset>
              </Form>
            </MainCol>
          </MainRow>
        </Layout.Content>
      </PageLayout>
    );
  }
}

interface State {
  username: string;
  password: string;
  loading: boolean;
}

interface Hoc {
  form: WrappedFormUtils;
  dispatch: Dispatch;
  loginMutation: MutationFn<{ login: Result<LoginState> }>;
  client: ApolloClient<{}>;
}

interface Props extends Partial<Hoc> {}
