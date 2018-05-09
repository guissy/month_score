---
to: src/pages/<%= name %>/<%= Name %>.model.ts
---
import { Model, Action, EffectsCommandMap, SubscriptionAPI } from 'dva';
import { showMessageForResult } from '../../utils/showMessage';
import { queryHttp, saveHttp } from './<%= Name %>.service.ts'

export <%= Name %>State {

}

const <%= name %>: Model = {
  namespace: '<%= name %>',
  state: {

  },
  effects: {
   *query({ payload }: Action, { load }: EffectsCommandMap ) {
     return yield load(queryHttp, payload);
   }
   *register({ payload }: Action, { call }: EffectsCommandMap ) {
     return showMessageForResult(yield call(saveHttp, payload));
   }
  },
  reducers: {
    update(state: <%= Name %>State, action: Action) {
      return { ...state, ...action.payload };
    },
  }
};

export default <%= name %>;
