<template>
  <div id="app">
    <b-container>
      <b-row class="mainrow">
      <b-col sm="4">
        <div class="leftbar">
          <img src="../img/DZ_Logo_CMYK_W.png" alt="Deezer logo" class="logo">
        <div class="navbar">

          <b-navbar toggleable="md" type="dark">

            <b-navbar-brand href="#">Find...</b-navbar-brand>

            <b-collapse is-nav id="nav_collapse">

            <b-navbar-nav class="ml-auto">

              <b-nav-form>
                <b-form-input size="sm" class="mr-sm-2" type="text" v-model="tagString" placeholder="coma-separated tags"/>
                <b-button size="sm" class="my-2 my-sm-0" type="submit" @click="search">Search</b-button>
              </b-nav-form>

            </b-navbar-nav>

          </b-collapse>
        </b-navbar>
      </div>

      <div class="content_types">
        <div>

          <b-form-group label="Type of content">
            <b-form-radio-group v-model="label"
                                :options="contentTypes"
                                stacked
                                name="radiosStacked">
            </b-form-radio-group>
          </b-form-group>
        </div>
        <div class="create_delete">
          <b-btn v-b-modal.modal-create style="margin: 30px;">New</b-btn>
          <b-btn v-b-modal.modal-delete style="margin: 30px;">Delete</b-btn>
        </div>
      </div>

      <div class="add_content">

      </div>
    </div>
    </b-col>

    <b-col>
      <router-view/>
    </b-col>
    </b-row>
    </b-container>

  <div class="create_del_modal">
    <b-modal id="modal-create" centered :title="'New ' + label" @ok="createItem">
      <b-form-input type="text"
                      placeholder="ID"
                      v-model="toBeCreated.id"></b-form-input>
      <br>
      <b-form-input type="text"
                      placeholder="Coma-separated tags"
                      v-model="toBeCreated.tagString"></b-form-input>
    </b-modal>

    <b-modal id="modal-delete" centered :title="'Delete ' + label" @ok="deleteItem">
      <b-form-input type="text"
                      placeholder="ID"
                      v-model="toBeDeleted"></b-form-input>
    </b-modal>
  </div>
  </div>
</template>

<script>
import TagServices from '@/services/TagServices'
import { EventBus } from './event-bus.js'

export default {
  name: 'App',

  data () {
    return {
      label: 'track',
      tagString: '',
      query: '',

      contentTypes: [
        { text: 'Track', value: 'track' },
        { text: 'Album', value: 'album' },
        { text: 'Artist', value: 'artist' }
      ],

      toBeCreated: {
        id: '',
        tagString: ''
      },
      toBeDeleted: ''
    }
  },

  mounted () {
    this.label = this.$route.params.label || 'track'
  },

  methods: {

    async createItem () {
      const str = this.toBeCreated.tagString.trim()
      const tags = str ? str.split(/ *, */) : []
      await TagServices.newContent(this.label, this.toBeCreated.id, tags)
      EventBus.$emit('refresh')
      this.toBeCreated = { id: '', tagString: '' }
    },

    async deleteItem () {
      await TagServices.deleteContent(this.label, this.toBeDeleted)
      EventBus.$emit('refresh')
      this.toBeDeleted = ''
    },

    async search () {
      const tags = this.tagString.split(/ *, */)

      this.query = '?'
      let i = 0
      for (let tag of tags) {
        if (tag !== '') {
          this.query += 'tags[]=' + tag
          if (++i < tags.length) { this.query += '&' }
        }
      }
      this.$router.push('/' + this.label + this.query)
    }
  },

  watch: {
    label: function () { // don't use arrow function here (this)
      this.$router.push('/' + this.label + this.query)
    }
  }
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
}

.leftbar {
  text-align: center;
  background-color: #3a3a3a;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 71.77%;
}

.logo {
  padding: 13px;
  width: 50%;
  max-width: 13vw;
}

.content_types {
  text-align: left;
  padding: 20px;
  color: #ffffff;
}

.create_delete {
  text-align: center;
  padding: 40px;
  color: #ffffff;
}

.create_delete_podal {
  margin: auto;
}

.navbar {
  margin: auto;
  padding: 10px;
}
</style>
