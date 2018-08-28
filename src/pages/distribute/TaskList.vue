<template>
	<section>
		<el-col :span="24" class="toolbar">
			<el-form :inline="true" :model="filters">
				<el-col :span="8">
					<el-select v-model="filters.robotId" style="width:90%" @change="getList">
						<el-option v-for="item in robots" :key="item.robotId" :label="item.robotName" :value="item.robotId">
						</el-option>
					</el-select>
				</el-col>
				<el-form-item>
					<el-button icon="search" type="primary" v-on:click="getList">刷新</el-button>
				</el-form-item>
				<el-form-item>
					<el-button icon="caret-bottom" type="success" @click="handlerAdd">任务派发</el-button>
				</el-form-item>
				<!--<el-form-item>
					<el-dropdown split-button type="info" @command="handleCommand">
						实时任务
						<el-dropdown-menu slot="dropdown">
							<el-dropdown-item command="a">临时任务</el-dropdown-item>
							<el-dropdown-item command="b">巷道避障</el-dropdown-item>
							<el-dropdown-item command="c">语音讲解</el-dropdown-item>
						</el-dropdown-menu>
					</el-dropdown>
				</el-form-item>-->
			</el-form>
		</el-col>
		<template>
			<el-table :data="rows" highlight-current-row v-loading="listLoading">
				<el-table-column type="index" width="80" label="序号" align="center">
				</el-table-column>
				<el-table-column prop="roomName" label="巡检房间" align="center" width="260">
				</el-table-column>
				<el-table-column prop="robotName" label="巡检机器人" width="220" align="center">
					<template scope="scope">
						<el-tag>{{scope.row.robotName}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="taskName" label="任务名称" align="center" width="180">
				</el-table-column>

				<el-table-column prop="taskTime" label="执行时间" align="center">
				</el-table-column>
				<el-table-column prop="createTime" label="创建时间" width="240" align="center" sortable>
					<template scope="scope">
						<span style="margin-left: 10px">{{ formatTime(scope.row) }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="status" label="操作" align="center" width="240">
					<template scope="scope">
						<el-button type="warning" icon="delete" size="small" @click="handleDel(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
		</template>
		<!--分页-->
		<el-col :span="24" class="toolbar" style="padding-bottom:10px;">
			<el-pagination layout="prev, pager, next,total,sizes,jumper" @current-change="handleCurrentChange" :page-sizes="[10, 15, 30, 40]" :page-size="size" :current-page="page" :total="total" style="float:right;" @size-change="handleSizeChange">
			</el-pagination>
		</el-col>
		<!--编辑界面-->
		<el-dialog :title="editFormTtile" v-model="editFormVisible" :close-on-click-modal="false" size="tiny" @close="cancel">
			<el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
				<el-form-item label='巡检房间' prop="roomId">
					<el-select style="width:100%" @change="getDevices" v-model="editForm.roomId">
						<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="任务名称" prop="taskName">
					<el-input v-model="editForm.taskName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label='巡检机器人' prop="robotId">
					<el-select v-model="editForm.robotId" style="width:100%">
						<el-option v-for="item in roomRobots" :key="item.robotId" :label="item.robotName" :value="item.robotId">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label='巡检设备' prop="devices" style="max-height:200px;overflow-y:auto;">
					<el-tree show-checkbox default-expand-all node-key="id" ref="tree" highlight-current :data="devices">
					</el-tree>
				</el-form-item>
				<el-form-item v-for="(domain, index) in editForm.domains" :label="'巡检时间' + index" :key="domain.key" :prop="'domains.' + index + '.value'" :rules="{
				     type: 'date', required: true, message: '时间不能为空', trigger: 'change'
				    }">
					<el-time-picker v-model="domain.value" placeholder="请选择时间" style="width:80%">
					</el-time-picker>
					<el-button @click.prevent="removeDomain(domain)" style="float:right">删除</el-button>
			  </el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible=false" icon="circle-cross">取 消</el-button>
				<el-button icon="plus" type="info" @click="addDomain">新增时间</el-button>
				<el-button icon="upload2" type="primary" @click.native="editSubmit" :loading="editLoading">{{btnEditText}}</el-button>
			</div>
		</el-dialog>
		<el-dialog title="临时任务" v-model="tempTaskVisible" :close-on-click-modal="false" size="tiny">
			<el-row :gutter="20">
				<el-col :span="18">
					<el-select v-model="address" placeholder="请选择地址" style="width:100%">
						<el-option v-for="item in robots" :key="item.robotId" :label="item.robotName" :value="item.robotId">
						</el-option>
					</el-select>
				</el-col>
				<el-col :span="6">
					<el-button type="success">开始执行</el-button>
				</el-col>
			</el-row>
			<el-row :gutter="20">
				<el-col :span="18">
					<el-autocomplete style="width:100%" v-model="tempTaskDeviceId" :fetch-suggestions="querySearch" placeholder="请输入设备名称" :trigger-on-focus="false" @select="handleSelect"></el-autocomplete>
				</el-col>
				<el-col :span="3">
					<el-button type="success">开始执行</el-button>
				</el-col>
			</el-row>
			<el-row :gutter="20">
				<el-col :span="18">
					<el-button>随工监督</el-button>
				</el-col>
				<el-col :span="6">
					<el-button type="success">开始执行</el-button>
				</el-col>
			</el-row>
		</el-dialog>
	</section>
</template>

<script>
	import NProgress from 'nprogress'
	import { parseTime, compare } from 'utils';
	import { Request } from 'utils/Cipher'
	import { getRobotList } from 'api/robot';
	import { getTaskList } from 'api/results';
	import { getRoomList, getRoomDetail } from 'api/room';

	export default {
		data() {
			var checkDev = (rule, value, callback) => {
				setTimeout(() => {
					if(value && value.length <= 0) {
						callback(new Error('请选择设备'));
					} else {
						callback()
					}
				}, 500);
			};
			return {
				filters: {
					robotId: '',
				},
				total: 0,
				page: 1,
				size: 15,
				robots: [],
				rows: [],
				rooms: [],
				listLoading: false,
				editFormTtile: '新增',
				editFormVisible: false,
				editForm: {
					roomId: '',
					robotId: '',
					devices: [],
					domains: [{
						value: ''
					}],
				},
				roomRobots: [],
				editFormRules: {
					roomId: [{
						required: true,
						message: '请选择机房',
						trigger: 'change'
					}],
					taskName: [{
						required: true,
						message: '请输入任务名称',
						trigger: 'blur'
					}],
					robotId: [{
						required: true,
						message: '请选择巡检机器人',
						trigger: 'change'
					}],
					execTime: [{
						type: 'date',
						required: true,
						message: '请选择日期',
						trigger: 'change'
					}],
				},
				editLoading: false,
				btnEditText: "提交",
				//tempTask
				tempTaskVisible: false,
				devices: [],
				tempTaskDeviceId: '',
				address: "",
			}
		},
		methods: {
			formatTime(r, c) {
				return parseTime(r.createTime, '{y}-{m}-{d} {h}:{i}')
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
			getRobots() {
				let para = {
					page: 0,
					roomstatus: 1,
					pageSize: 0
				};
				let self = this;
				getRobotList(self, para).then((res) => {
					if(res.data.data) {
						this.robots = res.body.data.list;
						this.filters.robotId = this.robots[0].robotId
					}
				})
			},
			cancel() {
				this.$refs.editForm.resetFields();
			},
			getList() {
				let para = {
					page: this.page,
					pageSize: this.size,
					robotId: this.filters.robotId,
				};
				this.listLoading = true;
				NProgress.start();
				let self = this;
				getTaskList(self, para).then((res) => {
					if(res.data.data && res.data.data.list) {
						this.rows = res.data.data.list;
						this.total = res.data.data.total;
					} else {
						this.total = 0;
						this.rows = [];
					}
					this.listLoading = false;
					NProgress.done();
				});
			},
			handlerAdd() {
				this.editFormTitle = "新增";
				this.editFormVisible = true;
				this.editForm.roomId = "";
				this.devices = [];
				this.roomRobots = [];
				this.editForm.domains=[{ value: ''}];
				this.getRooms();
			},
			editSubmit() {
				var _this = this,
					devs = _this.$refs.tree.getCheckedNodes();
				_this.$refs.editForm.validate((valid) => {
					if(valid) {
						if(!devs.length) {
							_this.$notify({
								title: '提示',
								message: '必须至少选一个设备',
								type: 'info'
							});

						} else {
							_this.$confirm('确认提交吗？', '提示', {}).then(() => {
								_this.editLoading = true;
								NProgress.start();
								_this.btnEditText = '提交中';
								let devices = [],
									rfids = [];
							     if(devs[0].id==="ALL"){
							     	devs.shift();
							     }
								devs.sort(compare('orderBy')).forEach((item) => {
									devices.push(item.id);
									rfids.push(item.rfid); 
								});
								 
                                let times = _this.editForm.domains.map((item)=>{
                                	return parseTime(item.value,'{h}:{i}:{s}');
                                })
                                
								let param = {
									'roomId': _this.editForm.roomId,
									'robotId': _this.editForm.robotId,
									'taskName': _this.editForm.taskName,
									'devices': devices.join(','),
									'rfids': rfids.join(','),
									'taskTime': times.join(',')
								}
								Request(_this, '/saveTaskSchedule.do', param,`下发任务${param.taskName}`).then(res => {
									_this.editLoading = false;
									NProgress.done();
									_this.btnEditText = '提 交';
									if(res.body.result == 200) {
										_this.$notify({
											title: '成功',
											message: '新增成功',
											type: 'success'
										});
										_this.filters.robotId = _this.editForm.robotId;
									} else {
										_this.$notify({
											title: '失败',
											message: res.body.message,
											type: 'error'
										});
									}
									_this.editFormVisible = false;
									_this.getList();
								}, err => {
									console.log(err)
								})
							})
						}
					}
				})

			},
			handleDel(row) {
				var _this = this;
				this.$confirm('确认删除吗', '提示', {
					//type: 'warning'
				}).then(() => {
					_this.listLoading = true;
					NProgress.start();
					let para = {
						taskId: row.taskId
					};
					Request(_this, "/deleteTaskSchedule.do", para,`删除任务${row.taskName}`).then((res) => {
						_this.listLoading = false;
						NProgress.done();
						if(res.body.result == 200) {
							_this.$notify({
								title: '成功',
								message: '删除成功',
								type: 'success'
							});
						} else {
							_this.$notify({
								title: '失败',
								message: res.body.message,
								type: 'error'
							});
						}
						_this.getList();
					});

				}).catch(() => {

				});
			},
			getRooms() {
				let para = {
					page: 0,
					roomstatus: 1,
					pageSize: 0
				};
				let self = this;
				getRoomList(self, para).then((res) => {
					if(res.body.data && res.body.data.rows) {
						this.rooms = res.body.data.rows.map((item) => {
							return {
								roomId: item.roomId,
								roomName: item.roomName
							};
						})
					} else {
						this.rooms = []
					}
				})
			},
			getDevices(roomId) {
				//console.log(roomId);
				this.editForm.robotId = '';
				this.editForm.devices = [];
				this.editForm.execTime = '';
				let self = this;
				let para = {
					roomId: roomId
				}
				NProgress.start();
				getRoomDetail(self, para).then((res) => {
					//console.log(res)
					NProgress.done();
					if(res.body.data) {
						if(res.body.data.deviceList) {
							var devices = res.body.data.deviceList.map((item) => {
								return {
									id: item.deviceId,
									label: item.deviceName,
									rfid: item.rfidId,
									orderBy: item.orderBy
								}
							})
							this.devices = [{
								id: "ALL",
								label: '全选',
								children: devices
							}];
						} else {
							this.devices = [];
						}

						if(res.body.data.robotList) {
							this.roomRobots = res.body.data.robotList.map((item) => {
								return {
									robotId: item.robotId,
									robotName: item.robotName,
								}
							})
						} else {
							this.roomRobots = [];
						}
					} else {

					}
				})
			},
			handleCommand(command) {
				this.$notify({
					title: '提示',
					message: '正在开发中。。。。',
					type: 'info'
				});
				//				switch(command) {
				//					case 'a':
				//						this.execTemp();
				//						break;
				//					case 'b':
				//						console.log(command);
				//						break;
				//					case 'c':
				//						console.log(command);
				//						break;
				//					default:
				//				}
			},
			execTemp() {
				this.tempTaskVisible = true;
				this.devices = this.robots.map((item) => {
					let obj = {};
					obj.id = item.robotId;
					obj.value = item.robotName;
					return obj;
				});
			},
			//临时任务
			querySearch(queryString, cb) {
				var devices = this.devices;
				var results = queryString ? devices.filter(this.createFilter(queryString)) : devices;
				// 调用 callback 返回建议列表的数据

				cb(results);
			},
			createFilter(queryString) {
				return(devices) => {
					var res = (devices.value.indexOf(queryString.toLowerCase()) === 0);
					return res;
				};
			},
			handleSelect(item) {
				//console.log(item)
			},
			removeDomain(item) {
				var index = this.editForm.domains.indexOf(item)
				if(index !== -1) {
					this.editForm.domains.splice(index, 1)
				}
			},
			addDomain() {
				this.editForm.domains.push({
					value: '',
					key: Date.now()
				});
			}
		},
		mounted() {
			this.getRobots();
		}
	}
</script>

<style>
	.el-row {
		margin-bottom: 20px;
	}
</style>