import * as React from 'react';
import { Dispatch } from 'dva';
import { Layout, Form, Input, Button } from 'antd';
import { routerRedux } from 'dva/router';
import { autobind } from 'core-decorators';
import { select } from '../../utils/model';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { push } from 'react-router-redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { FetchResult, MutationFn } from 'react-apollo/Mutation';
import { LoginState } from '../login/Login.model';
import { Result } from '../../utils/result';
import { messageError } from '../../utils/showMessage';

interface Hoc {
  dispatch: Dispatch;
  form: WrappedFormUtils;
  registerMutation: MutationFn;
}

interface Props extends Partial<Hoc> {}

/** Register */
@select('register')
@Form.create()
@graphql<{}, {}, {}>(
  gql`
    mutation registerMutation($user: UserInput!) {
      register(user: $user) {
        state
        message
      }
    }
  `,
  {
    alias: '注册',
    name: 'registerMutation'
  }
)
@autobind()
export default class Register extends React.PureComponent<Props, {}> {
  state = {};

  onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const {
      registerMutation,
      dispatch,
      form: { validateFields }
    } = this.props as Hoc;
    validateFields((err, values) => {
      if (err) {
        return;
      }
      // dispatch({ type: 'register/register', payload: values })
      registerMutation({
        variables: {
          user: values
        }
      })
        .then(({ data: { register = {} } = {} }: FetchResult<{ register: Result<{}> }>) => {
          const result = register as Result<LoginState>;
          if (result.state === 0) {
            dispatch(push('/login'));
          } else {
            messageError(result.message, dispatch);
          }
        })
        .catch((error: Error) => messageError(error, dispatch));
    });
  }

  render() {
    const {
      form: { getFieldDecorator }
    } = this.props as Hoc;
    const formItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 6 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 18 } }
    };
    return (
      <Layout>
        <Layout.Header style={{ color: '#fff', textAlign: 'center' }}>注册</Layout.Header>
        <Layout.Content>
          <Form onSubmit={this.onSubmit} style={{ margin: '40px auto', width: 600 }}>
            <Form.Item label="用户名" {...formItemLayout}>
              {getFieldDecorator('username', {
                initialValue: '',
                rules: [{ required: true, message: '必填' }]
              })(<Input />)}
            </Form.Item>

            <Form.Item label="密码" {...formItemLayout}>
              {getFieldDecorator('password', {
                initialValue: '',
                rules: [{ required: true, message: '必填' }]
              })(<Input type="password" />)}
            </Form.Item>

            <Form.Item label="真实姓名" {...formItemLayout}>
              {getFieldDecorator('truename', {
                initialValue: '',
                rules: [
                  { required: true, message: '必填' },
                  { pattern: /^[^\x00-\xff]+$/, message: '中文' }
                ]
              })(<Input />)}
            </Form.Item>

            <Form.Item label="职位" {...formItemLayout}>
              {getFieldDecorator('job', { initialValue: '前端攻城狮' })(<Input />)}
            </Form.Item>

            <Form.Item label="部门" {...formItemLayout}>
              {getFieldDecorator('part', { initialValue: '技术部' })(<Input />)}
            </Form.Item>

            <Form.Item style={{ textAlign: 'center' }}>
              <Button type="primary" htmlType="submit">
                提交
              </Button>
            </Form.Item>
          </Form>
        </Layout.Content>
      </Layout>
    );
  }
}
