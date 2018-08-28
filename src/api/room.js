import baseUrl from "./api";

export const getRoomList = (self,params) => { return  self.$http.jsonp(baseUrl+'/getAdminRoomList.action',{ params:params , jsonp:"callback"})};

export const getRoomDetail =  (self,params) => { return  self.$http.jsonp(baseUrl+'/getAdminRoomInfo.action',{ params:params , jsonp:"callback"})};

export const getRobots = (self,params) => { return  self.$http.jsonp(baseUrl+'/getRobotListToRoom.action',{ params:params , jsonp:"callback"})};

export const saveRoom =(self,params,msg) => { return  self.$http.jsonp(baseUrl+'/saveRoomInfo.action',{ params:params , msg:msg , jsonp:"callback"}) };

export const removeRoom =(self,params,msg) => { return  self.$http.jsonp(baseUrl+'/delRoom.action',{ params:params , msg:msg ,jsonp:"callback"}) };

//export const getRfidTypeList = (self,params) => { return  self.$http.jsonp(baseUrl+'/getDeviceRfidTypes.action',{ params:params , jsonp:"callback"})};

//export const saveDevRfidType = (self,params,msg) => { return  self.$http.jsonp(baseUrl+'/saveDeviceRfidType.action',{ params:params , msg:msg , jsonp:"callback"})};

//export const removeDevRfidType = (self,params,msg) => { return  self.$http.jsonp(baseUrl+'/delDeviceRfidType.action',{ params:params , msg:msg , jsonp:"callback"})};

//export const updateDevRfidType = (self,params,msg) => { return  self.$http.jsonp(baseUrl+'/updateDeviceRfidType.action',{ params:params , msg:msg , jsonp:"callback"})};

export const getNavList = (self,params) => { return  self.$http.jsonp(baseUrl+"/getMeasuringPointList.action",{params:params ,jsonp:"callback"})};

export const delMeasuringPointInfo = (self,params,msg) => { return  self.$http.jsonp(baseUrl+"/delMeasuringPointInfo.action",{params:params ,msg:msg,jsonp:"callback"})};

export const saveNavConfig =(self,params,msg) => { return  self.$http.jsonp(baseUrl+'/saveMeasuringPointInfo.action',{ params:params,msg:msg, jsonp:"callback"}) };
 
export const getRobotWarnList = (self,params) => {return self.$http.jsonp(baseUrl+'/getRobotMsgWarnList.action',{ params:params,jsonp:'callback'})};

export const uploadThe = (self,params)=>{return self.$http.get(baseUrl+'/testUploadTh.action',{params:params})};
