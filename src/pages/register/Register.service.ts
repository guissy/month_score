import request from '../../utils/request';

export async function registerHttp(param: object) {
  return request(`/admin/register`, {
    method: 'POST',
    body: JSON.stringify(param)
  });
}
