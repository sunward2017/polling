const Login = r => require.ensure([], () => r(require('./pages/login/Login.vue')), 'Login');

const Reset = r => require.ensure([], () => r(require('./pages/login/Reset.vue')), 'Reset');
const Home = r => require.ensure([], () => r(require('./pages/Home.vue')), 'Home');
const Robot = r => require.ensure([], () => r(require('./pages/robot/Table.vue')), 'Robot');
const Workers = r => require.ensure([], () => r(require('./pages/personnel/workers/Table.vue')), 'Workers');
const Admin = r => require.ensure([], () => r(require('./pages/personnel/admin/Table.vue')), 'Admin');
const Roles = r => require.ensure([], () => r(require('./pages/personnel/Roles/index.vue')), 'Admin');

const Room = r => require.ensure([], () => r(require('./pages/machineRoom/Table.vue')), 'Room');
const Device = r => require.ensure([], () => r(require('./pages/machineRoom/device.vue')), 'Device');
const Stagnation = r => require.ensure([], () => r(require('./pages/machineRoom/Stagnation.vue')), 'Stagnation');
 
const rfidTemplate = r => require.ensure([], () => r(require('./pages/machineRoom/rfidTemplate.vue')), 'rfidTemplate');

const Template = r => require.ensure([], () => r(require('./pages/template/Table.vue')), 'Template');
const warningSend = r => require.ensure([], () => r(require('./pages/template/warning.vue')), 'warningSend');

const CollectionResult = r => require.ensure([], () => r(require('./pages/results/collectionResult.vue')), 'CollectionResult');
const SmokeWarning = r => require.ensure([], () => r(require('./pages/results/smokeWarning.vue')), 'SmokeWarning');
const NoiseWarning = r => require.ensure([], () => r(require('./pages/results/noiseWarning.vue')), 'NoiseWarning');
const Thermal = r => require.ensure([], () => r(require('./pages/results/Thermal.vue')), 'Thermal');
const PhotoReport = r => require.ensure([], () => r(require('./pages/results/photoReport.vue')), 'PhotoReport');
const Source = r => require.ensure([], () => r(require('./pages/results/sourceRec.vue')), 'Source');
const taskVideos = r => require.ensure([], () => r(require('./pages/results/taskVideos.vue')), 'taskVideo');

const HistoryVideo = r => require.ensure([], () => r(require('./pages/supervision/historyVideos.vue')), 'HistoryVideos');
//const Supervision = r => require.ensure([], () => r(require('./pages/supervision/supervision.vue')), 'Supervision');
const Super = r => require.ensure([], () => r(require('./pages/supervision/realTime.vue')), 'Super');
const SuperviseImgs = r => require.ensure([], () => r(require('./pages/supervision/superViseImgs.vue')), 'SuperviseImgs');

const TaskList = r => require.ensure([], () => r(require('./pages/distribute/TaskList.vue')), 'TaskList');
const TaskDetail = r => require.ensure([], () => r(require('./pages/distribute/TaskDetail.vue')), 'TaskDetail');
const TaskTemplate = r => require.ensure([], () => r(require('./pages/distribute/TaskTemplate.vue')), 'TaskTemplate');
const WorkerDetail = r => require.ensure([], () => r(require('./pages/distribute/WorkerDetail.vue')), 'WorkerDetail');
const tempTask =  r => require.ensure([], () => r(require('./pages/distribute/TempTask.vue')), 'tempTask');

