<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-form :inline="true" :model="filters">
				<el-form-item label="巡检机房" prop="roomId"> 
					<el-select v-model="filters.roomId" style="width:90%">
						<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
						</el-option>
					</el-select>
			    </el-form-item>
				<!-- <el-form-item label="时间区间" style="width:320px;">
					<el-date-picker style="width:110%" v-model="filters.timeStamp" type="daterange" unlink-panels range-separator=" __至__" start-placeholder="开始日期" value-format="yyyy-MM-dd" end-placeholder="结束日期" :picker-options="pickerOptions2">
					</el-date-picker>
				</el-form-item>  -->
				<el-form-item>
					<el-button icon="search" type="primary" v-on:click="getList">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>
		<template>
			<el-table :data="rows" highlight-current-row v-loading="listLoading" style="width: 100%;">
				<el-table-column type="index" width="80" label="序号" align="center">
				</el-table-column>
				<el-table-column prop="nvPointName" label="导航点" align="center">
				</el-table-column>
				<el-table-column prop="timeStamp" label="创建时间" align="center" sortable :formatter="formatTime">
				</el-table-column>
				<el-table-column prop="fileSize" label="文件大小(KB)" align="center" width="200" :formatter="formatSize">
				</el-table-column>
				<el-table-column prop="fileUrl" label="视频文件" width="200" align="center">
					<template scope="scope">
					    <i class="fa fa-play-circle-o cmd active" @click="handlePlay(scope.row)"></i>
					</template>
				</el-table-column>
			</el-table>
		</template>
		<!--分页-->
		<el-col :span="24" class="toolbar" style="padding-bottom:10px;">
			<el-pagination layout="prev, pager, next,total,sizes,jumper" @current-change="handleCurrentChange" :page-sizes="[10, 15, 30, 40]" :page-size="size" :current-page="page" :total="total" style="float:right;" @size-change="handleSizeChange">
			</el-pagination>
		</el-col>
		<Play :source="videoUrl" v-if="videoVisible" @close="closeVideo"/>
		 
	</section>
</template>

<script>
	import NProgress from 'nprogress'
	import { parseTime } from 'utils';
	import { getAudiosByRoom,devList } from 'api/room';
    import Play from 'components/video'
	
	export default {
		components:{
           Play
		},
		data() {
			return {
				// pickerOptions2: {
				// 	shortcuts: [{
				// 		text: '最近一周',
				// 		onClick(picker) {
				// 			const end = new Date();
				// 			const start = new Date();
				// 			start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
				// 			picker.$emit('pick', [start, end]);
				// 		}
				// 	}, {
				// 		text: '最近一个月',
				// 		onClick(picker) {
				// 			const end = new Date();
				// 			const start = new Date();
				// 			start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
				// 			picker.$emit('pick', [start, end]);
				// 		}
				// 	}, {
				// 		text: '最近三个月',
				// 		onClick(picker) {
				// 			const end = new Date();
				// 			const start = new Date();
				// 			start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
				// 			picker.$emit('pick', [start, end]);
				// 		}
				// 	}]
				// },
				filters: {
					roomId: '',
					timeStamp:'',
				},
				total: 0,
				page: 1,
				size: 10,
				rooms: [],
				rows: [],
				listLoading: false,
				videoUrl:'',
				videoVisible:false,
				videoTitle:'视频播放',
				player:null,
				devs:{},
			}

		},
		methods: { 
			formatTime(r, c) {
				return parseTime(r.timeStamp, '{y}-{m}-{d} {h}:{i}:{s}')
			},
			formatSize(r,c){
				return r.fileSize&&r.fileSize/1000;
			},
			handleCurrentChange(val) {
				this.page = val;
				this.getList();
			},
			handleSizeChange(size) {
				this.page = 1;
				this.size = size;
				this.getList();
			},
			handlePlay(r){
				this.videoUrl = r.fileUrl;
				this.videoVisible = true;
			},
			closeVideo(done){
				this.videoVisible = false; 
			},
			getList() {
				// if(!this.filters.timeStamp[0]||!this.filters.timeStamp[1]) return; 
			    // let	startTime=parseTime(this.filters.timeStamp[0], '{y}-{m}-{d} {h}:{i}:{s}');
			    // let end =parseTime(this.filters.timeStamp[1], '{y}-{m}-{d} {h}:{i}:{s}' ); 
			    // let  times = end.split(' ')[1].split(':');
			    
			    // let	 endTime = (times.every(i=>{return i==="00"}))?`${end.split(' ')[0]} 23:59:59`:end;    
			    
				
				this.listLoading = true;
				NProgress.start();
				let self = this, 
				para = {
					page: this.page,
					pageSize: this.size,
					roomId: this.filters.roomId,
				    fileType:'1',
				};
				getAudiosByRoom(self, para).then((res) => {
                    if(res.body.data) {
                        this.rows = res.body.data.list.map(item=>({...item,...item.nvPointInfo}));
                        this.total = res.data.data.total;
                    } else {
                        this.total = 0;
                        this.rows = [];
                    }
                    this.listLoading = false;
					NProgress.done();
				});
			}
		},
		mounted() {
		   this.rooms = this.$store.state.rooms;
		   this.filters.roomId = this.$store.state.room||this.rooms[0].roomId;
		   this.getList();
		},
	}
</script>

<style scoped>
 .cmd{
	 font-size: 20px;
     color: #00ffff;
	 cursor:default,
 }

</style>