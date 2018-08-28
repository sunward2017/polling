import baseUrl from "./api";

export const getRoomIndex = (self,params) => { return  self.$http.get(baseUrl+'/web/getIndexInfo.action',{ params:params})};