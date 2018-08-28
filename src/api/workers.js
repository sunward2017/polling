import baseUrl from "./api";

export const getUserList = (self,params) => { return  self.$http.jsonp(baseUrl+'/getOperatorList.action',{ params:params , jsonp:"callback"})};

export const saveUser = (self,params,msg) => { return  self.$http.jsonp(baseUrl+'/saveOperatorInfo.action',{ params:params ,msg:msg, jsonp:"callback"})};

export const showDetail = (self,params) => { return  self.$http.jsonp(baseUrl+'/getOperatorDetail.action',{ params:params , jsonp:"callback"})};

export const removeOpt = (self,params,msg) => { return  self.$http.jsonp(baseUrl+'/delOpt.action',{ params:params , msg:msg, jsonp:"callback"})};