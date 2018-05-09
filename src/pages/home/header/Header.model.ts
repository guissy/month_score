import { Action, EffectsCommandMap, SubscriptionAPI } from 'dva';
import { queryMessage } from './Header.service';

export default {
  namespace: 'header',
  state: {
    offline_deposit: 0,
    withdraw: 0,
    common: 0,
    lastOfflineDeposit: 0,
    lastWithdraw: 0,
    lastCommon: 0,
    collapsed: false
  },
  subscriptions: {},
  effects: {
    *queryMessage({ payload }: Action, { call, put }: EffectsCommandMap) {
      const result = yield call(queryMessage, {});
      if (result.state === 0) {
        yield put({ type: 'querySuccess', payload: { ...result.data } });
      }
    }
  },
  reducers: {
    querySuccess(state: QueryMessageState, action: Action) {
      return { ...state, ...action.payload };
    },
    switchCollapsed(state: HeaderDefaultState, action: Action) {
      return { ...state, ...action.payload };
    }
  }
};

interface QueryMessageState {
  offline_deposit: number; // 入款消息
  withdraw: number; // 出款消息
  common: number; // 消息
}

interface LastMessage {
  lastOfflineDeposit: number; // 上次入款消息
  lastWithdraw: number; // 上次出款消息
  lastCommon: number; // 上次消息
}

export interface HeaderDefaultState extends QueryMessageState, LastMessage {
  collapsed: boolean; // sider是否折叠 true:折叠，false:展开
}
