<template>
    <section>
        <el-col :span="24" class="toolbar">
 			<el-form :inline="true">
 				<el-form-item>
 					<el-input  v-model="filters.navName" min="0" placeholder="请输入测温点名称" ></el-input>	
	 			</el-form-item>
	 			<el-form-item>
	 				<el-button type="primary" icon="search" v-on:click="getNavs">查询</el-button>
	 			</el-form-item>
	 			<el-form-item>
	 				<el-button type="success"  @click="handleAdd" icon="plus">新增</el-button>
	 			</el-form-item>
	 		</el-form>
	 	</el-col>

	 	<!--列表-->
	 	<template>
	 		<el-table :data="navListData" highlight-current-row v-loading="listLoading" style="width: 100%;">
	 			<el-table-column type="index" width="80" label="序号" align="center">
	 			</el-table-column>
	 			<el-table-column prop="pointId" label="测温点编号" width="120" align="center">
	 			</el-table-column>
	 			<el-table-column prop="name" label="测温点名称" width="180" align="center" sortable>
	 			</el-table-column>
				<el-table-column prop="tempUpper" label="温度上限" width="120" align="center"  >
				</el-table-column>
				<el-table-column prop="tempLower" label="温度下限" width="120" align="center" >
				</el-table-column>
				<el-table-column prop="humidityUpper" label="湿度上限" width="120" align="center">
				</el-table-column>
				<el-table-column prop="humidityLower" label="湿度下限" align="center" width="120">
				</el-table-column>
				 <el-table-column inline-template :context="_self" label="操作" width="180" align='center' fixed="right">
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
	</section>	
</template>

	<script>
	// import util from '../../common/util'
	import NProgress from 'nprogress'
	import { getNavList,delMeasuringPointInfo } from '../../api/room';

	export default {
		name:"NavConfigList",
		props:["roomId"],
		data() {
			return {
				filters: {
					navName: ''
				},
				navListData: [],
				total: 0,
				page: 1,
				size:10,
				listLoading: false
			}
		},
		watch:{
			roomId(old,newValue){
			    if(old!==newValue){
					this.getNavs();
				}
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.page = val;
				this.getNavs();
			},
			handleSizeChange(size){
				this.page = 1;
				this.size =size;
				this.getNavs();
			},
			 
			//获取列表 
			getNavs() {
				let para = {
					page: this.page,
					pageSize: this.size,
					roomId:this.roomId
				};
					if(this.filters.navName.trim()!=''){
						para.name = this.filters.navName; 
					}
					this.listLoading = true;
					NProgress.start();
					let self= this;

					getNavList(self,para).then((res) => {
						// console.log(res);
						if(res.data.data){
							this.total = res.data.data.total;
							this.navListData = res.data.data.rows;
						}else{
							this.total=0;
							this.navListData=[];
						}
						this.listLoading = false;
						NProgress.done();
					});
				},
			handleDel: function(row) {
				var _this = this;
				this.$confirm('确认删除?', '提示', {
					type: 'warning'
				}).then(() => {
					_this.listLoading = true;
					NProgress.start();
					let para = {
						id: row.id
					};
					delMeasuringPointInfo(_this,para,`删除告警配置${row.pointId}`).then((res) => {
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
						_this.getNavs();
					});

				}).catch(() => {

				});
			},
			//显示编辑界面
			handleEdit: function(row) {
				this.$emit("editNav",row)
			},
		 
			handleAdd: function() {
				this.$emit("addNav");
			}
		},
		mounted() {
            this.getNavs();
		}
	}
	</script>