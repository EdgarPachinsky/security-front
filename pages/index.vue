<template>
  <div class="text-center">
    <p class="mt-2" v-if="!$auth.loggedIn">
      که شایسته ترین وظایفش است
      به سراغ برخی خواهم آمد. با نوازش، دردهای برگزیده را به بار می آورند تا تربیتشان به زحمات بزرگترها بیفتد
      به خاطر لذت ها!
    </p>

    <template v-if="!$auth.loggedIn">
      <div class="mt-4">
        <b-button
          type="button"
          variant="danger"
          class="margin-bottom-15"
          to="/auth/login">وارد شدن
          <b-icon icon="lock"></b-icon>
        </b-button>

        <b-button
          type="button"
          variant="danger"
          class="margin-bottom-15"
          to="/auth/register">ثبت نا
          <b-icon icon="shield-check"></b-icon>
        </b-button>
      </div>
    </template>

    <template v-if="$auth.loggedIn">
      <b-button
        type="button"
        variant="danger"
        class="margin-bottom-15"
        to="/user/cabinet">برو به کابینه
        <b-icon icon="compass"></b-icon>
      </b-button>
    </template>


  </div>
</template>

<script>
// import WorkspaceList from "../components/Workspaces";

export default {

  components: {
    // WorkspaceList,
  },

  data() {
    return {}
  },

  methods: {},

  mounted() {
    $nuxt.$emit('setPageTitle', {title: 'امنیت پروژه'})
  }
}
</script>
