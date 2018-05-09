import * as React from 'react';
import { select } from '../../../utils/model';
import { Dispatch } from 'dva';
import { Button, Col, Form, Icon, Input, Layout, Row } from 'antd';
import styled from 'styled-components';
import environment from '../../../utils/environment';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import { LoginState } from '../../login/Login.model';
import { FetchResult, MutationFn } from 'react-apollo/Mutation';
import { DataProxy } from 'apollo-cache';
import { routerRedux } from 'dva/router';
import { showMessageForResult } from '../../../utils/showMessage';
import { Result } from '../../../utils/result';
import { WrappedFormUtils } from 'antd/es/form/Form';

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
const loginGQL = gql`
  mutation loginMutation($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      state
      message
      data {
        token
        list {
          id
          username
          truename
          nick
          logintime
          role
          member_control
          email
          mobile
          telephone
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
  }
`;
/** 登录表单 */
@select('')
@Form.create()
@compose(
  graphql<{}, LoginState, {}>(loginGQL, {
    alias: '登录表单',
    name: 'onLogin'
  })
)
export default class LoginComponent extends React.PureComponent<Props, State> {
  state = {
    username: '',
    password: '',
    loading: false
  };

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
    const { form, onLogin } = this.props as Hoc;
    form.validateFields((err: object, values: object) => {
      if (!err) {
        this.setState({ loading: true });
        onLogin({
          variables: values,
          update(cache: DataProxy, result: FetchResult) {
            cache.writeData({ data: result });
          }
        })
          .then(({ data: { login = {} } = {} }: FetchResult<{ login: Result<LoginState> }>) => {
            this.setState({ loading: false });
            const result = login as Result<LoginState>;
            if (result.state === 0) {
              this.props.dispatch!({ type: 'login/token', payload: result });
              window.localStorage.setItem('username', result.data.list.username);
              const lastestUrl = window.sessionStorage.getItem('lastestUrl') || '/month';
              this.props.dispatch!(routerRedux.push(`${lastestUrl}`));
            }
            return result;
          })
          .then(showMessageForResult)
          .catch(() => {
            this.setState({ loading: false });
          });
      }
    });
  }

  render() {
    const {
      form: { getFieldDecorator },
      ...hehe
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
  onLogin: MutationFn<{ login: Result<LoginState> }>;
}

interface Props extends Partial<Hoc> {}
