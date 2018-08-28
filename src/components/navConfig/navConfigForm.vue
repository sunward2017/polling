<template>
	<section>
		<el-form :model="navConfigData" label-width="90px" :rules="navFormRules" ref="navEditForm">
			<el-form-item label="测温点编号" prop="pointId">
			    <el-input v-model="navConfigData.pointId" auto-complete="off" min="0"></el-input>
			</el-form-item>
			<el-form-item label="测温点名称" prop="name">
			   <el-input v-model="navConfigData.name" auto-complete="off" min="0"></el-input>
			</el-form-item>
			<el-form-item label="温度上限" prop="tempUpper">
				<el-input v-model="navConfigData.tempUpper" auto-complete="off" min="0"></el-input>
			</el-form-item>
			<el-form-item label="温度下限" prop="tempLower">
				<el-input v-model="navConfigData.tempLower" auto-complete="off" min="0"></el-input> 
			</el-form-item> 
			<el-form-item label="湿度上限" prop="humidityUpper" >
               <el-input v-model="navConfigData.humidityUpper" auto-complete="off" min="0"></el-input>
			</el-form-item>
			<el-form-item label="湿度下限" prop="humidityLower" >
				<el-input  v-model="navConfigData.humidityLower" min="0"></el-input>
			</el-form-item>
		</el-form>
		<div slot="footer" class="footer">
			<el-button icon="circle-cross" @click.native="closeForm">取 消</el-button>
			<el-button icon="upload2" type="primary" @click.native="editSubmit" :loading="editLoading">{{btnEditText}}</el-button>
		</div>
	</section>
</template>
<script>
	import NProgress from 'nprogress'
	import	{ saveNavConfig} from '../../api/room';
	export default{
		name:"tagForm",
		props:{
			navConfigData:{
				type:Object,
			}
		},
		data(){
			var checkNum = (rule,value, callback) => {
				setTimeout(() => {
					if(value===""||value===null||value===undefined){
						callback(new Error('不可为空'));
					}else if (value&&isNaN(value)) {
						callback(new Error('请输入数字型'));
					}else{
						callback()
					}  
				}, 500);
			};
			return{
				editLoading:false,
				btnEditText:'提交',
				navFormRules:{
					tempUpper: [{
						validator:checkNum, 
						trigger: 'blur'
					}],
					tempLower: [{
						validator:checkNum, 
						trigger: 'blur'
					}],
					humidityUpper: [{
						validator:checkNum, 
						trigger: 'blur'
					}],
					humidityLower: [{
					    validator:checkNum,
						trigger: 'blur'
					}]
				}
			}			
		},
		methods:{
			closeForm:function(){
				this.$emit("closeNavForm")
			},
			//编辑 or 新增
			editSubmit: function() {
				var _this = this;
				_this.$refs.navEditForm.validate((valid) => {
					if(valid) {

						_this.$confirm('确认提交吗？', '提示', {}).then(() => {
							_this.editLoading = true;
							NProgress.start();
							_this.btnEditText = '提交中';
							 
							let para={},msg;
							if(_this.navConfigData.id == 0) {
								//新增
								    para = {
									 roomId:_this.navConfigData.roomId,
								     pointId:_this.navConfigData.pointId,
									 name:_this.navConfigData.name,
									 tempUpper: _this.navConfigData.tempUpper,
									 tempLower: _this.navConfigData.tempLower,
									 humidityUpper: _this.navConfigData.humidityUpper,
									 humidityLower: _this.navConfigData.humidityLower,
								}
							    msg = `新增测温告警${para.name}`
							} else {
								    para = {
								 	id:_this.navConfigData.id,
									roomId:_this.navConfigData.roomId,
								    pointId:_this.navConfigData.pointId,
									name:_this.navConfigData.name,
									tempUpper: _this.navConfigData.tempUpper,
									tempLower: _this.navConfigData.tempLower,
									humidityUpper: _this.navConfigData.humidityUpper,
									humidityLower: _this.navConfigData.humidityLower,
								}
                                msg = `修改测温告警${para.name}`
							}
							saveNavConfig(_this,para,msg).then((res) => {
									_this.editLoading = false;
									NProgress.done();
									_this.btnEditText = '提 交';
									if(res.body.result=="200"){
										_this.$notify({
											title: '成功',
											message: "更新成功",
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
									_this.$emit("refreshList");	
								}); 


						}).catch(()=>{});

					}
				});
      
			},
			resetForm:function(){
               this.$refs.navEditForm.resetFields();
			},
			 
		},
	}
</script>
<style scoped>
	.footer{
		text-align: right;
	}
</style>
