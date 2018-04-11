<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <input-tag placeholder="Enter tags here" :tags.sync="tagsArray"></input-tag>
    <h2>Essential Links</h2>
    <a href="#" @click="getTags('artist', '126')">Get tags</a>
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
      msg: 'Tag management',
      tagsArray: []
    }
  },

  methods: {
    async getTags (label, id) {
      const response = await TagServices.getTags(label, id)
      // this.tagsArray = response.data
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
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
