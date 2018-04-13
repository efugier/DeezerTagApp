import axios from 'axios'

export default () => {
  return axios.create({
    baseURL: `https://cors-anywhere.herokuapp.com/http://api.deezer.com/`
  })
}
