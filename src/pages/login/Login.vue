<template>
<div class="l-bg">
  <div class="tyg-div">
	<ul>
    	<li>让</li>
    	<li><div style="margin-left:20px;">智</div></li>
    	<li><div style="margin-left:40px;">能</div></li>
    	<li><div style="margin-left:60px;">改</div></li>
    	<li><div style="margin-left:80px;">变</div></li>
    	<li><div style="margin-left:100px;">生</div></li>
    	<li><div style="margin-left:120px;">活</div></li>
    </ul>
</div> 
<div id="contPar" class="contPar">
	<div id="page1"  style="z-index:1;">
		<div class="title0">机器人自动巡检平台</div>
 
		<div class="imgGroug">
			<ul>
				<img alt="" class="img0 png" src="../../assets/page1_0.png">
				<img alt="" class="img1 png" src="../../assets/page1_1.png">
				<img alt="" class="img2 png" src="../../assets/page1_2.png">
			</ul>
		</div>
		<img alt="" class="img3 png" src="../../assets/page1_3.jpg">
	</div>
</div>
  <el-form :model="ruleForm2" :rules="rules2" ref="ruleForm2" label-position="top" label-width="0px" class="demo-ruleForm card-box loginform">
    <h2 class="title">欢迎登录</h2>
    <el-form-item prop="account">
      <el-input type="text" v-model="ruleForm2.account" auto-complete="off" placeholder="请输入账号" refs="account"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input type="password" v-model="ruleForm2.password" auto-complete="off" placeholder="请输入密码" refs="account" @keyup.enter="handleSubmit2"></el-input>
    </el-form-item>
    
    <el-form-item style="text-align:center">
       <el-button class="loginBtn" @click.native.prevent="handleSubmit2" :loading="logining">登录</el-button>
    </el-form-item>
   </el-form>
</div>   
</template>

<script>
import { mapGetters } from "vuex";
// import { isWscnEmail } from 'utils/validate';
import NProgress from "nprogress";
import { loginByAccount } from "api/login";

