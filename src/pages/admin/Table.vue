<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="管理员名称"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button icon="search" type="primary" v-on:click="getAccountList">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button icon="plus" type="success" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<template>
			<el-table :data="accounts" highlight-current-row v-loading="listLoading" style="width: 100%;">
				<el-table-column type="index" width="100" label="序号" align="center">
				</el-table-column>
				<el-table-column prop="account" label="管理员名称" sortable>
				   <template scope="scope">
				      <el-tag type="primary">{{scope.row.account}}</el-tag>
				   </template>    
				</el-table-column>
				<el-table-column prop="customId" label="所属机构" :formatter="formatCustom" sortable>  
				</el-table-column>
				<el-table-column inline-template :context="_self" label="操作" width="180">
					<span>
						<el-button size="small" icon="edit" @click="handleEdit(row)" align="center">编辑</el-button>
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
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label='机构' prop="customId">
				    <el-col :span="21"> 
						<el-select v-model="editForm.customId"  style="width:100%"  placeholder="请选择" >
						    <el-option
						      v-for="item in customList"
						      :key="item.customId"
						      :label="item.customName"
						      :value="item.customId">
						    </el-option>
						</el-select>
					</el-col>
					<el-col :span="3">	
						  <el-button  style="width:100%" icon="edit" @click.native="handleIconClick"></el-button>
					</el-col>	  
					</el-input>
				</el-form-item> 
				<el-form-item label="账号" prop="account">
					<el-input v-model="editForm.account" auto-complete="off"></el-input>
				</el-form-item>
				 
				<el-form-item label="密码" prop="password">
					<el-input v-model="editForm.password" type="password"></el-input>
				</el-form-item> 
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="cancel" icon="circle-cross">取 消</el-button>
				<el-button icon="upload2" type="primary" @click.native="editSubmit" :loading="editLoading">{{btnEditText}}</el-button>
			</div>
		</el-dialog>

		<el-dialog
		  title="机构信息"
		  v-model="dialogVisible"
		  size="tiny"
		  @close="close"
		   >
		   <Custom  ref="custom"></Custom>
		</el-dialog>
	</section>
</template>

<script>
	// import util from '../../common/util'
	import NProgress from 'nprogress'
	import { getAdminList,saveAccount,removeAccount,getCustoms} from 'api/admin';
	import  Custom  from 'components/custom';
	export default {
		name:'Table',
		components: {
	        Custom
	    },
		data() {
				return {
					filters: {
						name: ''
					},
					total: 0,
					page: 1,
					size:20,
					listLoading: false,
					editFormVisible: false, //编辑界面显是否显示
					dialogVisible:false,
					editFormTtile: '编辑', //编辑界面标题
					//编辑界面数据
					customLoading:false,
					customs:{},
					customList:[], 
					accounts:[],
					editForm: {
						adminId:0,
						customId:'',
						account: '',
						password:'',
					},
					editLoading: false,
					btnEditText: '提 交',
					editFormRules: {
						customId: [{
							required: true,
							message: '请指定所属机构',
							trigger: 'blur'
						}],
						account: [{
							required: true,
							message: '请输入账号',
							trigger: 'blur'
						}],
						password: [{
							required: true,
							message: '请输入密码',
							trigger: 'blur'
						}],
					}

				}
			},
		methods: {
			cancel:function(){
				 this.$refs.editForm.resetFields();
				 this.editFormVisible = false;
			},
			handleCurrentChange(val) {
				this.page = val;
				this.getAccountList();
			},
			handleSizeChange(size){
				this.page = 1;
				this.size =size;
				this.getAccountList();
			},
			formatCustom:function(row,col){
                return this.customs[row.customId];
			},
			getAccountList() {
				let para = {
					page: this.page,
					pageSize: this.size
				};
				if(this.filters.name!=''){
					para.account = this.filters.name;
				}
				this.listLoading = true;
				NProgress.start();
				let self = this;
				getAdminList(self,para).then((res) => {
					if(res.data.data){
					   this.total = res.data.data.total;
					   this.accounts = res.data.data.rows;	
					}else{
						this.total =0;
						this.accounts = [];
					}
					this.listLoading = false;
					NProgress.done();
				}); 
			},
			getCustoms:function(){
			   let _this = this;
			   let obj ={};
			   getCustoms(_this,{}).then(function(res){
			   	  _this.customList = res.body.data;
			      res.body.data.forEach(function(v){
			      	  obj[v.customId] = v.customName
			      })
			   })
			   this.customs=obj;
			},
			//显示编辑界面
			handleEdit: function(row) {
				this.editFormVisible = true;
				this.editFormTtile = '编辑';
				this.editForm.adminId = row.adminId;
				this.editForm.account = row.account;
				this.editForm.password = row.password;
				this.editForm.customId = row.customId; 
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
							// console.log(_this.editForm)
							if(_this.editForm.adminId==0){
							   let para = {
									account:_this.editForm.account, 
									customId:_this.editForm.customId,
									password:_this.editForm.password 
								};
								saveAccount(_this,para,'新增管理员').then((res) => {
									// console.log(res);
									_this.editLoading = false;
									NProgress.done();
									_this.btnEditText = '提 交';
									_this.editFormVisible = false;
                                    if(res.body.result==200){
								       _this.$notify({
											title: '成功',
											message: '新增成功',
											type: 'success'
										});	
									}else{
									   _this.$notify({
											title: '失败',
											message: res.message,
											type: 'error'
										});	
									}
									_this.getAccountList();
								});
	
							}else{
								let para = {
									id:_this.editForm.adminId,
									account:_this.editForm.account, 
									customId:_this.editForm.customId,
									password:_this.editForm.password 
								};
								 
								saveAccount(_this,para,`修改管理员${para.account}`).then((res) => {
									// console.log(res);
									_this.editLoading = false;
									NProgress.done();
									_this.btnEditText = '提 交';
									_this.editFormVisible = false;
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
									_this.getAccountList();
								});
							}
							
						}).catch(()=>{});

					}
				});

			},
			//显示新增界面
			handleAdd: function() {
				var _this = this;
				this.editFormVisible = true;
				this.editFormTtile = '新增';
                
                this.editForm.adminId =0;
                this.editForm.customId ='';
				this.editForm.account ='';
				this.editForm.password ='';
			},
			handleDel:function(row){
				var _this = this;
				this.$confirm('确认删除管理员: '+row.account+'?', '提示', {
					// type: 'warning'
				}).then(() => {
					_this.listLoading = true;
					NProgress.start();
					let para = {
						adminId: row.adminId
					};
					removeAccount(_this,para,`删除管理员${row.account}`).then((res) => {
						_this.listLoading = false;
						NProgress.done();
                        if(res.body.result==200){
                            _this.$notify({
						 		title: '成功',
								message: '删除成功',
								type: 'success'
							});	
                        }else{
                            _this.$notify({
						 		title: '失败',
								message: res.body.message,
								type: 'success'
							});	 
                        }
						
						_this.getAccountList();
					});

				}).catch(() => {

				});
			},
			handleIconClick:function(){
               this.dialogVisible=true;
			}, 
            refreshCustom:function(){
				this.dialogVisible = false;
				this.getCustoms();
			},
			close:function(){
				this.refreshCustom();
				this.$refs.custom.finish();
			}
		},
		mounted() {
			this.getCustoms();
			this.getAccountList();
		}
	}
</script>

<style scoped>

</style>