import Vue from 'vue'
import Vuex from 'vuex'
import mutations from './mutations'
import actions from './actions'
Vue.use(Vuex);

const state = {
   user:'',
   robotId:'',
   room:'',
   rooms:[],
};

export default new Vuex.Store({
  state,
  mutations,
  actions
})

