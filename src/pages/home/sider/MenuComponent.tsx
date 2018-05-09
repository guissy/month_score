import * as React from 'react';
import { Link } from 'dva/router';
import styled from 'styled-components';
import { select } from '../../../utils/model';
import { Dispatch } from 'dva';
import { Menu } from 'antd';
import { LoginState } from '../../login/Login.model';
import { HeaderDefaultState } from '../header/Header.model';
import withLocale, { SiteProps } from '../../../utils/withLocale';
import MenuShortcut from './MenuShortcut';
import { MenuItem } from './Menu.data';
import { MenuMode } from 'antd/lib/menu';

const MenuWrap = styled.div`
  height: calc(100% - 40px);
  background: transparent;
  display: flex;

  .ant-menu-submenu > .ant-menu-submenu-title {
    color: ${props => props.theme.navTitle};

    &:hover {
      color: ${props => props.theme.navActive};
      background: ${props => props.theme.navActive};
    }
  }
`;
// tslint:disable-next-line:no-any
const MenuContainer = styled(Menu as any)`
  flex: 1;

  &.ant-menu-inline > li > .ant-menu-submenu-title,
  &.ant-menu-inline > li > .ant-menu .ant-menu-item {
    height: 38px;
    line-height: 38px;
    margin: 0;
  }
`;

/** 导航菜单 */
@withLocale
@select(['login', 'header', 'sider', 'setting'])
export default class MenuComponent extends React.PureComponent<MenusProps, MenusState> {
  static getDerivedStateFromProps(nextProps: MenusProps, prevState: MenusState) {
    if (nextProps.header) {
      // 首页或者菜单为折叠时清空当前key
      // collapsed: 解决菜单为折叠时切换到顶部出现的样式bug
      if (window.location.pathname === '/' || nextProps.header.collapsed) {
        return {
          openKeys: [],
          collapsed: nextProps.header.collapsed
        };
      } else {
        return {
          openKeys: prevState.openKeys,
          collapsed: nextProps.header.collapsed
        };
      }
    } else {
      return;
    }
  }

  state = {
    menuKeys: ['shortcut'],
    openKeys: [],
    route: [],
    collapsed: this.props.header ? this.props.header.collapsed : false
  };

  onOpenChange = (keys: string[]) => {
    const currentKeys = keys.filter(v => v !== undefined);
    const lastKey = [currentKeys[currentKeys.length - 1]];

    this.setState({
      openKeys: lastKey
    });
  }

  render() {
    const loginRoute =
      this.props.login && this.props.login.route.length > 0 ? this.props.login.route : [];
    const { mode, theme, site = () => '', login, logo } = this.props;
    const { openKeys, collapsed } = this.state;

    return (
      <MenuWrap>
        {logo}
        <MenuContainer
          mode={mode}
          theme={theme}
          forceSubMenuRender={true}
          openKeys={openKeys}
          onOpenChange={this.onOpenChange}
          inlineCollapsed={collapsed}
        >
          {MenuShortcut({ login, site })}
          {loginRoute.map(({ icon, id, name, children, visible }: MenuItem) => {
            if (visible) {
              return (
                <Menu.SubMenu
                  key={`${id}`}
                  title={
                    <span>
                      <svg className="icon" aria-hidden="true">
                        <use xlinkHref={`#icon-${icon}`} />
                      </svg>
                      <span>{site(name)}</span>
                    </span>
                  }
                >
                  {children.map(j => {
                    if (!j.hidden && j.visible) {
                      return (
                        <Menu.Item key={`${j.id}`}>
                          <Link to={j.path}>{site(j.name)}</Link>
                        </Menu.Item>
                      );
                    } else {
                      return;
                    }
                  })}
                </Menu.SubMenu>
              );
            } else {
              return <div />;
            }
          })}
        </MenuContainer>
      </MenuWrap>
    );
  }
}

interface MenusState {
  menuKeys: string[]; // 菜单key集合
  openKeys: string[]; // 打开key
  route: object[]; // 处理后的路由
  collapsed: boolean; // 折叠
}
interface MenusProps extends SiteProps {
  mode?: MenuMode; // 模式
  theme?: string; // 主题
  login?: LoginState;
  header?: HeaderDefaultState;
  dispatch?: Dispatch;
  logo?: React.ReactNode;
}
