import baseUrl from "./api";
export const getTemplateList = (self,params) => { return  self.$http.jsonp(baseUrl+ '/getTemplateList.action',{ params:params , jsonp:"callback"})};

export const getTemplateDetail = (self,params) => { return  self.$http.jsonp(baseUrl+ '/getTemplateDetail.action',{ params:params , jsonp:"callback"})};

export const saveTemplate = (self,params,msg)=>{ return self.$http.jsonp(baseUrl+ '/saveTemplate.action',{params:params,msg:msg,jsonp:"callback"})};

export const removeTemplate = (self,params,msg)=>{ return self.$http.jsonp(baseUrl+ '/deleteTemplate.action',{params:params,msg:msg,jsonp:"callback"})};

export const comfirmUp = (self,params) => {return self.$http.jsonp(baseUrl+ '/saveDeviceExcelImport.action',{params:params,jsonp:"callback"})};

export const editRfidTpl =(self,param)=>{
    let url = param.detectSettingId ? "/v1/updateDetectSetting.action" : "/v1/createDetectSetting.action";
    return self.$http.post(baseUrl + url, param, { emulateJSON: true })
};

export const listRfidTpl = (self,params) => { return  self.$http.get(baseUrl+ '/v1/listDetectSettings.action', params)};

export const deleteRfidTpl = (self,param)=>(self.$http.post(baseUrl + '/v1/deleteDetectSetting.action', param, { emulateJSON: true }));