<template>
	<section>
		<el-row :gutter="20">
			<el-col :span="6">
				<el-tree class="rfidTree" :data="rfids" :props="defaultProps" node-key="detectSettingId" default-expand-all highlight-current :render-content="renderContent">
				</el-tree>
			</el-col>
			<el-col :span="18">
				<div class="label_t">
					<span>标签模板:&emsp;&emsp;{{currentTpl?currentTpl.detectSettingName:''}}</span>
					<el-button type="info" @click="save" size="small" style="margin:0 10px;">提交保存</el-button>
					<el-button type="success" size="small" @click.native="addRow">新增面板行</el-button>
					<el-button size="small" @click.native="addTpl" type="success"> 新增模板</el-button>
				</div>
				<div id="right">
					<div class="rf_item" v-for="(item,index) in row" :key="index+uuid()">
						<!--row-->
						<label class="label_c">第{{index+1}}行</label>
						<div :id="`item_${index}`" class="rf_content">
							<template v-for="(col,index) in item">
								<!--col-->
								<Light v-if="col.type==='1'||col.type==='2'" :data="lights[col.id]" :id="col.id" :key="col.id" @configLight="configLight" />
								<Gauge v-else-if="col.type==='3'" :key="col.id" :numbers="gauges[col.id]" :id="col.id" @configGauge="configGauge" />
							</template>
						</div>
						<div class="closed" @click="remove(index)">x</div>
					</div>
				</div>
			</el-col>
		</el-row>
		<el-dialog title="仪表配置" :visible.sync="dialogVisible" size="small" :before-close="handleNum">
			<template v-for="(item,r) in data">
				<template v-for="(gauge,index) in item">
					<el-form :inline="true" :model="gauge" :key="r+'_'+index" :ref="'form_'+r+'_'+index">
						<el-form-item label="仪表参数" prop="type" :rules="{ required: true, message: '请选择仪表类型', trigger: 'change' }">
							<el-select v-model="gauge.type" placeholder="仪表类型" @change="changeType(gauge)" style="width:160px;">
								<el-option label="温度" value="7"></el-option>
								<el-option label="湿度" value="8"></el-option>
								<el-option label="电流" value="5"></el-option>
								<el-option label="电压" value="6"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="正常值区间">
							<el-form-item prop="lower" :rules="{ validator: checkNum, trigger: 'blur' }">
								<el-input v-model="gauge.lower" placeholder="低位值" style="width:100px;"></el-input>
							</el-form-item>
							<span>~</span>
							<el-form-item prop="high" :rules="{ validator: checkNum, trigger: 'blur' }">
								<el-input v-model="gauge.high" placeholder="高位值" style="width:100px;"></el-input>
							</el-form-item>
							<span style="font-weight:bold;"> &nbsp;{{gauge.unit}}&emsp;</span>
						</el-form-item>
						<el-form-item label="识别位数" prop='digits' :rules="{ validator: checkNum, trigger: 'blur' }">
							<el-input v-model="gauge.digits" style="width:100px;"></el-input>
						</el-form-item>
					</el-form>
				</template>
			</template>
			<span slot="footer" class="dialog-footer">
                <el-button @click="handleNum">确定</el-button>
              </span>
		</el-dialog>
		<el-dialog title="指示灯配置" :visible.sync="lightVisible" size="tiny">
			<el-form :model="lightForm" ref="form" label-width="80px" class="demo-dynamic" :rules="rules">
				<el-form-item label="颜色" prop="color">
					 <el-radio-group v-model="lightForm.color" size="small">
						<el-radio-button label="red">红色</el-radio-button>
						<el-radio-button label="green">绿色</el-radio-button>
						<el-radio-button label='yellow'>黄色</el-radio-button>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="状态" prop="state">
					 <el-radio-group v-model="lightForm.state" size="small">
						<el-radio-button label="on">开</el-radio-button>
						<el-radio-button label="off">关</el-radio-button>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="描述" prop="description">
					<el-input v-model="lightForm.description"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="submitForm">提交</el-button>
					<el-button @click="resetForm">还原</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
		<el-popover ref="popover" placement="top" width="256" trigger="click">
			<div class="label_t">标签集</div>
			<div id="left">
				<Light :data="smallLight" />
				<Light :data="largeLight" />
				<Gauge :numbers="[[{}],[{}]]" />
				<Gauge :numbers="[[{},{}]]" />
				<Gauge :numbers="[[{}]]" />
			</div>
		</el-popover>
		<el-button v-show="isEdit" type="warning" class="affix" v-popover:popover>仪表标签集</el-button>
	</section>
