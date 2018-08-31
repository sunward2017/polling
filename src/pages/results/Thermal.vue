<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-form :inline="true" :model="filters">
				<el-col :span="6">
					<el-select v-model="filters.roomId" style="width:90%">
						<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
						</el-option>
					</el-select>
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
				<el-table-column prop="robotName" label="巡检机器人" width="140" sortable>
					<template scope="scope">
						<el-tag type="warning">{{scope.row.robotName}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="taskName" label="任务名称" align="center" sortable>
				</el-table-column>
				<el-table-column prop="maxHumidity" label="最大湿度" width="120" align="center" sortable>
					<template scope="scope">
						<span :class="parseFloat(scope.row.maxHumidity)>parseFloat(scope.row.warnUpperH)||parseFloat(scope.row.maxHumidity)<parseFloat(scope.row.warnLowerH)?'darnger':''">{{scope.row.maxHumidity}}</span>
					</template>	
				</el-table-column>
				<el-table-column prop="minHumidity" label="最小湿度" width="120" align="center" sortable>
					<template scope="scope">
						<span :class="parseFloat(scope.row.minHumidity)<parseFloat(scope.row.warnLowerH)||parseFloat(scope.row.minHumidity)>parseFloat(scope.row.warnUpperH)?'darnger':''">{{scope.row.minHumidity}}</span>
					</template>	
				</el-table-column>
				<el-table-column prop="avHumidity" label="平均湿度" width="120" align="center" sortable>
					
				</el-table-column>
				<el-table-column prop="maxTemperature" label="最高温度" width="120" align="center" sortable>
					<template scope="scope">
						<span :class="parseFloat(scope.row.maxTemperature)>parseFloat(scope.row.warnUpper)||parseFloat(scope.row.maxTemperature)<parseFloat(scope.row.warnLower)?'darnger':''">{{scope.row.maxTemperature}}</span>
					</template>	
				</el-table-column>
				<el-table-column prop="minTemperature" label="最低温度" width="120" align="center" sortable>
					<template scope="scope">
						<span :class="parseFloat(scope.row.minTemperature)<parseFloat(scope.row.warnLower)||parseFloat(scope.row.minTemperature)>parseFloat(scope.row.warnUpper)?'darnger':''">{{scope.row.minTemperature}}</span>
					</template>	
				</el-table-column>
				<el-table-column prop="avTemperature" label="平均温度" width="120" align="center" sortable>
				</el-table-column>
				<el-table-column prop="taskTime" label="巡检时间" width="180" align="center" sortable :formatter="formatTime">
				</el-table-column>
				<el-table-column prop="HumidityUrl" label="分布图" align="center" width="220">
					<template scope="scope">
						<el-button-group>
						<el-button type="primary" v-if="scope.row.HumidityUrl" @click="showDetail({flag:1,r:scope.row})" size="small">湿度 </el-button>
						<el-button  v-if="scope.row.imgUrl" @click="showDetail({flag:2,r:scope.row})" size="small">温度</el-button>
						<el-button  type="success" @click="create(scope.row)" size="small">生成</el-button>
						</el-button-group>
					</template>
				</el-table-column>
			</el-table>
		</template>
		<!--分页-->
		<el-col :span="24" class="toolbar" style="padding-bottom:10px;">
			<el-pagination layout="prev, pager, next,total,sizes,jumper" @current-change="handleCurrentChange" :page-sizes="[10, 20, 30, 40]" :page-size="size" :current-page="page" :total="total" style="float:right;" @size-change="handleSizeChange">
			</el-pagination>
		</el-col>
		<el-dialog :title="bigImgTitle" v-model="bigImgVisible" style="text-align: center;" :size="dialogSize">
			<img :src="currentUrl" alt="异常图片,无法识别" width="100%" @click="changeSize()"/>
		</el-dialog>
	</section>
</template>
<script>
	import NProgress from 'nprogress'
	import { parseTime } from 'utils';
	import { getRoomList,uploadThe} from 'api/room';
	import { getThermalResults } from 'api/results';
	import { baseImgUrl } from 'api/api';

	export default {
		 
		data() {
			return {
				filters: {
					roomId: '',
				},
				total: 0,
				page: 1,
				size: 20,
				rooms: [],
				rows: [],
				listLoading: false,
				bigImgVisible: false,
				currentUrl: '',
				bigImgTitle: "原始图",
				dialogSize:'small'
			}
		},
		methods: {
			formatTime(r, c) {
				return parseTime(r.taskTime, '{y}-{m}-{d} {h}:{i}')
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
				NProgress.start();
				getRoomList(self, para).then((res) => {
					NProgress.done();
					if(res.data.data) {
						this.rooms = res.body.data.rows;
						this.filters.roomId = this.rooms[0].roomId
						this.getList();
					}

				})
			},
			getList() {
				let para = {
					page: this.page,
					pageSize: this.size,
					roomId: this.filters.roomId
				};
				this.listLoading = true;
				NProgress.start();
				let self = this;
				getThermalResults(self, para).then((res) => {
					if(res.body.data && res.body.data.list) {
						this.rows = res.body.data.list.map((item) => {
							let obj = {};
							obj.robotName = item.robotName;
							obj.taskName = item.taskName;
							obj.taskTime = item.taskTime;
							obj.maxHumidity = item.thermalequilibrium.maxHumidity;
							obj.minHumidity = item.thermalequilibrium.minHumidity;
							obj.avHumidity = item.thermalequilibrium.avgHumidity;
							obj.maxTemperature = item.thermalequilibrium.maxTemperature;
							obj.minTemperature = item.thermalequilibrium.minTemperature;
							obj.avTemperature = item.thermalequilibrium.avgTemperature;
							obj.HumidityUrl = item.thermalequilibrium.humidityUrl||'';
							obj.imgUrl = item.thermalequilibrium.imageUrl||'';
							obj.thermometrys = item.thermometrys||[];
							obj.customId= item.robotInfo.customId;
							obj.robotId = item.robotId;
							obj.taskId = item.taskId;
							obj.warnLower = item.roomInfo.warnLower||15;
							obj.warnLowerH = item.roomInfo.warnLowerH||15;
							obj.warnUpper = item.roomInfo.warnUpper||45;
							obj.warnUpperH = item.roomInfo.warnUpperH||45;
							return obj;
						}); 
						this.total = res.data.data.total;
					} else {
						this.total = 0;
						this.rows = [];
					}
					this.listLoading = false;
					NProgress.done();
				});
			},
			showDetail(obj) {
				this.dialogSize ='small';
				if(obj.flag === 1&&obj.r.taskName) {
					this.bigImgTitle = obj.r.taskName + "_湿度分布图";
					this.currentUrl = `${baseImgUrl}/${obj.r.HumidityUrl}?`+ new Date().valueOf();
				} else if(obj.flag === 2&&obj.r.taskName) {
					this.bigImgTitle = obj.r.taskName + "_温度分布图";
					this.currentUrl = `${baseImgUrl}/${obj.r.imgUrl}?`+new Date().valueOf();
				}
				let _this = this;
				this.$nextTick(() => {
					_this.bigImgVisible = true;
				})
			},
			create(row){
				 
				this.listLoading = true;
				let params={
					customId:row.customId,
					robotId:row.robotId,
					taskId:row.taskId,
				}
				let _this = this;
				uploadThe(_this,params).then((res)=>{
					 _this.listLoading = false;
					 _this.getList();
					 if(res.body.result==200){
				       _this.$notify({
							title: '成功',
							message: '修改成功',
							type: 'success'
							});	
				     }else{
					   _this.$notify({
							title: '失败',
							message: res.message,
							type: 'danger'
						});	
					}
				})
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
.darnger{
  color:#f00;
}
</style>