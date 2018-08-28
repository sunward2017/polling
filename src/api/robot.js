import baseUrl from "./api";

export const getRobotList = (self,params) => { return  self.$http.jsonp(baseUrl+'/getRobotList.action',{ params:params , jsonp:"callback"})};

export const getRobotDetail = (self,params)=> { return  self.$http.jsonp(baseUrl+'/getRobotInfo.action',{ params:params , jsonp:"callback"})};

export const editRobot = (self,params,msg)=> { return  self.$http.jsonp(baseUrl+'/modifyRobotInfo.action',{ params:params ,msg:msg, jsonp:"callback"})};

export const getRobotLogList = (self,params) => {return self.$http.jsonp(baseUrl+'/getRobotLogList.action',{ params:params , jsonp:"callback"})};

export const resetRobot = (self,params) => {return self.$http.jsonp(baseUrl+'/resetRobot.action',{params:params,jsonp:'callback'})};

export const getWorkerRobos = (self,params) => {return self.$http.jsonp(baseUrl+'/getRobotListOnWork.action',{ params:params , jsonp:"callback"})};

export const saveRobotWarn = (self,params,msg) => {return self.$http.jsonp(baseUrl+'/saveRobotMsgWarnInfo.action',{ params:params,msg:msg,jsonp:'callback'})};

export const removeRobotWarn = (self,params,msg) => {return self.$http.jsonp(baseUrl+'/delRobotMsgWarn.action',{ params:params,msg:msg,jsonp:'callback'})};

export const getCorrection = (self,params) => {return self.$http.jsonp(baseUrl+'/getRobotCorrection.action',{ params:params,jsonp:'callback'})};

export const saveCorrection = (self,params,msg) => {return self.$http.jsonp(baseUrl+'/updateRobotCorrection.action',{ params:params,msg:msg,jsonp:'callback'})};

export const getHumitureList = (self,params) => {return self.$http.jsonp(baseUrl+"/getHumitureFileList.action",{ params:params,jsonp:'callback'})};

export const restartRobot = (self,params) => {return self.$http.jsonp(baseUrl+'/rebootRobot.action',{ params:params , jsonp:"callback"})};
