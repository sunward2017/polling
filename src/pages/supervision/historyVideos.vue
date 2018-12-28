<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-form :inline="true" :model="filters">
				<el-form-item label="巡检机房" prop="roomId"> 
					<el-select v-model="filters.roomId" style="width:90%"  @change="changeRoom">
						<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
						</el-option>
					</el-select>
			    </el-form-item>
				<el-form-item>
					<el-select v-model="filters.robotId" placeholder="请选择机器人" @change="changeRobot">
					<el-option
						v-for="item in robots"
						:key="item.roomId"
						:label="item.robotName"
						:value="item.robotId"
					></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="时间区间" style="width:320px;">
					<el-date-picker style="width:110%" v-model="filters.timeStamp" type="daterange" unlink-panels range-separator=" __至__" start-placeholder="开始日期" value-format="yyyy-MM-dd" end-placeholder="结束日期" :picker-options="pickerOptions">
					</el-date-picker>
				</el-form-item> 
				<el-form-item>
					<el-button icon="search" type="primary" v-on:click="getList">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>
		<template>
			<el-table :data="rows" highlight-current-row v-loading="listLoading" style="width: 100%;">
				<el-table-column type="index" width="80" label="序号" align="center">
				</el-table-column>
				<el-table-column prop="fileName" label="视频名称" align="center">
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
	import { getVideosByRoom} from 'api/room';
	import {getRobotList} from 'api/robot';
    import Play from 'components/video'
	
	export default {
		components:{
           Play
		},
		data() {
			return {
				pickerOptions: {
					shortcuts: [{
						text: '最近一周',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
							picker.$emit('pick', [start, end]);
						}
					}, {
						text: '最近一个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
							picker.$emit('pick', [start, end]);
						}
					}, {
						text: '最近三个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
							picker.$emit('pick', [start, end]);
						}
					}]
				},
				filters: {
					roomId: '',
					timeStamp:'',
					robotId:'',
				},
				total: 0,
				page: 1,
				size: 10,
				rooms: [],
				rows: [],
				robots:[],
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
            changeRoom(v) {
				this.robots = this.rooms.find(i => i.roomId === v).robotList;
				this.filters.robotId = this.robots.length > 0 ? this.robots[0].robotId : "";
				if(this.filters.robotId){
					this.getList();
				}
			},
			 changeRobot() {
				this.getList()
			},
			getList() {
				this.listLoading = true;
				NProgress.start();
				let self = this, 
				para = {
					page: this.page,
					pageSize: this.size,
					robotId: this.filters.robotId,
				};
				 
				if(this.filters.timeStamp.length>1){
                      let start = parseTime(this.filters.timeStamp[0], '{y}-{m}-{d}');
					  let end = parseTime(this.filters.timeStamp[1], '{y}-{m}-{d}' );
					 para.starttime = `${start} 00:00:00`;
					 para.endtime = `${end} 23:59:59`
				}
				getVideosByRoom(self, para).then((res) => {
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