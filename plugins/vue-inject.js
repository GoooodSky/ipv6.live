import Vue from 'vue'

Vue.prototype.$getElementTop = function(element) {
  var actualTop = element.offsetTop
  var current = element.offsetParent

  while (current !== null) {
    actualTop += current.offsetTop
    current = current.offsetParent
  }
  return actualTop
}
// Vue.prototype.$scrollTo = function (target, interval = 1000, offset = 0) {
//   let dom = document.querySelector(target)
//   let scrollTop = document.documentElement.scrollTop
//   let targetLocale = this.$getElementTop(dom)
//   let distance = targetLocale - scrollTop
//   let startTime = new Date().getTime()
//   let timer = setInterval(() => {
//     if (new Date().getTime() - startTime > interval) {
//       clearInterval(timer)
//     } else {
//       let locale = scrollTop + ((distance + offset) * (new Date().getTime() - startTime)) / interval
//       window.scrollTo(0, locale)
//     }
//   }, 10)
// }
Vue.prototype.$scrollTo = function(target, interval = 1000, offset = 0) {
  let dom = document.querySelector(target)
  let scrollTop = document.documentElement.scrollTop
  let targetLocale = this.$getElementTop(dom)
  let distance = targetLocale - scrollTop
  let startTime = 0
  let timer = setInterval(() => {
    if (startTime >= interval) {
      clearInterval(timer)
    } else {
      let locale = scrollTop + ((distance + offset) * (startTime += 10)) / interval
      window.scrollTo(0, locale)
    }
  }, 10)
  // 10ms的刷新间隔可保证刷新率为100Hz以下的显示器不卡顿
}
