import TagApi from '@/services/TagApi'

export default {

  export () {
    return TagApi().get('/export')
  },

  getTags (label, id, params) {
    return TagApi().get('/' + label + '/' + id, params)
  },

  getTaggedContent (labelQuery, params) {
    return TagApi().get('/' + labelQuery)
  },

  newContent (label, id, params) {
    return TagApi().post('/' + label + '/' + id, params)
  },

  replaceContent (label, id, params) {
    return TagApi().post('/' + label + '/' + id, params)
  }

}
