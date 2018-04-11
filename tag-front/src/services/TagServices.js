import Api from '@/services/Api'

export default {

  getTags (label, id, params) {
    return Api().get('/' + label + '/' + id, params)
  },

  newContent (label, id, params) {
    return Api().post('/' + label + '/' + id, params)
  },

  replaceContent (label, id, params) {
    return Api().post('/' + label + '/' + id, params)
  }

}
