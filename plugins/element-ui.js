import Vue from 'vue'
import Element from 'element-ui'
// import locale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'

export default () => {
  Vue.use(Element, { zhLocale })
}
