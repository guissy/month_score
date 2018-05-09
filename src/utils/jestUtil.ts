import DoneCallback = jest.DoneCallback;
import * as React from 'react';

function formatMessage(option: { id: string; defaultMessage: string }, values: object) {
  return option.id;
}
/** 多语言上下文 */
export const mountOption = {
  context: {
    intl: { formatMessage }
  }
};

type ProvidesCallback<T> = (value: T) => void;
/**
 * 并行测试
 * 替换不同 case 做相同测试，预期返回相同结果
 */
export function series<T>(values: T[], testFn: ProvidesCallback<T>) {
  return async (cb: DoneCallback) => {
    return Promise.all(values.map(async value => await testFn(value))).then(() => cb());
  };
}

/** 并行测试非字符串 */
export function notString(testFn: ProvidesCallback<string>) {
  const values = [null, undefined, {}, [], /\d/, () => 0, NaN, true];
  return series<string>(values as string[], testFn);
}
/** 并行测试 children */
export function anyReactNode(testFn: ProvidesCallback<React.ReactNode>) {
  const values = [null, undefined, ['array[0]', 'array[1]'], 'string', React.createElement('div')];
  return series<React.ReactNode>(values as React.ReactNode[], testFn);
}
