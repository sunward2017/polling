<template>
	<div id="sec">
		<el-row>
			<el-col :span="24" class="toolbar">
				<h2> 机器人运行报告单</h2>
				<el-button icon="caret" v-if="listLoading" v-loading="exportLoading" type="info" @click="handleExport">导出</el-button>
			</el-col>
		</el-row>

		<el-col :span="24">
			<h3>1.1巡检路线图</h3>
			<el-row class="t_img">
				<img :src="`${baseImgUrl}/roomImages/${roomId}.png`" alt="巡检路径" width="95%" height="600" />
			</el-row>
			<h3>1.2巡检数据呈现图</h3>
			<dashboard/>
		</el-col>
		<el-col :span="24">
			<h3>2、任务安排</h3>
			<table border="0" cellpadding="0" cellspacing="0" style="width:100%" class="task_list">
				<tr class="tb_title">
					<th>序号</th>
					<th>日期</th>
					<th>任务来源</th>
					<th style="width:70%">阶段时间-任务完成比例</th>
				</tr>
				<template v-for="(item,index) in taskExec">
					<tr :key="index">
						<td rowspan="2">{{++index}}</td>
						<td rowspan="2">{{item.Date}}</td>
						<td>巡检任务</td>
						<td class="taskDes">{{item.fileTask}}</td>
					</tr>
					<tr :key="item.thermometTask">
						<td>定点测温</td>
						<td class="taskDes">{{item.thermometTask}}</td>
					</tr>
				</template>
			</table>
		</el-col>
		<el-col :span="24">
			<h3>3、机器人工作时长</h3>
			<h4>3.1机器人运行状态数据表</h4>
			<table border="0" cellpadding="0" cellspacing="0" style="width:100%" class="task_list">
				<tr>
					<th>日期</th>
					<th>开始时间</th>
					<th>结束时间</th>
					<th>工作时长(分)</th>
				</tr>
				<!--one day-->
				<template v-for="(day,index) in taskTimeByDay">
					<tr v-for="item in day.list">
						<td>{{item.createTime}}</td>
						<td>{{item.startTime}}</td>
						<td>{{item.endTime}}</td>
						<td>{{item.costTime}}</td>
					</tr>
					<tr>
						<td rowspan="2">工作时间合计</td>
						<td colspan="2">工作时间</td>
						<td>{{day.taskCostTime}}</td>
					</tr>
					<tr>
						<td colspan="2">工作占比</td>
						<td>{{day.taskPercent+'%'}}</td>
					</tr>
				</template>
			</table>
			 

			<h3>3.2机器人使用效率图</h3>
			<div id="worker" style="height:300px;width:90%;margin:0 auto;"></div>
		</el-col>
		<el-col :span="24">
			<h3>4、热能均衡</h3>
			<h4>4.1、热能均衡测试数据表</h4>
			<table border="0" cellpadding="0" cellspacing="0" style="width:100%" class="task_list">
				<tr>
					<th>序号</th>
					<th>任务执行时间</th>
					<th>最高温度(℃)</th>
					<th>最低温度(℃)</th>
					<th>平均温度(℃)</th>
					<th>平均湿度(%)</th>
				</tr>
				<tr v-for="(item,index) in humitures">
					<td>{{++index}}</td>
					<td>{{item.createTime}}</td>
					<td>{{item.maxTemperature}}</td>
					<td>{{item.minTemperature}}</td>
					<td>{{item.avgTemperature}}</td>
					<td>{{item.avgHumidity}}</td>
				</tr>
			</table>	
			 
			<h4>4.2、热能均衡测试呈现图</h4>
			<el-row class="t_img">
				<img :src="temperature" alt="温度分布图" width="70%" height="600" />
				<div>{{humidityDate}}温度分布图</div>
			</el-row>
			<el-row class="t_img">
				<img :src="humidity" alt="湿度分布图" width="70%" height="600" />
				<div>{{humidityDate}}湿度分布图</div>
			</el-row>
		</el-col>
		<el-col :span="24">
			<h3>5定点测温</h3>
			<h4>5.1定点测温数据表</h4>
				<table border="0" cellpadding="0" cellspacing="0" style="width:100%" class="task_list">
				<tr>
					<th>序号</th>
					<th>机柜号</th>
					<th>测温时间</th>
					<th>最高温度(℃)</th>
					<th>最低温度(℃)</th>
					<th>是否正常</th>
				</tr>
				<tr v-for="(item,index) in rows">
					<td>{{++index}}</td>
					<td>{{item.position}}</td>
					<td>{{item.uploadTime}}</td>
					<td>{{item.maxTemp}}</td>
					<td>{{item.minTemp}}</td>
					
					<td>{{item.validValue===1?'正常':'异常'}}</td>
				</tr>
			</table>
		</el-col>
	</div>
