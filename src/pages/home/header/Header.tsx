import * as React from 'react';
import { Layout, Icon, Menu, Modal, Tooltip, Badge } from 'antd';
import { select } from '../../../utils/model';
import { Dispatch } from 'dva';
import { Link } from 'dva/router';
import { LoginState } from '../../login/Login.model';
import { HeaderDefaultState } from './Header.model';
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
const CollapseBtn = styled(Icon)`
  color: ${props => props.theme.collapseBtn};
  height: inherit;
  line-height: inherit;
  font-size: 20px;
  padding: 0 24px;
  margin-left: -20px;
  margin-right: 10px;
  transition: all 0.3s, padding 0s;
  cursor: pointer;

  &:hover {
    background: #e6f7ff;
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
// tslint:disable-next-line:no-any
const BadgeWrap = styled(Badge as any)`
  color: inherit;
  [class*='ant-badge-count'] {
    height: 16px;
    line-height: 16px;
    min-width: 16px;
    padding: 0 2px;
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
  static getDerivedStateFromProps(nextProps: HeaderProps, prevState: HeaderState) {
    const { offline_deposit, withdraw, common } = nextProps.header || ({} as HeaderDefaultState);
    return {
      offline_deposit: offline_deposit,
      withdraw: withdraw,
      common: common
    };
  }

  state = {
    showPanel: false,
    offline_deposit: 0,
    withdraw: 0,
    common: 0,
    time: 0,
    isOpen: false,
    isEditPassword: false
  };

  private timer: number;
  private commonAudio: HTMLAudioElement;
  private withdrawAudio: HTMLAudioElement;
  private depositAudio: HTMLAudioElement;

  componentDidMount() {
    window.clearInterval(this.timer);
    this.queryMessage();
    this.timer = window.setInterval(() => {
      this.queryMessage();
    },                              30000);

    window.document.addEventListener('click', this.closePanel);
  }

  closePanel = () => {
    this.setState({ showPanel: false });
  }

  componentWillUnmount() {
    window.clearInterval(this.timer);
    window.document.removeEventListener('click', this.closePanel);
  }

  queryMessage = () => {
    // this.props.dispatch!({ type: 'header/queryMessage', payload: {} });
  }

  showSetting = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // navtiveEvent.stopPropagation 不管用
    e.nativeEvent.stopImmediatePropagation();
    this.setState({ showPanel: !this.state.showPanel });
  }
  showSettingPanel = (e: React.MouseEvent<HTMLDivElement>) => {
    // navtiveEvent.stopPropagation 不管用
    e.nativeEvent.stopImmediatePropagation();
  }

  onLogout = () => {
    this.props.dispatch!({
      type: 'login/logout',
      payload: this.props.login && this.props.login.list
    });
  }

  // 折叠 sider
  toggleCollapsed = () => {
    const { header = {} as HeaderDefaultState } = this.props;
    this.props.dispatch!({
      type: 'header/switchCollapsed',
      payload: { collapsed: !header.collapsed }
    });
  }

  onOpenChange(e: React.MouseEvent<HTMLAnchorElement>) {
    this.setState({ isOpen: !this.state.isOpen });
    console.info(`🐞: `, e);
  }

  public render() {
    const {
      site = () => '',
      header = {} as HeaderDefaultState,
      login = {} as LoginState
    } = this.props;
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
                        logout();
                        this.props.dispatch!({ type: 'login/logout', payload: {} });
                        this.props.dispatch!(push('/login'));
                      }}
                    >
                      <ItemIcon type="logout" />
                      {site('退出登录')}
                    </a>
                  )}
                </Mutation>
              </MenuItem>
            </SubMenu>
            <Menu.Item key="setting">
              <a onClick={e => this.showSetting(e)} hidden={true}>
                {site('设置')}
              </a>
            </Menu.Item>
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
          <Password />
        </Modal>
      </HeaderWrap>
    );
  }
}

interface HeaderProps {
  login?: LoginState; // tslint:disable-line
  dispatch?: Dispatch;
  site?: (words: IntlKeys) => React.ReactNode;
  header?: HeaderDefaultState;
}

interface HeaderState {
  showPanel: boolean; // 设置面板
  offline_deposit: number; // 入款
  withdraw: number; // 出款
  common: number; // 消息
  isOpen: boolean; // subMenu展开关闭
}
