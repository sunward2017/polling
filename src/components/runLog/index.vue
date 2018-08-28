 <template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.logType" placeholder="日志类型"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getLogList">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<template>
			<el-table :data="robotLogs" highlight-current-row v-loading="listLoading" style="width: 100%;">
				<el-table-column type="index" width="80" label="序号">
				</el-table-column>
				<el-table-column prop="createTime" label="创建时间" align="center" width="180" sortable>
	                <template scope="scope">
				        <el-icon name="time"></el-icon>
				        <span style="margin-left:10px">{{ formatTime(scope.row) }}</span>
				      </template> 
				</el-table-column>
				<el-table-column prop="robotName" label="机器人名称"  align="center" >
				    <template scope="scope">
				      <el-tag type="">{{scope.row.robotName}}</el-tag>
				   </template> 
				</el-table-column>
				<el-table-column prop="logType" label="日志类别" width="120" align="center">
				</el-table-column>
				 
				<el-table-column  prop="logUrl"  label="操作" width="100" align="center">
				    <template scope="scope"> 
					     <a href="javascript:void(0);"   @click="download(scope.row)">下载</a>
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
	// import util from '../../common/util'
	import NProgress from 'nprogress'
	import { getRobotLogList } from '../../api/robot';
	import { parseTime } from '../../utils';
	import '../../utils/blob.js'
	import { saveAs} from '../../utils/fileSaver';
    import {baseImgUrl } from '../../api/api'
    
	export default {
		name:'Log',
		props:{
           msg:{
           	  type:String,
           }
		},
		data() {
				return {
					filters: {
					   logType: ''
					},
					robotLogs: [],
					total: 0,
					page: 1,
					size:10,
					listLoading: false, 
					baseUrl:baseImgUrl
				     
				}
			},
		methods: {
			//显示转换
			formatTime:function(r,c){
				return parseTime(r.createTime,'{y}-{m}-{d} {h}:{i}')
			},
			handleCurrentChange(val) {
				this.page = val;
				this.getLogList();
			},
			handleSizeChange(size){
				this.page = 1;
				this.size =size;
				this.getLogList();
			},
			getLogList() {
				let para = {
					robotId: this.msg,
					page: this.page,
					pageSize: this.size
				};
				if(this.filters.logType!=''){
					para.logType= this.filters.logType;
				}
				this.listLoading = true;
				NProgress.start();
				let self = this;
				getRobotLogList(self,para).then((res) => {
					if(res.data.data){
					   this.total = res.data.data.total;
					   this.robotLogs = res.data.data.rows;	
					}else{
						this.total =0;
						this.robotLogs = [];
					}
					this.listLoading = false;
					NProgress.done();
				}); 
			},
			initMsg(){
				this.filters.logType='';
			},
			download(r){
				const {createTime,logUrl} = r;
				const ftime = parseTime(createTime,'{y}-{m}-{d} {h}:{i}');
				const logSrc = this.baseUrl+logUrl;  
				this.$http.get(logSrc).then(res=>{
					const blob = new Blob(["\uFEFF" + res.body],{ type: "application/vnd.ms-excel;charset=utf-8"})
					saveAs(blob,`${ftime}.log`)
				})
			}
		},
		mounted() {
		  
		}
	}
</script>

<style scoped>

</style>