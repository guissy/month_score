---
to: src/pages/<%= name %>/<%= Name %>.service.ts
---
import request from '../../utils/request';

export async function queryHttp(param: object) {
  return request(`/example`);
}
export async function saveHttp(param: object) {
  return request(`/example`, { method: 'POST' });
}
