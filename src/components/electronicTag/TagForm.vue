<template>
	<section>
		<el-form :model="tag_data" label-width="90px" :rules="tagFormRules" ref="tagEditForm">
			<el-form-item label="指示灯类型">
				<el-radio-group v-model="light" @change="valid('light')">
					<el-radio-button label="1">指示灯</el-radio-button>
					<el-radio-button label="2">小灯</el-radio-button>
					<el-radio-button label="0">无</el-radio-button>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="数字灯类型" @change="valid('numlight')">
				<el-radio-group v-model="numLight">
					<el-radio-button label="3">LED灯</el-radio-button>
					<el-radio-button label="4">LCD灯</el-radio-button>
					<el-radio-button label="0">无</el-radio-button>
				</el-radio-group>
			</el-form-item>

			<!--linght-->
			<div v-if="light!=0">
				<el-form-item label="类 别">
					<el-col :span="16">{{rfidTypes[light-1]}}</el-col>
					<el-col :span="8">
						<el-button @click.prevent="addDistribution('lightDistribution')" size="small">新增行</el-button>
					</el-col>
				</el-form-item>
				<el-form-item v-for="(light, index) in tag_data.lightDistribution" :label="`第 ${++index} 行`" :key="light.key" :rules="{
			       validator: checkNum, trigger: 'blur'
			    }">
					<el-col :span="16">
						<el-input-number v-model="light.value" :min="1" :max="10" size="small" style="vertical-align: middle;"></el-input-number>
					</el-col>
					<el-col :span="8">
						<el-button @click.prevent="removeLight('lightDistribution',light)" size="small" v-if="index!=1">删除</el-button>
					</el-col>
				</el-form-item>
			</div>
			<!--LED-->
			<div v-if="numLight!=0">
				<!--num-->
				<hr v-if="light&&numLight" />
				<el-form-item label="类 别:">
					<el-col :span="16">{{rfidTypes[numLight-1]}}</el-col>
					<el-col :span="8">
						<el-button @click.prevent="addDistribution('numDistribution')" size="small">新增行</el-button>
					</el-col>
				</el-form-item>
				<el-form-item v-for="(num, index) in tag_data.numDistribution" :label="`第 ${++index} 行`" :key="num.key" :rules="{
			        validator: checkNum,trigger: 'blur'
			    }">
					<el-col :span="16">
						<el-input-number v-model="num.value" :min="1" :max="10" size="small" style="vertical-align: middle;"></el-input-number>

					</el-col>
					<el-col :span="8">
						<el-button @click.prevent="removeLight('numDistribution',num)" size="small" v-if="index!=1">删除</el-button>
					</el-col>
				</el-form-item>
				<!--bgtype-->
				 
				<el-form-item label="数字灯类型">
					<el-col :span="16">
						<el-radio-group v-model="tag_data.bgType">
							<el-radio-button label="1">电流电压</el-radio-button>
							<el-radio-button label="2">温湿度</el-radio-button>
							<el-radio-button label="0">其他</el-radio-button>
						</el-radio-group>
					</el-col>
					<el-col :span="8">
						<el-button @click.prevent="addDistribution('bgDistribution')" size="small">新增行</el-button>
					</el-col>
				</el-form-item>
				<template>
					<el-form-item v-for="(bg, index) in tag_data.bgDistribution" :label="`第 ${++index} 行`" :key="bg.key" :rules="{
				      validator: checkNum, trigger: 'blur'
				    }">
						<el-col :span="16">
							<el-input-number v-model="bg.value" :min="1" :max="10" size="small" style="vertical-align: middle;"></el-input-number>
						</el-col>
						<el-col :span="8">
							<el-button @click.prevent="removeLight('bgDistribution',bg)" size="small" v-if="index!=1">删除</el-button>
						</el-col>
					</el-form-item>
				</template>
			</div>

		</el-form>
		<hr/>
		<div slot="footer" class="footer">
			<el-button icon="circle-cross" @click.native="closeForm">取 消</el-button>
			<el-button icon="upload2" type="primary" @click.native="editSubmit" :loading="editLoading">{{btnEditText}}</el-button>
		</div>
	</section>
