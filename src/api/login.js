import baseUrl from "./api";

export const loginByAccount = (self,params,msg) => { return  self.$http.jsonp(baseUrl+ '/adminLogin.action',{ params:params ,msg:msg,jsonp:"callback"})}

export const resetPwd = (self,params,msg) => { return  self.$http.jsonp(baseUrl+ '/modifyAdminPwd.action',{ params:params , msg:msg,jsonp:"callback"})};

