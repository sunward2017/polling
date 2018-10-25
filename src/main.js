import babelpolyfill from 'babel-polyfill' //完整使用es6 api插件
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import 'assets/custom-theme/index.css';
import VueRouter from 'vue-router'
import store from './store'
import Vuex from 'vuex'
import NProgress from 'nprogress' //页面顶部进度条
import 'nprogress/nprogress.css' 

const Login = r => require.ensure([], () => r(require('./pages/login/Login.vue')), 'Login');

const Reset = r => require.ensure([], () => r(require('./pages/login/Reset.vue')), 'Reset');
const Home = r => require.ensure([], () => r(require('./pages/Home.vue')), 'Home');
const Robot = r => require.ensure([], () => r(require('./pages/robot/Table.vue')), 'Robot');
const Workers = r => require.ensure([], () => r(require('./pages/workers/Table.vue')), 'Workers');

const Room = r => require.ensure([], () => r(require('./pages/machineRoom/Table.vue')), 'Room');
const Device = r => require.ensure([], () => r(require('./pages/machineRoom/device.vue')), 'Device');
const Stagnation = r => require.ensure([], () => r(require('./pages/machineRoom/Stagnation.vue')), 'Stagnation');
 
const rfidTemplate = r => require.ensure([], () => r(require('./pages/machineRoom/rfidTemplate.vue')), 'rfidTemplate');

const Template = r => require.ensure([], () => r(require('./pages/template/Table.vue')), 'Template');
const Admin = r => require.ensure([], () => r(require('./pages/admin/Table.vue')), 'Admin');
const warningSend = r => require.ensure([], () => r(require('./pages/template/warning.vue')), 'warningSend');

const CollectionResult = r => require.ensure([], () => r(require('./pages/results/collectionResult.vue')), 'CollectionResult');
const SmokeWarning = r => require.ensure([], () => r(require('./pages/results/smokeWarning.vue')), 'SmokeWarning');
const NoiseWarning = r => require.ensure([], () => r(require('./pages/results/noiseWarning.vue')), 'NoiseWarning');
const Thermal = r => require.ensure([], () => r(require('./pages/results/Thermal.vue')), 'Thermal');
const PhotoReport = r => require.ensure([], () => r(require('./pages/results/photoReport.vue')), 'PhotoReport');
const Source = r => require.ensure([], () => r(require('./pages/results/sourceRec.vue')), 'Source');

const HistoryVideo = r => require.ensure([], () => r(require('./pages/supervision/historyVideo.vue')), 'HistoryVideo');
const Supervision = r => require.ensure([], () => r(require('./pages/supervision/supervision.vue')), 'Supervision');
const Super = r => require.ensure([], () => r(require('./pages/supervision/realTime.vue')), 'Super');

const TaskList = r => require.ensure([], () => r(require('./pages/distribute/TaskList.vue')), 'TaskList');
const TaskDetail = r => require.ensure([], () => r(require('./pages/distribute/TaskDetail.vue')), 'TaskDetail');
const TaskTemplate = r => require.ensure([], () => r(require('./pages/distribute/TaskTemplate.vue')), 'TaskTemplate');
const WorkerDetail = r => require.ensure([], () => r(require('./pages/distribute/WorkerDetail.vue')), 'WorkerDetail');

const Dashboard = r => require.ensure([], () => r(require('./pages/dashboard/dashboard.vue')), 'Dashboard');
const Site = r => require.ensure([], () => r(require('./pages/results/site.vue')), 'site');
const report = r => require.ensure([], () => r(require('./pages/results/report.vue')), 'report');



import vueResource from 'vue-Resource'
import VueLazyLoad from 'vue-lazyload'
import { sendLogs } from './api/admin';

Vue.use(VueLazyLoad, {
	error: './static/img/error.jpg',
	loading: './static/img/waiting.gif'
})

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(vueResource);
 
