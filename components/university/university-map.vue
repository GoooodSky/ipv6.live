<template>
  <section id="map-container">
    <div id="universityMap"></div>
  </section>
</template>

<script>
export default {
  methods: {
    renderMap(data, config) {
      let { zoom } = config
      const scene = new L7.Scene({
        id: 'universityMap',
        map: new L7.GaodeMap({
          // style: "dark",
          zoom,
          center: [107.042225, 33.66565],
          pitch: 30
          // type: "amap",
          // token: "e8e12efd8fae0ca8a677bdfdaaf9ec29"
        })
      })
      const colors = [
        // "#eff3f6",
        'transparent',
        '#A6E1E0',
        '#72BED6',
        '#5B8FF9',
        '#3474DB',
        '#005CBE',
        '#00419F',
        '#00287E'
      ]
      const layer = new L7.PolygonLayer({})
        .source(data)
        .color('count', colors)
        .shape('fill')
        .style({ opacity: 0.9 })

      const layer2 = new L7.LineLayer({ zIndex: 2 })
        .source(data)
        .color('#fff')
        .size(0.3)
        .style({ opacity: 1 })

      scene.addLayer(layer)
      scene.addLayer(layer2)
    }
  },
  async mounted() {
    let zoom = document.body.clientWidth / document.body.clientHeight > 1 ? 4.5 : 1

    let {data: { cityData }} = await this.$axios.get('/api/getCity')

    this.renderMap(cityData, { zoom })
  }
}
</script>
<style lang="scss">
#universityMap {
  position: relative;
  width: 100vw;
  height: calc(100vh - 165px);
}
</style>
