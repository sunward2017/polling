import baseUrl from "./api";
//管理员
export const getAdminList = (self,params) => { return  self.$http.jsonp(baseUrl+'/getAdminAccountList.action',{ params:params , jsonp:"callback"})};

export const saveAccount = (self,params,msg)=> { return  self.$http.jsonp(baseUrl+'/saveAdminAccount.action',{ params:params ,msg:msg, jsonp:"callback"})};

export const getCustoms = (self,params) => { return self.$http.jsonp(baseUrl+'/getCustoms.action',{ params:params, jsonp:"callback"})};

export const removeAccount = (self,params,msg) => { return self.$http.jsonp(baseUrl+'/deleteAdminAccount.action',{ params:params,msg:msg, jsonp:"callback"})};

export const getCustomList = (self,params) => { return self.$http.jsonp(baseUrl+'/getCustomList.action',{params:params ,jsonp:"callback"})};

export const saveCustom =  (self,params,msg) => { return self.$http.jsonp(baseUrl+'/saveCustom.action',{params:params ,msg:msg, jsonp:"callback"})};

export const removeCustom = (self,params,msg) => { return self.$http.jsonp(baseUrl+'/deleteCustom.action',{params:params ,msg:msg, jsonp:"callback"})};

export const sendLogs = (self,params) => { return  self.$http.get(baseUrl+'web/insertOperationNote.action?',{ params:{detail:params}})};

export const saveRoleWithManage = (self, param) => { return self.$http.post(baseUrl + '/saveUserRolesInfo.action', param, { emulateJSON: true }) };

export const getRolesByManage = (self, param) => { return self.$http.post(baseUrl + '/getUserRolesInfo.action', param, { emulateJSON: true }) };

 
//操作员
export const getUserList = (self,params) => { return  self.$http.jsonp(baseUrl+'/getOperatorList.action',{ params:params , jsonp:"callback"})};

export const saveUser = (self,params,msg) => { return  self.$http.jsonp(baseUrl+'/saveOperatorInfo.action',{ params:params ,msg:msg, jsonp:"callback"})};

export const showDetail = (self,params) => { return  self.$http.jsonp(baseUrl+'/getOperatorDetail.action',{ params:params , jsonp:"callback"})};

export const removeOpt = (self,params,msg) => { return  self.$http.jsonp(baseUrl+'/delOpt.action',{ params:params , msg:msg, jsonp:"callback"})};

//角色

export const getMenuTree = (self, param) => { return self.$http.post(baseUrl + '/GetSysMemuTree.action', param, { emulateJSON: true }) };

export const getRoles = (self, param) => { return self.$http.post(baseUrl + '/GetSysRoleList.action', param, { emulateJSON: true }) };

export const saveRole=(self,param)=>{
   let url = param.id?'/ModifySysRoleList.action':'/AddSysRoleList.action';
   return self.$http.post(baseUrl +url, param, { emulateJSON: true })
}

export const deleteRole= (self, param) => { return self.$http.post(baseUrl + '/DelSysRoleList.action', param, { emulateJSON: true }) };
export const saveRoleAuth = (self, param) => { return self.$http.post(baseUrl + '/SaveSysMemuTree.action', param, { emulateJSON: true }) };