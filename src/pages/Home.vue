<template>
	<el-row class="panel">
		<el-col :span="24" class="panel-top">
			<el-col :span="18" class="title">
				<img src="../assets/logo5.png" class="logo"> <span>{{customer+"巡检"}}</span><i style="color:#20a0ff">&nbsp;管理系统&nbsp;</i>
			</el-col>
			<el-col :span="6" class="panel-right">
				<router-link to="/dashboard" class="banners">
					<i class="fa fa-home">&nbsp;首页</i>
				</router-link>
				<router-link to="/reset" class="banners">
					<i class="fa fa-pencil">&nbsp;密码修改</i>
				</router-link>
				<i class="fa fa-sign-out banners" aria-hidden="true" v-on:click="logout">&nbsp;退出登录</i>
			</el-col>
		</el-col>
		<el-col :span="24" class="panel-center">
			<aside class="panel-c-t">
				<h5 class="admin"><i class="fa fa-user" aria-hidden="true" style="margin-right:5px;"></i>欢迎您: {{user}}</h5>
				<el-menu style="border-top: 1px solid #475669;" text-color="#c0ccda" active-text-color="rgb(32, 160, 255)" :default-active="currentPath" class="el-menu-vertical-demo" @open="handleopen" @close="handleclose" @select="handleselect" theme="dark" unique-opened router>
					<template v-for="(item,index) in $router.options.routes" v-if="!item.hidden">
						<!--查找路由配置$router.options.routes-->
						<el-submenu :index="index+''" v-if="!item.leaf" :key="index">
							<template slot="title"><i :class="item.iconCls"></i>{{item.name}}</template>
							<el-menu-item v-for="child in item.children" :index="child.path" v-if="!child.hidden" :key="child.name">{{child.name}}</el-menu-item>
						</el-submenu>
						<!--只有一个节点的菜单-->
						<el-menu-item v-if="item.leaf&&item.children.length>0" :index="item.children[0].path" :key="index"><i :class="item.iconCls"></i>{{item.children[0].name}}</el-menu-item>
					</template>
				</el-menu>
			</aside>

			<section class="panel-c-c">
				<div :class="isDashboard?'bg-purple-light':''">
					<el-col :span="24" class="breadcrumb" v-if="isDashboard">
						<strong style="width:200px;float:left;color: #fff;">{{currentPathName}}</strong>
						<el-breadcrumb separator="/" style="float:right;">
							<el-breadcrumb-item :to="{ path:'/dashboard' }">首页</el-breadcrumb-item>
							<el-breadcrumb-item v-if="currentPathNameParent!=''">{{currentPathNameParent}}</el-breadcrumb-item>
							<el-breadcrumb-item v-if="currentPathName!=''">{{currentPathName}}</el-breadcrumb-item>
						</el-breadcrumb>
					</el-col>
					<el-col :span="24" style="box-sizing: border-box;">
						<transition name="fadeIn">
							<router-view></router-view>
						</transition>
					</el-col>
					<!--<el-col :span="24">
						梧斯源科技 客服热线 0571-88483380-806-->
					<!--</el-col>-->
				</div>
			</section>
			<!--</el-col>-->
		</el-col>
	</el-row>
</template>

<script>
export default {
  data() {
    return {
      currentPath: "/dashboard",
      isDashboard: false,
      currentPathName: "",
      currentPathNameParent: "",
      customer: "",
      isCollapse: true,
      form: {
        name: "",
        region: "",
        date1: "",
        date2: "",
        delivery: false,
        type: [],
        resource: "",
        desc: ""
      }
    };
  },
  watch: {
    $route(to, from) {
      //监听路由改变
      this.currentPath = to.path;
      (this.isDashboard = to.path === "/dashboard" ? false : true),
        (this.currentPathName = to.name);
      this.currentPathNameParent = to.matched[0].name;
    }
  },
  created: function() {
    // var username = localStorage.getItem("user");

    this.user = this.$store.state.user.account;
  },
  methods: {
    onSubmit() {
      //console.log('submit!');
    },
    handleopen() {
      //console.log('handleopen');
    },
    handleclose() {
      //console.log('handleclose');
    },
    handleselect: function(a, b) {},
    //退出登录
    logout: function() {
      var _this = this;
      this.$confirm("确认退出吗?", "提示", {
        //type: 'warning'
      })
        .then(() => {
          _this.$router.replace("/login");
        })
        .catch(() => {});
    }
  },
  mounted() {
    if (this.$store.state.user.customName) {
      this.customer = this.$store.state.user.customName;
    }
    this.currentPath = this.$route.fullPath;
    this.currentPathName = this.$route.name;
    this.currentPathNameParent = this.$route.matched[0].name;
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}

.panel {
  position: absolute;
  top: 0px;
  bottom: 0px;
  width: 100%;
  height: 95%;
}

.title span {
  background-image: -webkit-gradient(
    linear,
    0 0,
    right 0,
    from(#40e4d5),
    to(#008aff)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 26px;
  font-weight: bold;
}
.breadcrumb {
  padding: 11px;
  margin-bottom: 15px;
  border: 1px solid rgba(250,250,250,0.15);
  background: #2178f1 linear-gradient(90deg, #2178f1 0%, #2178f1 0%, #20b6f9 100%, #20b6f9 100%);
}

.panel-top {
  height: 60px;
  line-height: 60px;
  background: #090635;
  color: #c0ccda;
}

.panel-right {
  text-align: right;
}

.banners {
  margin-right: 25px;
  margin-top: 36px;
  color: #a6b4c9;
  cursor: pointer;
}

.panel-center {
  position: absolute;
  top: 60px;
  bottom: 0px;
  height: 95%;
  overflow-y: auto;
}

.panel-c-t {
  float: left;
  width: 230px;
}

.panel-c-c {
  background:url(../assets/blue.jpg);
  background-size: cover;
  margin-left: 230px;
}

.bg-purple-light {
  padding: 20px;
  min-height: 90vh;
}

.bg-purple-light:after {
  content: ".";
  display: block;
  height: 0;
  clear: both;
  visibility: hidden;
}

.logo {
  width: 40px;
  float: left;
  margin: 20px 10px 20px 38px;
}

.admin {
  color: #c0ccda;
  text-align: center;
}

.link-type .link-type:focus {
  color: #337ab7;
  cursor: pointer;
}

@-webkit-keyframes fadeInRight {
  0% {
    opacity: 0;
    -webkit-transform: translateX(40px);
    transform: translateX(40px);
  }
  100% {
    opacity: 1;
    -webkit-transform: translateX(0);
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  0% {
    opacity: 0;
    -webkit-transform: translateX(40px);
    -ms-transform: translateX(40px);
    transform: translateX(40px);
  }
  100% {
    opacity: 1;
    -webkit-transform: translateX(0);
    -ms-transform: translateX(0);
    transform: translateX(0);
  }
}

.fadeIn-enter-active {
  animation: fadeInRight 1.5s;
}
</style>