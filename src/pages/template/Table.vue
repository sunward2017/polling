<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-form :inline="true" :model="filters">
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
				<el-form-item >
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
					<el-input v-model="filters.value" placeholder="请输入查询字段"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button icon="search" type="primary" v-on:click="getList">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button icon="plus" type="success" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<template>
			<el-table :data="devices" highlight-current-row v-loading="listLoading" style="width: 100%;" border>
			    <el-table-column type="index" width="80" label="序号" align="center">
				</el-table-column>
				<el-table-column prop="deviceName" label="设备名称" width="120" algin="center" sortable>
				   <template scope="scope">
				       <!--  <el-popover trigger="hover" placement="right">
				            <p>生产厂商:<b>{{scope.row.deviceCompany}}</b></p>
				            <div slot="reference"> -->
			                    <el-tag type="primary">{{scope.row.deviceName}}</el-tag>
                           <!--  </div> 
                        </el-popover>  -->
			      </template> 
				</el-table-column>
				<el-table-column v-if="isShow" prop="customName" label="所属机构" width="140">
				</el-table-column>
				<el-table-column prop="deviceType" label="设备类型" width="100" align="center">
				</el-table-column>
				<el-table-column prop="deviceModel" label="设备型号" width="120" align="center">
				</el-table-column>
				<el-table-column label="设备尺寸" align="center" >
                    <el-table-column prop="deviceLength" label="长度(mm)" align="center" width="80">
				    </el-table-column>
				    <el-table-column prop="deviceWide" label="宽度(mm)" align="center" width="80">
				    </el-table-column>
				    <el-table-column prop="deviceHeight" label="高度(mm)" align="center" width="80">
				    </el-table-column>
				</el-table-column>
				<el-table-column label="仪表参数" align="center" >
                    <el-table-column prop="meterHeight" label="高度(mm)" align="center" width="80">
				    </el-table-column>
				    <el-table-column prop="meterWide" label="宽度(mm)" align="center" width="80">
				    </el-table-column>
				    <el-table-column prop="meterLiftoff" label="水平位(mm)" align="center" width="80">
				    </el-table-column>
				    <el-table-column prop="meterOffset" label="偏移量(mm)" align="center" width="80">
				    </el-table-column>
				</el-table-column>
				<el-table-column prop="deviceCompany" label="生产厂商">
				</el-table-column>
				<el-table-column inline-template :context="_self" label="操作"  width="200" align="center">
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
		<el-dialog :title="editFormTtile"   v-model="editFormVisible" :close-on-click-modal="false">
		    <el-form :model="editForm" label-width="100px" :rules="rules" ref="editForm" >
		         <el-form-item label="所属机构" prop="custom" v-if="isShow" class="item" >
				    <el-select v-model="editForm.customId" style="width:100%">
					    <el-option
					      v-for="item in allCustom"
					      :key="item.customId"
					      :label="item.customName"
					      :value="item.customId">
					    </el-option>
					</el-select>   
				</el-form-item>
                 <el-form-item label="设备名称"   prop="deviceName"  class="item">
				    <el-input v-model="editForm.deviceName" placeholder="设备名称"></el-input>
			    </el-form-item>
			    <el-form-item label="设备类型"  prop="deviceType" class="item">
				    <el-input v-model="editForm.deviceType" placeholder="设备类型"></el-input>
				</el-form-item>
				<el-form-item label="设备型号"  prop="deviceModel" class="item">
				    <el-input v-model="editForm.deviceModel" placeholder="设备型号"></el-input>
				</el-form-item>
				  <el-form-item label="设备高度"   prop="deviceHeight" class="item">
				    <el-input v-model="editForm.deviceHeight" placeholder="单位( mm )"></el-input>
				  </el-form-item>
				  <el-form-item label="设备长度"   prop="deviceLength" class="item">
				    <el-input v-model="editForm.deviceLength" placeholder="单位( mm )"></el-input>
				  </el-form-item>
				  <el-form-item label="设备宽度"   prop="deviceWide" class="item">
				    <el-input v-model="editForm.deviceWide" placeholder="单位( mm )"></el-input>
				  </el-form-item>
				  <el-form-item label="仪表宽度"  prop="meterWide" class="item">
				    <el-input v-model="editForm.meterWide" placeholder="单位( mm )"></el-input>
				  </el-form-item>
				  <el-form-item label="仪表高度"   prop="meterHeight" class="item">
				    <el-input v-model="editForm.meterHeight" placeholder="单位( mm )"></el-input>
				  </el-form-item>
				  <el-form-item label="水平位"   prop="meterLiftoff" class="item">
				    <el-input v-model="editForm.meterLiftoff" placeholder="单位( mm )"></el-input>
				  </el-form-item>
				  <el-form-item label="仪表偏移量"  prop="meterOffset" class="item">
				    <el-input v-model="editForm.meterOffset" placeholder="单位( mm )"></el-input>
				  </el-form-item>
				  <el-form-item label="生产厂商"   prop="deviceCompany" class="item">
				    <el-input v-model="editForm.deviceCompany" placeholder="设备厂商" ></el-input>
				  </el-form-item>

			</el-form>
				<el-row>
				  <el-col :span="24">
				            <div class="title">&nbsp;&nbsp;告警配置</div>
				            <el-table :data="editForm.warnList" highlight-current-row v-loading="listLoading1" style="width: 100%;" border>
				                <el-table-column type="index" width="80" label="序号" align="center">
				                </el-table-column> 
								<el-table-column prop="warnType" label="告警类型" width="120" sortable>
								    <template scope="scope">
								        <el-popover trigger="hover" placement="right">
								          <p >测试类型：<b>{{ scope.row.warnType}}</b></p>
								          <p >正&ensp;常&ensp;值：<b>{{ scope.row.normalValue}}{{warnTypesForObj[scope.row.warnType]}}</b></p>
								          <p v-if="scope.row.warnType=='指示灯'">序&emsp;&emsp;号：<b>{{scope.row.serial}}</b></p>
								          <div v-else>
								           <p >一般告警下限范围：<b>{{ scope.row.generalMin1}}~{{scope.row.generalMax1}}{{warnTypesForObj[scope.row.warnType]}}</b></p>
								           <p >一般告警上限范围：<b>{{ scope.row.generalMin2}}~{{scope.row.generalMax2}}{{warnTypesForObj[scope.row.warnType]}}</b></p>
								           <p >严重告警：<b>{{ scope.row.warnMax}}{{warnTypesForObj[scope.row.warnType]}}>=&nbsp;或&nbsp;<={{scope.row.warnMin}}{{warnTypesForObj[scope.row.warnType]}}</b></p>
								          </div> 
								          <div slot="reference">
								            <el-tag>{{scope.row.warnType}}</el-tag>
								          </div>
								        </el-popover>
								    </template>
								</el-table-column>
								 
								<el-table-column  label="简要说明" prop="warnDescription">    
								</el-table-column>
							   <el-table-column inline-template :context="_self" label="操作" width="160" align="center" fixed="right">
									<span>
										<el-button size="small"   @click="edtiWarning(row)">编辑</el-button>
										<el-button type="warning"   size="small" @click="warningDel(row)">删除</el-button>
									</span>
							   </el-table-column>	
							</el-table>
				  </el-col> 
				</el-row>
			 
			<div slot="footer" class="dialog-footer">
			    <el-button  icon="plus" type="success" @click.native="addWarning">新增告警</el-button>
				<el-button icon="circle-cross" @click.native="closeEditFrom">取 消</el-button>
				<el-button icon="upload2" type="primary" @click.native="editSubmit" :loading="editLoading">{{btnEditText}}</el-button>
			</div>
		</el-dialog>

		<!-- 告警编辑 -->
		<el-dialog :title="warnFormTtile" v-model="warnFormVisible" :close-on-click-modal="false" size="tiny">
			<el-form  :model="warnForm" label-width="140px" :rules="warnFormRules" ref="warningForm">
				<el-form-item label="告警类型"  prop="warnType">
					<el-select v-model="warnForm.warnType" placeholder="请选择" style="width:82%"  @change="setUnit">
					    <el-option
					      v-for="item in warnTypes"
					      :key="item.value"
					      :label="item.value"
					      :value="item.value">
					    </el-option>
					</el-select> 
				</el-form-item>
				<el-form-item label="正常值" prop="normalValue" v-if="type">
				    <el-col :span="20">
					  <el-input v-model="warnForm.normalValue" auto-complete="off"></el-input>
					</el-col>
					<el-col :span="2" class="unit">{{unit}}</el-col>
				</el-form-item>
				<el-form-item label="一般告警下限范围" prop="generalMin1" v-if="type">
			        <el-col :span="9"> 	
					    <el-input v-model="warnForm.generalMin1" auto-complete="off"></el-input>   
					</el-col>
					<el-col :span="2" class="unit">~</el-col>
				    <el-col :span="9">
					 <el-input v-model="warnForm.generalMax1" auto-complete="off"></el-input>
                    </el-col>
					<el-col :span="2" class="unit">{{unit}}</el-col>
				</el-form-item> 
				<el-form-item label="一般告警上限范围" prop="generalMin2" v-if="type">
			        <el-col :span="9"> 	 
				      <el-input v-model="warnForm.generalMin2" auto-complete="off"></el-input>
    				</el-col>
					<el-col :span="2" class="unit">~</el-col>
				    <el-col :span="9">
					   <el-input v-model="warnForm.generalMax2"  auto-complete="off"></el-input>
					</el-col>
					<el-col :span="2" class="unit">{{unit}}</el-col>  
				</el-form-item >
				<el-form-item label="严重告警上限" prop="warnMax" v-if="type">
				    <el-col :span="8">
					   <el-input  v-model="warnForm.warnMin"></el-input >
					</el-col>
					<el-col :span="4" class="unit">
					  >=&nbsp;or&nbsp;<=
					</el-col>
					<el-col :span="8">
					   <el-input  v-model="warnForm.warnMax"></el-input >
					</el-col>
					<el-col :span="2" class="unit">{{unit}}</el-col> 
				</el-form-item>
				<el-form-item label="正常指示" v-else>
				   <el-col :span="2"><strong>序号:</strong></el-col>
					<el-col :span="9">
					   <el-input  v-model="warnForm.serial"></el-input >
					</el-col>
					<el-col :span="1">&nbsp;</el-col>
					<el-col :span="9">
					    <el-select v-model="warnForm.normalValue" placeholder="请选择" style="width:84%">
					    <el-option
					      v-for="item in lamps"
					      :key="item"
					      :label="item"
					      :value="item">
					    </el-option>
					</el-select>  
					</el-col>
				</el-form-item>
				<el-form-item label="简要说明">
				    <el-col :span="20"> 
					   <el-input  v-model="warnForm.warnDescription"></el-input >
					</el-col> 
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button icon="circle-cross" @click.native="cancel">取 消</el-button>
				<el-button icon="check" type="primary" @click.native="warnSubmit">确定</el-button>
			</div>
		</el-dialog>

		<!--<el-dialog title="巡检设备告警上传" v-model="uploadVisible" size="tiny" top="25%">
	 		<Upload @closeUp="closeUp" ></Upload>
	 	</el-dialog>-->
	</section>
