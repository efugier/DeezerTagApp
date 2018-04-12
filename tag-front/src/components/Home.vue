<template>
  <div class="hello">
    <b-row sm="4">
      <b-col sm="3" style="text-align: center;">
        <img src="../../img/mock_item.png" alt="Deezer logo" class="item_img">
      </b-col>

      <b-col class=current_item_info>
        <h3>{{ currentItem.title }}</h3>
        <h4>{{ currentItem.subtitle }} </h4>
        <h5>{{ "Last label: " + label }} </h5>
          <input-tag placeholder="Enter tags here" :tags.sync="currentItem.tags"></input-tag>
        <!-- <a href="#" @click="getTags('artist', '126')">Get tags</a> -->
      </b-col>
    </b-row>

    <b-row>
      <div class="item_list">
        <b-table striped hover :items="items">
          <template slot="id" slot-scope="data">
            <a :href="1+1"> {{data.value}} </a>
          </template>
          <template slot="tags" slot-scope="data" width="100%">
              {{data.value.join(', ')}}
          </template>

        </b-table>
      </div>
    </b-row>
  </div>
</template>

<script>
import InputTag from 'better-vue-input-tag'
import TagServices from '@/services/TagServices'
import App from '../App'

export default {
  name: 'Home',
  components: { InputTag },

  data () {
    return {
      label: App.data().label,

      currentItem: {
        id: 123,
        title: 'Title',
        subtitle: 'Subtitle',
        tags: ['rock', 'guitar', 'pop rock', 'country']
      },

      items: [
        {
          id: 123,
          name: 'abc',
          tags: ['rock', 'guitar', 'pop']
        },

        {
          id: 124,
          name: 'efg',
          tags: ['rock', 'electro', 'pop']
        },

        {
          id: 125,
          name: 'ghi',
          tags: ['blues', 'jazz']
        },

        {
          id: 126,
          name: 'jkl',
          tags: ['classic', 'symphony', 'violin']
        },

        {
          id: 124,
          name: 'efg',
          tags: ['rock', 'electro', 'pop']
        },

        {
          id: 125,
          name: 'ghi',
          tags: ['blues', 'jazz']
        },

        {
          id: 126,
          name: 'jkl',
          tags: ['classic', 'symphony', 'violin']
        },

        {
          id: 124,
          name: 'efg',
          tags: ['rock', 'electro', 'pop']
        },

        {
          id: 125,
          name: 'ghi',
          tags: ['blues', 'jazz']
        },

        {
          id: 126,
          name: 'jkl',
          tags: ['classic', 'symphony', 'violin']
        },

        {
          id: 124,
          name: 'efg',
          tags: ['rock', 'electro', 'pop']
        },

        {
          id: 125,
          name: 'ghi',
          tags: ['blues', 'jazz']
        },

        {
          id: 126,
          name: 'jkl',
          tags: ['classic', 'symphony', 'violin']
        },

        {
          id: 124,
          name: 'efg',
          tags: ['rock', 'electro', 'pop']
        },

        {
          id: 125,
          name: 'ghi',
          tags: ['blues', 'jazz']
        },

        {
          id: 126,
          name: 'jkl',
          tags: ['classic', 'symphony', 'violin']
        },

        {
          id: 124,
          name: 'efg',
          tags: ['rock', 'electro', 'pop']
        },

        {
          id: 125,
          name: 'ghi',
          tags: ['blues', 'jazz']
        },

        {
          id: 126,
          name: 'jkl',
          tags: ['classic', 'symphony', 'violin']
        },

        {
          id: 124,
          name: 'efg',
          tags: ['rock', 'electro', 'pop']
        },

        {
          id: 125,
          name: 'ghi',
          tags: ['blues', 'jazz']
        },

        {
          id: 126,
          name: 'jkl',
          tags: ['classic', 'symphony', 'violin']
        },

        {
          id: 124,
          name: 'efg',
          tags: ['rock', 'electro', 'pop']
        },

        {
          id: 125,
          name: 'ghi',
          tags: ['blues', 'jazz']
        },

        {
          id: 126,
          name: 'jkl',
          tags: ['classic', 'symphony', 'violin', 'end']
        }
      ]
    }
  },

  mounted () {

  },

  methods: {
    async getTags (label, id) {
      const response = await TagServices.getTags(label, id)
      this.tagsArray = response.data
      console.log(response.data)
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
