import { Model } from 'dva';

/** 节流：防点击过快导致不必要请求 */
export default ({ effects, ...model }: Model) => ({
  ...model,
  effects:
    effects &&
    Object.entries(effects).reduce(
      (o, [effectName, effectFn]) => ({
        [effectName]: [effectFn, { type: 'throttle', ms: 1000 }],
        ...o
      }),
      {}
    )
});
