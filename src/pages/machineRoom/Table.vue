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
						<!-- <el-popover trigger="hover" placement="right">
							<div>
								<p>机房名称：{{ scope.row.roomName }}</p>
								<p>机房备注：{{ scope.row.description }}</p>
								<p>温度范围：<b>{{ scope.row.scaleLower}}&nbsp;至&nbsp;{{scope.row.scaleUpper}}&nbsp;℃</b></p>
								<p>温度告警：<b>下限：{{ scope.row.warnLower}}&nbsp; 上限：{{scope.row.warnUpper}}&nbsp;℃</b></p>
								<p>湿度范围：<b>{{ scope.row.scaleLowerH}}&nbsp;至&nbsp;{{scope.row.scaleUpperH}}&nbsp;%</b></p>
								<p>湿度告警：<b>下限：{{ scope.row.warnLowerH}}&nbsp;上限：{{scope.row.warnUpperH}}&nbsp;%</b></p>
							</div>
							<div slot="reference"> -->
								<el-tag>{{scope.row.roomName}}</el-tag>
							<!-- </div> -->
						<!-- </el-popover> -->
					</template>
				</el-table-column>
				<el-table-column prop="customName" label="所属机构" width="200" v-if="isShow">
				</el-table-column>
				<el-table-column prop="position" label="地址" >
				</el-table-column>
				<el-table-column prop="startPoint" label="初始化点" align="center" width="150">
				</el-table-column>
				<el-table-column prop="fileId" label="地图名称" align="center" width="180">
				</el-table-column>
				<el-table-column label="机房音频" width="120" align="center">
				    <template scope="scope">
					  <el-button  size="small"  type="info" @click="uploadAudio(scope.row)">音频文件</el-button>
					</template>  
				</el-table-column>
				<el-table-column prop="roomStatus" width="80" label="状态">
					<template scope="scope">
						<el-tag :type="scope.row.roomStatus==1?'success':'danger'">{{scope.row.roomStatus==1?"启用":"禁用"}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column inline-template :context="_self" label="操作" :width="isShow?520:420" align="center">
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
		<el-col :span="24" class="detail-title">
			{{currentRoom.roomName}}&nbsp;&amp;&nbsp;详情
		</el-col>
		<el-row :gutter="20">
			<el-col :span="18">
				<div class="toolbar">
				<h4>机器人详情</h4>
				<el-table :data="robotList" highlight-current-row v-loading="robotListLoading" style="width:99%">
					<el-table-column type="index" label="#" width="50">
					</el-table-column>
					<el-table-column prop="robotName" label="机器人名称" sortabl width="200">
					</el-table-column>
					<el-table-column prop="robotSerial" label="序列号" align="center" width="200">
					</el-table-column>
					<el-table-column prop="realtimeStatus" label="运行情况" align="center" :formatter="formatStatus">
					</el-table-column>
					<el-table-column prop="status" width="120" label="状态" align="center">
						<template scope="scope">
							<!--<el-tag :type="scope.row.status==1?'success':'danger'">{{scope.row.status==1?"启用":"禁用"}}</el-tag>-->
							<el-tag :type="type(scope.row.status)">{{formatRealTimeStatus(scope.row)}}</el-tag>
						</template>
					</el-table-column>
				</el-table>
				</div>
			</el-col>
			<el-col :span="6">
				<div class="toolbar">
				<h4>机房概况</h4>
				<p>机柜总数：<span class="card_c">{{deviceList.length}}</span></p>
				<p>温度范围：<span class="card_c">{{currentRoom.scaleLower?(currentRoom.scaleLower+'~'+currentRoom.scaleUpper+'°C'):''}}</span></p>
				<p>湿度范围：<span class="card_c">{{currentRoom.scaleLowerH?(currentRoom.scaleLowerH+'~'+currentRoom.scaleUpperH+'%'):''}}</span></p>
				<p>温度告警：<span class="card_c">{{currentRoom.warnLower?(currentRoom.warnLower+'~'+currentRoom.warnUpper+'°C'):''}}</span></p>
				<p>湿度告警：<span class="card_c">{{currentRoom.warnLowerH?(currentRoom.warnLowerH+'~'+currentRoom.warnUpperH+'°C'):''}}</span></p>
				<p>机房备注：{{ currentRoom.description?currentRoom.description:''}}</p>
				</div>
			</el-col>
		</el-row>	
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
				<el-form-item label="地址" prop='position'  >
					<el-input v-model="editForm.position" auto-complete="off"></el-input>
				</el-form-item>
				<!-- <el-form-item label="机器人">
					<el-select v-model="editForm.robots" multiple placeholder="请选择机器人" style="width:100%">
						<el-option v-for="item in robots" :key="item.robotId" :label="item.robotName" :value="item.robotId"></el-option>
					</el-select>
				</el-form-item> -->
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
				<el-form-item label="备注">
					<el-input type="textarea" v-model="editForm.description"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button icon="circle-cross" @click.native="closeEditFrom">取 消</el-button>
				<el-button icon="upload2" type="primary" @click.native="editSubmit" :loading="editLoading">{{btnEditText}}</el-button>
			</div>
		</el-dialog>
		<el-dialog title="文件上传" v-model="dialogVisible" size="tiny" top="25%">
			<el-upload
			    class="upload_demo"
				:data="para"
				drag
				:file-list="fileList"
				:action="uploadFileUrl"
				:before-upload ="handlePreview"
				:on-success="handleSuccess"
				:on-error="handleError"
				:on-remove="handleRemove"
				multiple>
				<i class="el-icon-upload"></i>
				<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
				<div class="el-upload__tip" slot="tip">只能上传mp3文件</div>
			</el-upload>
		</el-dialog>

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
	import { getRoomList, getRoomDetail, saveRoom, removeRoom,removeAudio,getAudiosByRoom} from 'api/room';
	import { parseTime } from 'utils';
	import UpMapload from 'components/upload/upMap';
	import NavConfigList from 'components/navConfig';
	import NavConfigForm from 'components/navConfig/NavConfigForm';
	import { getCustoms } from 'api/personnel';
	import{ uploadFileUrl } from 'api/api';

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
				size: 10,
				listLoading: false,
				isShow: false,
				customs: [],
				allCustom: [],
				robotListLoading: false,
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
				uploadFileUrl,
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
                currentRoom:'',
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
				upMapText: '上传',
				dialogVisible:false,
				fileList:[],
				para:{},
			}
		},
		methods: {
			handlePreview(file,fileList){
				if(this.fileList.length>4){
					this.$notify.info({
						title: '提示',
						message: '最多只能保存5条，请先删除后再上传',
						duration:2000,
						offset: 300
					}); 
					return false;
				}else{
					var strRegex = "(.MP3)$"; 
					var reg=new RegExp(strRegex);
					if(reg.test(file.name.toUpperCase())){
					    return true;
					}else{
						this.$notify.info({
							title: '提示',
							message: '文件格式不正确',
							duration:2000,
							offset: 300
						});
						return false;
					}
				}
			},
		    handleSuccess(res, file, fileList){
				if(res.result===200){
					this.$notify.success({
						title: '成功',
						message: '文件上传成功',
						duration:2000,
						offset: 300
					});
				}else{
				   this.$notify.error({
						title: '失败',
						message: '文件上传失败',
						duration:2000,
						offset: 300
					});	
				}
                this.getFileByRoom()
			},
			handleError(e,file,fileList){
				this.$notify.error({
					title: '失败',
					message: '通信失败',
					duration:2000,
					offset: 300
				});
				this.getFileByRoom()
			},
			handleRemove(file,fileList){
			   let _this = this;
               removeAudio(_this,{fileId:file.fileId,fileUrl:file.fileUrl}).then(res=>{
                  if(res.body.result===200){
					 this.$notify.success({
						title: '成功',
						message: '删除成功',
						duration:2000,
						offset: 300
					}); 
				  }else{
					this.$notify.error({
						title: '失败',
						message: '删除失败',
						duration:2000,
						offset: 300
					});	  
				  }
				   this.getFileByRoom()
			   })
			  
			},
			uploadAudio(r){
				let _this= this;
				getAudiosByRoom(_this,{roomId:r.roomId,page:1,pageSize:0,taskType:'4'}).then(res=>{
					let body = res.body
				  if(body.result==200){
					this.dialogVisible = true;
				    this.para = {roomId:r.roomId,taskType:'4'}
					this.fileList=body.data?body.data.list.map(item=>({name:item.fileName,fileId:item.fileId,fileUrl:item.fileUrl})):[];
				  }
				})	 
			},
			getFileByRoom(){
				let _this =this;
                getAudiosByRoom(_this,{roomId:this.currentRoom.roomId,taskType:'4',page:1,pageSize:0,}).then(res=>{
					let body = res.body
				  if(body.result==200){
					this.fileList=body.data?body.data.list.map(item=>({name:item.fileName,fileId:item.fileId,fileUrl:item.fileUrl})):[];
				  }
				})
			},
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
						this.$store.dispatch('setRooms',res.data.data.rows)
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
				this.currentRoom =r;
				this.robotListLoading = true;
				if(!r.roomId || r.roomId == '') {
					this.robotListLoading = false;
					return
				}
				let para = {
					roomId: r.roomId
				}
				NProgress.start();
				let self = this;
				getRoomDetail(self, para).then((res) => {
					if(res.body.data){
						this.robotList = res.body.data.robotList;
						this.deviceList = res.body.data.rbDeviceInfos?res.body.data.rbDeviceInfos:[];
					}
					this.robotListLoading = false;
					NProgress.done();
				})
			},
			//删除
			handleDel: function(row) {
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
				// this.$nextTick(function() {
					// this.$refs.nav_list.getNavs();
				// })
			},
			//显示编辑界面
			handleEdit: function(row) {
				this.editFormVisible = true;
				this.editFormTtile = '编辑';
				this.editForm={...row,robots:row.robotList?row.robotList.map(item=>(item.robotId)):[]}
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
									robots: JSON.stringify(robotList),
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
				this.editForm.startPoint ="";
				this.editForm.scaleLowerH = '';
				this.editForm.warnUpperH = '';
				this.editForm.warnLowerH = '';
				this.editForm.fileId = '';
			},
			changeCustom: function() {
				this.filters.name = "";
				this.getList();
			},
 
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
		margin-bottom:20px;
	}
	
	h4 {
		padding: 0;
		margin: 5px 0;
	}
	
	.unit {
		text-align: center;
		font-size: 16px;
	}
	.card_c{
	 padding: 10px;
     font-size: 12px;
     color: rgb(234, 238, 25);
	}
	.upload_demo{
		text-align: center;
	}
</style>