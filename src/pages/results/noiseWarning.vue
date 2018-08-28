<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-form :inline="true" :model="filters">
				<el-col :span="4">
					<el-select v-model="filters.roomId" style="width:90%">
						<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
						</el-option>
					</el-select>
				</el-col>
				<el-col :span="8">
					<el-date-picker style="width:90%" v-model="filters.timeStamp" type="daterange" unlink-panels range-separator=" __至__" start-placeholder="开始日期" value-format="yyyy-MM-dd" end-placeholder="结束日期" :picker-options="pickerOptions2">
					</el-date-picker>
				</el-col>
				<el-form-item>
					<el-button icon="search" type="primary" v-on:click="getList">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>
		<template>
			<el-table :data="rows" highlight-current-row v-loading="listLoading" style="width: 100%;">
				<el-table-column type="index" width="80" label="序号" align="center">
				</el-table-column>
				<el-table-column prop="roomName" label="巡检机房" width="260" align="center">
					 
				</el-table-column>
				<el-table-column prop="robotName" label="巡检机器人" width="260" align="center" sortable>
					<template scope="scope">
						<el-tag>{{scope.row.robotName}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="createTime" label="创建时间"  align="center" sortable>
					<template scope="scope">
						<span style="margin-left: 10px">{{ formatTime(scope.row) }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="voiceUrl" label="异常音频下载" width="260" align="center">
					<template scope="scope">
					   <a class="el-button el-button--warning el-button--small" :href="`${scope.row.voiceUrl}`" download>下载音频</a>
					</template>
				</el-table-column>
				<!--<el-table-column prop="warnStatus" label="处理标记" align="center" width="180">
					<template scope="scope">
						<el-button :type="scope.row.warnStatus==1?'warning':'success'" size="small" tye>{{scope.row.warnStatus==1?'未处理':'已处理'}}</el-button>
					</template>
				</el-table-column>-->
			</el-table>
		</template>
		<!--分页-->
		<el-col :span="24" class="toolbar" style="padding-bottom:10px;">
			<el-pagination layout="prev, pager, next,total,sizes,jumper" @current-change="handleCurrentChange" :page-sizes="[10, 15, 30, 40]" :page-size="size" :current-page="page" :total="total" style="float:right;" @size-change="handleSizeChange">
			</el-pagination>
		</el-col>
	</section>
</template>

<script>
	import NProgress from 'nprogress'
	import { parseTime } from 'utils';
	import { getRoomList } from 'api/room';
	import { getNoiseWarning } from 'api/results';

	export default {
		data() {
			return {
				pickerOptions2: {
					shortcuts: [{
						text: '最近一周',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
							picker.$emit('pick', [start, end]);
						}
					}, {
						text: '最近一个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
							picker.$emit('pick', [start, end]);
						}
					}, {
						text: '最近三个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
							picker.$emit('pick', [start, end]);
						}
					}]
				},
				filters: {
					roomId: '',
					timeStamp:'',
				},
				total: 0,
				page: 1,
				size: 15,
				rooms: [],
				rows: [],
				listLoading: false,
				currentUrl: '',
			}

		},
		methods: {
			type(warnType) {
				if(warnType === "温湿度告警") {
					return 'warning'
				} else if(warnType === "巡检红灯") {
					return 'gray'
				} else {
					return 'primary'
				}

			},
			formatTime(r, c) {
				return parseTime(r.timeStamp, '{y}-{m}-{d} {h}:{i}')
			},
			formatterStatus(row, column) {
				let statu = row.warnStatus === 1 ? '异常' : "正常";
				return statu;
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
				getRoomList(self, para).then((res) => {
					if(res.data.data) {
						this.rooms = res.body.data.rows;
						this.filters.roomId = this.rooms[0].roomId
						this.getList();
					}

				})
			},
			getList() {
				if(!this.filters.timeStamp[0]||!this.filters.timeStamp[1]) return; 
				 
			    let	startTime=parseTime(this.filters.timeStamp[0], '{y}-{m}-{d} {h}:{i}:{s}');
			    let end =parseTime(this.filters.timeStamp[1], '{y}-{m}-{d} {h}:{i}:{s}' ); 
			    let  times = end.split(' ')[1].split(':');
			    
			    let	 endTime = (times.every(i=>{return i==="00"}))?`${end.split(' ')[0]} 23:59:59`:end;    
			    
				let para = {
					page: this.page,
					pageSize: this.size,
					roomId: this.filters.roomId,
					startTime:startTime,
					endTime:endTime
				};
				 
				this.listLoading = true;
				NProgress.start();
				let self = this;
				getNoiseWarning(self, para).then((res) => { 
						if(res.data.data&& res.data.data.list.length > 0) { 
							this.rows = res.data.data.list.map(item=>{
								item.robotName = item.irRobotInfo.robotName;
								item.roomName = item.irRobotInfo.roomName;
								return item;
							});
					        this.total = res.data.data.total;
		     			} else {
							this.total = 0;
							this.rows = [];
						}
						this.listLoading = false;
					NProgress.done();
				});
			}
		},
		mounted() {
			this.getRooms();
		}
	}
</script>

<style>
.el-button{
	text-decoration: none;
}
</style>