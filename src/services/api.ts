import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3333',
})

interface IBGEUFResponse {
  sigla: string
}
export const apiUFs = () => {
  return axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
}

interface IBGECityResponse {
  nome: string
}
export const apiCitys = (city: string) => {
  return axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${city}/municipios?orderBy=nome`)
}

export default api
