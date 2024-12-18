export const state = () => ({
  universityList: [],
  provincesDetail: {},
  detailVisible: false,
  selectedUniversity: '',
  // cityList: {}
})

export const mutations = {
  initialuniversityList(state, universityList) {
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
            return e.IPv6DNS != 0 &&( e.HttpTest.some(test=>test.IPv6HttpStatus.status==true)||e.HttpsTest.some(test=>test.IPv6HttpsStatus.status==true))
          } else {
            return e.IPv6DNS != 0 && (e.HttpTest.some(test=>test.IPv6HttpStatus.status==true)||e.HttpsTest.some(test=>test.IPv6HttpsStatus.status==true)) && e.province == province
          }
        }).length
        let percentage = Number(((ipv6SupportCount / universityCount) * 100).toFixed(2))

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
  },
  // initialCityList(state, cityList) {
    // state.cityList = cityList
  // }
}
export const actions = {
  async nuxtServerInit({ commit }, ctx) {
    let { data: { universityList } } = await ctx.$axios.get('/api/getUniversity')
    commit('initialuniversityList', universityList)

    // let { data: { cityData } } = await ctx.$axios.get('http://127.0.0.1:3000/api/getCity')
    // commit('initialCityList', cityData)
  },
  detailVisible({ commit }, selectedUniversity) {
    commit('detailVisible', selectedUniversity)
  },
  detailInvisible({ commit }) {
    commit('detailInvisible')
  }
}
