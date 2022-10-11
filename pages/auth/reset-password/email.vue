<template>
  <b-form
    @submit="onSubmit"
    @reset="onReset"
  >
    <b-row>
      <b-col sm="12" md="6" lg="6">
        <b-form-group id="input-group-1" label="Email address:" label-for="email">
          <b-form-input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="Enter email"
            required
          ></b-form-input>
        </b-form-group>
        <hr>
      </b-col>

      <b-col cols="12">
        <b-button type="submit" variant="">Send reset link</b-button>
        <b-button type="reset" variant="danger" @click="onReset">Reset</b-button>
      </b-col>
    </b-row>
  </b-form>
</template>

<script>
export default {
  name: "email",

  auth: 'guest',

  data() {
    return {
      form: {
        email: null,
      }
    }
  },

  methods: {
    onSubmit(event){
      event.preventDefault()

      this.$axios.post('/user/reset-password' , this.form).then(({data}) => {

        if(data.status === 'error')
          this.$nuxt.$emit('setMessage', {type: data.status, message: 'Link already exists and active, check your email'})
        else
          this.$nuxt.$emit('setMessage', {type: data.status, message: 'Link created, check your email'})
      })
    },

    onReset(event) {
      event.preventDefault()
      // Reset our form values
      this.form.email = ''
    },
  },

  mounted() {
    $nuxt.$emit('setPageTitle', {title: 'Write your email'})
  }
}
</script>

<style scoped>

</style>
