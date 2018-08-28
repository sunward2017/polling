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
	}
};