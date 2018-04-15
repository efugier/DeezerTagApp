<template>
  <div class="hello">
    <b-row sm="4">
      <b-col sm="4" style="text-align: center;">
        <img v-bind:src="currentItem.imgPath" alt="Item image" class="item_img">
      </b-col>

      <b-col class=current_item_info>
        <h3>{{ currentItem.title }}</h3>
        <h5>{{ currentItem.subtitle }} </h5>
        <h6>ID: <a :href="'https://www.deezer.com/en/' + currentItem.label + '/' + currentItem.id" target="_blank">
        {{ currentItem.id }}
        </a> </h6>
          <b-row>
          <input-tag placeholder="Enter tags here" :tags.sync="currentItem.tags" style="margin: auto;"></input-tag>
          <b-button id="submit_button" size="sm" type="submit" @click="postTags" style="margin: auto;">Submit</b-button>

          <b-popover :show.sync="showSubmitPopover" target="submit_button" title="Success" placement="bottomleft">
            Tags have been updated !
          </b-popover>
          </b-row>
      </b-col>
    </b-row>

    <b-row>
      <div class="item_list">
        <b-table striped hover :items="items" @row-clicked="getDeezerContent">
          <template slot="id" slot-scope="data">
            <a> {{data.value}} </a>
          </template>
          <template slot="tags" slot-scope="data" width="100%">
            <div v-for="tag of data.value" :key="tag" style='display: inline-block;'>
              <b-badge variant="info">{{tag}}</b-badge> &nbsp;
            </div>
          </template>

        </b-table>
      </div>
    </b-row>
  </div>
</template>

<script>
import InputTag from 'better-vue-input-tag'
import TagServices from '@/services/TagServices'
import DeezerServices from '@/services/DeezerServices'
import { EventBus } from '../event-bus.js'

export default {
  name: 'Home',
  components: { InputTag },

  data () {
    return {
      deflautItem: {
        label: 'track',
        id: 0,
        title: 'Does not exist on deezer',
        subtitle: 'Choose another one',
        imgPath: require('../../img/mock_item.png'),
        tags: []
      },

      showSubmitPopover: false,

      currentItem: {},

      items: []
    }
  },

  mounted () {
    this.getContent()
    this.listenForRefresh()
  },

  methods: {
    async getTags (id) {
      const response = await TagServices.getTags(this.$route.params.label, id)
      this.tagsArray = response.data
    },

    listenForRefresh () {
      EventBus.$on('refresh', () => {
        this.getContent()
      })
    },

    async getDeezerContent (record) {
      const id = record.id
      const response = await DeezerServices.getContent(this.$route.params.label, id)

      const item = response.data
      item.label = this.$route.params.label

      if (!item.id) {
        this.currentItem = Object.assign({}, this.deflautItem)
        this.currentItem.id = record.id
        this.currentItem.tags = record.tags
      } else {
        item.tags = record.tags
        this.setCurrentItem(item)
      }
    },

    async getContent () {
      const response = await TagServices.getTaggedContent(this.$route.fullPath)
      if (!this.currentItem.id) { this.currentItem = Object.assign({}, this.deflautItem) }
      this.items = response.data
    },

    async postTags () {
      await TagServices.replaceContent(this.currentItem.label, this.currentItem.id, this.currentItem.tags)
      this.show = true
      setTimeout(() => { this.showSubmitPopover = false }, 500)
    },

    setCurrentItem (item) {
      this.currentItem.label = item.label
      this.currentItem.id = item.id
      this.currentItem.title = item.title || item.name
      this.currentItem.subtitle = item.album ? item.album.title + ', ' + item.artist.name : item.artist && item.artist.name
      this.currentItem.imgPath = item.picture_medium || item.cover_medium || (item.album && item.album.cover_medium) || (item.artist && item.artist.picture_medium)
      this.currentItem.tags = item.tags
    }
  },

  watch: {
    $route: function () { // don't use arrow function here (this)
      this.getContent()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
/* ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
} */
a {
  color: #42b983;
}

.item_img {
  text-align: center;
  padding: 20px;
  width: 100%;
}

.current_item_info {
  padding: 20px;
  text-align: left;
}

.item_list {
  padding: 30px;
  position: fixed;
  left: 28%;
  widows: 100%;
  height: 75%;
  right: 0;
  overflow-y: auto;
}
</style>
