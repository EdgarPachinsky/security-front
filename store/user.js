export const state = () => ({
  loadedUsers: true,
  users: [],
  currentUser: null,
  currentUserDevices:[]
})

export const actions = {

  loadUser({commit}) {
    commit('setUser', [])
    commit('setLoaded', true)

    this.$axios.get('/user/list', {}, {
      headers: {
        'Authorization': this.$auth.strategy.token.get()
      },
    }).then(({data}) => {
      // console.log(data)

      // this.$emit('setMessage', {type: data.status, message: data.message })
      const users = data.data
      let index = 1

      for (const user of users) {
        user['#'] = index
        index++

        const userDevices = []
        const userRoles = []

        for(const dev of user.device){
          userDevices.push(`${dev.name} `)
        }
        for(const role of user.role){
          userRoles.push(`${role.name} `)
        }
        user['devices'] = userDevices.length>0?userDevices.toString():'-'
        user['roles'] = userRoles.length>0?userRoles.toString():'-'
      }

      commit('setUser', data.data)
      commit('setLoaded', false)
    }).catch((err) => {
      console.log(err)
    })
  },

  async saveUser({ commit }, dataToSave){

    return this.$axios.post('/user/save', dataToSave, {
      headers: {
        'Authorization': this.$auth.strategy.token.get()
      },
    }).then(({data}) => {
      return data
    }).catch((err) => {
      return err
    })
  },

  async deleteUser({ commit }, userId){

    return this.$axios.delete(`/user/delete/${userId}`, {
      headers: {
        'Authorization': this.$auth.strategy.token.get()
      },
    }).then(({data}) => {
      return data
    }).catch((err) => {
      return err
    })
  },

  async changeUserStatus({ commit }, userId){

    return this.$axios.post(`/user/change-status`, {
      _id:userId
    }, {
      headers: {
        'Authorization': this.$auth.strategy.token.get()
      },
    }).then(({data}) => {
      return data
    }).catch((err) => {
      return err
    })
  },

  clearCurrentUser({ commit }){
    commit('setCurrentUser', null)
  },

  async loadCurrentUserData({ commit }, userId){

    commit('setCurrentUser', null)

    await this.$axios.get(`/user/get-for-admin/${userId}`, {
      headers: {
        'Authorization': this.$auth.strategy.token.get()
      },
    }).then(({data}) => {
      commit('setCurrentUser', data.user)
    }).catch((err) => {
      console.log(err)
    })
  },

  async loadCurrentUserDevices({ commit }){

    await this.$axios.get(`/user/my-devices`, {
      headers: {
        'Authorization': this.$auth.strategy.token.get()
      },
    }).then(({data}) => {
      console.log(data)
      commit('setCurrentUserDevices', data.data)
    }).catch((err) => {
      console.log(err)
    })
  },

  extractRole({commit}, user) {
    // if (user.role.length < 1) {
    //   return false
    // }
    //
    // const roles = user.role
    // let _roles = ''
    //
    // for (const role of roles) {
    //   _roles += `${role.name} `
    // }

    // return _roles
    return []
  },

  isAdmin({commit}, user) {
    // if (user.role.length < 1) {
    //   return false
    // }
    //
    // const roles = user.role
    //
    // for (const role of roles) {
    //   if (role.name === 'admin')
    //     return true
    // }

    return true
  }
}

export const getters = {}

export const mutations = {

  setUser(state, data) {
    state.users = data
  },

  setLoaded(state, data) {
    console.log('set ', data)
    state.loadedUsers = data
  },

  setCurrentUser(state, data) {
    state.currentUser = data
  },

  setCurrentUserDevices(state, data){
    state.currentUserDevices = data
  }
}
