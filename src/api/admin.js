
import baseUrl from "./api";
export const getAdminList = (self,params) => { return  self.$http.jsonp(baseUrl+'/getAdminAccountList.action',{ params:params , jsonp:"callback"})};

export const saveAccount = (self,params,msg)=> { return  self.$http.jsonp(baseUrl+'/saveAdminAccount.action',{ params:params ,msg:msg, jsonp:"callback"})};

export const getCustoms = (self,params) => { return self.$http.jsonp(baseUrl+'/getCustoms.action',{ params:params, jsonp:"callback"})};

export const removeAccount = (self,params,msg) => { return self.$http.jsonp(baseUrl+'/deleteAdminAccount.action',{ params:params,msg:msg, jsonp:"callback"})};

export const getCustomList = (self,params) => { return self.$http.jsonp(baseUrl+'/getCustomList.action',{params:params ,jsonp:"callback"})};

export const saveCustom =  (self,params,msg) => { return self.$http.jsonp(baseUrl+'/saveCustom.action',{params:params ,msg:msg, jsonp:"callback"})};

export const removeCustom = (self,params,msg) => { return self.$http.jsonp(baseUrl+'/deleteCustom.action',{params:params ,msg:msg, jsonp:"callback"})};

export const sendLogs = (self,params) => { return  self.$http.get(baseUrl+'web/insertOperationNote.action?',{ params:{detail:params}})};