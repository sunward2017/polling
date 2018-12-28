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

import vueResource from 'vue-Resource'
import VueLazyLoad from 'vue-lazyload'
import { sendLogs } from './api/personnel';
import {routes} from "./route";

Vue.use(VueLazyLoad, {
	error: './static/img/error.jpg',
	loading: './static/img/waiting.gif'
})

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(vueResource);
 


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