<template>
  <el-form :model="ruleForm2" :rules="rules2" ref="ruleForm2" label-position="left" label-width="0px" class="demo-ruleForm card-box loginform">
    <h3 class="title">系统登录</h3>
    <el-form-item prop="account">
      <el-input type="text" v-model="ruleForm2.account" auto-complete="off" placeholder="账号" refs="account"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input type="password" v-model="ruleForm2.password" auto-complete="off" placeholder="密码" refs="account"></el-input>
    </el-form-item>
    <!-- <el-checkbox v-model="checked" checked style="margin:0px 0px 35px 0px;">记住密码</el-checkbox> -->
<el-form-item style="width:100%;">
<el-button type="primary" style="width:100%;" @click.native.prevent="handleSubmit2" :loading="logining">登录</el-button>
<!--<el-button @click.native.prevent="handleReset2">重置</el-button>-->
</el-form-item>
</el-form>
</template>

<script>
  import { mapGetters } from 'vuex';
  // import { isWscnEmail } from 'utils/validate';
  import NProgress from 'nprogress';
  import { loginByAccount } from 'api/login';


  export default {
    data() {//初始化表单数据
      const validateEmail = (rule, str, callback) => {
          let value = str.replace(/^\s*$/g,'') 
          if (value=='') {
            callback(new Error('请输入用户名'));
          } else {
            callback();
          }
        };
      const validatePass = (rule, str, callback) => {
          let value = str.replace(/^\s*$/g,'') 
          if (value=="") {
            callback(new Error('密码不能为空'));
          } else {
            callback();
          }
        };
      const customId = (rule, str, callback) => {
         let value = str.replace(/^\s*$/g,'') 
          if(value==""){
            callback(new Error('机构不能为空'));
          }else{
            callback();
          }

      }

      return {
        logining: false,
        cusLoading: false,
        ruleForm2: {
          account: '',
          password: ''
        },
        rules2: {//绑定验证规则 
          account: [
            { required: true, trigger: 'blur', validator: validateEmail},
            //{ validator: validaePass }
          ],
          password: [
            { required: true, trigger: 'blur',validator: validatePass},
            //{ validator: validaePass2 }
          ]
          
        },
        checked: true,
        options:""
      };
    },
    computed: {
        ...mapGetters([
          'auth_type'
        ])
      },
    methods: {
      
      handleReset2() {
        this.$refs.ruleForm2.resetFields();
      },
      handleSubmit2(ev) {
        var _this = this;
        this.$refs.ruleForm2.validate((valid) => {
          if (valid) {//验证通过
            this.logining = true;
            NProgress.start(); 
            let _this = this;
            loginByAccount(_this,_this.ruleForm2,`${_this.ruleForm2.account}登录系统`).then(res => {//请求登录 获取数据
              this.logining = false;
              NProgress.done();
              let { statusText, status, body} = res;
              if (body.result==200) {
//                  localStorage.setItem('user', _this.ruleForm2.account);//本地保存用户名
                    // localStorage.setItem('pwd',_this.ruleForm2.password); 
                    this.$store.dispatch('setAccount',body.data);
                    if (this.$route.query.redirect) {
                      this.$router.push({ path: this.$route.query.redirect });//指定路由；
                    } else {
                      this.$router.options.routes[8].children[0].hidden = this.ruleForm2.account==="admin"?false:true;
                      this.$router.options.routes[9].children[1].hidden = res.data.data.customId==="a6a4b85d74d44341bfd53265521248a5"?false:true;
                      this.$router.push({ path: '/' });
                   }
              } else {
                this.$notify({
                  title: '错误',
                  message: "用户名或密码不对，请重新登录",
                  type: 'error'
                });
              }
            });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      }
    },
    mounted(){
      this.$store.state.user ="";
      let _this = this;
      this.$nextTick(function(){
          document.onkeydown= function(e){
            var ev = e || window.event;
            if (ev.keyCode === 13) {
              _this.handleSubmit2();
            }
          }
      })
    }
  }
</script>

<style scoped>
  .card-box {
    padding: 20px;
    /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
    -webkit-border-radius: 5px;
    border-radius: 5px;
    -moz-border-radius: 5px;
    background-clip: padding-box;
    margin-bottom: 20px;
    background-color: #F9FAFC;
    margin: 180px auto;
    width: 400px;
    border: 2px solid #8492A6;
  }
  
  .title {
    margin: 0px auto 40px auto;
    text-align: center;
    color: #505458;
  }
  
  .loginform {
    width: 350px;
    padding: 35px 35px 15px 35px;
  }
</style>