</template>

<script>
	import NProgress from 'nprogress'
	import { parseTime } from 'utils';
	import dashboard from '../dashboard/dashboard.vue'
	import { getRoomList } from 'api/room';
	import { getThermometryResults, getHumitureResults, getTaskByTime } from 'api/results';

	import echarts from 'echarts'
	import html2canvas from "html2canvas";
	import jsPDF from 'jspdf';
	import { baseImgUrl } from 'api/api';
 

	export default {
		components: {
			dashboard
		},
		data() {
			return {
				rows: [],
				baseImgUrl:baseImgUrl,
				listLoading: false,
				exportLoading: false,
				humitures: [],
				taskTimeByDay: [],
				energy: null,
				taskExec: [],
				humidity: '',
				temperature: '',
				humidityDate: ''
			}
		},

		computed: {
			robotId() {
				return this.$store.state.robotId.robotId;
			},
			roomId() {
				return this.$store.state.robotId.roomId;
			}
		},
		watch: {
			robotId: function(a, b) {
				this.listLoading =false;
				this.getList()
			}
		},
		methods: {
			getList() {
				let time = new Date().valueOf();
				let para = {
					robotId: this.robotId,
					roomId: this.roomId,
					starttime: parseTime(time - 86400000 * 3, '{y}-{m}-{d} {h}:{i}:{s}'),
					endtime: parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}')
				};
				 

				NProgress.start();
				let self = this;
				let add = 0;
				getHumitureResults(self, para).then(res => {
					if(res.body.data && res.body.data.humitureList) {
						let humitureList = res.body.data.humitureList;
						this.humitures = humitureList.map(i => {
							let obj = {};
							obj.maxTemperature = i.maxTemperature.toFixed(2);
							obj.minTemperature = i.minTemperature.toFixed(2);
							obj.avgTemperature = i.avgTemperature.toFixed(2);
							obj.avgHumidity = i.avgHumidity.toFixed(2);
							obj.createTime = parseTime(i.createTime, '{y}-{m}-{d} {h}:{i}:{s}');
							return obj;
						});
						let humiture = humitureList[0];
						this.humidityDate = parseTime(humiture.createTime, '{y}-{m}-{d} {h}:{i}:{s}')
						this.humidity = `${humiture.humidityUrl}?` + new Date().valueOf()
						this.temperature = `${humiture.temperatureUrl}?` + new Date().valueOf()
					} else {
						this.humitures = [];
					}
					add++
					if(add === 3) {
						NProgress.done();
						this.listLoading = true;
					}
				})
				getThermometryResults(self, para).then((res) => {
					if(res.body.data && res.body.data.irThermometryList) {
						this.rows = res.body.data.irThermometryList.map(i => {
							let obj = {};
							obj.position = i.position;
							obj.maxTemp = i.maxTemp / 100;
							obj.minTemp = i.minTemp / 100;
							obj.uploadTime =  parseTime(i.uploadTime, '{y}-{m}-{d} {h}:{i}:{s}');
							obj.validValue = i.validValue;
							return obj;
						});
					} else {
						this.rows = [];
					}
					 
					add++
					if(add === 3) {
						NProgress.done();
						this.listLoading = true;
					}
				});

				//				para.starttime = parseTime(time - 86400000 * 6, '{y}-{m}-{d} {h}:{i}:{s}');
				getTaskByTime(self, para).then(res => {
					if(res.body.data) {
						this.taskTimeByDay = res.body.data.map(i => {
							i.taskPercent = i.taskPercent.toFixed(2)
							i.list.map(r=>{
								r.createTime = parseTime(r.createTime, '{y}-{m}-{d}');
							    r.startTime = parseTime(r.startTime, '{y}-{m}-{d} {h}:{i}:{s}');
							    r.endTime = parseTime(r.endTime, '{y}-{m}-{d} {h}:{i}:{s}')
							    return r
							})
							return i;
						});
						let xData = [];
						let yData = [];
						this.taskExec = [];
						let _this = this;
						res.body.data.forEach((i, index) => {
							 
							let Date = i.list[0].startTime.split(' ')[0];
							 
							xData.push(Date);
							yData.push(+i.taskPercent);
							let obj = {};
							let regex = /.*\s+(\d{1,2}):(\d{1,2}):\d{1,2}/;
							let fileTask = i.list.map(n => {
								return `${n.endTime.replace(regex,'$1分$2秒')}-${n.fileInfosCount}/${n.fileInfosValidCount}`;
							})
							let thermometTask = i.list.map(t => {
								return `${t.endTime.replace(regex,'$1分$2秒')}-${t.thermometryCount}/${t.thermometryValidCount}`;
							})
							obj.Date = Date;
							obj.fileTask = fileTask.join(' ');
							obj.thermometTask = thermometTask.join(" ");
							_this.taskExec.push(obj)
						})

						this.initEnergy(xData, yData);
					}
					add++
					if(add === 3) {
						NProgress.done();
						this.listLoading = true;
					}
				})

			},
			initEnergy(xData, yData) {
				this.energy = echarts.init(document.getElementById('worker'));

				this.energy.setOption({
					tooltip: {
						trigger: 'axis',
						axisPointer: { // 坐标轴指示器，坐标轴触发有效
							type: 'line', // 默认为直线，可选为：'line' | 'shadow'
						},
						formatter: '{b}:{c}%'
					},
					grid: {
						show: false,
						height: '78%',
						width: '90%',
						top: '8%',
						left: '7%',
					},
					xAxis: {
						data: xData
					},
					yAxis: [{
						type: 'value',
						axisLabel: {
							show: true,
							textStyle: {
								color: '#3398DB',
								fontSize: '70%',
							},
							interval: 0,
							showMinLabel: true,
							formatter: '{value} %'
						},
						min: 0,
						//						max: ,
						splitNumber: 10
					}],
					series: [{
						name: '销量',
						type: 'line',
						data: yData,
					}]
				})

			},
			handleExport() {
				this.exportLoading = true;
				let _this = this;
				var dom = document.getElementById("sec");
				html2canvas(dom).then(function(canvas) {

					var imgData = canvas.toDataURL('image/jpeg');
					var img = new Image();
					img.src = imgData;

					img.onload = function() {

						if(this.width > this.height) {
							var doc = new jsPDF('l', 'mm', [this.width * 0.225, this.height * 0.225]);
						} else {
							var doc = new jsPDF('p', 'mm', [this.width * 0.225, this.height * 0.225]);
						}
						doc.addImage(imgData, 'jpeg', 0, 0, this.width * 0.225, this.height * 0.225);

						doc.save('pdf_' + new Date().getTime() + '.pdf');

						_this.exportLoading = false;
					};

				}).then(e => {
					console.log(e)
				})
			}
		},
		mounted() {
			this.getList()

		}
	}
</script>

<style>
	.toolbar h2 {
		display: inline-block;
		width: 90%;
		text-align: center;
	}
	
	#sec:after {
		display: block;
		clear: both;
		content: "";
		visibility: hidden;
		height: 0
	}
	
	.summary .el-table__empty-block {
		display: none;
	}
	
	#sec {
		width: 80%;
		margin: 0 auto;
		background: #fff;
	}
	
	#sec h3,
	#sec h4 {
		padding-left: 10px;
	}
	
	.empty .el-table__header-wrapper {
		display: none
	}
	
	.task_list {
		border-right: 1px solid #ccc;
		border-top: 1px solid #ccc;
		font-size: 14px;
		font-weight:600;
	}
	
	.task_list tr {
		height: 40px;
		line-height: 40px;
		text-align: center;
	}
	
	.task_list tr td,
	.task_list tr th {
		border-bottom: 1px solid #ccc;
		border-left: 1px solid #ccc;
	}
	
	.tb_title {
		background: #eef0f6;
	}
	
	.t_img {
		text-align: center;
	}
	.taskDes{
		word-break: keep-all;
	}
</style>