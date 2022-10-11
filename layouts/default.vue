<template>
  <div>
    <Navbar/>

    <b-container class="page">
      <b-row cols="12">
        <b-col cols="12">
          <h2 class="text-center">{{ pageTitle }}
            <span
              v-if="message"
              class="page-message"
              :class="messageType"
            >
              {{ message }}
            </span>
          </h2>

          <hr>
        </b-col>
      </b-row>


      <!--set your cols in pages individually-->
      <Nuxt/>
    </b-container>
  </div>
</template>

<script>
import Navbar from "../components/Navbar";

export default {
  components: {Navbar},

  name: "default",

  data() {
    return {
      pageTitle: null,
      messageType: null,
      message: null,
    }
  },

  methods:{

    clearMessage(){
      this.message = null
      this.messageType = null
    }
  },

  created() {
    this.$nuxt.$on('setPageTitle', (data) => {
      this.pageTitle = data.title
    })

    this.$nuxt.$on('setMessage', (data) => {
      this.messageType = data.type
      this.message = data.message

      setTimeout(() => this.clearMessage() ,3000)
    })
  },
}
</script>

<style scoped>

</style>
