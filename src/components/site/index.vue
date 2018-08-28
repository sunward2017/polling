<template>
	<section>
		<!--列表-->
		<template>
			<el-table :data="data" highlight-current-row style="height:600px;overflow-y:auto;">
				<el-table-column type="index" width="80" label="序号" align="center">
				</el-table-column>
				 <el-table-column prop="position" label="测温点" width="150" align="center" sortable>
				</el-table-column>
				<el-table-column prop="description" label="测温点描述" align="center" sortable>
				</el-table-column>
				<el-table-column prop="fileUrl" label="图片详情" width="120" align="center" sortable>
					 <template scope="scope" >
						<el-button type="warning"  @click="showDetail(scope.row)" size="small">定点图</el-button>
					</template>
				</el-table-column>
				<el-table-column prop="uploadTime" label="上传时间" width="220" align="center" :formatter="formatTime" sortable>
				</el-table-column>
			</el-table>
		</template>
	</section>
</template>

<script scope>
	import NProgress from 'nprogress'
	import { getHumitureList } from '../../api/robot';
	import { parseTime } from '../../utils';

	export default {
		name: 'Humiture',
		props: {
			data: {
				type: Array,
				default:[],
			}
		},
		data() {
			return {
			  listLoading:false	 
			}
		},
		methods: {
			//显示转换
			formatTime(r, c) {
				return parseTime(r.uploadTime, '{y}-{m}-{d} {h}:{i}')
			},
			showDetail(r) {
				 
				let obj ={
					position:r.position,
					url:r.fileUrl
				}
				
				this.$emit("setUrl", obj)
			}
		},
	}
</script>

<style scoped>

</style>