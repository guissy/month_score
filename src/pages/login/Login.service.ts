import request from '../../utils/request';
import { MenuItem } from '../home/sider/Menu.data';
import MenuData from '../home/sider/Menu.data';
import { LoginState } from './Login.model';

export async function logoutAjax(params: object) {
  return request(`/admin/logout`, {
    method: 'POST',
    body: JSON.stringify(params)
  });
}
export async function passwordHttp(params: object) {
  return request(`/admin/password`, {
    method: 'POST',
    body: JSON.stringify(params)
  });
}
export async function loginAjax(params: object) {
  return request(`/admin/login`, {
    method: 'POST',
    body: JSON.stringify(params)
  }).then(result => ({
    ...result,
    data: {
      ...result.data,
      route: transformLoginRoute((result.data as any).route) // tslint:disable-line:no-any
    }
  }));
}

/**
 * 当权限 action 为空数组时，不在菜单中显示
 * login.route[].action => login.route[].visible
 */
export function transformLoginRoute(loginRoute: MenuItem[]) {
  let loginRouteIn = loginRoute;
  if (!Array.isArray(loginRoute)) {
    loginRouteIn = [];
  }
  // 旧版路由适配为新版路由
  const menuDataOk = (MenuData as MenuItem[]).map(menuOne => {
    // 一级name: 根据name
    let parentIndex: number;
    const loginOne = loginRouteIn.find((loginItem, index) => {
      const hasFound = loginItem.name === menuOne.name;
      parentIndex = index;
      return hasFound;
    });
    const menuOneOk = { ...menuOne };
    if (loginOne) {
      menuOneOk.action = loginOne.action;
      menuOneOk.visible = Array.isArray(loginOne.action) && loginOne.action.length > 0;

      // 二级path: 根据path
      menuOneOk.visible = Array.isArray(loginOne.action) && loginOne.action.length > 0;
      menuOneOk.children = menuOne.children.map((menuTwo, index) => {
        const menuTwoOk = { ...menuTwo };
        const loginTwo = loginOne.children.find(loginItem => loginItem.path === menuTwo.path);
        if (loginTwo) {
          menuTwoOk.action = loginTwo.action;
          menuTwoOk.visible = Array.isArray(loginTwo.action) && loginTwo.action.length > 0;
          // 适配旧版 path
          menuTwoOk.parentIndex = parentIndex;
          menuTwoOk.index = index;
        }
        return menuTwoOk;
      });
    }
    return menuOneOk;
  });

  return menuDataOk;
}

/** 两级的loginRoute => 一级的loginRoute */
export function getFlatRoute(login: LoginState = {} as LoginState): MenuItem[] {
  const loginRoute = login.route as MenuItem[];
  const loginRouteFlat = loginRoute.reduce((s, v) => s.concat(v.children), [] as MenuItem[]);
  return loginRouteFlat;
}
