import request from 'src/service/request'

export function ListarConfiguracoes (params) {
  return request({
    url: '/settings/',
    method: 'get',
    params
  })
}

export function AlterarConfiguracao (data) {
  return request({
    url: `/settings/${data.Key}/`,
    method: 'put',
    data
  })
}

export function ListarLogoPublica () {
  return request({
    url: '/public-settings/logo',
    method: 'get'
  })
}

export function AlterarLogo (tipo, file) {
  const formData = new FormData()
  formData.append('logo', file)
  return request({
    url: `/settings/logo/${tipo}`,
    method: 'post',
    data: formData
  })
}
