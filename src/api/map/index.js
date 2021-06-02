import request from '@/utils/request'
import qs from 'qs'
// 登录
export function login(params) {
  return request({
    url: '/vue-admin-template/user/login',
    method: 'post',
    data: qs.stringify(params)
  })
}
// 获取用户信息
export function getDate(params) {
  return request({
    url: '/getDate',
    method: 'get',
    params
  })
}

export function getMapByDate(params) {
  return request({
    url: '/getMapByDate',
    method: 'get',
    params
  })
}
export function getTableData(params) {
  return request({
    url: '/getTableData',
    method: 'get',
    params
  })
}