export default {
  data() {
    //初始化表单数据
    const validateEmail = (rule, str, callback) => {
      let value = str.replace(/^\s*$/g, "");
      if (value == "") {
        callback(new Error("请输入用户名"));
      } else {
        callback();
      }
    };
    const validatePass = (rule, str, callback) => {
      let value = str.replace(/^\s*$/g, "");
      if (value == "") {
        callback(new Error("密码不能为空"));
      } else {
        callback();
      }
    };
    const customId = (rule, str, callback) => {
      let value = str.replace(/^\s*$/g, "");
      if (value == "") {
        callback(new Error("机构不能为空"));
      } else {
        callback();
      }
    };

    return {
      logining: false,
      cusLoading: false,
      ruleForm2: {
        account: "",
        password: ""
      },
      rules2: {
        //绑定验证规则
        account: [
          { required: true, trigger: "blur", validator: validateEmail }
          //{ validator: validaePass }
        ],
        password: [
          { required: true, trigger: "blur", validator: validatePass }
          //{ validator: validaePass2 }
        ]
      },
      checked: true,
      options: ""
    };
  },
  computed: {
    ...mapGetters(["auth_type"])
  },
  methods: {
    handleReset2() {
      this.$refs.ruleForm2.resetFields();
    },
    handleSubmit2(ev) {
      var _this = this;
      this.$refs.ruleForm2.validate(valid => {
        if (valid) {
          //验证通过
          this.logining = true;
          NProgress.start();
          let _this = this;
          loginByAccount(
            _this,
            _this.ruleForm2,
            `${_this.ruleForm2.account}登录系统`
          ).then(res => {
            //请求登录 获取数据
            this.logining = false;
            NProgress.done();
            let { statusText, status, body } = res;
            if (body.result == 200) {
              // localStorage.setItem('user', _this.ruleForm2.account);//本地保存用户名
              // localStorage.setItem('pwd',_this.ruleForm2.password);
              this.$store.dispatch("setAccount", body.data);
              if (this.$route.query.redirect) {
                this.$router.push({ path: this.$route.query.redirect }); //指定路由；
              } else {
                this.$router.options.routes[8].children[0].hidden =
                  this.ruleForm2.account === "admin" ? false : true;
                this.$router.options.routes[9].children[1].hidden =
                  res.data.data.customId === "a6a4b85d74d44341bfd53265521248a5"
                    ? false
                    : true;
                this.$router.push({ path: "/" });
              }
            } else {
              this.$notify({
                title: "错误",
                message: "用户名或密码不对，请重新登录",
                type: "error"
              });
            }
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    }
  },
  mounted() {
    this.$store.state.user = "";
    let _this = this;
    this.$nextTick(function() {
      document.onkeydown = function(e) {
        var ev = e || window.event;
        if (ev.keyCode === 13&&_this.$route.path==='/login') {
          _this.handleSubmit2();
        }
      };
    });
  }
};
</script>

<style lang="less">
.l-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #191c2c;
}

/******************************/
.tyg-div {
  float: left;
  position: absolute;
  left: 5%;
  top: 20%;
}
.tyg-div > ul > li {
  font-size: 30px;
  color: #2ec0f6;
}
li {
  list-style-type: none;
}
img {
  border: none;
}

#page1 .imgGroug {
  width: 170px;
  height: 170px;
  margin: -126px 0 0 -85px;
}
#page1 .imgGroug,
#page1 .img0,
#page1 .img1,
#page1 .img2,
.title0,
.title1 {
  position: absolute;
  top: 50%;
  left: 50%;
}

#page1 .img0,
#page1 .img1,
#page1 .img2,
#page1 .img3,
#page2 .imgGroug,
#page3 .img0,
#page3 .img1,
.btn,
.title0,
.title1 {
  transition: margin 0.5s ease, opacity 0.5s ease;
  -webkit-transition: margin 0.5s ease, opacity 0.5s ease;
  -moz-transition: margin 0.5s ease, opacity 0.5s ease;
  -o-transition: margin 0.5s ease, opacity 0.5s ease;
}
.title0,
.title1 {
  left: 0;
  width: 100%;
  text-align: center;
  color: #2ec0f6;
  font-size: 40px;
  height: 70px;
  line-height: 70px;
  margin: -300px 0 0 0;
  z-index: 1;
}
.title1 {
  color: #fff;
  font-size: 20px;
  height: 30px;
  line-height: 30px;
  margin: -230px 0 0 0;
}
#page1 .img0,
#page1 .img1,
#page1 .img2,
#page1 .imgGroug {
  z-index: 1;
}
#page1 .imgGroug {
  width: 170px;
  height: 170px;
  margin: -126px 0 0 -85px;
}
#page1 .imgGroug ul {
  width: 170px;
  height: 170px;
}
#page1 .img0,
#page1 .img1,
#page1 .img2 {
  margin: -85px 0 0 -85px;
  width: 100%;
  height: 100%;
}
#page1 .img0 {
  -webkit-transform: rotateY(240deg) translateZ(150px) scale(0.925);
  -moz-transform: rotateY(240deg) translateZ(150px) scale(0.925);
  -o-transform: rotateY(240deg) translateZ(150px) scale(0.925);
  transform: rotateY(240deg) translateZ(150px) scale(0.925);
  -webkit-animation: rotate_0 10s linear 0.5s infinite;
  -moz-animation: rotate_0 10s linear 0.5s infinite;
  -o-animation: rotate_0 10s linear 0.5s infinite;
  animation: rotate_0 10s linear 0.5s infinite;
}
#page1 .img1 {
  -webkit-transform: rotateY(0deg) translateZ(150px);
  -moz-transform: rotateY(0deg) translateZ(150px);
  -o-transform: rotateY(0deg) translateZ(150px);
  transform: rotateY(0deg) translateZ(150px);
  -webkit-animation: rotate_1 10s linear 0.5s infinite;
  -moz-animation: rotate_1 10s linear 0.5s infinite;
  -o-animation: rotate_1 10s linear 0.5s infinite;
  animation: rotate_1 10s linear 0.5s infinite;
}
#page1 .img2 {
  -webkit-transform: rotateY(120deg) translateZ(150px) scale(0.925);
  -moz-transform: rotateY(120deg) translateZ(150px) scale(0.925);
  -o-transform: rotateY(120deg) translateZ(150px) scale(0.925);
  transform: rotateY(120deg) translateZ(150px) scale(0.925);
  -webkit-animation: rotate_2 10s linear 0.5s infinite;
  -moz-animation: rotate_2 10s linear 0.5s infinite;
  -o-animation: rotate_2 10s linear 0.5s infinite;
  animation: rotate_2 10s linear 0.5s infinite;
}
@-webkit-keyframes rotate_0 {
  0% {
    -webkit-transform: rotateY(240deg) translateZ(150px) scale(0.85);
    z-index: 1;
  }
  12.4% {
    z-index: 1;
  }
  12.5% {
    -webkit-transform: rotateY(285deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  37.5% {
    -webkit-transform: rotateY(375deg) translateZ(150px) scale(1);
    z-index: 2;
  }
  62.5% {
    -webkit-transform: rotateY(465deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  62.6% {
    z-index: 1;
  }
  87.5% {
    -webkit-transform: rotateY(555deg) translateZ(150px) scale(0.8);
  }
  100% {
    -webkit-transform: rotateY(600deg) translateZ(150px) scale(0.85);
  }
}
@-moz-keyframes rotate_0 {
  0% {
    -moz-transform: rotateY(240deg) translateZ(150px) scale(0.85);
    z-index: 1;
  }
  12.4% {
    z-index: 1;
  }
  12.5% {
    -moz-transform: rotateY(285deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  37.5% {
    -moz-transform: rotateY(375deg) translateZ(150px) scale(1);
    z-index: 2;
  }
  62.5% {
    -moz-transform: rotateY(465deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  62.6% {
    z-index: 1;
  }
  87.5% {
    -moz-transform: rotateY(555deg) translateZ(150px) scale(0.8);
  }
  100% {
    -moz-transform: rotateY(600deg) translateZ(150px) scale(0.85);
  }
}
@-o-keyframes rotate_0 {
  0% {
    -o-transform: rotateY(240deg) translateZ(150px) scale(0.85);
    z-index: 1;
  }
  12.4% {
    z-index: 1;
  }
  12.5% {
    -o-transform: rotateY(285deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  37.5% {
    -o-transform: rotateY(375deg) translateZ(150px) scale(1);
    z-index: 2;
  }
  62.5% {
    -o-transform: rotateY(465deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  62.6% {
    z-index: 1;
  }
  87.5% {
    -o-transform: rotateY(555deg) translateZ(150px) scale(0.8);
  }
  100% {
    -o-transform: rotateY(600deg) translateZ(150px) scale(0.85);
  }
}
@keyframes rotate_0 {
  0% {
    transform: rotateY(240deg) translateZ(150px) scale(0.85);
    z-index: 1;
  }
  12.4% {
    z-index: 1;
  }
  12.5% {
    transform: rotateY(285deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  37.5% {
    transform: rotateY(375deg) translateZ(150px) scale(1);
    z-index: 2;
  }
  62.5% {
    transform: rotateY(465deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  62.6% {
    z-index: 1;
  }
  87.5% {
    transform: rotateY(555deg) translateZ(150px) scale(0.8);
  }
  100% {
    transform: rotateY(600deg) translateZ(150px) scale(0.85);
  }
}
@-webkit-keyframes rotate_1 {
  0% {
    -webkit-transform: rotateY(0deg) translateZ(150px) scale(1);
    z-index: 2;
  }
  25% {
    -webkit-transform: rotateY(90deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  25.1% {
    -webkit-transform: rotateY(91deg) translateZ(150px) scale(0.9);
    z-index: 1;
  }
  50% {
    -webkit-transform: rotateY(180deg) translateZ(150px) scale(0.8);
  }
  74.9% {
    -webkit-transform: rotateY(269deg) translateZ(150px) scale(0.9);
    z-index: 1;
  }
  75% {
    -webkit-transform: rotateY(270deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  100% {
    -webkit-transform: rotateY(360deg) translateZ(150px) scale(1);
    z-index: 2;
  }
}
@-moz-keyframes rotate_1 {
  0% {
    -moz-transform: rotateY(0deg) translateZ(150px) scale(1);
    z-index: 2;
  }
  25% {
    -moz-transform: rotateY(90deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  25.1% {
    -moz-transform: rotateY(91deg) translateZ(150px) scale(0.9);
    z-index: 1;
  }
  50% {
    -moz-transform: rotateY(180deg) translateZ(150px) scale(0.8);
  }
  74.9% {
    -moz-transform: rotateY(269deg) translateZ(150px) scale(0.9);
    z-index: 1;
  }
  75% {
    -moz-transform: rotateY(270deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  100% {
    -moz-transform: rotateY(360deg) translateZ(150px) scale(1);
    z-index: 2;
  }
}
@-o-keyframes rotate_1 {
  0% {
    -o-transform: rotateY(0deg) translateZ(150px) scale(1);
    z-index: 2;
  }
  25% {
    -o-transform: rotateY(90deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  25.1% {
    -o-transform: rotateY(91deg) translateZ(150px) scale(0.9);
    z-index: 1;
  }
  50% {
    -o-transform: rotateY(180deg) translateZ(150px) scale(0.8);
  }
  74.9% {
    -o-transform: rotateY(269deg) translateZ(150px) scale(0.9);
    z-index: 1;
  }
  75% {
    -o-transform: rotateY(270deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  100% {
    -o-transform: rotateY(360deg) translateZ(150px) scale(1);
    z-index: 2;
  }
}
@keyframes rotate_1 {
  0% {
    transform: rotateY(0deg) translateZ(150px) scale(1);
    z-index: 2;
  }
  25% {
    transform: rotateY(90deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  25.1% {
    transform: rotateY(91deg) translateZ(150px) scale(0.9);
    z-index: 1;
  }
  50% {
    transform: rotateY(180deg) translateZ(150px) scale(0.8);
  }
  74.9% {
    transform: rotateY(269deg) translateZ(150px) scale(0.9);
    z-index: 1;
  }
  75% {
    transform: rotateY(270deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  100% {
    transform: rotateY(360deg) translateZ(150px) scale(1);
    z-index: 2;
  }
}
@-webkit-keyframes rotate_2 {
  0% {
    -webkit-transform: rotateY(120deg) translateZ(150px) scale(0.85);
    z-index: 1;
  }
  12.5% {
    -webkit-transform: rotateY(165deg) translateZ(150px) scale(0.8);
  }
  37.4% {
    z-index: 1;
  }
  37.5% {
    -webkit-transform: rotateY(255deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  62.5% {
    -webkit-transform: rotateY(345deg) translateZ(150px) scale(1);
    z-index: 2;
  }
  87.5% {
    -webkit-transform: rotateY(435deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  100% {
    -webkit-transform: rotateY(480deg) translateZ(150px) scale(0.85);
    z-index: 1;
  }
}
@-moz-keyframes rotate_2 {
  0% {
    -moz-transform: rotateY(120deg) translateZ(150px) scale(0.85);
    z-index: 1;
  }
  12.5% {
    -moz-transform: rotateY(165deg) translateZ(150px) scale(0.8);
  }
  37.4% {
    z-index: 1;
  }
  37.5% {
    -moz-transform: rotateY(255deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  62.5% {
    -moz-transform: rotateY(345deg) translateZ(150px) scale(1);
    z-index: 2;
  }
  87.5% {
    -moz-transform: rotateY(435deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  100% {
    -moz-transform: rotateY(480deg) translateZ(150px) scale(0.85);
    z-index: 1;
  }
}
@-o-keyframes rotate_2 {
  0% {
    -o-transform: rotateY(120deg) translateZ(150px) scale(0.85);
    z-index: 1;
  }
  12.5% {
    -o-transform: rotateY(165deg) translateZ(150px) scale(0.8);
  }
  37.4% {
    z-index: 1;
  }
  37.5% {
    -o-transform: rotateY(255deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  62.5% {
    -o-transform: rotateY(345deg) translateZ(150px) scale(1);
    z-index: 2;
  }
  87.5% {
    -o-transform: rotateY(435deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  100% {
    -o-transform: rotateY(480deg) translateZ(150px) scale(0.85);
    z-index: 1;
  }
}
@keyframes rotate_2 {
  0% {
    transform: rotateY(120deg) translateZ(150px) scale(0.85);
    z-index: 1;
  }
  12.5% {
    transform: rotateY(165deg) translateZ(150px) scale(0.8);
  }
  37.4% {
    z-index: 1;
  }
  37.5% {
    transform: rotateY(255deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  62.5% {
    transform: rotateY(345deg) translateZ(150px) scale(1);
    z-index: 2;
  }
  87.5% {
    transform: rotateY(435deg) translateZ(150px) scale(0.9);
    z-index: 2;
  }
  100% {
    transform: rotateY(480deg) translateZ(150px) scale(0.85);
    z-index: 1;
  }
}
#page1.cont_0 .img0 {
  margin: -316px 0 0 -258px;
  opacity: 0;
}
#page1.cont_2 .img0 {
  margin: 284px 0 0 -258px;
  opacity: 0;
}
#page1.cont_0 .img1 {
  margin: -413px 0 0 -85px;
  opacity: 0;
}
#page1.cont_2 .img1 {
  margin: 330px 0 0 -85px;
  opacity: 0;
}
#page1.cont_0 .img2 {
  margin: -316px 0 0 91px;
  opacity: 0;
}
#page1.cont_2 .img2 {
  margin: 284px 0 0 91px;
  opacity: 0;
}
#page1 .img3 {
  position: absolute;
  left: 50%;
  top: 50%;
  margin: -410px 0 0 -352px;
}

/*********************************/

.card-box {
  padding: 20px;
  /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
  -webkit-border-radius: 2px;
  border-radius: 2px;
  background: #23305a;
  -moz-border-radius: 2px;
  background-clip: padding-box;
  border-bottom: 8px solid #2ec0f6;
  border-radius: 30px 30px 40px 40px;
  position: absolute;
  top: 20%;
  right: 10%;
  color: #2ec0f6;
}

.title {
  margin: 0px auto 40px auto;
  text-align: center;
  font-weight: 400;
}

.loginform {
  width: 260px;
  padding: 35px 35px 15px 35px;
}
.custom-theme .el-form-item__content .loginBtn {
  cursor: pointer;
  width: 270px;
  height: 40px;
  margin-top: 25px;
  padding: 0;
  background: #2ec0f6;
  -moz-border-radius: 6px;
  -webkit-border-radius: 6px;
  border-radius: 6px;
  border: 1px solid #2ec0f6;
  -moz-box-shadow: 0 15px 30px 0 rgba(255, 255, 255, 0.25) inset,
    0 2px 7px 0 rgba(0, 0, 0, 0.2);
  -webkit-box-shadow: 0 15px 30px 0 rgba(255, 255, 255, 0.25) inset,
    0 2px 7px 0 rgba(0, 0, 0, 0.2);
  box-shadow: 0 15px 30px 0 rgba(255, 255, 255, 0.25) inset,
    0 2px 7px 0 rgba(0, 0, 0, 0.2);
  font-family: "PT Sans", Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  -o-transition: all 0.2s;
  -moz-transition: all 0.2s;
  -webkit-transition: all 0.2s;
}
</style>