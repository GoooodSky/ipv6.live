import axios from 'axios'

export const state = () => ({
  universityList: [],
  provincesDetail: {},
  detailVisible: false,
  selectedUniversity: ''
})

export const mutations = {
  initial(state, universityList) {
    let provinces = ['全国'].concat(...new Set(universityList.map(item => item.province)))

    state.universityList = universityList
    state.provincesDetail = Object.assign(
      {},
      ...provinces.map(province => {
        let universityCount = universityList.filter(e => {
          if (province == '全国') {
            return e
          } else {
            return province == e.province
          }
        }).length
        let ipv6SupportCount = universityList.filter(e => {
          if (province == '全国') {
            return e.ipv6Resolve != 'N/A'
          } else {
            return e.ipv6Resolve != 'N/A' && e.province == province
          }
        }).length
        let percentage = ((ipv6SupportCount / universityCount) * 100).toFixed(2) + '%'

        return { [province]: { universityCount, ipv6SupportCount, percentage } }
      })
    )
  },
  detailVisible(state, selectedUniversity) {
    state.detailVisible = true
    state.selectedUniversity = selectedUniversity
  },
  detailInvisible(state) {
    state.detailVisible = false
  }
}
export const actions = {
  async nuxtServerInit({ commit }) {
    let {data: { universityList }} = await axios.get('http://127.0.0.1:3000/api/getUniversity')
    commit('initial', universityList)
  },
  detailVisible({ commit }, selectedUniversity) {
    commit('detailVisible', selectedUniversity)
  },
  detailInvisible({ commit }) {
    commit('detailInvisible')
  }
}
