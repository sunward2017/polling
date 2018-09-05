import baseUrl from "./api";

export const getCollectionResults = (self, params) => { return self.$http.jsonp(baseUrl + '/getCollectionResults.action', { params: params, jsonp: "callback" }) };

//export const getwarningReport = (self,params)=>{ return self.$http.get(baseUrl+"/web/getResultList.action",{params:params}) };

export const getTaskList = (self, params) => { return self.$http.post(baseUrl + "/v1/listTaskSchedules.action", params, { emulateJSON: true }) };

export const addTask = (self, param) => { return self.$http.post(baseUrl + '/v1/createTaskSchedule.action', param, { emulateJSON: true }) };

export const updateTask = (self, param) => { return self.$http.post(baseUrl + '/v1/updateTaskSchedule.action', param, { emulateJSON: true }) };

export const deleteTask = (self, param) => { return self.$http.post(baseUrl + '/v1/deleteTaskSchedule.action', param, { emulateJSON: true }) };

export const getThermalResults = (self, params) => { return self.$http.get("/web/getTaskResultList.action", { params: params }) };

export const getTaskResults = (self, params) => { return self.$http.get("/web/getTaskIdsWithFileInfos.action", { params: params }) };

export const getTaskDetail = (self, params) => { return self.$http.get("/web/getTaskDetail.action", { params: params }) };

export const getWarningByDetect = (self, params) => { return self.$http.get("/web/getImageDetectedResultList.action", { params: params }) };

export const getSmokeWarning = (self, params) => { return self.$http.get("/web/listSmokeWarning.action", { params: params }) };

export const getNoiseWarning = (self, params) => { return self.$http.get("/web/listNoiseWarning.action", { params: params }) };

export const getHumitureResults = (self, params) => { return self.$http.get("/web/listHumitureReport.action", { params: params }) };

export const getThermometryResults = (self, params) => { return self.$http.get("/web/listThermometryReport.action", { params: params }) };

export const getTaskByTime = (self, params) => { return self.$http.get("/web/listEndTaskByTime.action", { params: params }) };

export const getServersInfos = (self, params) => { return self.$http.get(baseUrl + '/listTaskWithCabinetInfos.action', { params: params }) }

export const getListCabinetsByTaskId = (self, params) => { return self.$http.get(baseUrl + '/listCabinetsByTaskId.action', { params: params }) }

export const getListServers = (self, params) => { return self.$http.get(baseUrl + '/listServers.action', { params: params }) };

export const cmdListByRoom = (self, params) => { return self.$http.post(baseUrl + "/v1/listNavigationPoints.action", params, { emulateJSON: true }) }




