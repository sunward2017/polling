<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-form :inline="true" :model="filters">
				 <el-form-item>
					<el-select v-model="filters.roomId">
						<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
						</el-option>
					</el-select>
				 </el-form-item>
				<!--<el-form-item>
					<el-select v-model="filters.deviceId" placeholder="请选择查询条件" >
						<el-option v-for="item in robots" :key="item.value" :label="item.label" :value="item.value">
						</el-option>
					</el-select>
				</el-form-item>-->
				<el-form-item>
					<el-button icon="search" type="primary" v-on:click="getList">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>
		<template>
			<el-table :data="collections" highlight-current-row v-loading="listLoading" style="width: 100%;">
				<el-table-column type="index" width="80" label="序号" align="center">
				</el-table-column>
				<el-table-column prop="deviceName" label="设备名称" width="200" align="center" sortable>
				</el-table-column>
				<el-table-column prop="rfidId" label="巡检驻点" width="150" align="center" sortable>
				</el-table-column>
				<el-table-column prop="mark" label="告警标识" align="center" sortable>
					<template scope="scope">
						<el-tag type="warning">{{scope.row.mark}}</el-tag>
					</template>
				</el-table-column>
				<!--<el-table-column prop="normalValue" label="正常值" align="center" width="150">
				</el-table-column>-->
				<el-table-column prop="createTime" label="创建时间" align="center" width="200" sortable>
					<template scope="scope">
						<span style="margin-left: 10px">{{ formatTime(scope.row) }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="fileUrl" label="原始图" align="center" width="180">
					<template scope="scope">
						<el-button type="info" @click="showDetail(1,scope.row.fileUrl)" size="small">原始图</el-button>
					</template>
				</el-table-column>
				<el-table-column prop="detectUrl" label="识别图" align="center" width="180">
					<template scope="scope">
						<el-button type="primary" @click="showDetail(2,scope.row.detectUrl)" size="small">
							识别图
						</el-button>
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
			<img :src="currentUrl" alt="异常图片,无法识别" width="100%" height="auto" @click="changeSize()" />
		</el-dialog>
	</section>
</template>

<script>
	import NProgress from 'nprogress'
	import { parseTime } from 'utils';
	import { getWarningByDetect } from 'api/results';
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
				collections: [],
				listLoading: false,
				bigImgVisible: false,
				currentUrl: '',
				bigImgTitle: "原始图",
				dialogSize: 'small',
			}

		},
		methods: {
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
				this.rooms = this.$store.state.rooms
				this.filters.roomId = this.$store.state.robotId.roomId;
				this.getList();
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
				getWarningByDetect(self, para).then((res) => {
					if(res.data.data && res.data.data.list.length > 0) {
						this.collections = res.data.data.list.map((item) => {
							item.deviceName = item.irDeviceInfo && item.irDeviceInfo.deviceName ? item.irDeviceInfo.deviceName : '未知';
							item.rfidId = item.irDeviceInfo && item.irDeviceInfo.rfidId ? item.irDeviceInfo.rfidId : '未知';
							item.fileUrl =item.fileInfos[0].fileUrl;
							item.detectUrl =item.fileInfos[0].detectResultUrl;
//							if(this.$store.state.user.customId === "a6a4b85d74d44341bfd53265521248a5") {
//								var pct=item.fileInfos[0].fileName.split(".");
//								item.detectUrl=`/ordinary/picture/output/${pct[0]}_out.${pct[1]}`;
//							} else {
//								item.detectUrl="/image/" + item.fileInfos[0].fileUrl.split('/')[4]
//							};
							return item;
						})
						this.total = res.data.data.total;
					} else { 
						this.total = 0;
						this.collections = [];
					}
					this.listLoading = false;
					NProgress.done();
				});
			},
			showDetail(flag, url) {
				this.dialogSize = 'small';
				this.bigImgTitle = flag === 1 ? "原始图" : "识别图";
				this.currentUrl = baseImgUrl+url;
				let _this = this;
				this.$nextTick(() => {
					_this.bigImgVisible = true;
				})
			},
			changeSize() {
				this.dialogSize = this.dialogSize === "small" ? 'full' : 'small';
			}
		},
		mounted() {
			this.getRooms();
		}
	}
</script>

<style>

</style>