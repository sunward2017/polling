<template>
	<section >
		<el-form :inline="true" v-model="filters" class="toolbar">
			<el-form-item>
				<el-select v-model="filters.roomId" placeholder="请选择机房" @change="changeRoom">
					<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item>
				<!--<div @click="getList">
					<el-input v-model="filters.taskName" :disabled="true" placeholder="请点击选择任务"></el-input>
				</div>-->
				<el-button   icon="search" @click="getList">任务检索</el-button>
			</el-form-item>
			<!--<el-form-item>
				<el-button icon="el-icon-refresh" type="primary" v-on:click="getResult">刷新</el-button>
			</el-form-item>-->
			<el-form-item v-if="hasTask" label="当前任务">
				<el-tag type="info">{{filters.taskName}}</el-tag>
			</el-form-item>
			<el-form-item v-if="hasTask"> 
				<el-button type="primary" @click.native="handleTask">刷新</el-button>
			</el-form-item>
		</el-form>

		<el-row class="section">
			<div :class="item.detectFlag!==0?'floor-item-content-wrap warn':'floor-item-content-wrap'" v-for="(item,index) in imgGather" :key="index" >
				<img class="floor-item-img" v-lazy="baseImgUrl+item.thumbnailUrl">
				<div class="floor-item-title">设备:{{ item.deviceName }}&emsp;<span @click="showBigImg(item.deviceName,item.fileUrl)">大图&emsp;</span><span v-if="item.detectFlag!==0" @click="showBigImg(item.deviceName,'/'+item.detectResultUrl)">识别图</span></div>
				<div class="floor-time">{{ formatTTime(item.timeStamp) }}</div>
			</div>
		</el-row>
		<el-dialog title="任务列表" :visible.sync="taskVisible" :close-on-click-modal="false">
			<el-table :data="taskGather" v-loading="listLoading" style="width: 100%" @row-click="setTask">
				<el-table-column prop="taskId" align="center" label="选项" width="100">
					<template scope="scope">
						<el-radio v-model="filters.taskId" :label="scope.row.taskId" @change='setTaskId(scope.row)'>{{&nbsp;}}</el-radio>
					</template>	
				</el-table-column>
				<el-table-column prop="robotName" align="center" label="机器人名称" width="180">
				</el-table-column>
				<el-table-column prop="taskType" align="center" label="任务类型" width="180">
					<template scope="scope">
						<el-tag>{{scope.row.taskType===1?'自动巡检':'临时任务'}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="taskName" align="center" label="任务名称" >
				</el-table-column>
				<el-table-column prop="timeStamp" label="巡检时间" :formatter="formatTime"  width="280" sortable>
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
	import { getRoomList } from 'api/room';
	import { getTaskResults, getTaskDetail } from 'api/results';
	import { baseImgUrl } from 'api/api';

	export default {
		data() {
			return {
				filters: {
					roomId: '',
					taskId: '',
					taskName:'',
				},
				baseImgUrl:baseImgUrl,
				rooms: [],
				taskVisible: false,
				taskGather: [],
				listLoading: false,
				total: 0,
				page: 1,
				size: 10,
				imgGather:[],
				bigImgTitle:'',
				bigImgVisible:false,
				dialogSize:'small',
				currentUrl:'',
				hasTask:false,
			}
		},
		methods: {
			formatTime(r,c) {
				return parseTime(r.taskTime, '{y}-{m}-{d} {h}:{i}')
			},
			formatTTime(t){
				return parseTime(t, '{y}-{m}-{d} {h}:{i}:{s}')
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
			getRooms() {
				let para = {
					page: 0,
					roomstatus: 1,
					pageSize: 0
				};
				let self = this;
				NProgress.start();
				getRoomList(self, para).then((res) => {
					NProgress.done();
					if(res.data.data) {
						this.rooms = res.body.data.rows;
						this.filters.roomId = this.rooms[0].roomId
					}

				})
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
					roomId: this.filters.roomId
				};
				this.listLoading = true;
				this.taskVisible = true;
				NProgress.start();
				let self = this;
				getTaskResults(self, para).then((res) => {
					this.listLoading = false;
					NProgress.done();
					if(res.data.data && res.data.data.list) {
						this.taskGather = res.data.data.list.map((item)=>{
							item.taskName = item.taskName?item.taskName:"未知";
							item.robotName =  item.robotName?item.robotName:"未知";
							return item;
						});
						this.total = res.data.data.total;
					} else {
						this.taskGather = [];
						this.total = 0;
					}

				})
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
				//this.filters.taskName = item.taskName;
				//this.filters.taskId = item.taskId;
			},
			setTask(row,e,c){
				this.filters.taskId = row.taskId;
				this.filters.taskName = row.taskName;
			},
			getResult() {
				this.imgGather =[];
				let para = {
					taskId: this.filters.taskId,
				}
				var self = this;
				getTaskDetail(self, para).then((res) => { 
					if(res.data.data&& res.data.data.fileInfos) {
						this.imgGather = res.data.data.fileInfos;
					}
				})
			},
			showBigImg(device,url){
				NProgress.start();
				this.dialogSize ='small';
				let img = new Image(),_this = this;
				img.src = baseImgUrl+url; 
                img.onload = ()=>{
                	NProgress.done();
                   _this.bigImgTitle = "设备名--"+device;
                   _this.currentUrl = baseImgUrl+url;
                   _this.bigImgVisible = true;
                }
			},
			changeSize(){
				this.dialogSize=this.dialogSize==="small"?'full':'small'; 
			}
		},
		mounted() {
			this.getRooms();
		}
	}
</script>

<style>
.floor-item-content-wrap{
	float:left;
	width:16%;
	margin-right:0.4%;
	margin-bottom:10px;
	border:1px solid #ccc;
	font-size:0.8rem;
}
.floor-item-content-wrap:hover{
  border:1px solid #F00;
}

.section{
	min-height:80vh;
	background:rgba(0,0,0,.15);
}
.floor-item-content-wrap>div{
	text-align: center;
	line-height: 22px;
	background:#ccc;
	font-weight: 600;
	font-family:Arial, Helvetica, sans-serif; 
	
}
.floor-item-img{
	display:block;
	width:100%;
	height:150px;
}

.warn>div{
	background:yellow; 
    color:#f00;
}
.floor-item-title>span{
	 
	color:#012B65;
	cursor:pointer;
}
.floor-item-title,.floor-item-time{
	height:20px;
}
</style>