const Dashboard = r => require.ensure([], () => r(require('./pages/dashboard/dashboard.vue')), 'Dashboard');
const Site = r => require.ensure([], () => r(require('./pages/results/site.vue')), 'site');
const report = r => require.ensure([], () => r(require('./pages/results/report.vue')), 'report');
export const routes = [{
	path: '/login',
	component: Login,
	hidden: true
}, {
	path: '/reset',
	component: Reset,
	hidden: true
}, {
	path: '/',
	component: Home,
	redirect: '/dashboard',
	name: "INDEX",
	leaf: true,
	iconCls: 'fa fa-area-chart',
	children: [{
		path: 'dashboard',
		component: Dashboard,
		name: '首页'
	}]
}, {
	path: '/',
	component: Home,
	name: '巡检结果',
	iconCls: 'fa fa-envelope-open', //图标样式class
    leaf: false,
    key:2, 
	children: [
		{
			path: '/photoReport',
            component: PhotoReport,
            key:9, 
			name: '巡检照片'
		},{
			path:'/taskVideos',
            component:taskVideos,
            key:10, 
			name:'巡检视频'
		},
		{
			path: '/Collection',
            component: CollectionResult,
            key:11, 
			name: '图像识别',
			hidden:false,
		},
		 {
			path: '/thermalResult',
            component: Thermal,
            key:12, 
			name: '热能均衡'
		}, 
		{
			path: '/Source',
            component: Source,
            key:13, 
			name: '资源识别'
		}, 
		{
			path: '/site',
            component: Site,
            key:14, 
			name: '定点测温'
		}, {
			path: '/smokeWarning',
            component: SmokeWarning,
            key:15, 
			name: '异味检测',
			hidden: false

		},
		 {
			path: '/noiseWarning',
            component: NoiseWarning,
            key:31, 
			name: '异响检测',
			hidden: true
		}
		, {
			path: '/report',
            component: report,
            key:16,
			name: '运行报告'
		}
	]
},
{
	path: '/',
	component: Home,
	name: '任务管理',
	iconCls: 'fa fa-microchip', //图标样式class
    leaf: false,
    key:3,
	children: [{
		path: 'histTask',
        component: TaskList,
        key:17,
		name: '任务计划'
	}, {
		path:'tempTask',
		component:tempTask,
		name:'临时任务',
		key:18,
	},{
		path: 'taskDetail',
        component: TaskDetail,
		name: '任务查看',
		key:19,
	}, {
		path: 'workerDetail',
		component: WorkerDetail,
        name: '巡检详情'
	}, {
		path: 'taskTemplate',
		component: TaskTemplate,
        name: '任务模版',
        key:20
	}]
},
{
	path: '/',
	component: Home,
	name: '机房管理',
	iconCls: 'fa fa-address-card',
    leaf: false, //只有一个节点
    key:4,
	children: [{
		path: 'machineRoom',
        component: Room,
        key:21,
		name: '机房编辑'
	}, {
		path: 'device',
        component: Device,
        key:22,
		name: '机房设备'
	}, {
		path: 'stagnation',
        component: Stagnation,
        key:23,
		name: '导航点配置'
	},{
		path:'rTemplate',
        component:rfidTemplate,
        key:24,
		name:'标签模板'
	}]
}, {
	path: '/',
	component: Home,
	name: '机器人管理',
	iconCls: 'fa fa-male', //图标样式class
    leaf: false,
    key:5,
	children: [{
		path: 'robot',
		component: Robot,
        name: '机器人配置',
        key:25
	}
	]
}, {
	path: '/',
	component: Home,
	name: '告警管理',
	iconCls: 'fa fa-address-card-o',
    leaf: false, 
    key:6,
	children: [
		{
		path: 'template',
        component: Template,
        key:26,
		name: '模板配置'
	}, 
	{
		path: 'warning',
        component: warningSend,
        key:27,
		name: '告警配置'
	}]
}, {
	path: '/',
	component: Home,
	name: '人员管理',
	iconCls: 'fa fa-user-plus',
    leaf: false, 
    key:7,
	children: [
        {
            path: 'admin',
            component: Admin,
            key:32,
            name: '系统管理员'
        }, {
            path: 'worker',
            component: Workers,
            key:28,
            name: '机器人操作员'
        },{
            path: 'roles',
            component: Roles,
            key:33,
            name: '角色权限' 
        }
    ]
},
{
	path: '/',
	component: Home,
	name: '随工监督',
	iconCls: 'fa fa-address-book', //图标样式class
    leaf: false,
    key:8,
	children: [{
		path: 'realTime',
        component: Super,
        key:29,
		name: '实时监控'
	},
	// {
	// 	path: 'supervision',
	// 	component: Supervision,
	// 	name: '工单监督',
	// 	hidden: true,
	// },
	{
		path: 'historyVideo',
		component: HistoryVideo,
        name: '历史视频',
        key:30
	},
	{
		path: 'superviseImgs',
		component:SuperviseImgs,
        name: '历史图片',
        key:34
	}
	]
},
{
	path: '*',
	redirect: '/login',
	hidden: true
}
]