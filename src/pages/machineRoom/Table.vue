<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-form :inline="true" :model="filters">
				<el-form-item v-if="isShow">
					<el-select v-model="filters.customId" @change="changeCustom">
						<el-option v-for="item in customs" :key="item.customId" :label="item.customName" :value="item.customId">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.name" placeholder="机房名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button class="filter-item" icon="search" type="primary" v-on:click="getList">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button class="filter-item" icon="plus" type="success" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>
		<!--列表-->
		<template>
			<el-table :data="rooms" highlight-current-row v-loading="listLoading" style="width: 100%;" @row-click="showDetail">
				<el-table-column type="index" width="80" label="序号" align="center">
				</el-table-column>
				<el-table-column prop="roomName" label="机房名" width="200" sortable>
					<template scope="scope">
						<el-popover trigger="hover" placement="right">
							<div>
								<p>机房名称：{{ scope.row.roomName }}</p>
								<p>机房备注：{{ scope.row.description }}</p>
								<p>温度范围：<b>{{ scope.row.scaleLower}}&nbsp;至&nbsp;{{scope.row.scaleUpper}}&nbsp;℃</b></p>
								<p>温度告警：<b>下限：{{ scope.row.warnLower}}&nbsp; 上限：{{scope.row.warnUpper}}&nbsp;℃</b></p>
								<p>湿度范围：<b>{{ scope.row.scaleLowerH}}&nbsp;至&nbsp;{{scope.row.scaleUpperH}}&nbsp;%</b></p>
								<p>湿度告警：<b>下限：{{ scope.row.warnLowerH}}&nbsp;上限：{{scope.row.warnUpperH}}&nbsp;%</b></p>
							</div>
							<div slot="reference">
								<el-tag>{{scope.row.roomName}}</el-tag>
							</div>
						</el-popover>
					</template>
				</el-table-column>
				<el-table-column prop="customName" label="所属机构" width="150" v-if="isShow">
				</el-table-column>
				<el-table-column prop="position" label="位置" >
				</el-table-column>
				<el-table-column prop="startPoint" label="初始化点" align="center" width="150">
				</el-table-column>
				<el-table-column prop="fileId" label="地图名称" align="center" width="180">
				</el-table-column>
				<el-table-column prop="roomStatus" width="80" label="状态">
					<template scope="scope">
						<el-tag :type="scope.row.roomStatus==1?'success':'danger'">{{scope.row.roomStatus==1?"启用":"禁用"}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column inline-template :context="_self" label="操作" width="420" align="center">
					<span>
 						<el-button size="small" icon="edit" @click="handleEdit(row)">编辑</el-button>
 						<el-button type="primary" icon="information" size="small" v-if="isShow" @click="upRoomMap(row)">地图配置</el-button> 
 						<el-button type="warning" icon="delete" size="small" @click="handleDel(row)">删除</el-button>
 						<el-button size="small" type="info" icon="setting" @click="handleEditNav(row.roomId)">测温点告警设置</el-button>
 					</span>
				</el-table-column>
			</el-table>
		</template>
		<!--分页-->
		<el-col :span="24" style="padding:5px 0;">
			<el-pagination layout="prev, pager, next,total,sizes,jumper" @current-change="handleCurrentChange" :page-sizes="[10, 20, 30, 40]" :page-size="size" :current-page="page" :total="total" style="float:right;" @size-change="handleSizeChange">
			</el-pagination>
		</el-col>
		<el-col :span="24">
			<div class="detail-title">{{rName}}&nbsp;&amp;&nbsp;详情</div>
		</el-col>
		<div class="toolbar">
			<div style="width:60%;float:left">
				<h4>设备详情</h4>
				<el-table :data="deviceList" highlight-current-row v-loading="deviceListLoading" style="width: 100%;">
					<el-table-column prop="deviceName" label="设备名称" width="200" sortable align="center">
					</el-table-column>
					<el-table-column prop="deviceCompany" label="设备厂商" sortable>
					</el-table-column>
					<el-table-column prop="deviceSerial" label="设备编号" width="180" sortable>
					</el-table-column>
					<el-table-column prop="deviceStatus" width="80" label="状态">
						<template scope="scope">
							<el-tag :type="scope.row.deviceStatus==1?'success':'danger'">{{scope.row.deviceStatus==1?"启用":"禁用"}}</el-tag>
						</template>
					</el-table-column>
					<el-table-column prop="deviceType" label="设备类型" align="center" width="100">
					</el-table-column>
					<el-table-column prop="deviceModel" label="设备型号" align="center" width="100">
					</el-table-column>
				</el-table>
			</div>
			<div style="width:39%;float:right">
				<h4>机器人详情</h4>
				<el-table :data="robotList" highlight-current-row v-loading="robotListLoading" style="width: 100%;">
					<el-table-column prop="robotName" label="名称" sortabl width="120">
					</el-table-column>
					<el-table-column prop="robotSerial" label="序列号" align="center" width="180">
					</el-table-column>
					<el-table-column prop="realtimeStatus" label="运行情况" align="center" :formatter="formatStatus">
					</el-table-column>
					<el-table-column prop="status" width="100" label="状态">
						<template scope="scope">
							<!--<el-tag :type="scope.row.status==1?'success':'danger'">{{scope.row.status==1?"启用":"禁用"}}</el-tag>-->
							<el-tag :type="type(scope.row.status)">{{formatRealTimeStatus(scope.row)}}</el-tag>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</div>

		<!--编辑界面-->
		<el-dialog :title="editFormTtile" v-model="editFormVisible" :close-on-click-modal="false" size="tiny" @close="closeEditFrom()">
			<el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
				<el-form-item label="机房名称" prop="roomName">
					<el-input v-model="editForm.roomName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="所属机构" prop="custom" v-if="isShow">
					<el-select v-model="editForm.custom" style="width:100%">
						<el-option v-for="item in allCustom" :key="item.customId" :label="item.customName" :value="item.customId">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="机房描述">
					<el-input type="textarea" v-model="editForm.description"></el-input>
				</el-form-item>
				<el-form-item label="机房位置" prop='position' class="item">
					<el-input v-model="editForm.position" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="机器人" class="item">
					<el-select v-model="editForm.robots" multiple placeholder="请选择机器人" style="width:100%">
						<el-option v-for="item in robots" :key="item.robotId" :label="item.robotName" :value="item.robotId"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="初始化点" prop='startPoint' class="item">
					<el-input v-model="editForm.startPoint" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="地图名称" prop='fileId' class="item">
					<el-input v-model="editForm.fileId" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="温度范围">
					<el-col :span="10">
						<el-input v-model="editForm.scaleLower" auto-complete="off"></el-input>
					</el-col>
					<el-col :span="2" class="unit">至</el-col>
					<el-col :span="10">
						<el-input v-model="editForm.scaleUpper" auto-complete="off"></el-input>
					</el-col>
					<el-col :span="2" class="unit">℃</el-col>
				</el-form-item>

				<el-form-item label="湿度范围">
					<el-col :span="10">
						<el-input v-model="editForm.scaleLowerH" auto-complete="off"></el-input>
					</el-col>
					<el-col :span="2" class="unit">至</el-col>
					<el-col :span="10">
						<el-input v-model="editForm.scaleUpperH" auto-complete="off"></el-input>
					</el-col>
					<el-col :span="2" class="unit">%</el-col>
				</el-form-item>
				<el-form-item label="温度告警">
					<el-col :span="3">
						下限：
					</el-col>
					<el-col :span="8">
						<el-input v-model="editForm.warnLower"></el-input>
					</el-col>
					<el-col :span="3">
						&nbsp;上限：
					</el-col>
					<el-col :span="8">
						<el-input v-model="editForm.warnUpper"></el-input>
					</el-col>
					<el-col :span="2" class="unit">℃</el-col>
				</el-form-item>
				<el-form-item label="湿度告警">
					<el-col :span="3">
						下限：
					</el-col>
					<el-col :span="8">
						<el-input v-model="editForm.warnLowerH"></el-input>
					</el-col>
					<el-col :span="3">
						&nbsp;上限：
					</el-col>
					<el-col :span="8">
						<el-input v-model="editForm.warnUpperH"></el-input>
					</el-col>
					<el-col :span="2" class="unit">%</el-col>
				</el-form-item>
				<el-form-item label="是否启用" prop="roomStatus">
					<el-radio class="radio" v-model="editForm.roomStatus" label="1">启用</el-radio>
					<el-radio class="radio" v-model="editForm.roomStatus" label="0">禁用</el-radio>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button icon="circle-cross" @click.native="closeEditFrom">取 消</el-button>
				<el-button icon="upload2" type="primary" @click.native="editSubmit" :loading="editLoading">{{btnEditText}}</el-button>
			</div>
		</el-dialog>
		<!--<el-dialog title="文件上传" v-model="dialogVisible" size="tiny" top="25%">
			<Upload :deviceId="deviceId"></Upload>
		</el-dialog>-->

		<!--<el-dialog title="标签列表" v-model="tagListVisible">
			<ElectronicTag :roomId="roomId" :rfid="rfid" @editTag="editTag" @addTag="addTag" ref="tag_list"></ElectronicTag>
		</el-dialog>-->

		<!--<el-dialog :title="tagFormTtile" v-model="tagFormVisible" :close-on-click-modal="false" size="tiny" @close="resetForm()">
			<TagForm :tagData="tagData" @closeTagForm="closeTagForm" @refreshList="refreshList" ref="tag_form"></TagForm>
		</el-dialog>-->

		<el-dialog title="测温点维护" v-model="navListVisible">
			<NavConfigList :roomId="navRoomId" ref="nav_list" @addNav="addNav" @editNav="editNav"></NavConfigList>
		</el-dialog>

		<el-dialog :title="navFormTtile" v-model="navConfigFormVisible" :close-on-click-modal="false" size="tiny" @close="resetNavForm()">
			<NavConfigForm :navConfigData="navConfigData" @closeNavForm="closeNavForm" @refreshList="refreshNavList" ref="nav_form"></NavConfigForm>>
		</el-dialog>
		<el-dialog title="温湿度分布图维护" v-model="upMapVisible" :close-on-click-modal="false" size="tiny">
			<el-form :model="upMapModel" label-width="90px">
				<el-form-item label="分布图文件">
					<UpMapload :param="upMapModel" :url="upMapUrl" strRegExp=".PNG|.JPG|.JPEG|.BMP" ref="uploadMap" :callback="cancel" />
				</el-form-item>
				<el-form-item label="转换公式" prop="formula">
					<el-radio class="radio" v-model="upMapModel.is_formula" label="1">启用</el-radio>
					<el-radio class="radio" v-model="upMapModel.is_formula" label="0">不启用</el-radio>
				</el-form-item>
				<el-col :span="12">
					<el-form-item label="X1" prop="x1">
						<el-input v-model="upMapModel.x1" auto-complete="off"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="Y1" prop="y1">
						<el-input v-model="upMapModel.y1" auto-complete="off"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="X2" prop="x2">
						<el-input v-model="upMapModel.x2" auto-complete="off"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="Y2" prop="y2">
						<el-input v-model="upMapModel.y2" auto-complete="off"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="X3" prop="x3">
						<el-input v-model="upMapModel.x3" auto-complete="off"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="Y3" prop="y3">
						<el-input v-model="upMapModel.y3" auto-complete="off"></el-input>
					</el-form-item>
				</el-col>

			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="cancel" icon="circle-cross">取 消</el-button>
				<el-button type="primary" icon="upload2" @click.native="upMapSubmit">{{upMapText}}</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	// import util from '../../common/util'
	import NProgress from 'nprogress'
	import { realtimeStatus, realTimeTypes, robotStatusForObj, robotStatusTypes } from '@/const';
	import { getRoomList, getRoomDetail, getRobots, saveRoom, removeRoom } from 'api/room';
	import { parseTime } from '../../utils';
	 
	import UpMapload from 'components/upload/upMap';
	 
	import NavConfigList from 'components/navConfig';
	import NavConfigForm from 'components/navConfig/NavConfigForm';
	import { getCustoms } from 'api/admin';

	export default {
		components: {
			NavConfigList,
			NavConfigForm,
			UpMapload
		},
		data() {
			var checkNum = (rule, value, callback) => {
				setTimeout(() => {
					if(value && isNaN(value)) {
						callback(new Error('请输入数字型'));
					} else {
						callback()
					}
				}, 500);
			};
			return {
				filters: {
					name: '',
					customId: 'all'
				},
				rooms: [],
				total: 0,
				page: 1,
				size: 20,
				listLoading: false,
				isShow: false,
				rName: '',
				customs: [],
				allCustom: [],
				robotListLoading: false,
				deviceListLoading: false,
				editFormVisible: false, //编辑界面显是否显示
				editFormTtile: '编辑', //编辑界面标题
				//detial
				robotList: [],
				deviceList: [],
				editForm: {
					roomId: 0,
					roonName: '',
					description: '',
					position: '',
					robots: [],
					roomStatus: 1,
					custom: '',
					scaleUpper: '',
					scaleLower: '',
					warnUpper: '',
					warnLower: '',
					scaleUpperH: '',
					scaleLowerH: '',
					warnUpperH: '',
					warnLowerH: '',
					fileId: '',
					startPoint: '',
				},
				robots: [],
				//edit
				editLoading: false,
				btnEditText: '提 交',
				editFormRules: {
					roomName: [{
						required: true,
						message: '请输入机房名称',
						trigger: 'blur'
					}],
					startPoint: [{
						required: true,
						message: '请输入初始化点',
						trigger: 'blur'
					}],
					fileId: [{
						required: true,
						message: '请输入机房',
						trigger: 'blur'
					}],
					scaleUpper: [{
						validator: checkNum,
						trigger: 'blur'
					}],
					scaleLower: [{
						validator: checkNum,
						trigger: 'blur'
					}],
					warnUpper: [{
						validator: checkNum,
						trigger: 'blur'
					}],
					warnLower: [{
						validator: checkNum,
						trigger: 'blur'
					}],
					scaleUpperH: [{
						validator: checkNum,
						trigger: 'blur'
					}],
					scaleLowerH: [{
						validator: checkNum,
						trigger: 'blur'
					}],
					warnLowerH: [{
						validator: checkNum,
						trigger: 'blur'
					}],
					warnUpperH: [{
						validator: checkNum,
						trigger: 'blur'
					}]
				},
//				dialogVisible: false,
//				deviceId: '',
				//tagList
//				tagListVisible: false,
//				roomId: '',
//				rfid: '',
				//tagForm
//				tagFormTtile: "新增",
//				tagFormVisible: false,
//				tagData: {
//					id: 0,
//					roomId: "",
//					rfidId: "",
//					rfidType: 1,
//					lightDistribution: 0,
//					numDistribution: 0,
//					lightNum: 0,
//					numNum: 0,
//					ledType: 0,
//					ledNum: 0
//				},
				navListVisible: false,
				navConfigFormVisible: false,
				navRoomId: '',
				navFormTtile: "新增",
				navConfigData: {
					id: 0,
					roomId: "",
					pointerId: '',
					name: '',
					tempUpper: '',
					tempLower: '',
					humidityUpper: '',
					humidityLower: '',
				},
				upMapVisible: false,
				upMapUrl: '/uploadRoomMap.action',
				upMapModel: {
					roomID: '',
					is_formula: '1',
					x1: '',
					x2: '',
					x3: '',
					y1: '',
					y2: '',
					y3: ''
				},
				upMapText: '上传'
			}
		},
		methods: {
			formatStatus: function(row, c) {
				return realtimeStatus[row.realtimeStatus];
			},

			formatTime: function(r, c) {
				return parseTime(r.createTime, '{y}-{m}-{d} {h}:{i}')
			},
			type: function(status) {
				return robotStatusTypes[status]
			},
			formatRealTimeStatus: function(row, column) {
				return robotStatusForObj[row.status];
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
				let self = this;
				getRobots(self, {}).then((res) => {
					this.robots = res.body.data;
				})
			},
			closeEditFrom: function() {
				this.editFormVisible = false;
				this.$refs.editForm.resetFields();
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
			//获取用户列表
			getList() {
				let para = {
					page: this.page,
					pageSize: this.size,
					// roomStatus:'1',
				};
				if(this.filters.name != '') {
					para.roomName = this.filters.name;
				}
				if(this.filters.customId != 'all') {
					para.customId = this.filters.customId
				}

				this.listLoading = true;
				NProgress.start();
				let self = this;
				getRoomList(self, para).then((res) => {
					if(res.data.data) {
						this.total = res.data.data.total;
						this.rooms = res.data.data.rows;
						if(this.rooms.length > 0) {
							let room = this.rooms[0]
							this.showDetail(room);
						}
					} else {
						this.total = 0;
						this.rooms = [];
						this.robotList = [];
						this.deviceList = [];
					}
					this.listLoading = false;
					NProgress.done();
				});
			},
			showDetail: function(r, e, c) {
				this.rName = r.roomName;
				this.robotListLoading = true;
				this.deviceListLoading = true;
				if(!r.roomId || r.roomId == '') {
					this.robotListLoading = false;
					this.deviceListLoading = false;
					return
				}
				let para = {
					roomId: r.roomId
				}
				NProgress.start();
				let self = this;
				getRoomDetail(self, para).then((res) => {
					this.robotList = res.data.data.robotList;
					this.deviceList = res.data.data.deviceList
					this.robotListLoading = false;
					this.deviceListLoading = false;
					NProgress.done();
				})
			},
			//删除
			handleDel: function(row) {
				//console.log(row);
				var _this = this;
				this.$confirm('确认删除：' + row.roomName + '？', '提示', {
					//type: 'warning'
				}).then(() => {
					_this.listLoading = true;
					NProgress.start();
					let para = {
						roomId: row.roomId
					};
					removeRoom(_this, para,`删除机房${row.roomName}`).then((res) => {
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
			handleEditNav: function(roomId) {
				this.navRoomId = roomId;
				this.navListVisible = true;
				this.$nextTick(function() {
					this.$refs.nav_list.getNavs();
				})
			},
			//显示编辑界面
			handleEdit: function(row) {
				this.getRobots();
				this.editFormVisible = true;
				this.editFormTtile = '编辑';
				this.editForm.roomId = row.roomId,
					this.editForm.roomName = row.roomName,
					this.editForm.description = row.description,
					this.editForm.position = row.position
				// this.editForm.robots = robots; 
				this.editForm.roomStatus = row.roomStatus.toString();
				this.editForm.custom = row.customId;
				this.editForm.scaleUpper = row.scaleUpper;
				this.editForm.scaleLower = row.scaleLower;
				this.editForm.warnUpper = row.warnUpper;
				this.editForm.warnLower = row.warnLower;
				this.editForm.scaleUpperH = row.scaleUpperH;
				this.editForm.scaleLowerH = row.scaleLowerH
				this.editForm.warnUpperH = row.warnUpperH;
				this.editForm.warnLowerH = row.warnLowerH;
				this.editForm.fileId = row.fileId;
				this.editForm.startPoint = row.startPoint;
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
							let robots = _this.editForm.robots,
								robotList = [];
							for(let i = 0, len = robots.length; i < len; i++) {
								let obj = {};
								obj.robotId = robots[i]
								robotList.push(obj);
							}

							if(_this.editForm.roomId == 0) {
								//新增  
								let para = {
									roomName: _this.editForm.roomName,
									description: _this.editForm.description,
									position: _this.editForm.position,
									robots: JSON.stringify(robotList),
									roomStatus: _this.editForm.roomStatus,
									scaleUpper: _this.editForm.scaleUpper,
									scaleLower: _this.editForm.scaleLower,
									warnUpper: _this.editForm.warnUpper,
									warnLower: _this.editForm.warnLower,
									scaleUpperH: _this.editForm.scaleUpperH,
									scaleLowerH: _this.editForm.scaleLowerH,
									warnUpperH: _this.editForm.warnUpperH,
									warnLowerH: _this.editForm.warnLowerH,
									fileId: _this.editForm.fileId,
									startPoint: _this.editForm.startPoint
								};
								para.customId = _this.editForm.custom ? _this.editForm.custom : _this.$store.state.user.customId;
								saveRoom(_this, para,`新增房间${_this.editForm.roomName}`).then((res) => {
									_this.editLoading = false;
									NProgress.done();
									_this.btnEditText = '提 交';
									if(res.body.result == 200) {
										_this.$notify({
											title: '成功',
											message: '新增成功',
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
							} else {
								//编辑 
								let para = {
									roomId: _this.editForm.roomId,
									roomName: _this.editForm.roomName,
									description: _this.editForm.description,
									position: _this.editForm.position,
									robots: robotList,
									roomStatus: _this.editForm.roomStatus,
									customId: _this.editForm.custom,
									scaleUpper: _this.editForm.scaleUpper,
									scaleLower: _this.editForm.scaleLower,
									warnUpper: _this.editForm.warnUpper,
									warnLower: _this.editForm.warnLower,
									scaleUpperH: _this.editForm.scaleUpperH,
									scaleLowerH: _this.editForm.scaleLowerH,
									warnUpperH: _this.editForm.warnUpperH,
									warnLowerH: _this.editForm.warnLowerH,
									fileId: _this.editForm.fileId,
									startPoint: _this.editForm.startPoint
								};

								saveRoom(_this, para,`修改房间${_this.editForm.roomName}`).then((res) => {
									_this.editLoading = false;
									NProgress.done();
									_this.btnEditText = '提 交';
									if(res.body.result == 200) {
										_this.$notify({
											title: '成功',
											message: '编辑成功',
											type: 'success'
										});
										_this.editFormVisible = false;
										_this.getList();
									} else {
										_this.$notify({
											title: '失败',
											message: res.body.message,
											type: 'error'
										});
									}
								});
							}
						}).catch(() => {});
					}
				});
			},
			//显示新增界面
			handleAdd: function() {
				var _this = this;

				this.editFormVisible = true;
				this.editFormTtile = '新增';
				this.getRobots();
				this.editForm.custom = "",
					this.editForm.roomId = '';
				this.editForm.roomName = '';
				this.editForm.description = '';
				this.editForm.position = '';
				this.editForm.robots = [];
				this.editForm.roomStatus = '1';
				this.editForm.scaleUpper = '';
				this.editForm.scaleLower = '';
				this.editForm.warnUpper = '';
				this.editForm.warnLower = '';
				this.editForm.scaleUpperH = '';
				this.editForm.scaleLowerH = '';
				this.editForm.warnUpperH = '';
				this.editForm.warnLowerH = '';
			},
			changeCustom: function() {
				this.filters.name = "";
				this.getList();
			},
//			handleEditTag: function(r) {
//				this.rfid = this.tagData.rfidId = r.rfidId;
//				this.roomId = this.tagData.roomId = r.roomId;
//				this.tagListVisible = true;
//				this.$nextTick(function() {
//					this.$refs.tag_list.getRfids();
//				})
//
//			},
//			handleEditVedio: function(r) {
//				this.deviceId = r.deviceId;
//				this.dialogVisible = true;
//			},
//			editTag: function(r) {
//				this.tagData = JSON.parse(JSON.stringify(r));
//				this.tagFormVisible = true;
//				this.tagFormTtile = "编辑";
//			},
//			addTag: function() {
//				this.tagData.id = 0;
//				this.tagData.rfidType = 1;
//				this.tagData.lightDistribution = 0;
//				this.tagData.numDistribution = 0;
//				this.tagData.lightNum = 0;
//				this.tagData.numNum = 0;
//				this.tagData.ledType = 0;
//				this.tagData.ledNum = 0;
//				this.tagFormVisible = true;
//				this.tagFormTtile = "新增";
//
//			},
//			closeTagForm: function() {
//				this.tagFormVisible = false;
//			},
//			refreshList: function() {
//				this.tagFormVisible = false;
//				this.$refs.tag_list.getRfids();
//			},
//			resetForm: function() {
//				this.$refs.tag_form.resetForm()
//			},
			//nav
			resetNavForm: function() {
				this.$refs.nav_form.resetForm()
			},

			editNav: function(r) {
				this.navConfigData = JSON.parse(JSON.stringify(r));
				this.navConfigFormVisible = true;
				this.navFormTtile = "编辑";
			},
			refreshNavList: function() {
				this.navConfigFormVisible = false;
				this.$refs.nav_list.getNavs();
			},
			closeNavForm: function() {
				this.navConfigFormVisible = false;
			},
			addNav: function() {
				this.navConfigData.id = 0;
				this.navConfigData.roomId = this.navRoomId;
				this.navConfigData.pointerId = '';
				this.navConfigData.name = '';
				this.navConfigData.tempUpper = '';
				this.navConfigData.tempLower = '';
				this.navConfigData.humidityUpper = '';
				this.navConfigData.humidityLower = '';
				this.navConfigFormVisible = true;
				this.navFormTtile = "新增";
			},
			upRoomMap: function(r) {
				this.upMapVisible = true;
				this.upMapModel.roomId = r.roomId;
				this.upMapModel.is_formula = '1';
				this.upMapModel.x1 = '';
				this.upMapModel.x2 = '';
				this.upMapModel.x3 = '';
				this.upMapModel.y1 = '';
				this.upMapModel.y2 = '';
				this.upMapModel.y3 = ''

			},
			cancel: function() {
				this.upMapVisible = false;
			},
			upMapSubmit: function() {
				this.$refs.uploadMap.submit();
			}
		},
		mounted() {
			if(this.$store.state.user.account == "admin") {
				this.isShow = true;
				this.getCustoms();
			}
			this.getList();
		}
	}
</script>

<style scoped>
	.link-type {
		color: #337ab7;
		cursor: pointer;
	}
	
	.item {
		width: 49%;
		display: inline-block;
	}
	
	.detail-title {
		font-size: 16px;
		font-weight: bold;
		min-height: 40px;
		line-height: 40px;
		color: #fff;
		background: #2178f1 linear-gradient(90deg, #2178f1 0%, #2178f1 0%, #20b6f9 100%, #20b6f9 100%);
		border-top-left-radius: 4px;
		border-top-right-radius: 4px;
		padding-left: 20px;
	}
	
	h4 {
		padding: 0;
		margin: 5px 0;
	}
	
	.unit {
		text-align: center;
		font-size: 16px;
	}
	
</style>