const routes = [{
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
	children: [
		{
			path: '/photoReport',
			component: PhotoReport,
			name: '巡检照片'
		},
		{
			path: '/Collection',
			component: CollectionResult,
			name: '图像识别',
		},
		 {
			path: '/thermalResult',
			component: Thermal,
			name: '热能均衡'
		}, {
			path: '/Source',
			component: Source,
			name: '资源识别'
		}, {
			path: '/site',
			component: Site,
			name: '定点测温'
		}, {
			path: '/smokeWarning',
			component: SmokeWarning,
			name: '异味检测',
			hidden: true

		}, {
			path: '/noiseWarning',
			component: NoiseWarning,
			name: '异响检测',
			hidden: true
		}
		, {
			path: '/report',
			component: report,
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
	children: [{
		path: 'histTask',
		component: TaskList,
		name: '任务计划'
	}, {
		path: 'taskDetail',
		component: TaskDetail,
		name: '任务查看'
	}, {
		path: 'workerDetail',
		component: WorkerDetail,
		name: '巡检详情',
		hidden: true,
	}, {
		path: 'taskTemplate',
		component: TaskTemplate,
		name: '任务模版'
	}]
},
{
	path: '/',
	component: Home,
	name: '机房管理',
	iconCls: 'fa fa-address-card',
	leaf: false, //只有一个节点
	children: [{
		path: 'machineRoom',
		component: Room,
		name: '机房编辑'
	}, {
		path: 'device',
		component: Device,
		name: '机房设备'
	}, {
		path: 'stagnation',
		component: Stagnation,
		name: '导航点配置'
	},{
		path:'rTemplate',
		component:rfidTemplate,
		name:'标签模板'
	}]
}, {
	path: '/',
	component: Home,
	name: '机器人管理',
	iconCls: 'fa fa-male', //图标样式class
	leaf: false, 
	children: [{
		path: 'robot',
		component: Robot,
		name: '机器人配置'
	},
		// { path: '/user', component: user, name: '列表' },
	]
}, {
	path: '/',
	component: Home,
	name: '告警管理',
	iconCls: 'fa fa-address-card-o',
	leaf: false, 
	children: [{
		path: 'template',
		component: Template,
		name: '模板配置'
	}, {
		path: 'warning',
		component: warningSend,
		name: '告警发送'
	},
		// { path: '/echarts', component: echarts, name: 'echarts' }
	]
}, {
	path: '/',
	component: Home,
	name: '人员管理',
	iconCls: 'fa fa-user-plus',
	leaf: false, 
	children: [{
		path: 'admin',
		component: Admin,
		hidden: true,
		name: '系统管理员'
	}, {
		path: 'worker',
		component: Workers,
		name: '机器人操作员'
	},]
},
{
	path: '/',
	component: Home,
	name: '随工监督',
	iconCls: 'fa fa-address-book', //图标样式class
	leaf: false,
	children: [{
		path: 'realTime',
		component: Super,
		name: '实时监控'
	},
	{
		path: 'supervision',
		component: Supervision,
		name: '工单监督',
		hidden: true,
	},
	{
		path: 'historyVideo',
		component: HistoryVideo,
		name: '历史视频'
	}
	]
},
{
	path: '*',
	redirect: '/login',
	hidden: true
}
]

const router = new VueRouter({
    mode: 'history',
	routes: routes,
})
/*
 * 创建的 router 对象中，如果不配置 mode，就会使用默认的 hash 模式，该模式下会将路径格式化为 #! 开头。
 * 添加 mode: 'history' 之后将使用 HTML5 history 模式，该模式下没有 # 前缀，而且可以使用 pushState 和 replaceState 来管理记录。
 */

router.beforeEach((to, from, next) => {
	NProgress.start();
	if (to.path == "/login" || to.path == "/reset") {
		next();
	} else {
		if (!store.state.user) {
			next({
				path: "/login"
			})
		} else {
			next();
		}
	}
})

router.afterEach(transition => {
	NProgress.done();
});

var app = new Vue({
	el: '#app',
	template: '<App/>',
	router,
	store,
	components: {
		App
	}
	//render: h => h(Login)
}).$mount('#app')

Vue.http.interceptors.push((request, next) => {
	if (request.method === "JSONP") {
		if (store.state.user && store.state.user.account !== "admin") {
			request.params.adminId = store.state.user.adminId;
			request.params.customId = store.state.user.customId;
		}
	}
	next((res) => {
		if (request.msg) {
			let detail = store.state.user ? `${store.state.user.account}${request.msg}` : `${request.msg}`;
			sendLogs(app, detail)
		}
		return res
	});
});



//router.replace('/login')