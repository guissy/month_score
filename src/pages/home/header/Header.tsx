import * as React from 'react';
import { Layout, Icon, Menu, Modal } from 'antd';
import { select } from '../../../utils/model';
import { Dispatch } from 'dva';
import { Link } from 'dva/router';
import { LoginState } from '../../login/Login.model';
import styled from 'styled-components';
import { IntlKeys } from '../../../locale/zh_CN';
import withLocale from '../../../utils/withLocale';
import environment from '../../../utils/environment';
import Password from './password/Password';
import { autobind } from 'core-decorators';
import { NavLink } from 'react-router-dom';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { push } from 'react-router-redux';

const { SubMenu } = Menu;

const HeaderWrap = styled(Layout.Header)`
  position: sticky;
  display: flex;
  justify-content: space-between;
  background: #fff;
  padding: 0;
  top: 0;
  z-index: 100;
  height: 40px;
  line-height: 40px;
  padding-left: 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  a {
    color: #666666;
    text-decoration: none;
    transition: color 0.3s;
  }
  a.active {
    color: #c4554c;
    border-bottom: 1px solid #c4554c;
  }
`;
// tslint:disable-next-line:no-any
const Utils = styled(Menu as any)`
  //float: right;
  border: 0 none;
  background: transparent;
  line-height: inherit;

  > [class*='ant-menu'] {
    border-bottom: 0 none;
    color: inherit;

    &:hover {
      border-bottom: inherit;
    }
  }

  > .ant-menu-item:hover,
  > .ant-menu-item-active,
  > .ant-menu-submenu:hover,
  > .ant-menu-submenu-active,
  .ant-menu-submenu-title:hover,
  &:not(.ant-menu-inline) .ant-menu-submenu-open,
  .ant-menu-submenu-active,
  .ant-menu-item > a:hover {
    color: ${props => props.theme.utilsActive};
  }
`;
const MenuItem = styled(Menu.Item)`
  &:hover,
  > a:hover,
  &.ant-menu-item-selected > a,
  &.ant-menu-item-selected > a:hover {
    color: ${props => props.theme.utilsActive};
  }
`;
const Username = styled.span`
  margin-right: 4px;
`;
const ItemIcon = styled(Icon)`
  margin-right: 4px;
`;

/** header */
@withLocale
@select(['login', 'header', 'setting'])
@autobind
export default class Header extends React.PureComponent<HeaderProps, {}> {
  state = {
    showPanel: false,
    offline_deposit: 0,
    withdraw: 0,
    common: 0,
    time: 0,
    isOpen: false,
    isEditPassword: false
  };

  onOpenChange(e: React.MouseEvent<HTMLAnchorElement>) {
    this.setState({ isOpen: !this.state.isOpen });
    console.info(`🐞: `, e);
  }

  public render() {
    const { site = () => '', login = {} as LoginState } = this.props;
    const username = login.list.username;

    return (
      <HeaderWrap style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex' }}>
          <h1 style={{ marginRight: 20 }}>{environment.title}</h1>
          <p style={{ marginRight: 20 }}>
            <NavLink to="/list">查看全部</NavLink>
          </p>
          <p>
            <NavLink to="/month">新增考核表</NavLink>
          </p>
        </div>
        <div>
          <Utils mode="horizontal" selectable={false}>
            <Menu.Item key="news">
              <Link to="/sysMessage" hidden={true}>
                消息
              </Link>
            </Menu.Item>
            <SubMenu
              title={
                <span>
                  <Username>{username}</Username>&nbsp;<Icon type="caret-up" />
                </span>
              }
              onOpenChange={this.onOpenChange}
            >
              <MenuItem key="password">
                <a
                  onClick={() => {
                    this.setState({ isEditPassword: true });
                  }}
                >
                  <ItemIcon type="key" />
                  {site('修改密码')}
                </a>
              </MenuItem>
              <MenuItem key="logout">
                <Mutation
                  mutation={gql`
                    mutation logoutMutation {
                      logout {
                        state
                      }
                    }
                  `}
                >
                  {(logout, { data }) => (
                    <a
                      onClick={() => {
                        logout().then(client => {
                          console.log('☞☞☞ 9527 Header 251', client);
                        });
                        this.props.dispatch!({ type: 'login/logout', payload: {} });
                        this.props.dispatch!(push('/login'));
                        // data.client.resetStore();
                      }}
                    >
                      <ItemIcon type="logout" />
                      {site('退出登录')}
                    </a>
                  )}
                </Mutation>
              </MenuItem>
            </SubMenu>
          </Utils>
          {environment.isDev && (
            <style>{`
            .ant-notification-topRight {
              width: 600px;
            }
          `}</style>
          )}
        </div>
        <Modal
          title={site('修改密码')}
          visible={this.state.isEditPassword}
          footer={null}
          onCancel={() => this.setState({ isEditPassword: false })}
        >
          <Password onSubmit={() => this.setState({ isEditPassword: false })} />
        </Modal>
      </HeaderWrap>
    );
  }
}

interface HeaderProps {
  login?: LoginState;
  dispatch?: Dispatch;
  site?: (words: IntlKeys) => React.ReactNode;
}
