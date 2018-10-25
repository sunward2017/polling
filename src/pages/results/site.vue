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
				<el-button  type="primary" icon="date" @click="getList">任务检索</el-button>
			</el-form-item>
			<el-form-item v-if="hasTask" label="当前任务">
				<el-tag> {{filters.taskName}}</el-tag>
			</el-form-item>
			<el-form-item v-if="hasTask"> 
				<el-button type="info" icon="search" @click.native="handleTask">查询</el-button>
			</el-form-item>
		</el-form>
        <template>
			<el-table :data="gather" highlight-current-row  v-loading="siteLoading">
				<el-table-column type="index" width="80" label="序号" align="center">
				</el-table-column>
				 <el-table-column prop="position" label="测温点" width="200" align="center">
				</el-table-column>
				<el-table-column prop="description" label="测温点描述" align="center">
				</el-table-column>
				<el-table-column prop="fileUrl" label="图片详情" width="200" align="center" sortable>
					 <template scope="scope" >
						<el-button type="warning"  @click="showDetail(scope.row)" size="small">温度分布图</el-button>
					</template>
				</el-table-column>
				<el-table-column prop="uploadTime" label="上传时间" width="220" align="center" :formatter="formatUTime" sortable>
				</el-table-column>
			</el-table>
		</template>
		<el-dialog title="任务列表" :visible.sync="taskVisible" :close-on-click-modal="false">
			<el-table :data="taskGather" v-loading="listLoading" style="width: 100%" @row-click="setTask">
				<el-table-column prop="taskId" align="center" label="选项" width="100">
					<template scope="scope">
						<el-radio v-model="filters.taskId" :label="scope.row.taskId" @change='setTaskId(scope.row)'>{{&nbsp;}}</el-radio>
					</template>	
				</el-table-column>
				<el-table-column prop="taskName" label="任务名称" width="360">
				</el-table-column>
				<el-table-column prop="startTime" label="巡检时间" :formatter="formatTime"  min-width="120" sortable>
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
	import NProgress from 'nprogress';
	import { parseTime } from 'utils';
	import { currentTask, getTaskDetail } from 'api/results';
    import { Request, Response } from 'utils/Cipher';
	import { baseImgUrl } from 'api/api';
	import { TASKEXECTYPES, CMDSTATUS } from "@/const";
     
	export default {
		data() {
			return {
				filters: {
					roomId: '',
					taskId: '',
					taskName:'',
					startTime:'',
					taskStatus:'1',
				},
				rooms: [],
				taskVisible: false,
				taskGather: [],
				listLoading: false,
				siteLoading: false,
				total: 0,
				page: 1,
				size: 10,
				bigImgTitle:'定点测温',
				bigImgVisible:false,
				dialogSize:'small',
				currentUrl:'',
				hasTask:false,
				gather:[],
				cmdStatus: CMDSTATUS
			}
		},
		methods: {
			formatUTime(r,c){
				return parseTime(r.uploadTime, '{y}-{m}-{d} {h}:{i}'); 
			},
			formatTime(r,c) {
				return parseTime(r.startTime, '{y}-{m}-{d} {h}:{i}');
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
			changeRoom(){
				this.filters.taskId="";
				this.filters.taskName="",
				this.hasTask = false;
			},
			getList() {
				let para = {
					page: this.page,
					pageSize: this.size,
					roomId: this.filters.roomId,
					taskStatus:this.filters.taskStatus
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
			setTaskId(r){
				this.filters.taskName = r.taskName;
			},
			handleTask() {
				if(this.filters.taskId===""){
					this.$notify.info({
			          title: '提示',
			          message: '小主，你真的不选任务吗？'
			        });
			        return;
				}
				
				this.taskVisible = false;
				this.hasTask = true;
				this.getResult();
				 
			},
			setTask(row,e,c){
				this.filters.taskId = row.taskId;
				this.filters.taskName = row.taskName;
			},
			getResult() {
				this.gather =[];
				let para = {
					taskId: this.filters.taskId,
				}
				var self = this;
				this.siteLoading =true;
				Request(self, "/getThermometryDetail.action",para).then((res) => { 
					if(res.data.data){
					   self.gather = JSON.parse(Response(res.data.data));
					}else{
					   self.gather =[];
					}
					self.siteLoading = false;
				})
			},
			showDetail(obj) {
				 
				this.dialogSize ='small';
				this.bigImgTitle = "测试点_" + obj.position + "_温度分布图";
				this.currentUrl = `${baseImgUrl}${obj.fileUrl}`;
				 
				let _this = this;
				this.$nextTick(() => {
					_this.bigImgVisible = true;
				})
			},
			changeSize(){
				this.dialogSize=this.dialogSize==="small"?'full':'small'; 
			}
		},
		mounted() {
		   this.rooms = this.$store.state.rooms;
		   this.filters.roomId = this.$store.state.robotId?this.$store.state.robotId.roomId:this.rooms[0].roomId;
		}
	}
</script>

<style>
</style>