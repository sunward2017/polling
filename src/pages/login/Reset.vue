<template>
  <el-form :model="ruleForm2" :rules="rules2" ref="ruleForm2" label-position="left" label-width="100px" class="demo-ruleForm card-box loginform">
    <h3 class="title">密码修改</h3>
    <el-form-item prop="account" label="账号">
      <el-input type="text" v-model="ruleForm2.account" auto-complete="off" placeholder="账号"></el-input>
    </el-form-item>
    <el-form-item prop="oldPassword" label="原密码">
      <el-input type="password" v-model="ruleForm2.oldPassword" auto-complete="off" placeholder="原密码"></el-input>
    </el-form-item>
    <el-form-item prop="password" label="新密码">
       <el-input type="password" v-model="ruleForm2.password" auto-complete="off" placeholder="新密码"></el-input>
    </el-form-item>
    <el-form-item prop="password2" label="确认新密码">
       <el-input type="password" v-model="ruleForm2.password2" auto-complete="off" placeholder="确认新密码"></el-input>
    </el-form-item>
     
    <el-form-item style="width:100%;">
          <el-button type="primary"  @click.native.prevent="handleSubmit2" :loading="logining">{{curStatus}}</el-button>
          <el-button @click.native.prevent="handleReset2">重置</el-button>
    </el-form-item>
</el-form>
</template>

<script>
   
  // import { isWscnEmail } from 'utils/validate';
  import NProgress from 'nprogress';
  import { loginByAccount, resetPwd } from 'api/login';
 
  export default {
    data() {//初始化表单数
      const password2 = (rule, value, callback) => {
         var str = value.replace(/^\s*$/g,'') 
          if(str==""){
            callback(new Error('确认密码不能为空'));
          }else if(str!==this.ruleForm2.password){
             callback(new Error('新密码与确认新密码不一致'));
          }else{
            callback();
          }

      }

      return {
        logining: false,
        ruleForm2: {
          adminId: this.$store.state.user.adminId,
          customId: this.$store.state.user.customId,
          account: '',
          oldPassword: '',
          password: '',
          password2:'',
        },
        curStatus:"提交",
        
        rules2: {//绑定验证规则 
          account: [
            { required: true, trigger: 'blur', message: '请输入账号',}, 
          ],
           oldPassword: [
            { required: true, trigger: 'blur', message: '请输入密码',},
            //{ validator: validaePass2 }
          ],
          password: [
            { required: true, trigger: 'blur', message: '请输入密码',},
            //{ validator: validaePass2 }
          ],
          password2: [
            { required: true, trigger: 'blur',validator:password2},
            //{ validator: validaePass2 }
          ]
        },
        
      };
    },
    computed: {
        
      },
    methods: {
      handleReset2() {
        this.$refs.ruleForm2.resetFields();
      },
      handleSubmit2(ev) {
        var _this = this;
        this.$refs.ruleForm2.validate((valid) => {
          if (valid) {//验证通过
            //_this.$router.replace('/table');
            this.logining = true;
            this.curStatus ="提交中..."
            NProgress.start(); 
            let _this = this;  
             resetPwd(_this,_this.ruleForm2,`修改${_this.ruleForm2.account}密码`).then(res => {//请求登录 获取数据
              this.logining = false;
              this.curStatus="提交",
              NProgress.done();
              let { statusText, status, body} = res;
              if (body.result==200) {
                    // localStorage.setItem('user', JSON.stringify(body.data));//本地保存用户名
                      this.$router.push({ path: '/login' });
                      this.$notify({
                        title: '成功',
                        message: "请牢记你的新密码并重新登录",
                        type: 'success'
                      });
                    
              } else {
                this.$notify({
                  title: '错误',
                  message: body.message,
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