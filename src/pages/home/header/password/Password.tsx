import * as React from 'react';
import { Dispatch } from 'dva';
import { Form, Input, Button } from 'antd';
import styled from 'styled-components';
import { select } from '../../../../utils/model';
import { autobind } from 'core-decorators';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { graphql, MutationFn } from 'react-apollo';
import gql from 'graphql-tag';
import { messageResult, showMessageForResult } from '../../../../utils/showMessage';

interface Hoc {
  dispatch: Dispatch;
  form: WrappedFormUtils;
  passwordMutation: MutationFn;
}

interface Props extends Partial<Hoc> {
  onSubmit: () => void;
}

/** Password */
@Form.create()
@graphql<{}, {}, {}>(
  gql`
    mutation passwordMutation($user: PasswordInput!) {
      password(user: $user) {
        state
        message
      }
    }
  `,
  {
    alias: '改密',
    name: 'passwordMutation'
  }
)
@autobind
export default class Password extends React.PureComponent<Props, {}> {
  state = {};

  onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const {
      dispatch,
      form: { validateFields },
      passwordMutation
    } = this.props as Hoc;
    validateFields((err, values) => {
      if (err) {
        return;
      }
      passwordMutation({
        variables: {
          user: values
        }
      })
        .then(messageResult('password'))
        .then(v => {
          this.props.onSubmit();
        });
      // dispatch({ type: 'login/password', payload: values });
    });
  }

  render() {
    const formItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 6 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 18 } }
    };
    const {
      form: { getFieldDecorator }
    } = this.props as Hoc;
    return (
      <Form onSubmit={this.onSubmit}>
        <Form.Item label="密码" {...formItemLayout}>
          {getFieldDecorator('password', {
            initialValue: '',
            rules: [{ required: true, message: '必填' }]
          })(<Input type="password" />)}
        </Form.Item>
        <Form.Item style={{ textAlign: 'center' }}>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
