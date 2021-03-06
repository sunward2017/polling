import * as types from './mutation-types'
export default {
	setAccount({
		commit
	}, userInfo) {
		commit(types.SET_ACCOUNT, userInfo)
	},
	setRobotId({
		commit
	}, robotId) {
		commit(types.SET_ROBOTID, robotId);
	},
	setRoom({
		commit
	}, room) {
		commit(types.SET_ROOM,room);
	},
	setRooms({
		commit
	},data){
		commit(types.SET_ROOMS,data);
	}
};