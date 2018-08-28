<template>
   <el-upload
    drag
    :action="uploadUrl"
    :before-upload ="handlePreview"
    :on-success="handleSuccess"
    :on-error="handleError"
    ref="upload"
    >
    <i class="el-icon-upload"></i>
    <div class="el-upload_text">将文件拖到此处，或<em>点击上传</em></div>
    <div class="el-upload_tip" slot="tip">只能上传XLS或XLSX文件</div>
  </el-upload>
     
</template>  
<script>
  import baseUrl from "../../api/api";
  import {comfirmUp} from '../../api/template'

  export default {
  	name:'Upload',
    data() {
      return {
        fileList: [],
        baseUrl:baseUrl,
        isUpload:false,
      };
    },
    methods: {
      handlePreview(file){
            var strRegex = "(.XLS|.XLSX)$"; 
            var reg=new RegExp(strRegex);
            if(reg.test(file.name.toUpperCase())){
               return true;
            }else{
              this.$notify.info({
                title: '提示',
                message: '文件格式不正确',
                duration:2000,
                offset: 300
              });
              return false;
            }

      },
      handleSuccess(response, file, fileList){
        let _this = this;
      	if(response.message){
      		var param={};
            this.$confirm( response.message+'！你确认要覆盖吗？', '提示', {
				type: 'warning'
		    }).then(() => {
                param={
                	flag:'true'
                }
                _this.comfirmMsg(param)
                this.isUpload= true;
		    }).catch(()=>{
                param={
                	flag:'false'
                }
                _this.comfirmMsg(param)
		    })
		   
      	}else{
      		this.isUpload= true;
            param={
                flag:'true'
            }
            _this.comfirmMsg(param) 
      	}
      },
      handleError(e,file,fileList){
          this.$notify.error({
            title: '失败',
            message: '文件上传失败',
            duration:2000,
            offset: 300
          });
      },
      comfirmMsg(msg){
      	 let _this = this;
      	 this.$refs.upload.clearFiles();
         comfirmUp(_this,msg).then((res)=>{
         	if(this.isUpload){
	         	  this.$notify.success({
			            title: '成功',
			            message: res.body.message,
			            offset: 300
		          }); 
		          this.$emit("closeUp");
		          this.isUpload=false;       
         	}

         }).catch(()=>{

         }) 
      } 
    },
    computed:{
       uploadUrl:function(){
          return  this.baseUrl+'/checkDeviceExcelImport.action';
       }
    }
  }
</script>
<style scoped>
  .custom-theme .el-dialog__body>div{
     text-align: center;
  }
  .el-icon-upload{
    font-size: 67px;
    color: #97a8be;
    margin: 40px 0 16px;
    line-height: 50px;
  }
  .el-upload_text{
    color: #97a8be;
    font-size: 14px;
    text-align: center;
  }
  .el-upload_text em{
    color:#20a0ff;
    font-style:normal;
  }
  .el-upload_tip{
    font-size: 12px;
    color: #8391a5;
    margin-top: 7px;
  }
</style>
