<template>
	<el-form ref="tagEditForm" label-width="0px" :inline="true">
		<div v-for="(item,index) in column" :key="item.key">
			<el-row class="l_comfirm">
				<el-col :span="item.type===1||item.type===2?10:7">识别类型</el-col>
				<el-col :span="8">{{item.type==="1"||item.type==="2"?"灯数量":"识别数字位数"}}</el-col>
				<el-col :span="6" v-if="item.type!=='1'&&item.type!=='2'">表精度</el-col>
			</el-row>
			<el-form-item :prop="'column.' + index + '.type'">
				<el-select v-model="item.type" placeholder="请选择类型" class="l_type">
					<el-option label="指示灯" value="1">
					</el-option>
					<el-option label="小灯" value="2">
					</el-option>
					<el-option label="电流" value="3">
					</el-option>
					<el-option label="电压" value="4">
					</el-option>
					<el-option label="温度表" value="5">
					</el-option>
					<el-option label="湿度表" value="6">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item :prop="'column.' + index + '.value'">
				<el-input-number v-model="item.value" style="width:120px" :min="1" :max="10"></el-input-number>
			</el-form-item>
			<el-form-item :prop="'column.' + index + '.precision'" v-if="item.type!=='1'&&item.type!=='2'">
				<el-input-number v-model="item.precision" style="width:120px" :min="1" :max="10"></el-input-number>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="delete" @click.prevent="removeDomain(item)"></el-button>
			</el-form-item>
		</div>
		<el-form-item v-if="column.length>0">
			<el-button @click="addDomain">新增行</el-button>
		</el-form-item>
	</el-form>
</template>

<script>
	export default {
		name: 'cell',
		props: {
			columns: {
				type: Array
			}
		},
		data() {
			return {
				column: this.columns
			};
		},
		created: function() {
			//console.log(this.columns)
		},
		methods: {
			removeDomain(item) {
				var index = this.column.indexOf(item)
				if(index !== -1) {
					this.column.splice(index, 1)
				}
			},
			addDomain() {
				this.column.push({
					type: '3',
					value: '1',
					precision: '3',
					key: Date.now()
				});
			},

		}
	}
</script>

<style>
	.l_type {
		width: 100px;
	}
</style>