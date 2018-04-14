import TagApi from '@/services/TagApi'

export default {

  export () {
    return TagApi().get('/export')
  },

  getTags (label, id, params) {
    return TagApi().get('/' + label + '/' + id, params)
  },

  getTaggedContent (path, params) {
    return TagApi().get(path, params)
  },

  newContent (label, id, params) {
    return TagApi().post('/' + label + '/' + id, params)
  },

  replaceContent (label, id, params) {
    return TagApi().post('/' + label + '/' + id, params)
  }

}
