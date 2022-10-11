<template>
  <div>
    <b-row>
      <b-col sm="12" md="4" lg="4">

        <div class="user-info-card">
          <div>
            <b-card
              :title="'@_'+$auth.user.username || $auth.user.fullName"
              img-alt="Image"
              img-top
              style="max-width: 20rem;"
              class="mb-2 text-center user-card"
            >
              <b-card-text>
                نام و نام خانوادگی | {{ $auth.user.fullName }}
              </b-card-text>
              <b-card-text>
                شماره پاسپورت | {{ $auth.user.passportNo }}
              </b-card-text>
            </b-card>
          </div>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>

export default {
  name: "cabinet",
  middleware: 'auth',
  components: {},
  data() {
    return {
      timestamp: "",
      roles: null,
      isAdmin: false,
    }
  },

  methods: {
  },

  async mounted() {
    $nuxt.$emit('setPageTitle', {title: 'کابینه شخصی'})
    this.roles = await this.$store.dispatch('user/extractRole', this.$auth.user)
    this.isAdmin = await this.$store.dispatch('user/isAdmin', this.$auth.user)
  }
}
</script>

<style scoped>

</style>
