import { Action, EffectsCommandMap, SubscriptionAPI } from 'dva';
import environment from '../../utils/environment';
import { routerRedux } from 'dva/router';
import { Location, Action as LocationAction } from 'history';
import { MenuItem } from '../home/sider/Menu.data';
import { parse } from 'querystring';
import gql from 'graphql-tag';
import ApolloClient from 'apollo-client/ApolloClient';

export default {
  namespace: 'login',
  state: {
    hasLogin: false,
    loading: false,
    needLogin: false,
    list: {},
    route: []
  },
  subscriptions: {
    setup({ dispatch, history }: SubscriptionAPI) {
      // 刷新页面：已登录
      let expiration = window.sessionStorage.getItem(environment.expiration) || '0';
      // 后台挂了不能登录时延长有效期，跳过登录
      const params = parse(window.location.search.slice(1));
      if (params.debug === '42') {
        expiration = String(new Date(2020, 1, 2).valueOf() / 1000);
      }
      if (parseInt(expiration, 10) * 1000 - new Date().valueOf() > 0) {
        // token 没过期
        const userInfo = JSON.parse(window.sessionStorage.getItem(environment.userInfo) || 'null');
        if (userInfo) {
          dispatch({
            type: 'loginSuccess',
            payload: { ...userInfo, hasLogin: true }
          });
          dispatch({
            type: 'readShortcut',
            payload: true
          });
          // 登录页和登陆后刷新页面
          if (location.pathname === '/login' || location.pathname === '/') {
            dispatch(routerRedux.push(environment.userFirstPage));
          }
        }
      } else {
        if (location.pathname === '/') {
          dispatch(routerRedux.push(`/login`));
        } else {
          dispatch({ type: 'update', payload: { needLogin: true } });
        }
      }
      history.listen((location: Location, action: LocationAction) => {
        if (location.pathname !== '/login') {
          dispatch({ type: 'access', payload: location.pathname });
        }
      });
    }
  },
  effects: {
    *logout({ payload }: Action, { call, put }: EffectsCommandMap) {
      window.sessionStorage.clear();
      yield put({ type: 'logoutSuccess', payload: { hasLogin: false } });
    },
    *token({ payload }: Action, { put, select }: EffectsCommandMap) {
      const result = payload as LoginedResult;
      const user = result.data;
      window.sessionStorage.setItem(environment.tokenName, result.data.token);
      window.sessionStorage.setItem(environment.expiration, String(result.data.expire));
      window.sessionStorage.setItem(environment.userInfo, String(JSON.stringify(user)));
      yield put({
        type: 'loginSuccess',
        payload: {
          ...user,
          loading: false,
          hasLogin: true,
          needLogin: false
        }
      });
      yield put({ type: 'readShortcut', payload: true });
    },
    *access({ payload }: Action, { put, select }: EffectsCommandMap) {
      // tslint:disable-next-line:no-any
      const store = yield select((({ login }: any) => ({ login })) as any);
      const route = store.login.route as MenuItem[];
      let [isDelete, isUpdate, isInsert, isFetch, isFinish] = [false, false, false, false, false];
      route.forEach(item => {
        const subOk = item.children.find(sub => sub.path === payload);
        if (subOk) {
          isDelete = subOk.action.includes('delete');
          isUpdate = subOk.action.includes('update');
          isInsert = subOk.action.includes('insert');
          isFetch = subOk.action.includes('fetch');
          isFinish = subOk.action.includes('finish');
        }
      });
      yield put({
        type: 'getAction',
        payload: {
          isDelete,
          isFetch,
          isUpdate,
          isInsert,
          isFinish
        }
      });
    }
  },
  reducers: {
    update(state: LoginState, action: Action) {
      return { ...state, ...action.payload };
    },
    changeLoading(state: LoginState, action: Action) {
      return { ...state, ...action.payload };
    },
    loginSuccess(state: LoginState, action: Action) {
      return { ...state, ...action.payload };
    },
    logoutSuccess(state: LoginState, action: Action) {
      return { ...state, ...action.payload };
    },
    getAction(state: LoginState, action: Action) {
      return { ...state, ...action.payload };
    },
    needLogin(state: LoginState, action: Action) {
      return { ...state, ...action.payload };
    },
    shortcutSuccess(state: LoginState, action: Action) {
      return { ...state, ...action.payload };
    }
  }
};

export interface LoginState {
  loading: boolean; // 提交中
  hasLogin: boolean; // 标识是否已登录
  action: Array<string>;
  route: object[]; // 路由
  isDelete: boolean;
  isUpdate: boolean;
  isInsert: boolean;
  isFetch: boolean;
  isFinish: boolean;
  needLogin: boolean; // 是否需要重新登录
  list: User;
}

// 返回结果
export interface LoginedResult {
  data: {
    // list: User;
    expire: number; // 时间戳
    member_control: object;
    token: string;
    route: MenuItem[];
  };
}

// 账号操作权限
interface Premission {
  isDelete: boolean;
  isUpdate: boolean;
  isInsert: boolean;
  isFtech: boolean;
}

// 账号相关
export interface User {
  id: number;
  username: string;
  truename: string;
  nick: string;
  logintime: string;
  role: string;
  member_control: object;
  route: MenuItem[];
  email: string;
  mobile: string;
  telephone: string;
  part: string;
  job: string;
  comment: string;
}

export const LoginUser = gql`
  fragment LoginUser on User {
    hasLogin
  }
`;

export function hasLoginUser(client: ApolloClient<object>) {
  const loginUser = client.readFragment({
    id: 'user/login',
    fragment: LoginUser
  }) as { hasLogin: boolean };
  return loginUser && loginUser.hasLogin;
}
