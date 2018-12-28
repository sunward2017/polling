import baseUrl from "./api";

export const getCollectionResults = (self, params) => { return self.$http.jsonp(baseUrl + '/getCollectionResults.action', { params: params, jsonp: "callback" }) };

//export const getwarningReport = (self,params)=>{ return self.$http.get(baseUrl+"/web/getResultList.action",{params:params}) };
//任务计划
export const getTaskList = (self, params) => { return self.$http.post(baseUrl + "/v1/listTaskSchedules.action", params, { emulateJSON: true }) };

export const addTask = (self, param) => { return self.$http.post(baseUrl + '/v1/createTaskSchedule.action', param, { emulateJSON: true }) };

export const updateTask = (self, param) => { return self.$http.post(baseUrl + '/v1/updateTaskSchedule.action', param, { emulateJSON: true }) };

export const deleteTask = (self, param) => { return self.$http.post(baseUrl + '/v1/deleteTaskSchedule.action', param, { emulateJSON: true }) };

export const pauseTask = (self, param) => { return self.$http.post(baseUrl + '/v1/activeTaskSchedule.action', param, { emulateJSON: true }) };

export const sendTempTask = (self, param) => { return self.$http.post(baseUrl + '/v1/sendTempTask.action', param, { emulateJSON: true }) };


//任务查看
export const currentTask = (self, params) => { return self.$http.post(baseUrl + "/v1/listCurrentTasks.action", params, { emulateJSON: true }) };

export const currentTaskDetail = (self, params) => { return self.$http.post(baseUrl + "/v1/listTaskDetailsByTask.action", params, { emulateJSON: true }) };

export const siteTask = (self, params) => { return self.$http.post(baseUrl + "/v1/listTasksWithInfraredPictures.action", params, { emulateJSON: true }) };


//任务模版
export const createTaskTemplate = (self, params) => {
    const url = params.templateId ? "/v1/updateTemplateInfo.action" : "/v1/createTemplateInfo.action";
    return self.$http.post(baseUrl + url, params, { emulateJSON: true })
};

export const templateList = (self, params) => { return self.$http.post(baseUrl + "/v1/listTemplateInfos.action", params, { emulateJSON: true }) };

export const deleteTemplate = (self, params) => { return self.$http.post(baseUrl + "/v1/deleteTemplateInfo.action", params, { emulateJSON: true }) };

export const updateTaskCurrent = (self, params) => { return self.$http.post(baseUrl + "/v1/updateTaskCurrent.action", params, { emulateJSON: true }) };
 

export const getThermalResults = (self, params) => { return self.$http.get(baseUrl+"/v1/getTaskResultList.action", { params: params }) };

export const getTaskResults = (self, params) => { return self.$http.get("/web/getTaskIdsWithFileInfos.action", { params: params }) };

export const getTaskDetail = (self, params) => { return self.$http.get(baseUrl+"/v1/listFilesByTaskId.action", { params: params }) };

// export const getWarningByDetect = (self, params) => { return self.$http.get("/web/getImageDetectedResultList.action", { params: params }) };
export const getWarningByDetect =  (self, param) => { return self.$http.post(baseUrl + '/v1/listImageDetectResults.action', param, { emulateJSON: true }) };

export const getSmokeWarning = (self, params) => { return self.$http.get("/web/listSmokeWarning.action", { params: params }) };

export const getNoiseWarning = (self, params) => { return self.$http.get("/web/listNoiseWarning.action", { params: params }) };

export const getHumitureResults = (self, params) => { return self.$http.get("/web/listHumitureReport.action", { params: params }) };

export const getThermometryResults = (self, params) => { return self.$http.get("/web/listThermometryReport.action", { params: params }) };

export const getTaskByTime = (self, params) => { return self.$http.get("/web/listEndTaskByTime.action", { params: params }) };

//export const getServersInfos = (self, params) => { return self.$http.get(baseUrl + '/listTaskWithCabinetInfos.action', { params: params }) }
export const getServersInfos = (self, params) => { return self.$http.get(baseUrl + '/v1/listTasksWithServers.action', { params: params }) }

//资源
export const getListCabinetsByTaskId = (self, params) => { return self.$http.get(baseUrl + '/v1/listDevicesByTaskId.action', { params: params }) }
 

export const getListServers = (self, params) => { return self.$http.get(baseUrl + '/v1/listServers.action', { params: params }) };

export const cmdListByRoom = (self, params) => { return self.$http.post(baseUrl + "/v1/listNavigationPoints.action", params, { emulateJSON: true }) }




