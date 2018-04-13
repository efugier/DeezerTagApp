import DeezerApi from '@/services/DeezerApi'

const config = {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET'
  }
}

export default {

  getContent (label, id, params) {
    return DeezerApi().get('/' + label + '/' + id, params, config)
  }

}
