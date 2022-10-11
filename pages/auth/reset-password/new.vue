<template>

  <b-row>
    <b-col sm="12" md="6" lg="6">
    <b-form-group
      description="Minimum length of 8"
      id="input-group-2" label="New Password:" label-for="password">
      <b-form-input
        @keyup="onPasswordChange"
        id="password"
        v-model="form.password"
        placeholder="Enter password"
        type="password"
        required
      ></b-form-input>
    </b-form-group>

    <b-form-group
      :description="isEqualDescription"
      id="input-group-2" label="Repeat password:" label-for="r-password">
      <b-form-input
        @keyup="onPasswordChange"
        id="r-password"
        v-model="r_password"
        placeholder="Enter password"
        type="password"
        required
      ></b-form-input>
    </b-form-group>
    </b-col>
    <hr>

    <b-col cols="12">
      <b-button :disabled="notEqual" type="submit" @click="confirmChange" variant="">Submit</b-button>
      <b-button type="reset" variant="danger" @click="onReset">Reset</b-button>
    </b-col>
  </b-row>
</template>

<script>
export default {
  name: "new",

  auth: 'guest',

  data(){
    return{
      link:null,
      isEqualDescription:'',
      notEqual:true,

      r_password:'',

      form:{
        link:null,
        password:null,
      }
    }
  },

  methods:{
    onReset(){
      this.r_password = ''
      this.form.password = ''
    },

    confirmChange(){
      if(!this.validatePassword(this.form.password)){
        this.$nuxt.$emit('setMessage', {type: 'error', message: 'password must be longer then 8 characters'})
        return
      }

      this.$axios.post('/user/reset-password-main', {
        link: this.link,
        password: this.form.password
      }).then(({data}) => {
        this.$nuxt.$emit('setMessage', {type: data.status, message: data.message})

        if(data.status === 'success'){

          this.$router.push('/auth/login')
        }
      })
    },

    validatePassword(password){
      return password.length > 8
    },

    onPasswordChange(){

      this.notEqual = !(this.r_password === this.form.password)

      if(this.notEqual){
        this.isEqualDescription = "Passwords don't match"
      }else{
        this.isEqualDescription = ""
      }
    }
  },

  mounted() {

    this.link = this.$route.query?.link

    if(this.link){

      this.$axios.post('/user/reset-password-link-check', {
        link : this.link
      }).then(({data}) => {
        if(data.status === 'active')
          this.$nuxt.$emit('setMessage', {type: 'success', message: 'Link is active you can change your password'})
        else {
          this.$nuxt.$emit('setMessage', {type: 'error', message: 'Link expired'})
          this.$router.push('/auth/login')
        }
      })
    }

    $nuxt.$emit('setPageTitle', {title: 'Write your new password and repeat'})
  }
}
</script>

<style scoped>

</style>