</template>
<script>
	import NProgress from 'nprogress'
	import { Request, Response } from 'utils/Cipher'
	export default {
		name: "tagForm",
		props: {
			tagData: {
				type: Object,
			}
		},
		data() {
			var checkNull = (rule, value, callback) => {
				setTimeout(() => {
					if(value === "" || value === null || value === undefined) {
						callback(new Error('不可为空'));
					} else {
						callback()
					}
				}, 500);
			}
			 
			let light = this.tagData.rfidType.substr(0,1);
			let num = this.tagData.rfidType.substr(1,1);
			return {
				tag_data: Object.assign({}, this.tagData),
				editLoading: false,
				btnEditText: '提交',
				rfidTypes: ['指示灯', '小灯', 'LED灯', 'LCD灯'],
				light:light,
				numLight:num?num:'0',
				tagFormRules: {
					rfidType: [{
						validator: checkNull,
						trigger: 'blur'
					}],
				}
			}
		},
		methods: {
			checkNum(rule, value, callback) {
				setTimeout(() => {
					if(!/^[1-9]\d*$/.test(value)) {
						callback(new Error('请输入数字型'));
					} else {
						callback()
					}
				}, 500);
			},
			closeForm: function() {
				this.$emit("closeTagForm")
			},
			//编辑 or 新增
			valid:function(type){
			    if(type=="light"){
			    	switch(this.light){
			    		case '0': this.lightDistribution=null;
			    		          break;
			    		default:  this.lightDistribution=[{value:1}];
			    	}
			    }else{
			    	switch(this.numLight){
			    		case '0': this.numDistribution=null;
			    	              this.bgType='0';
			    	              this.bgDistribution = null;
			    	              break;
			    		    
			    		default:  this.numDistribution=[{value:1}];
			    		          this.bgType='0';
			    		          this.bgDistribution = [{value:1}];	           
			    	}
			    }
			},
			editSubmit: function() {
				var _this = this;
				let param = Object.assign({}, _this.tag_data);
				param.lightDistribution = null;
				param.numDistribution = null;
				param.bgDistribution = null;
				if(+_this.light!=0) {
					param.lightDistribution = _this.tag_data.lightDistribution.map(i => (i.value)).join(",");
				}
				if(+_this.numLight) {				 
					param.bgDistribution = _this.tag_data.bgDistribution.map(i => (i.value)).join(",");
					param.numDistribution = _this.tag_data.numDistribution.map(i => (i.value)).join(",");
				}else{
					param.bgType ='0';
					param.bgDistribution = null;
				}
				param.rfidType = `${_this.light}${_this.numLight}`;				
                
				_this.$refs.tagEditForm.validate((valid) => {
					if(valid) {
						_this.$confirm('确认提交吗？', '提示', {}).then(() => {
							_this.editLoading = true;
							NProgress.start();
							_this.btnEditText = '提交中';
							Request(_this, "/web/setDeviceRfidDetail.action", param).then((res) => {
								NProgress.done();
								_this.editLoading = false;
								_this.btnEditText = '提交';
								if(res.body.result == 200) {
									_this.$notify({
										title: '成功',
										message: '提交成功',
										type: 'success'
									});
								} else {
									_this.$notify({
										title: '失败',
										message: '提交失败',
										type: 'error'
									});
								}
								_this.closeForm()
							})

						}).catch(() => {});

					}
				});

			},

			addDistribution: function(distribution) {
				this.tag_data[distribution].push({
					value: 1
				});
			},
			removeLight: function(parent, item) {
				var index = this.tag_data[parent].indexOf(item)
				if(index !== -1) {
					this.tag_data[parent].splice(index, 1)
				}
			},
			resetForm: function() {
				this.$refs.tagEditForm.resetFields();
			},
			 
		}	 
	}
</script>
<style scoped>
	.footer {
		text-align: center;
	}
</style>