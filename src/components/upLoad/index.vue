<template>
   <el-upload
    drag
    :action="uploadUrl"
    :before-upload ="handlePreview"
    :on-success="handleSuccess"
    :on-error="handleError"
    >
    <i class="el-icon-upload"></i>
    <div class="el-upload_text">将文件拖到此处，或<em>点击上传</em></div>
    <div class="el-upload_tip" slot="tip">只能上传CD/OGG/MP3/ASF/WMA/WAV/MP3PRO/RM/REAL/APE/MODULE/MIDI/VQF文件</div>
  </el-upload>
     
</template>  
<script>
  import baseUrl from "../../api/api";

  export default {
    props:{
           deviceId:{
              type:String,
           }
    },
    data() {
      return {
        fileList: [],
        baseUrl:baseUrl,
      };
    },
    methods: {
      handlePreview(file){
            var strRegex = "(.CD|.OGG|.MP3|.ASF|.WMA|.WAV|.MP3PRO|.RM|.REAL|.APE|.MODULE|.MIDI|.VQF)$"; 
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
          this.$notify.success({
            title: '成功',
            message: '文件上传成功',
            duration:2000,
            offset: 300
          });
          fileList=[];
      },
      handleError(e,file,fileList){
          this.$notify.error({
            title: '失败',
            message: '文件上传失败',
            duration:2000,
            offset: 300
          });
      }
    },
    computed:{
       uploadUrl:function(){
          return  this.baseUrl+'/uploadAudio.action?deviceId='+this.deviceId;
       }
    }
  }
</script>
<style scoped>
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