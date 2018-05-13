import { message, notification } from 'antd';
import { Result } from './result';
import withLocale from './withLocale';
import environment from './environment';
import * as React from 'react';
import { memoize } from 'lodash/fp';
import { ResponseDetail } from './request';
import { FetchResult } from 'react-apollo/Mutation';
import { Dispatch } from 'dva';
import { ApolloError } from 'apollo-client';
import { ErrorResponse } from 'apollo-link-error/src/index';

/**
 * 弹出成功/失败消息（顶部出现，数秒消失）
 *
 * 后端返回数据请使用 {@link showMessageForResult}
 * @example
 *  dispatch({...}).then(showMessage).then(this.callBack.bind(this));   不配置时间
 *  dispatch({...}).then((value: boolean) => {showMesaage(value, 2).then(this.callBack.bind(this))});    配置时间
 */
export default function showMessage(success: boolean, duration: number = 2) {
  console.warn(`🐞: `, '过时showMessage');
  return new Promise((resolve, reject) => {
    if (success) {
      message.success(withLocale.site('操作成功'), duration);
      resolve();
    } else {
      message.error(withLocale.site('操作失败'), duration);
      reject();
    }
  });
}

/**
 * 根据后台返回的 state 弹成功/失败消息
 *
 * 如果后端返回有message是中文则显示
 * @example
 * dispatch({...}).then(showMessageForResult).then(this.callBack.bind(this));
 */
export function showMessageForResult(
  result: Result<object>,
  content: string = '操作成功',
  duration: number = 2
) {
  return new Promise((resolve, reject) => {
    if (Number(result.state) === 0 && result.data) {
      if (content === '__skip__') {
        // 不显示成功消息，只显示失败消息
      } else if (content) {
        message.success(withLocale.site(content), duration);
      } else if (result.message && result.message.match(/[^\x00-\xff]/)) {
        message.success(result.message, duration);
      }
      resolve(result);
    } else {
      // 失败了
      if (environment.isDev) {
        messageError(result);
      } else {
        if (result.message && result.message.match(/[^\x00-\xff]/)) {
          messageError(result.message);
        } else {
          messageError(content);
        }
      }
      resolve(result);
    }
  });
}

/**
 * 根据后台返回的 state 弹成功/失败消息
 *
 * 如果后端返回有message是中文则显示
 * @example
 * dispatch({...}).then(showMessageForResult).then(this.callBack.bind(this));
 */
export function messageResult<T extends string = string>(graphKey: string) {
  return (fetchResult: FetchResult<{ [key in T]: Result<object> }>) => {
    if (fetchResult && fetchResult.data) {
      const result = fetchResult.data[graphKey] as Result<object>;
      const content = '操作成功';
      if (Number(result.state) === 0) {
        // 不显示成功消息，只显示失败消息
        if (content) {
          message.success(withLocale.site(content));
        } else if (result.message && result.message.match(/[^\x00-\xff]/)) {
          message.success(result.message);
        }
      } else {
        if (result.message && result.message.match(/[^\x00-\xff]/)) {
          messageError(result.message);
        } else {
          messageError(content);
        }
      }
    }
    return fetchResult;
  };
}

/** 包装 antd 的 message.error  */
export function messageError(
  content: string | Error | ApolloError | Result<object> | ErrorResponse,
  dispatch?: Dispatch
) {
  if (content instanceof Error) {
    if (content.message.toLowerCase().includes('fetch')) {
      message.error('服务器繁忙，请稍后重试！');
      // message.error(content.message);
    }
    messageDebug(content);
  } else if (isResult(content)) {
    message.error(content.message);
    messageDebug(new Error(content.status + ' error'), JSON.stringify(content, null, '  '));
  } else if (isErrorResponse(content)) {
    const {
      networkError: { statusCode = 200, message: messageTxt }
    } = (content || {}) as ErrorResponse & { networkError: { statusCode: number } };
    if (messageTxt.includes('fetch')) {
      message.error('服务器繁忙，请稍后重试！');
    }
    if (
      messageTxt.includes('fetch') ||
      statusCode === 401 ||
      (statusCode === 403 && typeof dispatch === 'function')
    ) {
      // todo hasLogin
      dispatch!({ type: 'login/update', payload: { needLogin: true } });
    } else {
      message.error(content.message);
    }
    messageDebug(new Error(content.status + ' error'), JSON.stringify(content, null, '  '));
  } else if (typeof content === 'string') {
    // 直接显示错误文字
    message.error(content);
  } else {
    messageDebug(new Error('other'), JSON.stringify(content));
    console.error(content);
  }
}

function doMessageDebug(msgTitle: string, msgBody: string = '') {
  notification.config({ duration: 5 });
  notification.error({
    message: msgTitle,
    description: React.createElement('pre', {}, msgBody)
  });
}
const doMessageDebugMm = memoize(doMessageDebug);

/** 开发时：React 错误提示和网络请求错误提示 */
export function messageDebug(error: Error, detail?: string) {
  if (environment.isDev) {
    const msgBody = detail || error.stack;
    doMessageDebugMm(error.message, msgBody);
  }
}

function isResult(
  content: string | Error | ResponseDetail | Result<object> | ErrorResponse
): content is Result<object> {
  return (
    typeof content === 'object' && content.hasOwnProperty('data') && content.hasOwnProperty('state')
  );
}

function isResponseDetail(
  content: string | Error | ResponseDetail | Result<object> | ErrorResponse
): content is Result<object> {
  return typeof content === 'object' && content.hasOwnProperty('url');
}

function isErrorResponse(
  content: string | Error | ResponseDetail | Result<object> | ErrorResponse
): content is Result<object> {
  return typeof content === 'object' && content.hasOwnProperty('networkError');
}

/** 可读性好的string */
export function prettyString(obj: object) {
  let str = String(obj);
  try {
    str = JSON.stringify(obj, null, ' ');
  } finally {
    /* tslint:disable-line*/
  }
  return str;
}
