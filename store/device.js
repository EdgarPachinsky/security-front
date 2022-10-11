export const state = () => ({
  loadedDevices: true,
  devices:[],

  selectValue_device:[],

  currentDevice:null,

  deviceHistory:[],
  loadedHistory: true,

  weightsHistory:[],
  weightsMax:0,
})

export const actions = {

  loadDevices({ commit }){
    commit('setDevices', [])
    commit('setLoaded', true)

    this.$axios.get('/device/list', {}, {
      headers: {
        'Authorization': this.$auth.strategy.token.get()
      },
    }).then(({data}) => {
      // console.log(data)

      // this.$emit('setMessage', {type: data.status, message: data.message })
      const devices = data.data

      let index = 1
      for (const device of devices) {
        const params = []
        device['#'] = index
        index++
        console.log(device.parameters)

        for (const param of device.parameters) {
          params.push(`${param} `)
        }

        device['params'] = params.toString()
      }

      commit('setDevices', devices)
      commit('setLoaded', false)
    }).catch((err) => {
      console.log(err)
    })
  },

  async saveDevice({ commit }, dataToSave){

    return  this.$axios.post('/device/save', dataToSave, {
      headers: {
        'Authorization': this.$auth.strategy.token.get()
      },
    }).then(({data}) => {
      return data
    }).catch((err) => {
      return err
    })
  },

  async deleteDevice({ commit }, id){

    return this.$axios.delete(`/device/delete/${id}`, {
      headers: {
        'Authorization': this.$auth.strategy.token.get()
      },
    }).then(({data}) => {
      return data
    }).catch((err) => {
      return err
    })
  },

  async loadCurrentDevice({ commit }, id){

    commit('setCurrentDevice', null)

    await this.$axios.get(`/device/get/${id}`, {
      headers: {
        'Authorization': this.$auth.strategy.token.get()
      },
    }).then(({data}) => {
      commit('setCurrentDevice', data)
    }).catch((err) => {
      console.log(err)
    })
  },




  async transformForSelect_device({ commit }){

    await this.$axios.get('/device/list', {}, {
      headers: {
        'Authorization': this.$auth.strategy.token.get()
      },
    }).then(({data}) => {

      const allDevices = data.data

      const transformed = []
      for(const device of allDevices){
        transformed.push({
          value: device._id,
          text: device.name
        })
      }

      commit('setSelectTransformedDevices', transformed)
    }).catch((err) => {
      console.log(err)
    })
  },


  async saveDeviceCustomId({ commit }, data){

    commit('setLoadedHistory', true)

    return this.$axios.post(`/history/save-by-animal-id`, {
      animalId: data.animalId,
      customId: data.customId,
    },{
      headers: {
        'Authorization': this.$auth.strategy.token.get()
      },
    }).then(({data}) => {
      return data
    })
  },

  async loadDeviceHistory({ commit }, data){

    commit('setLoadedHistory', true)

    this.$axios.get(`/history/by-device/${data.id}`,{
      headers: {
        'Authorization': this.$auth.strategy.token.get()
      },
    }).then(({data}) => {

      if(data.historyForOneAnimal){
        return
      }

      commit('setLoadedHistory', false)

      let index = 1
      for (const history of data) {
        history['#'] = index
        index++
      }

      commit('setDeviceHistory', data)
    })
  },

  async dropHistory({ commit }){
    commit('setWeightsHistory', [])
    commit('setMaxWeight', 0)
  },

  async loadDeviceHistory_({ commit }, data){

    const data_ = {
      ...data.animalId && {animalId: data.animalId},
      ...data.start && {start: data.start},
      ...data.end && {end: data.end}
    }

    return this.$axios.post(`/history/by-device-history/${data.id}`, data_,{
      headers: {
        'Authorization': this.$auth.strategy.token.get()
      },
    }).then(({data}) => {

      let weights = []
      data.map(weightInfo => {
        weights.push(parseInt(weightInfo.weight))
      })
      let maxOfWeights = Math.max(...weights)

      commit('setWeightsHistory', weights)
      commit('setMaxWeight', maxOfWeights)
      return true
    })
  },


  deleteHistoryElement_({ commit }, data) {
    let url = `/history/delete`

    if(data.many){
      url += `-many`;

      if(!data.customId){
        delete data.customId
      }
    }
    delete data.many

    return this.$axios.post(url, data, {
      headers: {
        'Authorization': this.$auth.strategy.token.get()
      },
    }).then(({data}) => {
      return data
    })
  }
}

export const getters = {
  getDevices(state){
    return state.devices
  }
}

export const mutations = {

  setDevices(state, data){
    state.devices = data
  },
  setSelectTransformedDevices(state, data){
    state.selectValue_device = data
  },
  setLoaded(state, data){
    state.loadedDevices = data
  },

  setCurrentDevice(state, data) {
    state.currentDevice = data
  },

  setDeviceHistory(state, data){
    state.deviceHistory = data
  },
  setLoadedHistory(state, data){
    state.loadedHistory = data
  },

  setWeightsHistory(state, data){
    state.weightsHistory = data
  },
  setMaxWeight(state, data){
    state.weightsMax = data
  },
}
