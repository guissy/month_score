import * as React from 'react';
import { Menu } from 'antd';
import { SiteProps } from '../../../utils/withLocale';
import { Link } from 'react-router-dom';
import { getFlatRoute } from '../../login/Login.service';
import { LoginState } from '../../login/Login.model';

interface Props extends SiteProps {
  login?: LoginState;
}

const MenuShortcut: React.SFC<Props> = ({ login, site }: Props) => {
  return (
    <Menu.SubMenu
      key="shortcut"
      title={
        <span>
          <svg className="icon" aria-hidden="true">
            <use xlinkHref="#icon-caidanguanli" />
          </svg>
          <span>{site!('快捷')}</span>
        </span>
      }
    >
      {getFlatRoute(login)
        .filter(route => route.isFav)
        .map((route, i) => (
          <Menu.Item key={i.toString()}>
            <Link to={route.path}>{route.name}</Link>
          </Menu.Item>
        ))}
    </Menu.SubMenu>
  );
};

/** 快捷菜单 */
export default MenuShortcut;
