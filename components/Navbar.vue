<template>
  <div>
    <b-navbar toggleable="sm" type="light" variant="light" class="page-navbar">

      <b-navbar-brand class="app-name">
        <nuxt-link to="/">
          پروژه<span>امنیت</span>
          <nuxt-img class="nav-logo" src="/icons/logo.png" />
        </nuxt-link>
      </b-navbar-brand>

      <div class="nav-time">
        {{ timestamp }}

        <span class="icon-container">
          <b-icon icon="clock"></b-icon>
        </span>
      </div>

      <div class="nav-actions">

        <template v-if="$auth.loggedIn">

          <b-button to="/" type="button" class="custom-button nav-button" variant="">
            <b-icon icon="house"></b-icon>
          </b-button>

          <b-button to="/user/cabinet" type="button" class="user-avatar-small-container custom-button nav-button user-info" variant="">
            <span>
<!--              <img-->
<!--                class="user-avatar-small"-->
<!--                :src="avatar"-->
<!--                alt="">-->
            </span>
            @_{{ $auth.user.username && $auth.user.username.length > 7 ? $auth.user.username.substr(1, 7)+ '...' : $auth.user.username || '-'  }}
          </b-button>

          <b-button  @click="logOut" type="button" class="custom-button nav-button" variant="" style="margin-right: 0">
            <b-icon icon="door-open"></b-icon>
          </b-button>
        </template>

<!--        <template v-else>-->
<!--          <b-button to="/auth/login" type="button" class="custom-button nav-button" variant="">Login</b-button>-->
<!--          <b-button to="/auth/register" type="button" class="custom-button nav-button" variant="">Register</b-button>-->
<!--        </template>-->
      </div>

    </b-navbar>
  </div>
</template>

<script>
export default {
  name: "Navbar",

  data(){
    return{
      timestamp: "",
      // hostPrefix: `http://91.103.29.205:3000/file`,
      // avatar: null,
    }
  },

  methods: {

    logOut:function (){
      this.$auth.logout()
    },

    getNow: function () {
      const today = new Date();

      let month = (today.getMonth() + 1) < 10 ? `0${today.getMonth() + 1}` : today.getMonth() + 1
      let day = today.getDate() < 10 ? `0${today.getDate()}` : today.getDate()
      let year = today.getFullYear()
      const date = `${month}-${day}-${year}`;

      let hours = today.getHours() < 10 ? `0${today.getHours()}` : today.getHours()
      let minutes = today.getMinutes() < 10 ? `0${today.getMinutes()}` : today.getMinutes()
      let seconds = today.getSeconds() < 10 ? `0${today.getSeconds()}` : today.getSeconds()

      const time = `${hours}:${minutes}:${seconds}`

      this.timestamp = date + '/' + time;
    },

    setAvatar(){
      this.avatar = `${this.hostPrefix}/${this.$auth?.user?.avatar?this.$auth.user.avatar:"placeholder.png"}`
    }
  },

  async created() {
    setInterval(this.getNow, 1000);
  },

  mounted() {
    // this.setAvatar()
  }
}
</script>

<style scoped>

</style>
