<template>
	<div id="app">
		<!--<transition name="bounce">-->
		<router-view></router-view>
		<!--</transition>-->
	</div>
</template>

<script>
	export default {
		name: 'app',
		components: {},
		//		created: function () {
		//			this.$router.replace('/login')
		//		}
	}
</script>

<style>
	@import "../node_modules/font-awesome/css/font-awesome.min.css";
	@import "../node_modules/flex.css/dist/flex.css";
	.bounce-enter-active {
		animation: bounce-in .5s;
	}
	
	.bounce-leave-active {
		animation: bounce-out .2s;
	}
	
	@keyframes bounce-in {
		0% {
			transform: scale(0);
		}
		50% {
			transform: scale(1.15);
		}
		100% {
			transform: scale(1);
		}
	}
	
	@keyframes bounce-out {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(0.75);
		}
		100% {
			transform: scale(0);
		}
	}
	
	.fade-enter-active,
	.fade-leave-active {
		transition: opacity .5s
	}
	
	.fade-enter,
	.fade-leave-active {
		opacity: 0
	}
	
	body {
		background: #09192a;
		margin: 0;
		padding: 0;
		font-family:"微软雅黑",'宋体', Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, SimSun, sans-serif;
		font-weight: 400;
		-webkit-font-smoothing: antialiased;
		overflow: hidden;
	}
	
	#app { 
		 position:absolute;
		 top:0;
		 right:0;
		 left:0;
		 bottom:0;
	}
	
	.el-submenu [class^=fa] {
		vertical-align: baseline;
		margin-right: 10px;
	}
	
	.el-menu-item [class^=fa] {
		vertical-align: baseline;
		margin-right: 10px;
	}
	
	.toolbar .el-form-item {
		margin-bottom: 10px;
	}
	
	.toolbar {
		color:#fff;
		padding: 15px 0 10px 10px;
		background:rgba(0,0,0,.35);
		border: 1px solid rgba(250,250,250,0.35);
		border-radius: 4px;
		-webkit-box-shadow: 0 1px 1px rgba(0, 0, 0, .05);
		box-shadow: 0 1px 1px rgba(0, 0, 0, .05);
		overflow: hidden;
		margin-bottom: 20px;
	}
</style>