</template>
<script>
	import NProgress from "nprogress";
	import dragula from "dragula";
	import { cloneObj } from "utils";
	import { editRfidTpl, listRfidTpl, deleteRfidTpl } from "api/template";
	import { guid } from "utils";

	import Gauge from "components/rComponent/Gauge";
	import Light from "components/rComponent/Light";

	export default {
		components: {
			Gauge,
			Light
		},
		data() {
			return {
				row: [
					[]
				],
				drake: null,
				dialogVisible: false,
				rfids: [{
					detectSettingId: "1",
					detectSettingName: "所有模板",
					children: []
				}],
				defaultProps: {
					children: "children",
					label: "detectSettingName"
				},
				data: [],
				isEdit: false,
				gauges: {},
				lights: {},
				currentTpl: null,
				smallLight: {
					value: 'info',
					type: "2"
				},
				largeLight: {
					value: 'info',
					type: '1'
				},
				lightVisible: false,
				lightForm: {},
				rules: {
					color: [{
						required: true,
						message: '请选择颜色',
						trigger: 'change'
					}],
					state: [{
						required: true,
						message: '请设置状态',
						trigger: 'change'
					}],
					description: [{
						required: true,
						message: '请填写描述信息',
						trigger: 'blur'
					}]
				}
			};
		},
		methods: {
			uuid() {
				return guid();
			},
			checkNum(rules, value, callback) {
				if(!value) {
					return callback(new Error("数据不能为空"));
				}
				setTimeout(() => {
					if(!/(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)/.test(value)) {
						return callback(new Error("数据格式不正确"));
					} else {
						callback();
					}
				}, 1000);
			},
			editTpl(store, data) {
				this.currentTpl = data;
				this.isEdit = true;
				this.row = JSON.parse(data.detectSetting).map(item => {
					return item.map(m => {
						m.id = guid();
						if(m.type === "3") {
							this.gauges[m.id] = m.numbers;
						} else {
							this.lights[m.id] = { ...m
							};
						}
						return m;
					});
				});
			},
			handleNum() {
				let _this = this;
				let keys = Object.keys(_this.$refs).filter(
					item => (item.indexOf("form") === 0 && _this.$refs[item][0])
				);

				for(var k = 0, l = keys.length; k < l; k++) {
					(k => {
						if(this.$refs[keys[k]][0]) {
							this.$refs[keys[k]][0].validate(valid => {
								if(!valid) {
									return
								} else {
									if(++k === l) {
										_this.dialogVisible = false
									}
								}
							});
						}
					})(k);
				}
			},
			removeTpl(store, data) {
				var _this = this;
				this.$confirm(
					"确认删除标签模板：" + data.detectSettingName + "？",
					"提示", {
						//type: 'warning'
					}
				).then(() => {
					NProgress.start();
					deleteRfidTpl(_this, {
						detectSettingId: data.detectSettingId
					}).then(res => {
						NProgress.done();
						if(res.data.result === 200) {
							_this.$message({
								message: "删除成功",
								type: "success"
							});
						} else {
							_this.$message.error("删除失败");
						}
						_this.getTpls();
					});
				});
			},
			addTpl() {
				this.currentTpl = null;
				this.isEdit = true;
				this.row = [[]];
			},
			renderContent(h, {
				node,
				data,
				store
			}) {
				if(data.hasOwnProperty("children")) {
					return(
						<span>{node.label}</span>
					);
				} else {
					return(
						<span>
            <span style="display:inline-block;width:40%;overflow:hidden;text-overflow: ellipsis;">{node.label}</span>
            <span style="float: right; margin-right: 20px">
              <el-button
                size="mini"
                type="primary"
                on-click={() => this.editTpl(store, data)}
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                type="warning"
                on-click={() => this.removeTpl(store, data)}
              >
                删除
              </el-button>
            </span>
          </span>
					);
				}
			},
			getTpls() {
				let self = this;
				listRfidTpl(self).then(res => {
					if(res.data.result === 200) {
						this.rfids[0].children = res.data.data;
					} else {
						this.rfids[0].children = [];
					}
				});
			},
			init() {
				let _this = this;
				this.drake = dragula([document.getElementById("left")], {
					isContainer: function(el) {
						return el.classList.contains("rf_content");
						// return false; // only elements in drake.containers will be taken into account
					},
					moves: function(el, source, handle, sibling) {
						return true; // elements are always draggable by default
					},
					// accepts: function (el, target, source, sibling) {
					//     return true; // elements can be dropped in any of the `containers` by default
					// },
					invalid: function(el, handle) {
						return false; // don't prevent any drags from initiating by default
					},
					copy: function(el, source) {
						return source === document.getElementById("left");
					},
					accepts: function(el, target) {
						return target !== document.getElementById("left");
					},
					direction: "vertical", // Y axis is considered when determining where an element would be dropped
					copySortSource: false, // elements in copy-source containers can be reordered
					revertOnSpill: true, // spilling will put the element back where it was dragged from, if this is true
					removeOnSpill: true, // spilling will `.remove` the element, if this is true
					//mirrorContainer: document.getElementById('right'), // set the element that gets mirror elements appended
					ignoreInputTextSelection: true // allows users to select input text, see details below
				}).on("dragend", function(el) {
					_this.configPanel(el);
				});
			},

			configPanel(el) {
				//添加仪表
				if(!el.id) {
					el.id = guid();
					if(el.className.indexOf("gauge") >= 0) {
						this.gauges[el.id] =
							el.className === "gauge_d" ?
							[
								[{
									unit: "℃"
								}],
								[{
									unit: "℃"
								}]
							] :
							el.className === "gauge_t" ?
							[
								[{
									unit: "℃"
								}, {
									unit: "℃"
								}]
							] :
							[
								[{
									unit: "℃"
								}]
							];
					} else {
						this.lights[el.id] = {
							type: el.className.indexOf("large") >= 0 ? "1" : "2",
							value: 'info_on',
						}
					}
				}

				let data = [];
				var content = document.getElementsByClassName("rf_content");
				for(var i = 0, l = content.length; i < l; i++) {
					let arr = [];
					for(var j = 0, k = content[i].childNodes.length; j < k; j++) {
						let r = {};
						if(content[i].childNodes[j].className.indexOf('light') >= 0) {
							if(content[i].childNodes[j].className.indexOf('large') >= 0) {
								r = {
									type: '1',
									id: content[i].childNodes[j].id
								}
							} else {
								r = {
									type: '2',
									id: content[i].childNodes[j].id
								}
							}
						} else {
							r = {
								type: "3",
								id: content[i].childNodes[j].id
							};
						}
						arr.push(r);
					}
					data.push(arr);
				}
				this.row = data;
			},
			addRow() {
				this.row.push([]);
			},

			remove(index) {
				this.row.splice(index, 1);
			},
			save() {
				let tpl = this.currentTpl;
				let _this = this;
				if(this.row.length === 0) {
					_this.$message.error("模板没有配置");
					return;
				}
				for(var i = 0, l = _this.row.length; i < l; i++) {
					if(_this.row[i].length === 0) {
						_this.$message("请删除空白面板行");
						return;
					}
				}

				let row = cloneObj(this.row);
				let para = [];
				for(var i = 0, l = row.length; i < l; i++) {
					let r = [];
					for(var j = 0, n = row[i].length; j < n; j++) {
						let obj = {};
						if(row[i][j].type==="3") {
							if(!_this.gauges[row[i][j].id][0][0].type) {
								_this.$message.error("仪表参数没有配置");
								return;
							} else {
								obj = {
									type: row[i][j].type,
									numbers: _this.gauges[row[i][j].id]
								};
								r.push(obj)
							}
						} else {
							let {description,value,type}= _this.lights[row[i][j].id]
							if(!description) {
								_this.$message.error("指示灯没有配置");
								return;
							} else {
								obj = Object.assign({},{description,value,type});
								r.push(obj)
							}
						}
					}
					para.push(r)
				}

				this.$prompt("请输入模板名称", "提示", {
						confirmButtonText: "确定",
						cancelButtonText: "取消",
						inputValue: tpl ? tpl.detectSettingName : "",
						inputPattern: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/,
						inputErrorMessage: "模板名称只能是中文、英文、数字组合"
					})
					.then(({
						value
					}) => {
						let params = {
							detectSettingName: value,
							detectSetting: JSON.stringify(para)
						};
						let msg = "";
						if(tpl) {
							params.detectSettingId = tpl.detectSettingId;
							msg = "标签模板修改";
						} else {
							msg = "标签模板新增";
						}

						editRfidTpl(_this, params).then(res => {
							_this.getTpls();
							if(res.data.result === 200) {
								_this.$notify({
									title: "成功",
									message: msg + "成功",
									type: "success"
								});
							} else {
								_this.$notify({
									title: "失败",
									message: msg + "失败",
									type: "error"
								});
							}
						});
						this.row = [
							[]
						];
						this.isEdit = false;
					})
					.catch(() => {});
			},
			configLight(id) {
				let {
					value,
					type,
					state,
					description,
				} = this.lights[id];
				let color = value.split('_')[0]==="info"?'red':value.split('_')[0];
				this.lightForm = Object.assign({}, {
					id,
					type,
					color,
					state: value.split('_')[1],
					description
				});
				this.lightVisible = true;
			},
			submitForm() {
				this.$refs.form.validate((valid) => {
					if(valid) {
						let {color,id,state,description,type} = this.lightForm;
					    this.lights[id] = Object.assign({},{value:`${color}_${state}`,id,type,description});
					    this.lightVisible= false;
					} else {
						return false;
					}
				});
			},
			resetForm() {
				this.$refs.form.resetFields();
			},
			configGauge(key) {
				this.data = this.gauges[key];
				this.dialogVisible = true;
			},
			changeType(gauge) {
				let val = gauge.type;
				switch(val) {
					case "8":
						gauge.unit = "%";
						break;
					case "5":
						gauge.unit = "A";
						break;
					case "6":
						gauge.unit = "V";
						break;
					default:
						gauge.unit = "℃";
				}
			}
		},
		beforeDestroy() {
			if(this.drake) {
				this.drake.destroy();
				this.drake = null;
			}
		},
		mounted() {
			this.getTpls();
			this.init();
		}
	};
