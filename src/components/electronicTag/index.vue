<template>
	<div>
		<el-row>
			<h2>
				<el-button @click="addRow">新增行</el-button>
			</h2>
		</el-row>
		<el-row v-for="row in data" v-if="compu(row)" class="l_row">
			<div class="l_cell">
				<el-button @click="addCol(row)">新增列</el-button>
			</div>
			<div class="l_cell" v-for="col in row" v-if="col.length>0">
				<cell :columns="col" />
			</div>
		</el-row>
		<hr/>
		<el-row style="text-align: center;">
			<el-button icon="circle-cross" @click.native="closeForm">取 消</el-button>
			<el-button icon="upload2" type="primary" @click.native="editSubmit" :loading="editLoading">{{btnEditText}}</el-button>
		</el-row>
	</div>
</template>

<script>
	import cell from "./cell"
	export default {
		components: {
			cell,
		},
		data() {
			return {
				data: [],
				btnEditText: '提交',
				editLoading: false
			}
		},
		methods: {
			compu(r) {
				return r.some(i => i.length > 0)
			},
			addRow() {
				this.data.push([
					[{
						type: '3',
						value: '1',
						precision: '2'
					}]
				])
			},
			addCol(r) {
				var index = this.data.indexOf(r)
				r = r.filter(i => i.length > 0);
				if(r.length > 1) return;
				r.push([{
					type: '3',
					value: '1',
					precision: '1'
				}])
				if(index !== -1) {
					this.data.splice(index, 1, r)
				}

			},
			closeForm: function() {
				this.$emit("closeTagForm")
			},
			editSubmit: function() {
				console.log(this.data)
			}
		}
	}
</script>

<style>
	.l_cell {
		float: left;
		padding: 5px;
		border: 1px solid #ccc;
		margin-right: 20px;
	}
	
	.l_row {
		margin: 5px 0;
	}
</style>