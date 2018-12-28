<template>
	<section>
		<el-col :span="24" class="toolbar">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-select style="width:90%"  v-model="filters.roomId">
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
          <el-select v-model="filters.taskStatus" placeholder="请选择任务状态" style="width:150px;" clearable>
            <el-option label="未执行"  value="0"></el-option>
            <el-option label="执行中"  value="1"></el-option>
            <el-option label="执行完毕"  value="2"></el-option>
            <el-option label="执行中断"  value="4"></el-option>
          </el-select> 	
        </el-form-item>
				<el-form-item>
					<el-button icon="refreash" type="primary" @click="getTaskByRoom">查询</el-button>
				</el-form-item>
				<el-form-item>
					<!-- <el-button icon="edit" type="primary" @click="handlerAdd">临时任务</el-button> -->
				</el-form-item>
			</el-form>
		</el-col>
		<template>
			<el-table :data="rows" highlight-current-row v-loading="listLoading">
				<el-table-column type="index" width="60" label="#" align="center">
				</el-table-column>
				<el-table-column prop="roomId" label="巡检机房" width="160" :formatter="formatterRoom">
				</el-table-column>
				<el-table-column prop="taskName" label="任务名称" align="center" width="200">
				</el-table-column>
				<el-table-column prop="status" label="执行状态" align="center" width="120">
					<template scope="scope">
						<el-tag :type="cmdStatus[+scope.row.taskStatus+1+'']">{{formatStatus(scope.row)}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="robotId" label="巡检机器人" align="center" :formatter="formatterRobot" min-width="200">
				</el-table-column>
				<!-- <el-table-column prop="startTime" label="开始时间"  width="200"  align="center" sortable :formatter="formatTimeSction">
				</el-table-column> -->
				<el-table-column prop="creatTime"  label="开始时间" min-width="200" align="center" :formatter="formatCTime">
				</el-table-column>
        <el-table-column prop="active" label="任务状态" align="center" width="100">
					<template scope="scope">
						<el-tag :type="scope.row.active?'success':'danger'">{{scope.row.active?" 可执行 ":" 挂起 "}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="status" label="操作" align="center" width="300">
          <template scope="scope">
					  <router-link :to="{path:'workerDetail',query:{taskId:scope.row.taskId,taskName:scope.row.taskName}}" >
					     <el-button type="info" size="small">执行详情</el-button>
				      </router-link>
					  <el-button type="warning" icon="delete" size="small" @click="handleStop(scope.row)">终止任务</el-button>
					</template>
				</el-table-column>
			</el-table>
		</template>
    <!--分页-->
		<el-col :span="24" class="toolbar" style="padding-bottom:10px;">
			<el-pagination layout="prev, pager, next,total,sizes,jumper" @current-change="handleCurrentChange" :page-sizes="[10, 20, 30, 40]" :page-size="size" :current-page="page" :total="total" style="float:right;" @size-change="handleSizeChange">
			</el-pagination>
		</el-col>
	</section>
</template>

<script>
import NProgress from "nprogress";
import { parseTime} from "utils";
import { getRobotList } from "api/robot";
import {
  currentTask,
  cmdListByRoom,
  updateTaskCurrent
} from "api/results";
import { getRoomDetail, roadwayList } from "api/room";
import { TASKEXECTYPES, CMDTYPES,CMDSTATUS } from "@/const";

export default {
  data() {
    return {
      filters: {
        roomId: "",
        roomName: "",
        startTime:'',
        taskStatus:''
      },
      robotList: [],
      roomRobots: [],
      rows: [],
      rooms: [],
      listLoading: false,
      cmdStatus:CMDSTATUS,
      total: 0,
			page: 1,
			size: 10,
    };
  },
  methods: {
    handleCurrentChange(val) {
      this.page = val;
      this.getTaskByRoom();
    },
    handleSizeChange(size) {
      this.page = 1;
      this.size = size;
      this.getTaskByRoom();
    },
    getTaskByRoom() {
      let para = {
        page:this.page,
        roomId: this.filters.roomId,
        pageSize:this.size,
      };
      if(this.filters.taskStatus||this.filters.taskStatus==='0'){
        para.taskStatus = this.filters.taskStatus;
      }
      if(this.filters.startTime){
        para.starttime = parseTime(this.filters.startTime,"{y}-{m}-{d} {h}:{i}:{s}");
      }
      const currentroom = this.rooms.find(item => item.roomId === this.filters.roomId);
      this.robotList = currentroom.robotList;
      this.listLoading = true;
      NProgress.start();
      let self = this;
      currentTask(self, para).then(res => {
        if (res.data.data) {
          this.rows = res.data.data?res.data.data.list.filter(i=>(i.taskType!==2)):[];
          this.total = res.data.data.total
        } else {
          this.rows = [];
          this.total =0;
        }
        this.listLoading = false;
        NProgress.done();
      });
    }, 
    handleStop(r){
      let para = {taskId:r.taskId,taskStatus:'5'};
      let _this = this;
      updateTaskCurrent(_this,para).then(res=>{
        if (res.body.result == 200) {
          _this.$notify({
            title: "成功",
            message: "任务终止成功",
            type: "success"
          });
        } else {
          _this.$notify({
            title: "失败",
            message: "任务终止失败",
            type: "error"
          });
        }
        _this.getTaskByRoom()
      })
    },
    formatterRoom(r,c){
       return this.rooms.find(i=>(i.roomId==r.roomId)).roomName
    }, 
    formatterRobot(r, c) {
      const robot = this.robotList.find(item => r.robotId === item.robotId);
      return robot ? robot.robotName : r.robotId;
    },
    formatTimeSction(r, c) {
      return (
        parseTime(r.startTime)  
      );
    },
    formatStatus(r) {
      return TASKEXECTYPES[r.taskStatus];
    },
    formatCTime(r, c) {
      return parseTime(r.startTime)
    } 
  },
  mounted() {
    this.rooms = this.$store.state.rooms
    this.filters.roomId = this.$store.state.room;
    this.getTaskByRoom()
  }
};
</script>

<style>
.el-row {
  margin-bottom: 20px;
}
</style>