 
export const realtimeStatus={'0':'空 闲','10':'手工控制中','20':'自动巡检中','30':'随工监督中','40':'充电中','50':'掉  线'};        

export const robotStatusForObj = {'0':'工作中','10':'已闲置','20':'已故障','30':'维修中','40':'已报废'};

export const realTimeTypes={'0':'gray','10':'primary','20':'success','50':'warning','40':'','30':'danger'}; 

export const robotStatusTypes={'0':'success','10':'gray','20':'danger','40':'','30':'warning'};

export const  warnTypes = [{value:"仪表温度",unit:"℃"},{value:"仪表湿度",unit:'%'},{value:"温度检测",unit:"℃"},{value:"湿度检测",unit:"%"},{value:"仪表电压",unit:"V"},{value:"仪表电流",unit:"A"},{value:"热能探测",unit:'℃'},{value:"指示灯",unit:' '}];

export const  warnTypesForObj = {"仪表温度":"℃","仪表湿度":'%',"温度检测":"℃","湿度检测":"%","仪表电压":"V","仪表电流":"A","热能探测":'℃',"指示灯":''};

export const workerColumns =[{value:"optName",label:"姓名"},{value:"optAccount",label:"账号"},{value:"optJobNumber",label:"工号"},{value:"optDepartment",label:"所属部门"},{value:"all",label:"所有"}];

export const templateCls =[{value:"deviceName",label:"设备名称"},{value:"deviceType",label:"设备类型"},{value:"deviceModel",label:"设备型号"},{value:"all",label:"所有"}];

export const robotCls =[{value:"robotName",label:"机器人名称"},{value:"robotSerial",label:"机器人编号"},{value:"roomName",label:"机房名称"},{value:"all",label:"所有"}];

export const RFIDTYPES ={"1":"指示灯","2":"小灯","3":"LED数字","4":"灯和LED数字"};

export const LIGHTDISTRIBUTION = {"0":"无","1":"横排","2":"竖排","3":"双竖排"};

export const NUMDISTRIBUTON = {"0":"无","1":"横排","2":"竖排"};

export const LEDTYPES = {"0":"无","1":"电流电压","2":"温湿度"};

export const WARNMSGCOLUMNS = [{value:"robotName",label:"机器人名称"},{value:"warnMobile",label:"告警手机"},{value:"warnEmail",label:"告警邮箱"}];

export const LIGHTTYPES =  [{ value: '1',label: '状态指示灯'}, { value: '2', label: '背光面板'}, { value: '3', label: '不带背光面板'}, {  value: '4',label: 'LED数字'}];

export const TESTTYPES = [{value:'1',label:'图像识别'},{value:'2',label:'温度湿度'},{value:'3',label:'热成像'}];
