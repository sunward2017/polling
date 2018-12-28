<template>
	<section >
		<el-form :inline="true" v-model="filters" class="toolbar">
			<el-form-item>
				<el-select v-model="filters.roomId" placeholder="请选择机房" @change="changeRoom">
					<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item >
				 <el-date-picker
					v-model="filters.startTime"
					type="datetime"
					placeholder="任务开始时间">
				</el-date-picker>
			</el-form-item>
			<el-form-item >
				<el-select v-model="filters.taskStatus" placeholder="请选择任务状态" style="width:150px;">
				   <el-option label="执行中"  value="1"></el-option>
				   <el-option label="执行完毕"  value="2"></el-option>
				   <el-option label="执行中断"  value="4"></el-option>
				</el-select> 	
			</el-form-item>
			<el-form-item>
				<el-button  type='primary'  icon="date" @click="getList">任务检索</el-button>
			</el-form-item>
			<el-form-item v-if="hasTask" label="当前任务">
				<el-tag type="info">{{filters.taskName}}</el-tag>
			</el-form-item>
			<el-form-item v-if="hasTask"> 
				<el-button type="primary" @click.native="handleTask">刷新</el-button>
			</el-form-item>
		</el-form>

		<el-row class="section">
			<div :class="item.detectResultUrl?'floor-item-content-wrap warn':'floor-item-content-wrap'" v-for="(item,index) in imgGather" :key="index" >
				<img class="floor-item-img" v-lazy="baseImgUrl+item.thumbnailUrl">
				<div>导航点:{{ item.nvPointInfo.nvPointName }}</div>
        <div class="floor-item-title">
         <span v-if="item.fileUrl"  @click="showBigImg(item.nvPointInfo.nvPointName,item.fileUrl)">大图&emsp;</span>
         <span v-if="item.detectResultUrl" @click="showBigImg(item.nvPointInfo.nvPointName,item.detectResultUrl)">识别图</span></div>
				<div>{{ formatTTime(item.timeStamp) }}</div>
			</div>
		</el-row>
		<el-dialog title="任务列表" :visible.sync="taskVisible" :close-on-click-modal="false">
			<el-table :data="taskGather" v-loading="listLoading" style="width: 100%" @row-click="setTask">
				<el-table-column prop="taskId" align="center" label="选项" width="70">
					<template scope="scope">
						<el-radio v-model="filters.taskId" :label="scope.row.taskId" @change='setTaskId(scope.row)'>{{''}}</el-radio>
					</template>	
				</el-table-column>
				<el-table-column prop="taskName" label="任务名称" width="300">
				</el-table-column>
				<el-table-column prop="startTime" label="巡检时间" :formatter="formatTime"  min-width="200" sortable>
				</el-table-column>
				<el-table-column  label="执行状态" align="center" width="120">
					<template scope="scope">
						<el-tag :type="cmdStatus[+scope.row.taskStatus+1+'']">{{formatStatus(scope.row)}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="totalDevices" label="巡检设备数"  min-width="80" align="center" >
				</el-table-column>
			</el-table>
			<el-col :span="24" class="toolbar" style="padding-bottom:10px;">
				<el-pagination layout="prev, pager, next,total,sizes,jumper" @current-change="handleCurrentChange" :page-sizes="[10, 20, 30, 40]" :page-size="size" :current-page="page" :total="total" style="float:right;" @size-change="handleSizeChange">
				</el-pagination>
			</el-col>
			<div slot="footer" class="dialog-footer">
				<el-button icon="success" type="primary" @click.native="handleTask">确定</el-button>
			</div>
		</el-dialog>
		<el-dialog :title="bigImgTitle" v-model="bigImgVisible" style="text-align: center;" :size="dialogSize">
			<img :src="currentUrl" alt="异常图片,无法识别" width="100%" @click="changeSize()"/>
		</el-dialog>
	</section>
</template>

<script>
import NProgress from "nprogress";
import { parseTime } from "utils";
import { currentTask, getTaskDetail } from "api/results";
import { baseImgUrl } from "api/api";
import { TASKEXECTYPES, CMDSTATUS } from "@/const";
import {mapState} from 'vuex';

export default {
  data() {
    return {
      filters: {
        roomId: "",
        taskId: "",
        taskName: "",
        startTime: "",
        taskStatus: "1"
      },
      baseImgUrl: baseImgUrl,
      taskVisible: false,
      taskGather: [],
      listLoading: false,
      total: 0,
      page: 1,
      size: 10,
      imgGather: [],
      bigImgTitle: "",
      bigImgVisible: false,
      dialogSize: "small",
      currentUrl: "",
      hasTask: false,
      cmdStatus: CMDSTATUS
    };
  },
  computed:{
     ...mapState(['rooms','room'])
  },
  methods: {
    formatTime(r, c) {
      return parseTime(r.startTime, "{y}-{m}-{d} {h}:{i}");
    },
    formatTTime(t) {
      return parseTime(t, "{y}-{m}-{d} {h}:{i}:{s}");
    },
    formatStatus(r) {
      return TASKEXECTYPES[r.taskStatus];
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getList();
    },
    handleSizeChange(size) {
      this.page = 1;
      this.size = size;
      this.getList();
    },
    changeRoom() {
      this.filters.taskId = "";
      (this.filters.taskName = ""), (this.hasTask = false);
    },
    getList() {
      let para = {
        page: this.page,
        pageSize: this.size,
        roomId: this.filters.roomId,
        taskStatus: this.filters.taskStatus
      };
      if (this.filters.startTime) {
        para.starttime = parseTime(this.filters.startTime,"{y}-{m}-{d} {h}:{i}:{s}");
      }
      this.listLoading = true;
      this.taskVisible = true;
      NProgress.start();
      let self = this;
      currentTask(self, para).then(res => {
        this.listLoading = false;
        NProgress.done();
        if (res.body.data && res.body.data.list) {
          this.taskGather = res.data.data.list;
          this.total = res.data.data.total;
        } else {
          this.taskGather = [];
          this.total = 0;
        }
      });
    },
    setTaskId(r) {
      this.filters.taskName = r.taskName;
    },
    handleTask() {
      if (this.filters.taskId === "") {
        this.$notify.info({
          title: "提示",
          message: "你真的不选任务吗？"
        });
        return;
      }
      this.taskVisible = false;
      this.hasTask = true;
      this.getResult();
    },
    setTask(row, e, c) {
      this.filters.taskId = row.taskId;
      this.filters.taskName = row.taskName;
    },
    getResult() {
      this.imgGather = [];
      let para = {
        taskId: this.filters.taskId,
        fileType:'3'
      };
      var self = this;
      getTaskDetail(self, para).then(res => {
        if (res.body.data) {
          this.imgGather = res.body.data
        }else{
          this.imgGather=[];
        }
      });
    },
    showBigImg(device, url) {
      NProgress.start();
      this.dialogSize = "small";
      let img = new Image(),
        _this = this;
      img.src = baseImgUrl + url;
      img.onload = () => {
        NProgress.done();
        _this.bigImgTitle = "设备名--" + device;
        _this.currentUrl = baseImgUrl + url;
        _this.bigImgVisible = true;
      };
    },
    changeSize() {
      this.dialogSize = this.dialogSize === "small" ? "full" : "small";
    }
  },
  mounted() {
     this.filters.roomId = this.room;
  }
};
</script>

<style scoped>
.floor-item-content-wrap {
  float: left;
  width: 16%;
  margin-right: 0.4%;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  font-size: 0.8rem;
}
.floor-item-content-wrap:hover {
  border: 1px solid #f00;
}

.section {
  min-height: 80vh;
  background: rgba(0, 0, 0, 0.15);
}
.floor-item-content-wrap > div {
  text-align: center;
  line-height: 22px;
  background: #ccc;
  font-weight: 600;
  font-family: Arial, Helvetica, sans-serif;
}
.floor-item-img {
  display: block;
  width: 100%;
  height: 150px;
}

.warn > div {
  background: yellow;
  color: #f00;
}
.floor-item-title > span {
  color: #012b65;
  cursor: pointer;
}
.floor-item-title,
.floor-item-time {
  height: 20px;
}
</style>