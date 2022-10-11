export const state = () => ({
  loadedRoles: true,
  roles:[],

  selectValue_role:[],
  currentUserRoles:[],
})

export const actions = {

  // loadDevices({ commit }){
  //   commit('setRoles', [])
  //   commit('setLoaded', true)
  //
  //   this.$axios.get('/role/list', {}, {
  //     headers: {
  //       'Authorization': this.$auth.strategy.token.get()
  //     },
  //   }).then(({data}) => {
  //     // console.log(data)
  //
  //     // this.$emit('setMessage', {type: data.status, message: data.message })
  //     const devices = data.data
  //
  //     let index = 1
  //     for (const device of devices) {
  //       const params = device.parameters.toString()
  //       device['#'] = index
  //       device['params'] = params
  //       index++
  //     }
  //
  //     commit('setDevices', devices)
  //     commit('setLoaded', false)
  //   }).catch((err) => {
  //     console.log(err)
  //   })
  // },

  async transformForSelect_role({ commit , state, getters }){

    await this.$axios.get('/role/list', {}, {
      headers: {
        'Authorization': this.$auth.strategy.token.get()
      },
    }).then(({data}) => {

      const allData = data.data
      const transformed = []

      for(const _data of allData){
        transformed.push({
          value: _data._id,
          text: _data.name
        })
      }

      commit('setSelectTransformedData', transformed)
    }).catch((err) => {
      console.log(err)
    })
  }
}

export const getters = {

}

export const mutations = {

  setRoles(state, data){
    state.roles = data
  },
  setSelectTransformedData(state, data){
    state.selectValue_role = data
  },
}