</template>

<script>
	// import util from '../../common/util';
	import NProgress from 'nprogress';
	import { guid } from 'utils';
	import { getTemplateList,getTemplateDetail, saveTemplate,removeTemplate} from 'api/template';
    import { warnTypes,warnTypesForObj,templateCls} from '@/const';
    import { getCustoms } from 'api/admin';
    import  Upload  from 'components/upload/upload';

	export default {
		 
		data() {
			 var checkNum = (rule, value, callback) => {
			 	   setTimeout(() => {
			          if (value&&isNaN(value)) {
			            callback(new Error('请输入数字型'));
			          }else if(value<0){
			          	callback(new Error('请输入正确的值'))
			          }else{
			          	callback()
			          }  
			        }, 500);
				};
				return {
					filters: {
						key: 'all',
						value:'',
						custom:'all',
					},
					devices: [],
					total: 0,
					page: 1,
					size:10,
					listLoading: false,
					listLoading1: false,
					isShow:false,
					customs:[],
					allCustom:[],
					editFormVisible: false, //编辑界面显是否显示
					
					isAll:false,
					columns:templateCls,
					editFormTtile: '编辑', //编辑界面标题
					//编辑界面数据
					editForm: {
					    templateId:'',
						deviceName:'',
						deviceType:'',
						deviceModel:'',
						deviceCompany:'',
						deviceLength:'',
						deviceWide:'',
						deviceHeight:'',
						meterHeight:'',
						meterWide:'',
						meterLiftoff:'',
						meterOffset:'',
	                    warnList: [],
	                    customId:''
					},
					rules:{
                       deviceName: [{
							required: true,
							message: '请输入设备名称',
							trigger: 'blur'
						}],
						deviceType: [{
							required: true,
							message: '请输入设备类型',
							trigger: 'blur'
						}],
						deviceModel: [{
							required: true,
							message: '请输入设备型号',
							trigger: 'blur'
						}],
						deviceCompany: [{
							required: true,
							message: '请输入设备生产厂商',
							trigger: 'blur'
						}],
						deviceLength: [{
							validator: checkNum,
							trigger: 'blur'
						}],
						deviceWide: [{ 
							validator: checkNum,
							trigger: 'blur'
						}],
						deviceHeight: [{
							validator: checkNum,
							trigger: 'blur'
						}],
						meterHeight: [{
							validator: checkNum,
							trigger: 'blur'
						}],
						meterWide: [{ 
							validator: checkNum,
							trigger: 'blur'
						}],
						meterLiftoff: [{ 
							validator: checkNum,
							trigger: 'blur'
						}],
						meterOffset: [{
							validator: checkNum,
							trigger: 'blur'
						}],
					},
					editLoading: false,
					btnEditText: '提 交',
					//warning
					warnFormVisible: false,
					warnFormTtile:'新增',
					warnForm: {
						warnId: "",
		                warnType: "仪表温度",
		                normalValue : "",
		                generalMin1 :'',
		                generalMax1 : '',
		                generalMin2 : '',
		                generalMax2 : '',
		                warnMin:'',
		                warnMax: '',
		                warnDescription: "",
		                serial:'',
					},
					warnTypes:warnTypes,
					warnTypesForObj:warnTypesForObj,
					type:true,
					lamps:['亮','灭','闪烁'],
					unit:'', 
					warnAction:"",
					warnFormRules: {
						warnType: [{
							required: true,
							message: '请输入告警类型',
							trigger: 'blur'
						}],
						normalValue: [{
							required: true,
							message: '请输入正确的值',
							trigger: 'blur'
						}],
						generalMin1: [{ validator: checkNum, trigger: 'blur' }],
						generalMax1: [{ validator: checkNum, trigger: 'blur' }],
						generalMin2: [{ validator: checkNum, trigger: 'blur' }],
						generalMax2: [{ validator: checkNum, trigger: 'blur' }],
						warnMin: [{ validator: checkNum, trigger: 'blur' }],
						warnMax: [{ validator: checkNum, trigger: 'blur' }],
						normalValue:[{ validator: checkNum, trigger: 'blur' }],
					}

				}
			},
			methods: {
				getTemplateDetail:function(id){
					let para = {
						templateId:id
					};
					this.listLoading1 = true;
					NProgress.start();
					let _this = this;
			        getTemplateDetail(_this,para).then((res) => {
						this.listLoading1 = false;
						NProgress.done();
						if(res.body.result==200){
							_this.editForm= res.body.data;
							if(!_this.editForm.warnList){_this.editForm.warnList=[]}
						}else{
							this.$notify({
			                  title: '错误',
			                  message: "详情获取失败,请稍后再试",
			                  type: 'error'
			                });
						}
					});
				},
                changKey(){
                   this.filters.value='';
                   if(this.filters.key!="all"){
                   	  this.isAll = true;
                   }else{
                   	 this.isAll = false;
                   	 this.getList();
                   }
				},
				handleCurrentChange(val) {
					this.page = val;
					this.getList();
				},
				handleSizeChange(size){
					this.page = 1;
					this.size =size;
					this.getList();
				},
				//获取用户列表
				getList() {
					let para = {
						page: this.page,
						pageSize: this.size
					};
					if(this.filters.key!="all"&&this.filters.value!=''){
						para[this.filters.key]= this.filters.value;
					}
                    if( this.filters.custom!='all'){
						para.customId = this.filters.custom
					} 

					this.listLoading = true;
					NProgress.start();
					let self = this;
			        getTemplateList(self,para).then((res) => {
			            if(res.data.data){
			            	this.total = res.data.data.total;
						    this.devices = res.data.data.rows;
			            }else{
			            	this.total =0;
			            	this.devices =[];
			            }

						this.listLoading = false;
						NProgress.done();
					});
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
				setUnit:function(){
				   let curWarnType = this.warnForm.warnType;

                   if(curWarnType&&curWarnType!="指示灯"){
                   	   this.type = true;
                   	  let warnType = this.warnTypes.filter(function(v){
                   	  	return v.value === curWarnType 
                   	  })
                   	  this.unit = warnType[0].unit;
                   	  

                   }else{
                   	 this.warnForm.serial='',
                   	 this.type = false;
                   }
				},
				//显示编辑界面
				handleEdit: function(row) {
					// event.stopPropagation();
					this.editFormVisible = true;
					this.editFormTtile = '编辑';
				    this.editForm.templateId = row.templateId;
				    this.editForm.customId = row.customId;
				     
					this.getTemplateDetail(row.templateId);
				},
				handleDel:function(row){
					var _this = this;
					this.$confirm('确认删除模板: '+row.deviceName+' 吗?删除后不可恢复！', '提示', {
						type: 'warning'
					}).then(() => {
						_this.listLoading = true;
						NProgress.start();
						let para = {
							templateIds: '[{"templateId":"'+row.templateId+'"}]'
						};
						removeTemplate(_this,para,`删除模板`).then((res) => {
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
									type: 'error'
								});	
							}
							_this.getList();
						});

					}).catch(() => {
                         console.log('cache')
					});
				},
				closeEditFrom:function(){
                    this.editFormVisible = false;
                    this.$refs.editForm.resetFields();
				},
				//编辑 or 新增
				editSubmit: function() {
					var _this = this;
                    let  warnList  = _this.editForm.warnList.slice(0);
                     if(warnList.length==0){
                            this.$notify.info({
                              title: '提醒', 
					          message: '告警设置不可为空',
					          duration:2000
					        });
                            return;
                     }     
					_this.$refs.editForm.validate((valid) => {
						if(valid) {

							_this.$confirm('确认提交吗？', '提示', {}).then(() => {
								_this.editLoading = true;
								NProgress.start();
								_this.btnEditText = '提交中';
                                 
								if(!_this.editForm.templateId) {
									     // console.log("add......")
										
										let  para ={
										 	 
				                          deviceName:_this.editForm.deviceName,
										  deviceType:_this.editForm.deviceType,
										  deviceModel:_this.editForm.deviceModel, 
										  deviceCompany:_this.editForm.deviceCompany,
										  deviceLength:_this.editForm.deviceLength, 
										  deviceWide:_this.editForm.deviceWide, 
										  deviceHeight:_this.editForm.deviceHeight, 
										  meterHeight:_this.editForm.meterHeight, 
										  meterWide:_this.editForm.meterWide, 
										  meterLiftoff:_this.editForm.meterLiftoff, 
										  meterOffset:_this.editForm.meterOffset, 
										  warns:JSON.stringify(warnList)  
										}
										 
										para.customId = _this.editForm.customId?_this.editForm.customId:_this.$store.state.user.customId; 
										saveTemplate(_this,para,`新增模板`).then((res) => {
											// console.log(res);
											_this.editLoading = false;
											NProgress.done();
											_this.btnEditText = '提 交';
											if(res.body.result==200){
											    _this.$notify({
													title: '成功',
													message: '新增成功',
													type: 'success'
												});	
											}else{
                                                 _this.$notify({
													title: '失败',
													message: '新增失败',
													type: 'error'
												});	
											}
											_this.editFormVisible = false;
											_this.getList();
										});
									
								} else {
									// console.log("modify.....")
									   
										let  para ={
										  
							              templateId:_this.editForm.templateId,	 
				                          deviceName:_this.editForm.deviceName,
										  deviceType:_this.editForm.deviceType,
										  deviceModel:_this.editForm.deviceModel, 
										  deviceCompany:_this.editForm.deviceCompany,
										  deviceLength:_this.editForm.deviceLength, 
										  deviceWide:_this.editForm.deviceWide, 
										  deviceHeight:_this.editForm.deviceHeight, 
										  meterHeight:_this.editForm.meterHeight, 
										  meterWide:_this.editForm.meterWide, 
										  meterLiftoff:_this.editForm.meterLiftoff, 
										  meterOffset:_this.editForm.meterOffset, 
										  warns:JSON.stringify(warnList),
										  customId:_this.editForm.customId  
										}
										 
										saveTemplate(_this,para,"修改模板").then((res) => {
											_this.editLoading = false;
											NProgress.done();
											_this.btnEditText = '提 交';
											  if(res.body.result==200){
											       _this.$notify({
														title: '成功',
														message: '编辑成功',
														type: 'success'
													});	
												}else{
												   _this.$notify({
														title: '失败',
														message: res.message,
														type: 'success'
													});	
												}
														_this.editFormVisible = false;
											_this.getList();
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

					this.editForm.templateId='';
					this.editForm.deviceName='';
					this.editForm.deviceType='';
				    this.editForm.deviceModel='';
					this.editForm.deviceCompany='';
					this.editForm.deviceLength='';
					this.editForm.deviceWide='';
					this.editForm.deviceHeight='';
					this.editForm.meterHeight='';
					this.editForm.meterWide='';
					this.editForm.meterLiftoff='';
					this.editForm.meterOffset=''; 
				    this.editForm.warnList=[];
				    this.editForm.customId ='';
				},
				//告警编辑
				addWarning: function(){
	                    this.warnFormVisible = true;
	                    this.warnFormTtile ="新增";
	                    this.warnAction ="add";
	                   
	                    this.warnForm.warnId=guid();
			            this.warnForm.warnType="仪表温度";
			            this.warnForm.normalValue="";
			            this.warnForm.generalMin1='';
			            this.warnForm.generalMax1='';
			            this.warnForm.generalMin2='';
			            this.warnForm.generalMax2='';
			            this.warnForm.warnMin='';
			            this.warnForm.warnMax='';
			            this.warnForm.warnDescription="";	
					 
				},
				warnSubmit:function(){
					let _this = this;
                    _this.$refs.warningForm.validate((valid) => {
						if(valid) {
						    if(_this.warnAction==="add"){
						    	let obj=JSON.parse(JSON.stringify(_this.warnForm)) 
						           _this.editForm.warnList.push(obj);	
						    }else{
						    	let index,Id = _this.warnForm.warnId;
						        for(let i=0,warns=_this.editForm.warnList,len=warns.length;i<len;i++){
                                    if(warns[i].warnId==Id){
                                    	index = i;
                                    	break;
                                    }
						        }
						        // console.log(index);
						        let obj=JSON.parse(JSON.stringify(_this.warnForm)) 
						        _this.editForm.warnList.splice(index,1,obj) 
						    }
 							_this.warnFormVisible = false;
						}
					});	   
				},
				cancel:function(){
                    this.type = true;
                    this.$nextTick(()=>{
                       this.$refs.warningForm.resetFields();
                       this.warnFormVisible = false;	
                    })
                    
				},
				edtiWarning:function(r){
					this.warnFormVisible = true;
                    this.warnFormTtile ="编辑";
					this.warnAction ="edit";
					this.type= r.warnType =="指示灯"? false:true;
					//this.warnForm = Object.assign({},r);
					this.warnForm = JSON.parse(JSON.stringify(r)) 
				},
				warningDel:function(r){
					var _this = this;
					this.$confirm('确认删除该记录吗?', '提示', {
						//type: 'warning'
					}).then(() => {
						let index,Id = _this.warnForm.warnId;
				        for(let i=0,warns=_this.editForm.warnList,len=warns.length;i<len;i++){
                            if(warns[i].warnId==Id){
                            	index = i;
                            	break;
                            }
				        }
						        // console.log(index);
						_this.editForm.warnList.splice(index,1)  
					}).catch(() => {

					});
				},
				 
			},
			mounted() {
				if(this.$store.state.user.account =="admin"){
					this.isShow = true;
					this.getCustoms();
				}
				this.getList();
			}
	}
</script>

<style scoped>
   .title{
   	 font-size:16px;
   	 color:#fff;
   	 background: #2178f1 linear-gradient(90deg, #2178f1 0%,#2178f1 0%, #20b6f9 100%, #20b6f9 100%);
   	 width:100%;
   	 height:35px;
   	 font-family: inherit;
   	 line-height: 35px;
   	 font-weight: 100;
   	 margin-bottom: 5px;
     border-bottom: 1px solid #E0E0E0;
   }

  .el-row {
    margin-bottom: 10px;
  }
  .item{
  	width:46%;
  	display: inline-block; 
  }
  .unit{
  	text-align: center;
  	font-weight: bold;
  	font-size:16px;
  }
</style>