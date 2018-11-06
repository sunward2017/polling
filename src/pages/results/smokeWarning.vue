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
				<el-form-item label="时间区间" style="width:320px;">
					<el-date-picker style="width:110%" v-model="filters.timeStamp" type="daterange" unlink-panels range-separator=" __至__" start-placeholder="开始日期" value-format="yyyy-MM-dd" end-placeholder="结束日期" :picker-options="pickerOptions2">
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
				<el-table-column prop="robotName" label="巡检机器人" width="260" align="center" sortable>
					<template scope="scope">
						<el-tag>{{scope.row.robotName}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="type" label="异味类型" align="center" sortable> 	
					<template scope="scope">
						<el-tag :type="scope.row.flaovrType">{{scope.row.type}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="x" label="坐标X" align="center" sortable>  
				</el-table-column>
				<el-table-column prop="y" label="坐标Y" align="center" sortable> 	 
				</el-table-column>
				
				<el-table-column prop="createTime" label="创建时间" width="250" align="center" sortable>
					<template scope="scope">
						<span style="margin-left: 10px">{{ formatTime(scope.row.timeStamp) }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="warnStatus" label="所在位置" align="center" width="180">
					<template scope="scope">
						<el-button  size="small" type="success" round @click="showSite(scope.row)">位置信息</el-button>
					</template>
				</el-table-column>
			</el-table>
		</template>
		<!--分页-->
		<el-col :span="24" class="toolbar" style="padding-bottom:10px;">
			<el-pagination layout="prev, pager, next,total,sizes,jumper" @current-change="handleCurrentChange" :page-sizes="[10, 15, 30, 40]" :page-size="size" :current-page="page" :total="total" style="float:right;" @size-change="handleSizeChange">
			</el-pagination>
		</el-col>
		<el-dialog title="异味标示图" v-model="siteVisible">
			<img :src="roomUrl" alt="异常图片,无法识别" width="100%" ref="roomImg"/>
			<div class="circle" :style="{left:cleft,bottom:ctop}">
			     <div class="c1"></div>
			     <div class="c2"></div>
			     <div class="c3"></div>
			 </div>
		</el-dialog>
	</section>
</template>

<script>
	import NProgress from 'nprogress'
	import { parseTime } from 'utils';
	import { getRoomList } from 'api/room';
	import { getSmokeWarning } from 'api/results';
    import { FLAOVR_TYPE } from '@/const'; 
   
	export default {
		data() {
			return {
				pickerOptions2: {
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
				},
				total: 0,
				page: 1,
				size: 10,
				rooms: [],
				rows: [],
				listLoading: false,
				roomUrl: '',
				siteVisible:false,
				ctop:'',
				cleft:'',
				initial:{},
			}

		},
		methods: { 
			formatTime(t, c) {
				return parseTime(t, '{y}-{m}-{d} {h}:{i}:{s}')
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
		 
			getList() {
				if(!this.filters.timeStamp[0]||!this.filters.timeStamp[1]) return; 
			    let	startTime=parseTime(this.filters.timeStamp[0], '{y}-{m}-{d} {h}:{i}:{s}');
			    let end =parseTime(this.filters.timeStamp[1], '{y}-{m}-{d} {h}:{i}:{s}' ); 
			    let  times = end.split(' ')[1].split(':');
			    
			    let	 endTime = (times.every(i=>{return i==="00"}))?`${end.split(' ')[0]} 23:59:59`:end;    
			    
				let para = {
					page: this.page,
					pageSize: this.size,
					roomId: this.filters.roomId,
					startTime: startTime,
					endTime: endTime
				};
				this.listLoading = true;
				NProgress.start();
				let self = this;
				var img = new Image();
					img.src = `/upload/${this.filters.roomId}_base.png`; 
					img.onload=function(){
					   self.initial.x = img.width;
					   self.initial.y = img.height;
					}
				getSmokeWarning(self, para).then((res) => {
						if(res.data.data&& res.data.data.list.length > 0) {
							this.rows = res.data.data.list.map(item=>{
								item.robotName = item.robotInfo.robotName;
								item.flaovrType = item.type?FLAOVR_TYPE[item.type-1]:"warning";
								item.type = item.type===1?"氟利昂":item.type===2?"氯化氢":"混合气体";
								return item;
							});
					        this.total = res.data.data.total;
		     			} else {
							this.total = 0;
							this.rows = [];
						}
						this.listLoading = false;
					NProgress.done();
				});
			},
		    showSite(r){
		    	var W,w,H,h;
				this.siteVisible= true;
				this.roomUrl = `/upload/${this.filters.roomId}_base.png`;
				this.$nextTick(()=>{
					let w = this.$refs.roomImg.width;
					let h = this.$refs.roomImg.height;
					this.cleft = r.x/this.initial.x*w+"px";
					this.ctop = (1-r.y/this.initial.y)*h+"px";
				})
			}
		},
		mounted() {
		   this.rooms = this.$store.state.rooms;
		   this.filters.roomId = this.$store.state.robotId?this.$store.state.robotId.roomId:this.rooms[0].roomId;
		   this.getList();
		}
	}
</script>

<style>
  .custom-theme .el-dialog__body{
  	position:relative;
  }
 .circle {
    position:absolute;
    width:40px;
    height:40px
 }
 .circle div {
    position:absolute;
    width:70px;
    height:70px;
    opacity:1;
    border-radius:35px;
              
    animation-timing-function:linear;
    animation-iteration-count:infinite;
}
.circle div.c1 {
	width:5px;
	height:5px;
	opacity:1;
	margin-left:33px;
	margin-top:33px;
	border-radius:1px;
	background:#ff412c;
}
.circle div.c2 {
	border:1px solid #ff412c;
	border-color:#ff412c;
	box-shadow:0px 0px 15px 10px #ff412c inset;
	animation-name:c2; 
	animation-delay:0s; 
	animation-duration: 1.8s;
}
.circle div.c3 { 
	border:1px solid #ff412c ;
	border-color:#ff412c;
	box-shadow:0px 0px 15px 10px #ff412c inset;
	animation-name:c2; 
	animation-delay:0.9s; 
	animation-duration: 1.8s;
}
		
          

  @-webkit-keyframes c2 {
		0% {
			-webkit-transform:scale(0);
			-ms-transform:scale(0);
			-moz-transform:scale(0);
			-o-transform:scale(0);
			transform:scale(0);
			opacity:1
		}
		50% {
			-webkit-transform:scale(.622);
			-ms-transform:scale(.622);
			-moz-transform:scale(.622);
			-o-transform:scale(.622);
			transform:scale(.622);
			opacity:.4
		}
		90% {
			-webkit-transform:scale(1);
			-ms-transform:scale(1);
			-moz-transform:scale(1);
			-o-transform:scale(1);
			transform:scale(1);
			opacity:.3
		}
		100% {
			opacity:0.1
		}
	}
  @keyframes c2 {
	0% {
		-webkit-transform:scale(0);
		-ms-transform:scale(0);
		-moz-transform:scale(0);
		-o-transform:scale(0);
		transform:scale(0);
	opacity:1
	}
	50% {
		-webkit-transform:scale(.622);
	-ms-transform:scale(.622);
	-moz-transform:scale(.622);
		-o-transform:scale(.622);
	transform:scale(.622);
		opacity:.4
	}
	90% {
		-webkit-transform:scale(1);
		-ms-transform:scale(1);
		-moz-transform:scale(1);
		-o-transform:scale(1);
		transform:scale(1);
	opacity:.3
	}
	100% {
	opacity:0.1
   }
}
</style>