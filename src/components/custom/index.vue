<template>
	<section>
		<!--列表-->
		<template>
			<el-table :data="customs" highlight-current-row v-loading="listLoading" style="width: 100%;">
				<el-table-column type="index" width="100" label="序号" align="center">
				</el-table-column>
				<el-table-column prop="customName" label="所属机构" sortable>
					<template scope="scope">
						<span v-show="customIds[scope.row.customId]" style="boder:1px solid transparent;padding-left:15px;">{{scope.row.customName}}</span>
						<el-input v-show="!customIds[scope.row.customId]" size="small" v-model="customName2"></el-input>
					</template>
				</el-table-column>
				<el-table-column inline-template :context="_self" label="操作" width="180" align="center">
					<span>
						<el-button size="small" type="primary" @click="handleEdit(row)" align="center">编辑</el-button>
						<el-button type="warning" size="small" @click="handleDel(row)">删除</el-button>
					</span>
				</el-table-column>
			</el-table>
		</template>

		<!--分页-->
		<el-col :span="24" class="toolbar" style="padding-bottom:10px;">
			<el-pagination @current-change="handleCurrentChange" :current-page.sync="page" :page-size="5" layout="prev, pager, next,total,jumper" :total="total" style="float:right;">
			</el-pagination>
		</el-col>
		<el-col :span="24" class="toolbar" v-if="add">
			<el-input v-model="customName1" placeholder="机构名称"></el-input>
		</el-col>
		<div slot="footer" class="toolbar wrapper">
			<el-button type="success" @click.native="handleAdd">新增</el-button>
			<!-- <el-button :plain="true" type="warning" @click.native="finish">完成</el-button> -->
			<el-button type="primary" @click.native="editSubmit" :loading="editLoading">{{ btnEditText }}</el-button>
		</div>
	</section>
</template>

<script scoped>
	//import util from '../../common/util'
	import NProgress from 'nprogress'
	import { getCustomList, saveCustom, removeCustom } from '../../api/admin';

	export default {
		name: 'Custom',
		data() {
			return {
				total: 0,
				page: 1,
				listLoading: false,
				customs: [],
				//编辑页数据
				customName1: '',
				customName2: '',
				customIds: {},
				read: true,
				add: false,
				customId: '',
				editLoading: false,
				btnEditText: '提 交',
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.page = val;
				this.getCustomList();
			},

			getCustomList() {
				let para = {
					page: this.page,
					pageSize: 5,
				};
				this.listLoading = true;
				NProgress.start();
				let self = this;
				getCustomList(self, para).then((res) => {
					if(res.data.data) {
						this.total = res.data.data.total;
						this.customs = res.data.data.rows;
						let _this = this;
						res.data.data.rows.forEach(function(o) {
							_this.customIds[o.customId] = true;
						})
					} else {
						this.total = 0;
						this.customs = [];
					}
					this.listLoading = false;
					NProgress.done();
				});
			},
			handleAdd: function() {
				this.customId = '';
				this.customName1 = '';
				this.add = true;
				let customIds = this.customIds;
				this.customName2 = '';
				for(var k in customIds) {
					customIds[k] = true;
				}
			},
			handleEdit: function(row) {
				this.add = false;
				this.customName1 = '';
				this.read = !this.read;
				let customIds = this.customIds;
				this.customName2 = '';
				for(var k in customIds) {
					customIds[k] = true;
				}
				this.customIds[row.customId] = this.read;
				this.customName2 = row.customName;
				this.customId = row.customId;
			},
			//编辑 or 新增
			editSubmit: function() {
				var _this = this;
				if(_this.customName1 || _this.customName2) {
					_this.$confirm('确认提交吗？', '提示', {}).then(() => {
						_this.editLoading = true;
						NProgress.start();
						_this.btnEditText = '提交中';
						if(_this.customId) {
							let para = {
								customId: _this.customId,
								customName: _this.customName2,
							}
							saveCustom(_this, para, '修改机构').then(function(res) {
								_this.editLoading = false;
								NProgress.done();
								_this.btnEditText = '提 交';
								if(res.body.result == 200) {
									_this.$notify({
										title: '成功',
										message: '修改成功',
										type: 'success'
									});
								} else {
									_this.$notify({
										title: '失败',
										message: res.body.message,
										type: 'error'
									});
								}
								_this.getCustomList();
							})
						} else {
							let para = {
								customName: _this.customName1
							}
							saveCustom(_this, para, "新增机构").then(function(res) {
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
								_this.add = false;
								_this.getCustomList();
							})
						}

					}).catch(() => {});
				}
			},
			//显示新增界面

			handleDel: function(row) {
				var _this = this;
				this.$confirm('确认删除客户:' + row.customName + '吗?', '提示', {

				}).then(() => {
					_this.editLoading = true;
					NProgress.start();
					_this.btnEditText = '提交中';
					let para = {
						customId: row.customId
					};
					removeCustom(_this, para, `删除机构${row.customName}`).then(function(res) {
						_this.editLoading = false;
						NProgress.done();
						_this.btnEditText = '提 交';
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
						_this.getCustomList();
					})

				}).catch(() => {

				});

			},
			finish: function() {
				this.handleAdd();
				this.add = false;
			}
		},
		mounted() {
			this.getCustomList();
		}
	}
</script>

<style scoped>
	.wrapper {
		text-align: right;
	}
</style>