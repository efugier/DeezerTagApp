<template>
  <div class="hello">
    <b-row sm="4">
      <b-col sm="4">
        <img src="../../img/mock_item.png" alt="Deezer logo" class="item_img">
      </b-col>

      <b-col>
        <div class=current_item_info>
        <h3>{{ title }}</h3>
        <h4>{{ subtitle }} </h4>
          <input-tag placeholder="Enter tags here" :tags.sync="tagsArray"></input-tag>
        <a href="#" @click="getTags('artist', '126')">Get tags</a>
        </div>
      </b-col>
    </b-row>

    <b-row>
    <div>
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
      <li>Item 4</li>
    </ul>
  </div>
    </b-row>
  </div>
</template>

<script>
import InputTag from 'better-vue-input-tag'
import TagServices from '@/services/TagServices'

export default {
  name: 'Home',
  components: {InputTag},
  data () {
    return {
      title: 'Title',
      subtitle: 'Subtitle',
      tagsArray: []
    }
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
  padding: 20px;
  width: 70%;
}

.current_item_info {
  padding: 20px;
  text-align: left;
}
</style>
