import * as fetch from 'isomorphic-fetch';
// tslint:disable-next-line:env-ref
import environment from './environment';
import { Result } from './result';
import { parse, stringify } from 'querystring';

function requestWrap(env: Environment) {
  /**
   * 调用原生 fetch
   *
   * @param  {string} url       地址：自动加上缺省域名
   * @param  {object} [options] 选项：包括 method， body，header
   * @return {promise}          成功返回 Result 失败返回 Response
   */
  return function<T extends object>(url: string, options: RequestInit = {}): Promise<Result<T>> {
    if (options == null) {
      options = {};
    }

    // https: 当前域为 https 则 fetch 外链也要 https
    if (url && url.startsWith('http')) {
      const protocolUrl = new URL(url).protocol;
      const protocolApi = new URL(env.apiHost).protocol;
      if (protocolApi === 'https:' && protocolUrl === 'http:') {
        url = url.replace('http:', 'https:');
      }
    }
    // 域名
    if (!url.startsWith('http') && !url.endsWith('.json') && !url.startsWith('/api')) {
      url = `${env.apiHost}${url}`;
    }
    const headers = new Headers();
    // 授权：登录时缓存
    const token = window.sessionStorage.getItem(env.tokenName);
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    const m = (options.method || '').toLowerCase();
    if (m === 'post' || m === 'put' || m === 'patch') {
      headers.append('Content-Type', 'application/json');
    }

    // 多语言
    if (env.locale) {
      headers.append('Accept-Language', env.locale);
    }

    // 自定义头
    if (typeof options.headers === 'object') {
      Object.entries(options.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }
    options.headers = headers;

    // debug
    const params = parse(window.location.search.slice(1));
    if (params.debug === '42') {
      if (url.includes('?')) {
        url += '&debug=1';
      } else {
        url += '?debug=1';
      }
    }

    return (
      fetch(url, options)
        // 跨域和502走options请求，不进去then
        .then((response: Response) => {
          const { status } = response;
          const detail: ResponseDetail = {
            url,
            method: options.method,
            body: options.body as string,
            status,
            headers: {
              Authorization: headers.get('Authorization')
            }
          };
          let promise;
          const isBadCode = status >= 400 && status < 600;
          if (isBadCode) {
            // 默认由 dva({onError}) 全局拦截
            promise = response
              .json()
              .then((v: Result<T>) => Promise.reject(v))
              .catch(result => Promise.reject({ ...detail, result }));
          } else {
            promise = response
              .json()
              .then((v: Result<T>) => ({ status, ...v }))
              .catch(result => Promise.reject({ ...detail, result }));
          }
          return promise.then(v => ({ url, ...v }));
        })
    );
  };
}

/** 请求接口 */
export default requestWrap(environment);

/** 用于配置默认头 */
interface Environment {
  readonly apiHost: string;
  readonly tokenName: string;
  readonly locale: string;
}

/** 调试API错误 */
export interface ResponseDetail {
  url: string;
  method?: string;
  body: string;
  status: number;
  headers: object;
}
