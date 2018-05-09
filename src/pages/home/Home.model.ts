import { Model, EffectsCommandMap, Action } from 'dva';
import { queryAjax } from './Home.service';

const HomeModel: Model = {
  namespace: 'home',
  state: {},
  effects: {
    *query({ payload }: Action, { put, call }: EffectsCommandMap) {
      const result = yield call(queryAjax, payload);
      if (result) {
        yield put({ type: 'save', payload: result });
      }
    }
  },
  reducers: {
    save(state: HomeState, action: Action) {
      return { ...state, ...action.payload };
    }
  }
};

export default HomeModel;

export interface HomeState {
  lang: string;
}
