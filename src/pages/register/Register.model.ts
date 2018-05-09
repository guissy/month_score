import { Model, Action, EffectsCommandMap, SubscriptionAPI } from 'dva';
import { showMessageForResult } from '../../utils/showMessage';
import { registerHttp } from './Register.service';

export interface LoginState {}

const register: Model = {
  namespace: 'register',
  state: {},
  effects: {
    *register({ payload }: Action, { call }: EffectsCommandMap) {
      return showMessageForResult(yield call(registerHttp, payload));
    }
  },
  reducers: {
    update(state: LoginState, action: Action) {
      return { ...state, ...action.payload };
    }
  }
};

export default register;
