import { Action, connect, EffectFn, EffectsCommandMap, Model, Reducer } from 'dva';
import { compose, pick } from 'lodash/fp';
import * as React from 'react';
import { Result } from './result';
import { defaults } from 'lodash/fp';
import { messageError, showMessageForResult } from './showMessage';
import { ResponseDetail } from './request';

type Props = {};
type LodashPick = typeof pick;
// React.ComponentType<T>;
type Component<T> = any; // tslint:disable-line
/**
 * 带选择器的 Redux 的 connect
 * connect(({ns}) => ({ns})
 */
export const select = compose<string | string[], ConnectFn<Props>, LodashPick>(connect, pick);
type ConnectFn<T> = <Super extends Component<T>, Impl extends Super>(component: Super) => Impl;

const DEFAULT_OPT = {
  data: 'data',
  attributes: 'attributes',
  loading: 'loading',
  success: '__skip__',
  message: ''
};
/**
 * 类似saga副作用 load = call + put
 *
 * 调用 service.ts 中方法，加载数据 result 后，
 * 保存 result的 data 和 attributes
 * @see NoticeManageModel#effects#query}
 * @example
 *  *query({payload}, {load}) {
 *     return yield load(query, payload);
 *  }
 *
 */
export function loadEffect(call: Function, put: Function, namespace: string) {
  return {
    load: function*(asyncFetch: Function, payload: object, resultOpt: ResultOpt = DEFAULT_OPT) {
      const { data, attributes, success, message, loading } = defaults(DEFAULT_OPT, resultOpt);
      yield put({ type: `${namespace}/@@load`, payload: { [loading]: true } });
      const result: Result<object> = yield call(asyncFetch, payload);
      if (Number(result.state) === 0 && result.data) {
        const other = {
          [loading]: false,
          [attributes]: result.attributes
        };
        const main = data === '...' ? result.data : { [data]: result.data };
        yield put({
          type: `${namespace}/@@load`,
          payload: { ...main, ...other }
        });
      }
      return message === '__skip__' ? result : showMessageForResult(result, success);
    }
  };
}

/** state 字段名 */
export interface ResultOpt {
  data?: string; // model.state的字段名
  attributes?: string; // model.state的字段名
  loading: string; // model.state的字段名
  success?: string; // 弹成的成功消息
}

/**
 * 同步合并副作用 load 的数据
 */
export function loadReducer(reducer: Reducer): Reducer {
  return (state: object, action: Action) => {
    let [ns, typeName] = action.type.split('/');
    if (typeName && typeName.includes('@@load')) {
      // 加载data和attributes后，保存到 model 中
      const loadedState = { ...state[ns], ...action.payload };
      return { ...state, [ns]: loadedState };
    } else {
      return reducer(state, action);
    }
  };
}

/**
 * 全局副作用：
 * 1.loading 仅带翻页的副作用会全局loading
 * 2.load 提供与saga类似的
 * 3.error 遇到全局错误做弹窗
 */
export function effectLoadingLoadError(
  effect: EffectFn,
  sagaEffect: EffectsCommandMap,
  model: Model,
  actionType: string
) {
  return function*(action: Action) {
    try {
      if (action.payload && action.payload.page > 0) {
        yield sagaEffect.put({ type: 'loading/update', payload: true });
      }
      yield effect(action, {
        ...dvaEffect(sagaEffect, model),
        ...loadEffect(sagaEffect.call, sagaEffect.put, model.namespace)
      });
      if (action.payload && action.payload.page > 0) {
        yield sagaEffect.put({ type: 'loading/update', payload: false });
      }
    } catch (e) {
      yield sagaEffect.put({ type: 'login/needLogin', payload: { needLogin: true } });
    }
  };
}

/**
 * 错误弹窗，处理副作用里的错误
 *
 * 如果需要在 model 中的 effects 拦截错误，需要
 * @example
 *  try {
 *    const result = yield call(ajax, payload);
 *  } catch (e) {
 *    console.error(e.message); // 这里拦截错误
 *  }
 * @see effectLoadingLoadError
 */
export function effectErrorMessage(e: Error | ResponseDetail) {
  if (e instanceof Error) {
    messageError(e);
  } else if (typeof e === 'object' && (e.status === 401 || e.status === 403)) {
    window.sessionStorage.setItem('lastestUrl', window.location.pathname);
    throw new Error(e.status.toString());
  } else {
    messageError(e);
  }
}

// 给 sagaEffect.put/take 的 action.type 加命名空间前缀
function dvaEffect(sagaEffects: EffectsCommandMap, model: Model) {
  function put(action: Action) {
    const { type } = action;
    return sagaEffects.put({ ...action, type: prefixType(type, model) });
  }
  function take(type: string) {
    if (typeof type === 'string') {
      return sagaEffects.take(prefixType(type, model));
    } else {
      return sagaEffects.take(type);
    }
  }
  return { ...sagaEffects, put, take };
}

function prefixType(type: string, model: Model) {
  const prefixedType = `${model.namespace}/${type}`;
  const typeWithoutAffix = prefixedType.replace(/\/@@[^/]+?$/, '');
  if (
    (model.reducers && model.reducers[typeWithoutAffix]) ||
    (model.effects && model.effects[typeWithoutAffix])
  ) {
    return prefixedType;
  }
  return type;
}
