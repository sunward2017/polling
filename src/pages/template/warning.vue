 <template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-form :inline="true" :model="filters" >
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
				<el-form-item>
					<el-input v-model="filters.value" placeholder="请输入查询字段" ></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" icon="search" v-on:click="getWarnList">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="success"  @click="handleAdd" icon="plus">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<template>
			<el-table :data="warnData" highlight-current-row v-loading="listLoading" style="width: 100%;">
				<el-table-column type="index" width="80" label="序号" align="center">
				</el-table-column>
				<el-table-column prop="robotName" label="机器人名称" width="240" align='center' sortable>
				</el-table-column>
				<el-table-column prop="warnMobile" label="告警手机" width="240" align='center'  sortable>
				</el-table-column> 
				<el-table-column prop="warnEmail" label="告警邮箱" align='center' sortable>
				</el-table-column>
				<el-table-column prop="pileCount" label="上充电桩次数" width="150" align='center' sortable>
				</el-table-column>
				<el-table-column inline-template :context="_self" label="操作" width="180" align='center'>
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
			<el-form :model="editForm" label-width="120px" :rules="editFormRules" ref="editForm">
			     <el-form-item label="机器人名称" prop="robotId">
			    	<el-select v-model="editForm.robotId" style="width:100%" :disabled="isEdit">
					    <el-option
					      v-for="item in workRobos"
					      :key="item.robotId"
					      :label="item.robotName"
					      :value="item.robotId">
					    </el-option>
					 </el-select>
			    </el-form-item>
				<el-form-item label="告警手机号" prop="warnMobile" >
					 <el-input  v-model="editForm.warnMobile" placeholder="请输入手机号"></el-input >
				</el-form-item>
				<el-form-item label="告警邮箱" prop="warnEmail">
					 <el-input  v-model="editForm.warnEmail" placeholder="请输入邮箱"></el-input >
				</el-form-item>
				<el-form-item label="上充电桩次数" prop="pileCount">
					 <el-input v-model="editForm.pileCount"></el-input> 
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
	import { getRobotWarnList} from 'api/room';
	import { WARNMSGCOLUMNS} from '@/const';
	import { getWorkerRobos,saveRobotWarn,removeRobotWarn} from 'api/robot';
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
					if(value.trim()==""){
                        return callback(new Error("邮箱不可为空"));
					}else if(value&&!isWscnEmail(value)){
                       return callback(new Error('邮箱格式不正确'));
					}else{
						callback();
					}
				}
				return {
					filters: {
						key: 'robotName',
						value: ''
					},
					warnData: [],
					total: 0,
					page: 1,
					size:20,
					listLoading: false,
					editFormVisible: false, //编辑界面显是否显示
					editFormTtile: '编辑', //编辑界面标题
					columns:WARNMSGCOLUMNS,
					workRobos:[],
					isEdit:false,
					//编辑界面数据
					editForm: {
						id:'',
						robotId:'',
						warnMobile:'',
						warnEmail: '',
						pileCount: '',
					},
					editLoading: false,
					btnEditText: '提 交',
					isAll:false,
					editFormRules: {
						robotId: [{
							required: true,
							message: '机器人不可为空',
							trigger: 'change'
						}],
						warnMobile: [{
							required: true,
							validator: checkContact,
							trigger: 'blur'
						}],
						warnEmail:[{
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
					this.getWarnList();
				},
				handleSizeChange(size){
					this.page = 1;
					this.size =size;
					this.getWarnList();
				},
				changKey(){
				   this.filters.value='';
                   if(this.filters.key&&this.filters.key!="all"){
                   	  this.isAll = true;
                   }else{
                   	 this.isAll = false;
                   	 this.getWarnList()
                   }
				},
				//获取用户列表
				cancel:function(){
					 this.$refs.editForm.resetFields();
					 this.editFormVisible = false;
				},
				getWarnList() {
					let para = {
						page: this.page,
						pageSize: this.size,
					};
					if(this.filters.key!="all"&&this.filters.value!=''){
						para[this.filters.key]= this.filters.value;
					}
					this.listLoading = true;
					NProgress.start();
					let self= this;
			        getRobotWarnList(self,para).then((res) => {
			        	if(res.data.data){
							this.total = res.data.data.total;
							this.warnData = res.data.data.rows;
						}else{
							this.total=0;
							this.warnData=[];
						}
						this.listLoading = false;
						NProgress.done();
					});
				},
				getWorkerRobos(){
					let self = this;
					getWorkerRobos(self,{}).then((res)=>{
						this.workRobos = res.data.data
					})
				},
				 
				//删除
				handleDel: function(row) {
					var _this = this;
					this.$confirm('确认删除吗?', '提示', {
						//type: 'warning'
					}).then(() => {
						_this.listLoading = true;
						NProgress.start();
						let para = {
							robotId: row.robotId
						};
                               
						removeRobotWarn(_this,para,"删除告警发送").then((res) => {
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
							_this.getWarnList();
						});

					}).catch(() => {

					});
				},
				//显示编辑界面
				handleEdit: function(row) {
					let self = this;
					this.isEdit=true;
					this.editFormVisible = true;
					this.editFormTtile = '编辑';
					this.getWorkerRobos();
				    this.editForm.id= row.id;
					this.editForm.robotId= row.robotId;
					this.editForm.warnMobile=row.warnMobile;
					this.editForm.warnEmail=row.warnEmail;
					this.editForm.pileCount= row.pileCount;
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
								  
								if(_this.editForm.id == '') {
									//新增
									 
								    let  para = {
					                        robotId:_this.editForm.robotId,
					                        warnMobile:_this.editForm.warnMobile,
					                        warnEmail:_this.editForm.warnEmail,
					                        pileCount:_this.editForm.pileCount
								   }
								    
									saveRobotWarn(_this,para,"新增告警发送").then((res) => {
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
											_this.getWarnList();	
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
										id:_this.editForm.id,
										robotId:_this.editForm.robotId,
					                    warnMobile:_this.editForm.warnMobile,
					                    warnEmail:_this.editForm.warnEmail,
					                    pileCount:_this.editForm.pileCount
								    }
								      
									saveRobotWarn(_this,para,'修改告警发送').then((res) => {
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
										_this.getWarnList();
										
									}); 

								}

							}).catch(()=>{});

						}
					});

				},
				//显示新增界面
				handleAdd: function() {
                    this.isEdit= false;    
					this.editFormVisible = true;
					this.editFormTtile = '新增';
                    
                    this.getWorkerRobos();
                    this.editForm.id ="";
					this.editForm.robotId = "";
					this.editForm.warnMobile = "" ;
					this.editForm.warnEmail ="";
					this.editForm.pileCount ="";	 
				}
			},
			mounted() {
				this.getWarnList();
			}
	}
</script>

<style scoped>

</style>