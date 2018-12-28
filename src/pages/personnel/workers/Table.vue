<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-form :inline="true" :model="filters" >
			    <el-form-item v-if="isShow">
			    	<el-select v-model="filters.custom">
					    <el-option
					      v-for="item in customs"
					      :key="item.customId"
					      :label="item.customName"
					      :value="item.customId">
					    </el-option>
					  </el-select>
			    </el-form-item>
			    <el-form-item>
			    	<el-select v-model="filters.key" placeholder="请选择查询条件" @change="changKey">
					    <el-option
					      v-for="item in columns"
					      :key="item.value"
					      :label="item.label"
					      :value="item.value">
					    </el-option>
					  </el-select>
			    </el-form-item>
				<el-form-item v-if="isAll">
					<el-input v-model="filters.value" placeholder="请输入查询字段" ></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" icon="search" v-on:click="getUsers">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="success"  @click="handleAdd" icon="plus">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<template>
			<el-table :data="users" highlight-current-row v-loading="listLoading" style="width: 100%;">
				<el-table-column type="index" width="80" label="序号" align="center">
				</el-table-column>
				<el-table-column prop="optName" label="姓 名" align="center" >
				   <template scope="scope">
			        <el-popover trigger="hover" placement="top">
			          <p>姓名: <b>{{ scope.row.optName}}</b></p>
			          <p>手机号码: <b>{{ scope.row.optContact1}}</b></p>
			          <p>邮箱地址: <b>{{ scope.row.optContact2}}</b></p>
			          <div slot="reference" class="name-wrapper">
			            <el-tag>{{ scope.row.optName }}</el-tag>
			          </div>
			        </el-popover>
			      </template> 
				</el-table-column>
				<el-table-column prop="optAccount" label="账 号"  sortable>
				</el-table-column>
				<el-table-column prop="optJobNumber" label="工 号"   sortable>
				</el-table-column>
				<!-- <el-table-column prop="optContact1" label="联系方式" width="300" sortable>
				</el-table-column> -->
				<el-table-column v-if="isShow" prop="customName" label="所属机构"  sortable>
				</el-table-column>
				<el-table-column prop="optDepartment" label="所属部门"  sortable>
				</el-table-column>
				<el-table-column prop="optStatus" label="状态" width="100" align='center' sortable>
				    <template scope="scope">
				      <el-tag :type="scope.row.optStatus==1?'success':'danger'">{{scope.row.optStatus==1?"启用":"禁用"}}</el-tag>
				   </template>    
				</el-table-column>
				<el-table-column inline-template :context="_self" label="操作" width="240" align='center'>
					<span>
						<el-button size="small" icon="edit" @click="handleEdit(row)">编辑</el-button>
						<el-button type="warning" icon="delete" size="small" @click="handleDel(row)">删除</el-button>
					</span>
				</el-table-column>
			</el-table>
		</template>

		<!--分页-->
		<el-col :span="24" class="toolbar" style="padding-bottom:10px;">
			<el-pagination 
				layout="prev, pager, next,total,sizes,jumper" 
				@current-change="handleCurrentChange" 
				:page-sizes="[10, 20, 30, 40]" 
				:page-size="size" 
				:current-page="page"
				:total="total" 
				style="float:right;"
				@size-change="handleSizeChange"
				>
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog :title="editFormTtile" v-model="editFormVisible" :close-on-click-modal="false" size="tiny">
			<el-form :model="editForm" label-width="90px" :rules="editFormRules" ref="editForm">
			     <el-form-item label="所属机构" prop="custom" v-if="isShow" >
			    	<el-select v-model="editForm.custom" style="width:100%">
					    <el-option
					      v-for="item in allCustom"
					      :key="item.customId"
					      :label="item.customName"
					      :value="item.customId">
					    </el-option>
					 </el-select>
			    </el-form-item>
				<el-form-item label="姓  名" prop="optName">
					<el-input v-model="editForm.optName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="工 号" prop="optJobNumber">
					 <el-input v-model="editForm.optJobNumber" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="账 号" prop="optAccount">
					 <el-input v-model="editForm.optAccount" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="密 码" prop="optPassword">
					 <el-input v-model="editForm.optPassword" auto-complete="off" type="password"></el-input>
				</el-form-item> 
				<el-form-item label="所属部门" prop="optDepartment">
					 <el-input v-model="editForm.optDepartment"></el-input> 
				</el-form-item>
				<el-form-item label="管辖机房" >
                   <el-select v-model="editForm.rooms" multiple placeholder="请选择机房" style="width:100%">
					    <el-option
					      v-for="item in editForm.options"
					      :key="item.roomId"
					      :label="item.roomName"
					      :value="item.roomId">
					    </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="手机号码" prop="optContact1" >
					 <el-input  v-model="editForm.optContact1" placeholder="请输入手机号"></el-input >
				</el-form-item>
				<el-form-item label="邮箱地址" prop="optContact2">
					 <el-input  v-model="editForm.optContact2" placeholder="请输入邮箱"></el-input >
				</el-form-item>
				<el-form-item label="当前状态" prop="optStatus"> 
				      <el-radio class="radio"   v-model="editForm.optStatus" label="1">启用</el-radio>
                      <el-radio class="radio"   v-model="editForm.optStatus" label="0">禁用</el-radio>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="cancel"  icon="circle-cross">取 消</el-button>
				<el-button type="primary" icon="upload2" @click.native="editSubmit" :loading="editLoading">{{btnEditText}}</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	// import util from '../../common/util'
	import NProgress from 'nprogress'
	import { getUserList,saveUser ,showDetail,removeOpt,getCustoms} from 'api/personnel';
	import { workerColumns } from '@/const';
	import { getRoomList } from 'api/room';
	import { isWscnEmail } from 'utils/validate';
    
	export default {
		data() {
				var checkContact = (rule,str, callback) => {
					let reg =  /^0?(13[0-9]|15[012356789]|17[013678]|18[0-9]|14[57])[0-9]{8}$/;
					let value = str.replace(/^\s*$/g,'');
					if(value==''){
                        return callback(new Error('手机号不能为空'));
					}else if(!reg.test(value)) {
						return callback(new Error('手机号码不正确'));
					}else{
						callback();
					}

				};
				var checkContact2 =(rule,value,callback)=>{
					if(value&&!isWscnEmail(value)){
                       return callback(new Error('邮箱格式不正确'));
					}else{
						callback();
					}
				}
				return {
					filters: {
						key: 'all',
						custom:'all',
						value: ''
					},
					users: [],
					total: 0,
					page: 1,
					size:10,
					isShow: false,
					listLoading: false,
					editFormVisible: false, //编辑界面显是否显示
					editFormTtile: '编辑', //编辑界面标题
					columns:workerColumns,
					customs:[],
					allCustom:[],
					//编辑界面数据
					editForm: {
						optId: 0,
						optName: '',
						optJobNumber:'',
						optAccount:'',
						optPassword: '',
						optContact1: '',
						optContact2:'',
						optDepartment:'',
						optStatus:'1',
						options: [],
				        rooms: [],
				        custom:''
					},
					editLoading: false,
					btnEditText: '提 交',
					isAll:false,
					editFormRules: {
						optName: [{
							required: true,
							message: '请输入姓名',
							trigger: 'blur'
						}],
						optJobNumber: [{
							required: true,
							message: '请输入工号',
							trigger: 'blur'
						}],
						optAccount: [{
							required: true,
							message: '请输入账号',
							trigger: 'blur'
						}],
						optDepartment: [{
							required: true,
							message: '请输入所属部门',
							trigger: 'blur'
						}],
						optPassword: [{
							required: true,
							message: '请输入密码',
							trigger: 'blur'
						}],
						optStatus: [{
							required: true,
							message: '请选择状态',
							trigger: 'blur'
						}],
						custom: [{
							required: true,
							message: '请选择机构',
							trigger: 'blur'
						}],
						optContact1: [{
							required: true,
							validator: checkContact,
							trigger: 'blur'
						}],
						optContact2:[{
							validator: checkContact2,
							trigger: 'blur'
						}],
					}

				}
			},
			methods: {
				//性别显示转换
				handleCurrentChange(val) {
					this.page = val;
					this.getUsers();
				},
				handleSizeChange(size){
					this.page = 1;
					this.size =size;
					this.getUsers();
				},
				changKey(){
				   this.filters.value='';
                   if(this.filters.key&&this.filters.key!="all"){
                   	  this.isAll = true;
                   }else{
                   	 this.isAll = false;
                   	 this.getUsers();
                   }
				},
				//获取用户列表
				cancel:function(){
					 this.$refs.editForm.resetFields();
					 this.editFormVisible = false;
				},
				getUsers() {
					let para = {
						page: this.page,
						pageSize: this.size,
						// optStatus:'1'
					};
					if(this.filters.key!="all"&&this.filters.value!=''){
						para[this.filters.key]= this.filters.value;
					}
					if( this.filters.custom!='all'){
						para.customId = this.filters.custom
					}
					this.listLoading = true;
					NProgress.start();
					let self= this;
			        getUserList(self,para).then((res) => {
			        	if(res.data.data){
							this.total = res.data.data.total;
							this.users = res.data.data.rows;
						}else{
							this.total=0;
							this.users=[];
						}
						this.listLoading = false;
						NProgress.done();
					});
				},
				getRooms(){
					if(this.editForm.options.length>0){
						return;
					}
					let para = {
                        page: 0,
						roomstatus:1,
						pageSize: 0
					};
					let self = this;
					getRoomList(self,para).then((res)=>{
						this.editForm.options = res.body.data.rows;
					})
				},
				getCustoms(){
				   let _this = this;
                   getCustoms(_this,{}).then(function(res){
                    
                   	if(res.body&&res.body.data){
                   		 this.allCustom =res.body.data;
                         let  data =  res.body.data.slice(0);
                         data.push({'customId':"all",'customName':"所有机构"});
                        this.customs = data;
                       
                   	 }
                   })
				},
				//删除
				handleDel: function(row) {
					//console.log(row);
					var _this = this;
					this.$confirm('确认删除用户：'+row.optName+'?', '提示', {
						//type: 'warning'
					}).then(() => {
						_this.listLoading = true;
						NProgress.start();
						let para = {
							optId: row.optId
						};

						removeOpt(_this,para,`删除操作员${row.optName}`).then((res) => {
							_this.listLoading = false;
							NProgress.done();
							if(res.body.result=="200"){
								_this.$notify({
									title: '成功',
									message: '删除成功',
									type: 'success'
								});
							}else{
								 _this.$notify({
									title: '失败',
									message: res.body.message,
									type: 'error'
								});
							}	
							_this.getUsers();
						});

					}).catch(() => {

					});
				},
				//显示编辑界面
				handleEdit: function(row) {
					let self = this;
					this.action=false;
					this.editFormVisible = true;
					this.editFormTtile = '编辑';
					this.getRooms();
					 showDetail(self,{optId:row.optId}).then((res)=>{
					 	   let users = res.body.data;
					 	    self.editForm.optId= users.optId ;
							self.editForm.optName=users.optName;
							self.editForm.optJobNumber=users.optJobNumber;
							self.editForm.optAccount=users.optAccount;
							self.editForm.optPassword= row.optPassword;
							self.editForm.optContact1= users.optContact1;
							self.editForm.optContact2= users.optContact2;
							self.editForm.optDepartment = users.optDepartment; 
							self.editForm.optStatus = users.optStatus.toString();
							self.editForm.rooms=[];
							self.editForm.custom = row.customId; 
							 
							 
						    for(let i=0, rooms=users.roomList,len=rooms.length;i<len;i++){
						    	self.editForm.rooms.push(rooms[i].roomId);
						    }
					 })  
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
								  
								let rooms=[];
								for(let i=0,rms=_this.editForm.rooms,len=rms.length;i<len;i++){
                                    let obj ={};
                                    obj.roomId = rms[i];
                                    rooms.push(obj);
								}
								if(_this.editForm.optId == 0) {
									//新增
								    let  para = {
										optName:_this.editForm.optName,
										optJobNumber:_this.editForm.optJobNumber,
										optAccount:_this.editForm.optAccount,
										optPassword:_this.editForm.optPassword,
										optContact1:_this.editForm.optContact1,
										optContact2:_this.editForm.optContact2,
										optDepartment:_this.editForm.optDepartment,
								        rooms: JSON.stringify(rooms),
								        optDepartment:_this.editForm.optDepartment,
						                optStatus:_this.editForm.optStatus
						         
								    }

								    para.customId = _this.editForm.custom?_this.editForm.custom:_this.$store.state.user.customId;
								     
									saveUser(_this,para,'新增操作员').then((res) => {
										_this.editLoading = false;
										NProgress.done();
										_this.btnEditText = '提 交';
										if(res.body.result=="200"){
											  _this.$notify({
												title: '成功',
												message: '新增成功',
												type: 'success'
											});
											_this.editFormVisible = false;
											_this.getUsers();	
										}else{
											 _this.$notify({
												title: '失败',
												message: res.body.message,
												type: 'error'
											});
										}
										
									});
								} else {
									let  para = {
										optId:_this.editForm.optId,
										optName:_this.editForm.optName,
										optJobNumber:_this.editForm.optJobNumber,
										optAccount:_this.editForm.optAccount,
										optPassword:_this.editForm.optPassword,
										optContact1:_this.editForm.optContact1,
										optContact2:_this.editForm.optContact2,
										optDepartment:_this.editForm.optDepartment,
								        rooms: JSON.stringify(rooms),
						                optStatus:_this.editForm.optStatus,
						                customId:_this.editForm.custom
								    }
								      
									saveUser(_this,para,'修改操作员').then((res) => {
										_this.editLoading = false;
										NProgress.done();
										_this.btnEditText = '提 交';
										if(res.body.result=="200"){
											  _this.$notify({
												title: '成功',
												message: '编辑成功',
												type: 'success'
											});	
										}else{
											 _this.$notify({
												title: '失败',
												message: res.body.message,
												type: 'error'
											});
										}
										_this.editFormVisible = false;
										_this.getUsers();
										
									}); 

								}

							}).catch(()=>{});

						}
					});

				},
				//显示新增界面
				handleAdd: function() {
					var _this = this;
                    this.action=true;          
					this.editFormVisible = true;
					this.editFormTtile = '新增';
                    this.getRooms();
					this.editForm.optId= 0;
					this.editForm.optName='';
					this.editForm.optJobNumber='';
					this.editForm.optAccount='';
					this.editForm.optPassword= '';
					this.editForm.optStatus= '1';
					this.editForm.optContact1='';
					this.editForm.optContact2='';
					this.editForm.optDepartment='';
				    this.editForm.rooms= [];
				    this.editForm.custom='';
					 
				}
			},
			mounted() {
			 
				if(this.$store.state.user.account =="admin"){
					this.isShow = true;
					this.getCustoms();
				}
				this.getUsers();
			}
	}
</script>

<style scoped>

</style>