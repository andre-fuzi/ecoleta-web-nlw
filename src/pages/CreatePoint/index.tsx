/* eslint-disable no-unused-vars */
import React, {
  useEffect, useState, ChangeEvent, FormEvent,
} from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import { api, apiUFs, apiCitys } from '../../services/api'
/* eslint-enable no-unused-vars */

import Dropzone from '../../components/Dropzone'

import './style.css'
import logo from '../../assets/logo.svg'

// useState - Array or Object
// Must provice data type
interface Item {
  id: number
  title: string
  // eslint-disable-next-line camelcase
  url_image: string
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([])
  const [ufs, setUFs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [mapInitialPos, setMapInitialPos] = useState<[number, number]>([0, 0])

  const [formData, setFormData] = useState({ 'name': '', 'email': '', 'whatsapp': '' })
  const [selectedUF, setSelectedUF] = useState<string>('0')
  const [selectedCity, setSelectedCity] = useState<string>('0')
  const [selectedMapPosition, setSelectedMapPosition] = useState<[number, number]>([0, 0])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [selectedFile, setSelectedFile] = useState<File>()

  const history = useHistory()

  // Controls when the function will be called.
  // if a empty [] it will only be executed once the component starts.
  // or if passed a [state].. i will run every time the state changes.
  useEffect(() => {
    api.get('items').then((resp) => {
      if (resp && resp.data) setItems(resp.data)
    })
  }, [])

  // Get geolocation of the user
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords

      setMapInitialPos([latitude, longitude])
    })
  }, [])

  // Get all the UFs from IBGE API
  useEffect(() => {
    apiUFs().then((resp) => {
      if (resp && resp.data) {
        const ufInitials = resp.data.map((uf) => uf.sigla)
        setUFs(ufInitials)
      }
    })
  }, [])

  // Get all cities from the current selected UF
  useEffect(() => {
    if (selectedUF === '0') return
    apiCitys(selectedUF).then((resp) => {
      if (resp && resp.data) {
        const citiesNames = resp.data.map((city) => city.nome)
        setCities(citiesNames)
      }
    })
  }, [selectedUF])

  function handleSelectedUF (event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value
    setSelectedUF(uf)
  }

  function handleSelectedCity (event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value
    setSelectedCity(city)
  }

  function handleMapClick (event: LeafletMouseEvent) {
    const position = event.latlng
    if (position) {
      setSelectedMapPosition([position.lat, position.lng])
    }
  }

  function handleInputChange (event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target

    setFormData({ ...formData, [name]: value })
  }

  function handleSelectItem (id: number) {
    if (selectedItems.includes(id)) {
      const newSelecteItem = selectedItems.filter((element) => element !== id)

      setSelectedItems([...newSelecteItem])
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  async function handleSubmit (event: FormEvent) {
    event.preventDefault()

    const { name, email, whatsapp } = formData
    const uf = selectedUF
    const city = selectedCity
    const [latitude, longitude] = selectedMapPosition

    const data = new FormData()

    data.append('name', name)
    data.append('email', email)
    data.append('whatsapp', whatsapp)
    data.append('uf', uf)
    data.append('city', city)
    data.append('latitude', String(latitude))
    data.append('longitude', String(longitude))
    data.append('items', selectedItems.join(','))
    if (selectedFile) {
      data.append('image', selectedFile)
    }

    await api.post('collect-points', data)

    // eslint-disable-next-line no-alert
    alert('Ponto de coleta criado')

    history.push('/')
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br /> Ponto de Coleta </h1>
        <Dropzone onFileUploaded={setSelectedFile} />
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da Entidade</label>
            <input type="text" name="name" id="name" onChange={handleInputChange} />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input type="email" name="email" id="email" onChange={handleInputChange} />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={mapInitialPos} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedMapPosition} />
          </Map>
          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" value={selectedUF} onChange={handleSelectedUF}>
                <option value="0">Selecione uma UF</option>
                {ufs.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" value={selectedCity} onChange={handleSelectedCity}>
                <option value="0">Selecione uma Cidade</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Ítens de Coleta</h2>
          </legend>
          <ul className="items-grid">
            {items.map((item) => (
              <li key={item.id} onClick={() => handleSelectItem(item.id)} className={selectedItems.includes(item.id) ? 'selected' : ''}>
                <img src={item.url_image} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>
        <button type="submit">Cadastrar Ponto de Coleta</button>
      </form>
    </div>
  )
}

export default CreatePoint