</script>
<style>
	#left,
	#right,
	.rfidTree {
		border: 1px solid rgba(250, 250, 250, 0.35);
		min-height: 80.5vh;
		min-width: 200px;
	}
	
	#left {
	background: #191d22;
	}

	#right {
	min-height: 75vh;
	background: rgba(0, 0, 0, 0.35);
	}
	
	.rf_content {
		min-height: 120px;
		border-bottom: 1px solid #ccc;
		margin: 10px;
	}
	
	.rf_content:after,
	#left:after {
		content: "020";
		display: block;
		height: 0;
		clear: both;
		visibility: hidden;
	}
	
	.rf_item {
		position: relative;
	}
	
	.label_t {
		color: #fff;
		border: 1px solid rgba(250, 250, 250, 0.35);
		border-bottom: none;
		padding: 15px 0;
		text-indent: 15px;
		background: #022c6b;
	}
	
	.label_c {
		width: 100px;
		text-align: right;
		vertical-align: middle;
		float: left;
		font-size: 14px;
		color: orange;
		line-height: 115px;
		padding: 0 22px 0 0;
		box-sizing: border-box;
	}
	
	.label_t button {
		float: right;
		margin-right: 10px;
	}
	
	.closed {
		position: absolute;
		top: 10px;
		right: 10px;
		color: red;
		background: rgba(0, 0, 0, 0.5);
		border: 1px solid #ccc;
		font-size: 20px;
		padding: 5px 10px;
		opacity: 0;
	}
	
	.rf_item:hover .closed {
		opacity: 1;
		cursor: pointer;
	}
	
	.affix {
		position: fixed;
		left: 300px;
		bottom: 10px;
	}
</style>