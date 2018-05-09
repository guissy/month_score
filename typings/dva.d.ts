// tslint:disable-line
declare module '*.png';

declare module 'dva' {
  import { History } from 'history';
  import { Result } from '../src/utils/result';
  import { ResultOpt } from '../src/utils/model';

  export type EffectFn = (action: Action, map: EffectsCommandMap) => IterableIterator<Result>;
  export interface Effects {
    [effect: string]: EffectFn;
  }
  type State = any; // tslint:disable-line:no-any
  export type Reducer = (state: State, action: Action) => State;
  export interface Reducers {
    [reducer: string]: Reducer<object>;
  }
  export interface Dva {
    model: (m: Model) => void;
    router: (routeConfig: (hisLoc: SubscriptionAPI) => React.ReactNode) => void;
    start: (root: HTMLElement | null) => Dva;
    _store: {
      dispatch: Dispatch;
    };
    use: (opt: Option) => void;
  }

  export interface Model {
    namespace: string;
    state: object | boolean;
    subscriptions?: {
      setup?(hisLoc: SubscriptionAPI): void;
    };
    effects?: Effects;
    reducers?: Reducers;
  }
  export interface Action {
    type: string;
    payload: any; // tslint:disable-line:no-any
  }
  export interface Dispatch {
    <A extends Action>(action: A): A & Promise<Result>;
  }

  interface MapStateToProps<TStateProps, TOwnProps, State> {
    (state: State, ownProps: TOwnProps): TStateProps;
  }

  interface MapStateToPropsFactory<TStateProps, TOwnProps, State> {
    (initialState: State, ownProps: TOwnProps): MapStateToProps<TStateProps, TOwnProps, State>;
  }

  type MapStateToPropsParam<TStateProps, TOwnProps, State> =
    MapStateToPropsFactory<TStateProps, TOwnProps, State>
    | MapStateToProps<TStateProps, TOwnProps, State> | null | undefined;
  export interface Connect {
    (): InferableComponentEnhancer<DispatchProp<any>>; // tslint:disable-line
    <TStateProps = {}, no_dispatch = {}, TOwnProps = {}, State = {}>
    (mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>): any; // tslint:disable-line
  }
  export declare const connect: Connect;

  export interface SubscriptionAPI {
    history: History;
    dispatch: Dispatch;
  }
  export interface EffectsCommandMap {
    put: <A extends Action>(action: A) => Action;
    call: (ajaxFn: (params: object) => Promise<Result>, params: object = null) => Result;
    select: Function;
    take: Function;
    cancel: Function;
    load<T>(ajaxFn: (params: object) => Promise<Result<T>>,
            params: object,
            resultKeys?: ResultOpt): Result<T>;
    // [key: string]: any;
  }

  type Option = {
    history?: History,
    onEffect?: (
      effect: EffectFn,
      map: EffectsCommandMap,
      model: Model,
      actionType: string
    ) => (action: Action) => void
    onError?: Function;
    onReducer?: (reducer: Reducer) => Reducer;
    onAction?: OnActionFunc | OnActionFunc[];
  };
  export interface OnActionFunc {
    (api: MiddlewareAPI<any>): void;
  }
  export default function dva(option: Option): Dva;
}

declare module 'dva/router' {
  export { Link } from 'react-router-dom';
  export { routerRedux } from 'react-router-redux';
}
