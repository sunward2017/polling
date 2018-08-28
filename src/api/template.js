import baseUrl from "./api";
export const getTemplateList = (self,params) => { return  self.$http.jsonp(baseUrl+ '/getTemplateList.action',{ params:params , jsonp:"callback"})};

export const getTemplateDetail = (self,params) => { return  self.$http.jsonp(baseUrl+ '/getTemplateDetail.action',{ params:params , jsonp:"callback"})};

export const saveTemplate = (self,params,msg)=>{ return self.$http.jsonp(baseUrl+ '/saveTemplate.action',{params:params,msg:msg,jsonp:"callback"})};

export const removeTemplate = (self,params,msg)=>{ return self.$http.jsonp(baseUrl+ '/deleteTemplate.action',{params:params,msg:msg,jsonp:"callback"})};

export const comfirmUp = (self,params) => {return self.$http.jsonp(baseUrl+ '/saveDeviceExcelImport.action',{params:params,jsonp:"callback"})};