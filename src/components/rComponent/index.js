import Light from './light'
import Gauge from './Gauge'

const GaugePlugin ={};
GaugePlugin.install = function (Vue) {
  Vue.component(Light.name, Light)
  Vue.component(Gauge.name, Gauge)
}

export default GaugePlugin;