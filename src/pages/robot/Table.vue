<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-form :inline="true" :model="filters">
				<el-form-item v-if="isShow">
					<el-select v-model="filters.custom">
						<el-option v-for="item in customs" :key="item.customId" :label="item.customName" :value="item.customId">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-select v-model="filters.key" placeholder="请选择查询条件" @change="changKey">
						<el-option v-for="item in columns" :key="item.value" :label="item.label" :value="item.value">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item v-if="isAll">
					<el-input v-model="filters.value" placeholder="请输入查询字段"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button icon="search" type="primary" v-on:click="getList">查询</el-button>
				</el-form-item>
				<!-- <el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item> -->
			</el-form>
		</el-col>

		<!--列表-->
		<template>
			<el-table :data="robots" highlight-current-row v-loading="listLoading" style="width: 100%;">
				<el-table-column type="index" width="80" label="序号" align="center">
				</el-table-column>
				<el-table-column prop="robotName" label="机器人名称" width="200" sortable>
					<template scope="scope">
						<el-tag type="success">{{scope.row.robotName}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="robotSerial" label="机器人编号" width="220" sortable>
				</el-table-column>
				<el-table-column v-if="isShow" prop="customName" label="所属机构" width="200"  >
				</el-table-column>
				<el-table-column prop="roomName" label="所属机房" width="200" >
				</el-table-column>
				<!-- <el-table-column prop="status" label="当前状态" width="200" :formatter="formatStatus" > -->
				<!--</el-table-column>-->
				<el-table-column prop="sysVer" label="软件版本" width="120" >
				</el-table-column>
				<el-table-column prop="sysName" label="版本名称" >
				</el-table-column>
				<el-table-column prop="realtimeStatus" label="状态" width="100">
					<template scope="scope" >
						<el-tag v-if="scope.row.customName" :type="type(scope.row.realtimeStatus)">{{formatRealTimeStatus(scope.row)}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="配置" :width="setWidth" align='center' v-if="isShow" >
					<template scope="scope">
						<el-button-group v-if="scope.row.customName">
							<!--<el-button  size="small" @click="showHumiture(scope.row)">分布图</el-button>-->
							<el-button type="primary" size="small" @click="handleRobotCorrection(scope.row.robotId)">修正值</el-button>
							<el-button size="small" type="info" icon="message" @click="showLog(scope.row)"  >日志</el-button>
						</el-button-group>
					</template>
				</el-table-column>
                <el-table-column label="操作" :width="editWidth" align='center'>
					<template scope="scope" >
						<el-button-group v-if="scope.row.customName">
							<el-button size="small" icon="edit" @click="handleEdit(scope.row)">编辑</el-button>
							<el-button size="small" icon="check" type="success" @click="restart(scope.row)">重启</el-button>
							<el-button  size="small" type="warning" icon="setting" @click="handleInt(scope.row)" v-if="isShow" :loading="scope.row.edit">{{scope.row.edit?'恢复中...':'初始化'}}</el-button>
						</el-button-group>
						<el-button-group v-else>
							<el-button size="small" icon="edit" @click="handleEdit(scope.row)">绑定机房</el-button>
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

		<!--编辑界面-->
		<el-dialog :title="editFormTitle" v-model="editFormVisible" :close-on-click-modal="false" size="tiny">
			<el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
				<el-form-item label="机器人名称" prop="robotName">
					<el-input v-model="editForm.robotName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="归属机房">
					<el-select v-model="editForm.roomId" placeholder="请选择机房" style="width:100%" v-loading="roomLoading">
						<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
						</el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button icon="circle-cross" @click.native="cancel">取 消</el-button>
				<el-button icon="upload2" type="primary" @click.native="editSubmit" :loading="editLoading">{{btnEditText}}</el-button>
			</div>
		</el-dialog>

		<el-dialog title="日志信息" v-model="dialogVisible" @close="initMsg">
			<Log :msg="curRobotId" ref="profile"></Log>
		</el-dialog>
		<el-dialog title="修正值维护" v-model="correctionFormVisible" :close-on-click-modal="false" size="tiny" @close="resetCorForm()">
			<el-form :model="correctionModel" label-width="100px" :rules="correctionRules" ref="editCorForm">
				<el-form-item label="温度修正值" prop="temperatureCorrection">
					<el-input v-model="correctionModel.temperatureCorrection" auto-complete="off">℃</el-input>
				</el-form-item>
				<el-form-item label="湿度修正值" prop="humidityCorrection">
					<el-input v-model="correctionModel.humidityCorrection" auto-complete="off">%</el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button icon="circle-cross" @click.native="cancelCor">取 消</el-button>
				<el-button icon="upload2" type="primary" @click.native="saveCorrection" :loading="corLoading">{{corBtn}}</el-button>
			</div>
		</el-dialog>
		<el-dialog title="分布图列表" v-model="humitureVisible">
			<Humiture :robot="curRobotId" ref="humit" @setUrl="showBigImg"></Humiture>
		</el-dialog>
		<el-dialog title="分布图详情" v-model="imgVisible" style="text-align: center;">
			<img :src="currentUrl" alt="" width="800" height="500" />
		</el-dialog>
	</section>
</template>

<script>
	// import util from '../../common/util'
	import NProgress from 'nprogress'
	import { robotStatusForObj, realtimeStatus, realTimeTypes, robotCls } from '@/const';
	import { getRobotList, getRobotDetail, editRobot, resetRobot, getCorrection, saveCorrection, restartRobot } from 'api/robot';
	import { getRoomList } from 'api/room';
	import Log from 'components/runLog';
	import Humiture from 'components/Humiture';
	import { getCustoms } from 'api/admin';
	import { baseImgUrl } from 'api/api';
 

	export default {
		components: {
			Log,
			Humiture,
		},
		data() {
			var checkNum = (rule, value, callback) => {
				if(isNaN(value)) {
					return callback(new Error('输入格式不正确'));
				} else {
					callback();
				}
			}
			return {
				filters: {
					key: 'all',
					value: '',
					custom: 'all'
				},
				robots: [],
				editWidth: '',
				setWidth: '',
				total: 0,
				page: 1,
				size: 20,
				isAll: false,
				isShow: false,
				columns: robotCls,
				listLoading: false,
				downLoading: false,
				customs: [],
				allCustom: [],
				dialogVisible: false,
				curRobotId: '',
				editFormVisible: false, //编辑界面显是否显示
				editFormTitle: '编辑', //编辑界面标题
				//编辑界面数据
				roomLoading: false,
				rooms: [],
				editForm: {
					robotId: '',
					robotName: '',
					roomId: '',
					custom: '',
				},
				editLoading: false,
				btnEditText: '提 交',
				editFormRules: {
					robotName: [{
						required: true,
						message: '请输入机器人名称',
						trigger: 'blur'
					}],
					custom: [{
						required: true,
						message: '请选择机构',
						trigger: 'blur'
					}],

				},
				correctionListVisible: false,
				corRobotId: '',
				correctionFormVisible: false,
				correctionFormTitle: '新增',
				correctionModel: {
					temperatureCorrection: 0,
					humidityCorrection: 0
				},
				correctionRules: {
					temperatureCorrection: [{
						validator: checkNum,
						trigger: 'blur'
					}],
					humidityCorrection: [{
						validator: checkNum,
						trigger: 'blur'
					}],
				},
				corBtn: "提交",
				corLoading: false,
				humitureVisible: false,
				imgVisible: false,
				currentUrl: '',
			}
		},
		methods: {
			//显示转换
			formatStatus: function(row, column) {
				return robotStatusForObj[row.status];
			},
			formatRealTimeStatus: function(row, column) {
				return realtimeStatus[row.realtimeStatus];
			},
			cancel: function() {
				// this.$refs.editForm.resetFields();
				this.editForm.custom = '';
				this.editFormVisible = false;
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
			type: function(status) {
				return realTimeTypes[status]
			},
			changKey() {
				this.filters.value = '';
				if(this.filters.key && this.filters.key != "all") {
					this.isAll = true;
				} else {
					this.isAll = false;
					this.getList();
				}
			},
			getCustoms() {
				let _this = this;
				getCustoms(_this, {}).then(function(res) {
					if(res.body && res.body.data) {
						this.allCustom = res.body.data;
						let data = res.body.data.slice(0);
						data.push({
							'customId': "all",
							'customName': "所有机构"
						});
						this.customs = data;

					}
				})
			},
			//获取机器人列表
			getList() {
				let para = {
					page: this.page,
					pageSize: this.size
				};
				if(this.filters.value != '' && this.filters != "all") {
					para[this.filters.key] = this.filters.value;
				}
				if(this.filters.custom != 'all') {
					para.customId = this.filters.custom
				}
				this.listLoading = true;
				NProgress.start();
				let self = this;
				getRobotList(self, para).then((res) => {
					if(res.data.data) {
						this.total = res.body.data.total;
						this.robots = res.body.data.list.map((v) => {
							v.edit = false;
							return v;
						});
					} else {
						this.total = 0;
						this.robots = [];
					}
					this.listLoading = false;
					NProgress.done();
				});
			},

			//显示编辑界面
			getRoomList: function(id) {
				if(this.rooms.length === 0) {
					let para = {
						page: 0,
						roomstatus: 1,
						pageSize: 0
					};
					let self = this;
					getRoomList(self, para).then((res) => {
						this.rooms = res.body.data.rows;
						this.getRobotDetail(id);
					})
				} else {
					this.getRobotDetail(id);
				}

			},

			getRobotDetail: function(id) {
				let para = {
					robotId: id
				}
				let self = this;
				getRobotDetail(self, para).then((res) => {
					let robot = res.body.data
					this.editForm.model = robot.model;
					this.editForm.sysVer = robot.sysVer;
					this.editForm.roomId = robot.relation ? robot.relation.roomId : '';
				})
			},
			handleEdit: function(row) {
				this.editFormVisible = true;
				this.editFormTtile = '编辑';
				this.editForm.robotId = row.robotId;
				this.editForm.robotName = row.robotName;
				this.editForm.roomId = row.roomId?row.roomId:'';
				this.editForm.custom = row.customId;
				this.getRoomList(row.robotId);

			},
			//编辑 or 新增
			editSubmit: function() {
				var _this = this;
				_this.$refs.editForm.validate((valid) => {
					if(valid) {
						_this.$confirm('确认提交吗？', '提示', {}).then(() => {
							_this.editLoading = true;
							NProgress.start();
							_this.btnEditText = '提交中';
							let para = {
								robotId: _this.editForm.robotId,
								robotName: _this.editForm.robotName,
								roomId: _this.editForm.roomId,
								customId: _this.editForm.custom
							};

							editRobot(_this, para,`修改机器人${para.robotName}`).then((res) => {
								// console.log(res);
								_this.editLoading = false;
								NProgress.done();
								_this.btnEditText = '提 交';
								if(res.body.result == 200) {
									_this.$notify({
										title: '成功',
										message: '提交成功',
										type: 'success'
									});
								} else {
									_this.$notify({
										title: '失败',
										message: res.body.message,
										type: 'error'
									});
								}

								_this.editFormVisible = false;
								_this.getList();
							});

						}).catch(() => {});

					}
				});

			},
			showLog: function(row) {
				this.curRobotId = row.robotId;
				this.dialogVisible = true;
				let _this = this;
				this.$nextTick(function() {
					_this.$refs.profile.getLogList();
				})

			},
			initMsg: function() {
				this.$refs.profile.initMsg();
			},
			handleInt: function(row) {
				let _this = this;
				_this.$confirm('即将初始化机器人：' + row.robotName + ',确认定要执行此项操作吗', '警告', {}).then(() => {
					row.edit = true;
					resetRobot(_this, {
						robotId: row.robotId
					}).then((res) => {
						row.edit = false;
						_this.getList();
						if(res.body.result == 200) {
							_this.$notify({
								title: '成功',
								message: '重置成功',
								type: 'success'
							});
						} else {
							_this.$notify({
								title: '失败',
								message: res.body.message,
								type: 'error'
							});
						}

					})
				}).catch(() => {})
			},
			handleRobotCorrection: function(Id) {
				this.corRobotId = Id;
				getCorrection(this, {
					robotId: Id
				}).then((res) => {

					if(res.data.data) {
						this.correctionModel = Object.assign(res.data.data)
					} else {
						this.correctionModel.humidityCorrection = 0;
						this.correctionModel.temperatureCorrection = 0;
					}
					this.correctionFormVisible = true;
				});

			},
			saveCorrection: function() {
				var _this = this;
				_this.$refs.editCorForm.validate((valid) => {
					if(valid) {
						_this.$confirm('确认提交吗？', '提示', {}).then(() => {
							_this.corLoading = true;
							NProgress.start();
							_this.corBtn = '提交中';
							let para = {
								robotId: this.corRobotId,
								humidityCorrection: this.correctionModel.humidityCorrection,
								temperatureCorrection: this.correctionModel.temperatureCorrection,
							}

							saveCorrection(_this, para,"修改机器人修正值").then((res) => {

								_this.corLoading = false;
								NProgress.done();
								_this.corBtn = '提 交';
								if(res.body.result == 200) {
									_this.$notify({
										title: '成功',
										message: '提交成功',
										type: 'success'
									});
								} else {
									_this.$notify({
										title: '失败',
										message: res.body.message,
										type: 'error'
									});
								}

								this.correctionFormVisible = false;
							});

						}).catch(() => {});

					}
				});
			},
			cancelCor: function() {
				this.correctionFormVisible = false;
			},
			resetCorForm: function() {
				this.$refs.editCorForm.resetFields();
			},
			showHumiture: function(r) {
				this.humitureVisible = true;
				this.curRobotId = r.robotId;
				let _this = this;
				this.$nextTick(function() {
					_this.$refs.humit.getList();
				})
			},
			showBigImg: function(url) {
				this.currentUrl = url;
				this.imgVisible = true;
			},
			restart: function(r) {
				let self = this;
				let params = {
					robotSerial: r.robotSerial
				}
				restartRobot(self, params).then((res) => {
					if(res.body.result == 200) {
						self.$notify({
							title: '成功',
							message:res.body.message,
							type: 'success'
						});
					} else {
						self.$notify({
							title: '失败',
							message: res.body.message,
							type: 'error'
						});
					}
				})
			}
		},
		created() {
			if(this.$store.state.user.account == "admin") {
				this.isShow = true;
				this.getCustoms();
			}
			this.editWidth = this.isShow ? 260 : 180;
			this.setWidth = this.isShow ? 220 : 180;
			this.getList();
		}
	}
</script>

<style scoped>

</style>