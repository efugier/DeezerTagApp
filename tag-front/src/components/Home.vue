<template>
  <div class="hello">
    <b-row sm="4">
      <b-col sm="4" style="text-align: center;">
        <img v-bind:src="currentItem.imgPath" alt="Item image" class="item_img">
      </b-col>

      <b-col class=current_item_info>
        <h3>{{ currentItem.title }}</h3>
        <h5>{{ currentItem.subtitle }} </h5>
          <b-row>
          <input-tag placeholder="Enter tags here" :tags.sync="currentItem.tags" style="margin: auto;"></input-tag>
          <b-button size="sm" type="submit" @click="postTags" style="margin: auto;">Submit</b-button>
          </b-row>
      </b-col>
    </b-row>

    <b-row>
      <div class="item_list">
        <b-table striped hover :items="items" @row-clicked="getContent">
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

export default {
  name: 'Home',
  components: { InputTag },

  data () {
    return {
      currentItem: {
        id: 123,
        title: 'Title',
        subtitle: 'Subtitle',
        imgPath: require('../../img/mock_item.png'),
        tags: ['rock', 'guitar', 'pop rock', 'country']
      },

      items: [
        {
          id: 1234321,
          tags: ['rock', 'guitar', 'pop']
        },

        {
          id: 1244321,
          tags: ['rock', 'electro', 'pop']
        },

        {
          id: 1254321,
          tags: ['blues', 'jazz']
        },

        {
          id: 1264321,
          tags: ['classic', 'symphony', 'violin']
        },

        {
          id: 126,
          tags: ['classic', 'symphony', 'violin']
        }
      ]
    }
  },

  mounted () {

  },

  methods: {
    async getTags (id) {
      const response = await TagServices.getTags(this.$route.params.label, id)
      this.tagsArray = response.data
      console.log(response.data)
    },

    async getContent (record) {
      const id = record.id
      const response = await DeezerServices.getContent(this.$route.params.label, id).catch()
      this.setCurrentItem(response.data)
      console.log(this.$route.params.label)
    },

    async postTags () {
      console.log('tag post !')
    },

    setCurrentItem (item) {
      this.currentItem.title = item.title || item.name
      this.currentItem.subtitle = item.album ? item.album.title + ', ' + item.artist.name : item.artist && item.artist.name
      this.currentItem.imgPath = item.picture_medium || (item.album && item.album.cover_medium) || (item.artist && item.artist.picture_medium)
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
