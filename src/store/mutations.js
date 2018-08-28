import * as types from './mutation-types'

export default {
  [types.SET_ACCOUNT] (state, userInfo) {
    state.user = userInfo;
  },
  [types.SET_ROBOTID](state,robotId){
  	state.robotId = robotId;
  }
};
