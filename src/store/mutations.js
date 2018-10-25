import * as types from './mutation-types'

export default {
  [types.SET_ACCOUNT] (state, userInfo) {
    state.user = userInfo;
  },
  [types.SET_ROBOTID](state,robotId){
  	state.robotId = robotId;
  },
  [types.SET_ROOM](state,room){
  	state.room = room;
  },
  [types.SET_TASK](state,task){
  	state.task = task;
  },
  [types.SET_ROOMS](state,data){
    state.rooms = data;
  }
};
