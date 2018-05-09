import request from '../../../utils/request';
import queryString from 'querystring';

// 顶部入款/出款/消息
export async function queryMessage(params: object) {
  return request(`/message/num`);
}
