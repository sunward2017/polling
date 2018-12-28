import baseUrl from "./api";
//机房
export const getRoomList = (self, params) => { return self.$http.jsonp(baseUrl + '/getAdminRoomList.action', { params: params, jsonp: "callback" }) };

export const getRoomDetail = (self, params) => { return self.$http.jsonp(baseUrl + '/getAdminRoomInfo.action', { params: params, jsonp: "callback" }) };

export const getRobots = (self, params) => { return self.$http.jsonp(baseUrl + '/getRobotListToRoom.action', { params: params, jsonp: "callback" }) };

export const saveRoom = (self, params, msg) => { return self.$http.jsonp(baseUrl + '/saveRoomInfo.action', { params: params, msg: msg, jsonp: "callback" }) };

export const removeRoom = (self, params, msg) => { return self.$http.jsonp(baseUrl + '/delRoom.action', { params: params, msg: msg, jsonp: "callback" }) };

export const getNavList = (self, params) => { return self.$http.jsonp(baseUrl + "/getMeasuringPointList.action", { params: params, jsonp: "callback" }) };

export const delMeasuringPointInfo = (self, params, msg) => { return self.$http.jsonp(baseUrl + "/delMeasuringPointInfo.action", { params: params, msg: msg, jsonp: "callback" }) };

export const saveNavConfig = (self, params, msg) => { return self.$http.jsonp(baseUrl + '/saveMeasuringPointInfo.action', { params: params, msg: msg, jsonp: "callback" }) };

export const getRobotWarnList = (self, params) => { return self.$http.jsonp(baseUrl + '/getRobotMsgWarnList.action', { params: params, jsonp: 'callback' }) };

export const getAudiosByRoom = (self, params) => { return self.$http.get(baseUrl + '/v1/listFilesByRoomId.action', { params: params }) };

export const getFilesByRoom = (self, params) => { return self.$http.get(baseUrl + '/v1/listFiles.action', { params: params }) };

export const removeAudio = (self, params) => { return self.$http.get(baseUrl + '/v1/deleteFile.action', { params: params }) };

export const uploadThe = (self, params) => { return self.$http.get(baseUrl + '/testUploadTh.action', { params: params }) };


//巷道
export const createArea = (self, param) => { return self.$http.post(baseUrl + '/v1/createAreaInfo.action', param, { emulateJSON: true }) };

export const roadwayList = (self, param) => { return self.$http.post(baseUrl + '/v1/listAreaInfosByCustomerId.action', param, { emulateJSON: true }) };

export const listAreaByRoom = (self, param) => { return self.$http.post(baseUrl + '/v1/listAreaInfosByRoomId.action', param, { emulateJSON: true }) };

export const deleteArea = (self, param) => { return self.$http.post(baseUrl + '/v1/deleteAreaInfo.action', param, { emulateJSON: true }) };


//导航点
export const stagList = (self, param) => { return self.$http.post(baseUrl + '/v1/listNavigationPoints.action', param, { emulateJSON: true }) };

export const editStag = (self, param) => { return self.$http.post(baseUrl + '/v1/createNavigationPoint.action', param, { emulateJSON: true }) };

export const updateStag = (self, param) => { return self.$http.post(baseUrl + '/v1/updateNavigationPoint.action', param, { emulateJSON: true }) };

export const deleteStag = (self, param) => { return self.$http.post(baseUrl + '/v1/deleteNavigationPoint.action', param, { emulateJSON: true }) };

//操作
export const workerListByStag = (self, param) => { return self.$http.post(baseUrl + '/v1/listCommandInfosByNvPoint.action', param, { emulateJSON: true }) };

export const addWorker = (self, param) => { return self.$http.post(baseUrl + '/v1/createCommandInfo.action', param, { emulateJSON: true }) };

export const updateWorker = (self, param) => { return self.$http.post(baseUrl + '/v1/updateCommandInfo.action', param, { emulateJSON: true }) };

export const deleteWorker = (self, param) => { return self.$http.post(baseUrl + '/v1/deleteCommand.action', param, { emulateJSON: true }) };

//设备
export const devList = (self, param) => { return self.$http.post(baseUrl + '/v1/listDeviceInfos.action', param, { emulateJSON: true }) };

export const saveDevices = (self, param) => {
    let url = param.deviceId ? "/v1/updateDeviceInfo.action" : "/v1/createDeviceInfo.action";
    return self.$http.post(baseUrl + url, param, { emulateJSON: true })
};

export const delDevice = (self, param) => { return self.$http.post(baseUrl + '/v1/deleteDeviceInfo.action', param, { emulateJSON: true }) };

//视频
export const getVideosByRoom =   (self, params) => { return self.$http.get(baseUrl + '/v1/listHistoryVideos.action', { params: params }) };






