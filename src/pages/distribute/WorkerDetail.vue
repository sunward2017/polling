<template>
	<section>
		<div class="toolbar">
        <router-link :to="{path:'taskDetail'}" >
					<el-button type="text" icon="d-arrow-left" size="small">任务切换</el-button>
			  </router-link>
			   	&emsp;&emsp;当前任务:&emsp; {{taskName}} 
          &emsp;&emsp;
          <el-button @click.native="getCurrentTaskDetail" size="small" type="primary">刷新</el-button> 
		</div>
		<el-row :gutter="20">
			<el-col :span="6">
				<div class="working-box">video</div>
			</el-col>
			<el-col :span="6">
				<div class="working-box">locality</div>
			</el-col>
			<el-col :span="12">
				<div class="log-view">
           controller
				</div>
			</el-col>
		</el-row>
		<table width="100%" border="1" cellspacing="0" colspacing="0" class="table">
			<tr>
				<th>导航点</th>
				<th>指令名称</th>
				<th>指令类型</th>
				<th>执行情况</th>
				<th style="width:40%">执行结果</th>
			</tr>
			<template v-for="point in tableData">
        <tr v-for="(cmd,index) in point.details" :key="cmd.id">
            <td :rowspan="point.details.length" v-if="index<1">{{point.nvPointName}}</td>
            <td>{{cmd.commandInfo.commandName}}</td>
            <td><el-tag :type="types[cmd.commandInfo.commandType+'']">{{formatType(cmd.commandInfo.commandType)}}</el-tag></td>
            <td><el-tag :type="types[+cmd.commandStatus+1+'']">{{formatStatus(cmd.commandStatus)}}</el-tag></td>
            <td>
              <el-button v-if="cmd.fileInfo&&cmd.fileInfo.fileUrl&&cmd.fileInfo.fileType===3" type="info" size="small" @click="showImg(cmd.fileInfo.fileUrl,'原始图')">原始图</el-button>&emsp;
              <el-button v-if="cmd.fileInfo&&cmd.fileInfo.detectResultUrl" type="warning" size="small" @click="showImg(cmd.fileInfo.detectResultUrl,'识别图')">识别图</el-button>
              <el-button v-if="cmd.fileInfo&&cmd.fileInfo.fileUrl&&cmd.fileInfo.fileType===1" type="primary" size="small" @click="play(cmd.fileInfo.fileUrl)">播放视频</el-button>&emsp;
            </td>
			  </tr>
			</template>
		</table>
    <el-dialog :title="bigImgTitle" v-model="bigImgVisible" style="text-align: center;" :size="dialogSize">
			<img :src="currentUrl" alt="异常图片,无法识别" width="100%" @click="changeSize()" ref='img'/>
		</el-dialog>
    <el-dialog :title="videoTitle" v-model="videoVisible" style="text-align: center;">
			  <video id="video_1" class="video-js vjs-default-skin" controls>
          <source :src="videoUrl" type="video/mp4">
           Your browser does not support the video tag.
       </video>
		</el-dialog>
	</section>
</template>
<script>
import { currentTaskDetail } from "api/results";
import { TASKEXECTYPES, CMDTYPES, CMDSTATUS} from "@/const";
import { baseImgUrl } from 'api/api';
import videoJs from 'video.js'
import 'video.js/dist/video-js.min.css'

export default {
  name: "",
  data() {
    return {
      taskName: '',
      tableData: [],
      types:CMDSTATUS,
      bigImgTitle:'原始图',
      bigImgVisible:false,
      dialogSize:'small',
      currentUrl:'',
      videoTitle:"视频播放",
      videoVisible:false,
      videoUrl:'',
      taskId:'',
    };
  },
  methods: {
    getCurrentTaskDetail() {
      let _this = this,taskId = this.taskId;
      currentTaskDetail(_this, { taskId }).then(res => {
          _this.taskName = this.$route.query.taskName;   
        if (res.data.result === 200) {
          _this.tableData = res.data.data;
        } else {
          _this.tableData = [];
          _this.$message.error("获取任务详情失败");
        }
      });
    },
    formatType(type) {
      return CMDTYPES.find(i=>(i.value==type)).label;
    },
    formatStatus(type) {
      return TASKEXECTYPES[type + ""];
    },
    showImg(url,type){
        this.dialogSize ='small';
        this.bigImgTitle = type;
        this.currentUrl = baseImgUrl+url; 
        this.bigImgVisible = true;
    },
    changeSize(){
			this.dialogSize=this.dialogSize==="small"?'full':'small'; 
    },
    play(url){
      this.videoUrl = url;
      this.videoVisible = true;
      this.$nextTick(()=>{
          var player = videoJs('video_1',{
              autoplay : true,
              loop : false,
              muted : false,
              preload:true,
          })
      }) 
    }
  },
  mounted() {
    this.taskId = this.$route.query.taskId;
    this.getCurrentTaskDetail();
  }
};
</script>
<style>
.working-box {
  width: 100%;
  height: 300px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
}
.log-view {
  width: 100%;
  height: 300px;
  background-color: #000;
  color:chartreuse
}
.table {
  color: #fff;
  background: rgba(0, 0, 0, 0.35);
  border: none;
}
.table td,
.table th {
  border-color: rgba(250, 250, 250, 0.35);
  text-align: center;
  line-height: 34px;
  font-size: 14px;
}
</style>