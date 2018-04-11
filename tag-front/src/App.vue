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
                <b-form-input size="sm" class="mr-sm-2" type="text" placeholder="coma-separated tags"/>
                <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
              </b-nav-form>

            </b-navbar-nav>

          </b-collapse>
        </b-navbar>
      </div>

      <div class="content_types">
        <div>

          <b-form-group label="Stacked radios">
            <b-form-radio-group v-model="selected"
                                :options="options"
                                stacked
                                name="radiosStacked">
            </b-form-radio-group>
          </b-form-group>

          <b-form-group label="Stacked button style radios">
            <b-form-radio-group v-model="selected"
                                :options="options"
                                buttons
                                stacked
                                name="radioBtnStacked" />
          </b-form-group>

          <div class="mt-3">
            Selected: <strong>{{ selected }}</strong>
          </div>
        </div>
      </div>
    </div>
    </b-col>

    <b-col>
      <router-view/>
    </b-col>
    </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: 'App',

  data () {
    return {
      selected: 'first',
      options: [
        { text: 'Track', value: 'track' },
        { text: 'Album', value: 'album' },
        { text: 'Artist', value: 'artist' }
      ]
    }
  }
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.leftbar {
  background-color: #3a3a3a;
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

.navbar {
  margin: auto;
  /* width: 50%; */
  padding: 10px;
}
</style>
