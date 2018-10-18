<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-form :inline="true" :model="filters">
				<el-col :span="8">
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
				<el-table :data="data" highlight-current-row style="height:600px;overflow-y:auto;">
					<el-table-column type="index" width="80" label="序号" align="center">
					</el-table-column>
					 <el-table-column prop="position" label="测温点" width="150" align="center" sortable>
					</el-table-column>
					<el-table-column prop="description" label="测温点描述" align="center" sortable>
					</el-table-column>
					<el-table-column prop="fileUrl" label="图片详情" width="120" align="center" sortable>
						 <template scope="scope" >
							<el-button type="warning"  @click="showDetail(scope.row)" size="small">温度分布图</el-button>
						</template>
					</el-table-column>
					<el-table-column prop="uploadTime" label="上传时间" width="220" align="center" :formatter="formatTime" sortable>
					</el-table-column>
				</el-table>
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
	import { getRoomList } from 'api/room';
	import { getThermalResults } from 'api/results';
	import Site from 'components/site'

	export default {
		components: {
			Site,
		},
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
				bigImgTitle: "温度分布图",
				thermometryVisible: false,
				thermometrys: [],
				dialogSize:'small'
			}
		},
		methods: {
			formatTime(r, c) {
				return parseTime(r.taskTime, '{y}-{m}-{d} {h}:{i}')
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
					    this.filters.roomId = this.$store.state.robotId?this.$store.robotId.state.roomId:this.rooms[0].roomId;
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
				 
				this.bigImgTitle = "测试点_" + obj.position + "_温度分布图";
				this.currentUrl = obj.url;
				 
				let _this = this;
				this.$nextTick(() => {
					_this.bigImgVisible = true;
				})
			},
			showThermometrys(t) {
				this.thermometrys = t;
				this.thermometryVisible = true;
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

</style>