  <template>
	<section>
		<!--列表-->
		<template>
			<el-table :data="robotHumitures" highlight-current-row v-loading="listLoading">
				<el-table-column type="index" width="80" label="序号" align="center">
				</el-table-column>
				<el-table-column prop="logType" label="温度分布图" width="200" align="center">
					<template scope="scope">
				       <img :src="'./upload'+scope.row.fileUrl" alt="" width="50" height="50" @click="showDetail(scope.row.fileUrl)"/> 
				   </template> 
				</el-table-column>
				<el-table-column prop="robotName" label="湿度分布图"  align="center" width="200">
				   <template scope="scope">
				       <img :src="'./upload'+scope.row.humidityUrl" alt="" widht="50" height="50" @click="showDetail(scope.row.humidityUrl)"/> 
				   </template> 
				</el-table-column>
				<el-table-column prop="createTime" label="创建时间" align="center"   sortable>
	                <template scope="scope">
				        <el-icon name="time"></el-icon>
				        <span style="margin-left:10px">{{ formatTime(scope.row) }}</span>
				      </template> 
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
	</section>
</template>

<script scope>
	import NProgress from 'nprogress'
	import { getHumitureList } from '../../api/robot';
	import { parseTime } from '../../utils';
	 
	export default {
		name:'Humiture',
		props:{
           robot:{
           	  type:String,
           }
		},
		data() {
				return {
					robotHumitures: [],
					total: 0,
					page: 1,
					size:10,
					listLoading: false,
					currentUrl:'',
					distributeTitle:'',
					imgVisible:false
				}
			},
		methods: {
			//显示转换
			formatTime:function(r,c){
				return parseTime(r.createTime,'{y}-{m}-{d} {h}:{i}')
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
			getList() {
				let para = {
					robotId: this.robot,
					page: this.page,
					pageSize: this.size
				};
				this.listLoading = true;
				NProgress.start();
				let self = this;
				getHumitureList(self,para).then((res) => {
					if(res.data.data){
					   this.total = res.data.data.total;
					   this.robotHumitures = res.data.data.rows;	
					}else{
						this.total =0;
						this.robotHumitures = [];
					}
					this.listLoading = false;
					NProgress.done();
				}); 
			},
			showDetail(src){
				this.$emit("setUrl",src)
			}
		},
		mounted() {
		  
		}
	}
</script>

<style scoped>

</style>