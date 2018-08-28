<template>
	<section class="chart">
		<el-col :span="10">
			<div id="chartPie" class="wrap">
			</div>
		</el-col>
		<el-col :span="4">
			<div class="robotInfo">
				<div style="text-align: center;margin:1rem 0">
					<el-select v-model="filters.roomId" style="width:80%" size="mini" @change="roomData">
						<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
						</el-option>
					</el-select>
				</div>
				<el-row>
					<el-col>
					    机器人:&emsp;{{robotName}}&emsp; 
					</el-col>
				</el-row>
				<el-row>
					<el-col>
					    状态:&emsp;<el-tag :type="robotStatusType">{{robotStatus}}</el-tag>	
					</el-col>
				</el-row>
				<el-row>
					<el-col>
					 坐标:&emsp;X:{{ robotCoorX}}&emsp;Y:{{ robotCoorY}}
					 </el-col>
				</el-row>
				<div id="energy" class="panel_energy"></div>

			</div>
		</el-col>
		<el-col :span="10">
			<div id="chartBar" class="wrap"></div>
		</el-col>
		<el-col :span="24">
			<div id="chartLine" class="wrap"></div>
		</el-col>

	</section>
</template>

<script>
	import NProgress from 'nprogress'
	import echarts from 'echarts'
	import { getRoomIndex } from 'api/dashboard';
	import { getRoomList } from 'api/room';
	import { realtimeStatus, realTimeTypes } from '@/const';
	import { parseTime } from 'utils';

	export default {
		data() {
			return {
				filters: {
					roomId: '',
				},
				chartBar: null,
				chartLine: null,
				chartPie: null,
				energy: null,
				Date: [],
				rooms: [],
				avgHumidity: [],
				avgTemperature: [],
				maxHumidity: [],
				minHumidity: [],
				maxTemperature: [],
				minTemperature: [],
				robotStatus: '',
				robotName: '',
				robotCoorX: '',
				robotCoorY: '',
				robotEnergy: '',
				robotStatusType: '',
			}
		},
		methods: {
			roomData() {
				let _this = this;
				let para = {
					//customId: "43abe352a38d4addb500ffbd0bed7d85"
					customId: this.$store.state.user.customId,
				}

				getRoomIndex(_this, para).then((res) => {
					if(res.body.data && res.body.data.length > 0) {
						let body = res.body.data.filter(item => {
							if(item.roomId == _this.filters.roomId) {
								return item;
							};
						})
						this.$store.dispatch("setRobotId", {
							robotId: body[0].robotRealtimes[0].robotId,
							roomId: body[0].roomId
						});
						this.Date = [];
						this.avgHumidity = [];
						this.avgTemperature = [];
						this.maxHumidity = [];
						this.minHumidity = [];
						this.maxTemperature = [];
						this.minTemperature = [];
						let humitureList = body.length > 0 && body[0].humitureList ? body[0].humitureList : 0;
						let robotInfo = body.length > 0 && body[0].robotRealtimes[0] ? body[0].robotRealtimes[0] : {};

						this.robotName = robotInfo.robotName;
						this.robotCoorX = robotInfo.robotX;
						this.robotCoorY = robotInfo.robotY;
						this.robotStatus = realtimeStatus[robotInfo.realtimeStatus];
						this.robotEnergy = robotInfo.energy;
						this.robotStatusType = realTimeTypes[robotInfo.realtimeStatus];

						for(var l = humitureList.length - 1, i = l; i >= 0; i--) {
							this.Date.push(parseTime(humitureList[i].createTime, '{m}-{d} {h}:{i}'));
							this.avgHumidity.push(humitureList[i].avgHumidity);

							this.minHumidity.push(humitureList[i].minHumidity);
							this.maxHumidity.push(humitureList[i].maxHumidity);

							this.avgTemperature.push(humitureList[i].avgTemperature);
							this.minTemperature.push(humitureList[i].minTemperature);
							this.maxTemperature.push(humitureList[i].maxTemperature);
						}

					}

					this.init();
				})
			},
			getRooms() {
				let para = {
					page: 0,
					roomstatus: 1,
					pageSize: 0
				};
				let self = this;
				NProgress.start();
				getRoomList(self, para).then((res) => {
					NProgress.done();
					if(res.data.data) {
						this.rooms = res.body.data.rows;
						this.filters.roomId = this.rooms[0].roomId
						//this.roomData()
					}

				})
			},
			init() {
				Array.prototype.min = function() {
					return Math.min.apply({}, this)
				}

				var _this = this;
				this.chartBar = echarts.init(document.getElementById('chartBar'));
				this.chartLine = echarts.init(document.getElementById('chartLine'));
				this.chartPie = echarts.init(document.getElementById('chartPie'));
				this.energy = echarts.init(document.getElementById('energy'));
				this.energy.setOption({
					tooltip: {
						formatter: "{a} <br/>{b} : {c}%",

					},
					toolbox: {
						show: false,
						feature: {
							mark: {
								show: false
							},
							restore: {
								show: false
							},
							saveAsImage: {
								show: false
							}
						}
					},
					series: [{
						name: '电量',
						type: 'gauge',
						splitNumber: 10, // 分割段数，默认为5
						axisLine: { // 坐标轴线
							lineStyle: { // 属性lineStyle控制线条样式
								color: [
									[0.2, '#ff4500'],
									[0.8, '#1e90ff'],
									[1, 'lime']
								],
								width: 2,
								shadowColor: '#fff', //默认透明
								shadowBlur: 10
							}
						},
						axisLabel: { // 坐标轴小标记
							textStyle: { // 属性lineStyle控制线条样式
								fontWeight: 'bolder',
								color: '#fff',
								shadowColor: '#fff', //默认透明
								shadowBlur: 10
							}
						},
						axisTick: { // 坐标轴小标记
							length: 12, // 属性length控制线长
							lineStyle: { // 属性lineStyle控制线条样式
								color: 'auto',
								shadowColor: '#fff', //默认透明
								shadowBlur: 10
							}
						},
						splitLine: { // 分隔线
							length: 20, // 属性length控制线长
							lineStyle: { // 属性lineStyle（详见lineStyle）控制线条样式
								width: 3,
								color: '#fff',
								shadowColor: '#fff', //默认透明
								shadowBlur: 10
							}
						},
						pointer: {
							width: 5,
							shadowColor: '#fff', //默认透明
							shadowBlur: 5
						},
						title: {
							show: true,
							offsetCenter: [0, '-30%'], // x, y，单位px
							textStyle: { // 其余属性默认使用全局文本样式，详见TEXTSTYLE
								fontWeight: 'bolder',
								color: '#B4524F'
							}
						},
						detail: {
							formatter: '{value}%',
							textStyle: { // 其余属性默认使用全局文本样式，详见TEXTSTYLE
								color: 'auto',
								fontWeight: 'bold',
								fontSize: '18',
								color: 'orange'
							}
						},
						data: [{
							value: _this.robotEnergy,
							name: '剩余电量',
							top: 50,
							textStyle: {
								color: '#ccc'
							}
						}],
					}]
				})

				this.chartBar.setOption({
					backgroundColor: '#0F375F',
					title: {
						text: '湿度走势',
						textStyle: {
							color: '#f3f3f3'
						},
					},
					legend: {
						top: '1%',
						data: ['最大值', '最小值'],
						textStyle: {
							color: '#ccc'
						}
					},
					toolbox: {
						show: true,
						feature: {
							dataZoom: {
								yAxisIndex: 'none'
							},
							dataView: {
								show: false,
								readOnly: false
							},
							magicType: {
								show: false,
								type: ['line', 'bar']
							},
							restore: {},
							saveAsImage: {}
						}
					},
					tooltip: {
						trigger: 'axis',
						axisPointer: {
							type: 'shadow'
						},
					},
					grid: {
						left: '3%',
						right: '4%',
						bottom: '3%',
						containLabel: true
					},
					xAxis: [{
						type: 'category',
						axisLine: {
							lineStyle: {
								color: '#ccc'
							}
						},
						data: _this.Date.slice(-16),
					}],
					yAxis: [{
						type: 'value',
						axisLine: {
							lineStyle: {
								color: '#ccc'
							}
						},

					}],
					series: [{
							name: '最大值',
							type: 'bar',
							data: _this.maxHumidity.slice(-16),
							itemStyle: {
								normal: {
									color: '#248AB9'
								}
							},
						},
						{
							name: '最小值',
							type: 'bar',
							data: _this.minHumidity.slice(-16),
							itemStyle: {
								normal: {
									color: '#A7D576'
								}
							},
						}
					]
				});
				// option
				this.chartLine.setOption({
					backgroundColor: '#0f375f',
					title: {
						text: '平均温度、湿度走势图',
						x: 'center',
						y: '2%',
						textStyle: {
							color: '#f3f3f3'
						},

					},
					grid: {
						left: "5%",
						right: '2%'
					},
					tooltip: {
						trigger: 'axis',
						axisPointer: {
							type: 'shadow',
							label: {
								show: true,
								backgroundColor: '#333'
							}
						},
						formatter: function(params, ticket, callback) {
							var res = '<div><p>时间：' + params[0].name + '</p></div>'
							for(var k = 0, l = params.length; k < l; k++) {
								if(params[k].seriesName === "湿度") {
									res += '<p> ' + params[k].seriesName + ': ' + parseFloat(params[k].data).toFixed(2) + ' %</p>'
								}
								if(params[k].seriesName === "温度") {
									res += '<p> ' + params[k].seriesName + ': ' + parseFloat(params[k].data).toFixed(2) + ' °C</p>'
								}
							}
							return res;
						}
					},
					legend: {
						data: ['湿度', '温度'],
						left: '2%',
						top: '2%',
						textStyle: {
							color: '#ccc'
						}
					},
					xAxis: {
						data: _this.Date,
						axisLine: {
							lineStyle: {
								color: '#ccc'
							}
						}
					},
					yAxis: {
						splitLine: {
							show: false
						},
						axisLine: {
							lineStyle: {
								color: '#ccc'
							}
						}
					},
					series: [{
						name: '湿度',
						type: 'line',
						smooth: true,
						showAllSymbol: true,
						symbol: 'emptyCircle',
						symbolSize: 15,
						data: _this.avgHumidity,
					}, {
						name: '温度',
						type: 'bar',
						barWidth: 10,
						itemStyle: {
							normal: {
								barBorderRadius: 5,
								color: new echarts.graphic.LinearGradient(
									0, 0, 0, 1, [{
											offset: 0,
											color: '#14c8d4'
										},
										{
											offset: 1,
											color: '#43eec6'
										}
									]
								)
							}
						},
						data: _this.avgTemperature
					}, {
						name: 'bg',
						type: 'bar',
						barGap: '-100%',
						barWidth: 10,
						itemStyle: {
							normal: {
								color: new echarts.graphic.LinearGradient(
									0, 0, 0, 1, [{
											offset: 0,
											color: 'rgba(20,200,212,0.5)'
										},
										{
											offset: 0.2,
											color: 'rgba(20,200,212,0.2)'
										},
										{
											offset: 1,
											color: 'rgba(20,200,212,0)'
										}
									]
								)
							}
						},
						z: -12,
						data: _this.avgHumidity,
					}, {
						name: 'dotted',
						type: 'pictorialBar',
						symbol: 'rect',
						itemStyle: {
							normal: {
								color: '#0f375f'
								//color:'#19f182',
								// color:"#0b0a0f"
							}
						},
						symbolRepeat: true,
						symbolSize: [12, 4],
						symbolMargin: 1,
						z: -10,
						data: _this.avgHumidity,
					}]
				});
				this.chartPie.setOption({
					backgroundColor: '#0f375f',
					title: {
						text: '温度走势图',
						textStyle: {
							color: '#f3f3f3'
						},
					},
					tooltip: {
						trigger: 'axis',
					},
					grid: {
						right: '4%',
					},
					legend: {
						top: '1%',
						data: ['最高温度', '最低温度'],
						textStyle: {
							color: "#ccc"
						}
					},
					toolbox: {
						show: true,
						feature: {
							dataZoom: {
								yAxisIndex: 'none'
							},
							dataView: {
								show: false,
								readOnly: false
							},
							magicType: {
								show: false,
								type: ['line', 'bar']
							},
							restore: {},
							saveAsImage: {}
						}
					},
					xAxis: {
						type: 'category',
						boundaryGap: false,
						axisLine: {
							lineStyle: {
								color: '#ccc'
							}
						},
						data: _this.Date,
					},
					yAxis: {
						type: 'value',
						axisLabel: {
							formatter: '{value} °C'
						},
						axisLine: {
							lineStyle: {
								color: '#ccc'
							}
						},
						min: Math.round(_this.minTemperature.min() - 5),
					},
					series: [{
							name: '最高温度',
							type: 'line',
							data: _this.maxTemperature,
							markPoint: {
								data: [{
										type: 'max',
										name: '峰值'
									},
									{
										type: 'min',
										name: '谷值'
									}
								]
							},
							//							markLine: {
							//								data: [{
							//									type: 'average',
							//									name: '平均值'
							//								}]
							//							}
						},
						{
							name: '最低温度',
							type: 'line',
							data: _this.minTemperature,
							itemStyle: {
								normal: {
									color: '#A7D576'
								}
							},
							markPoint: {
								data: [{
										type: 'max',
										name: '峰值'
									},
									{
										type: 'min',
										name: '谷值'
									}
								]
							},

						}
					]
				});

				window.onresize = function() {
					_this.chartBar.resize();
					_this.chartLine.resize();
					_this.chartPie.resize();
					_this.energy.resize();
				}
			}
		},
		mounted: function() {
			this.getRooms();
		}
	}
</script>

<style scoped>
	.chart {
		background: #0f375f url(../../assets/bg.jpg);
		background-size: 100% 100%;
		padding:12px;
		 
	}
	
	.chart:after {
		display: block;
		clear: both;
		content: "";
		visibility: hidden;
		height: 0
	}
	
	.el-col {
		padding: 10px;
	}
	
	.el-row {
		margin: 0;
	}
	
	.wrap {
		border: 1px solid #ccc;
		height: 41vh;
	}
	
	.panel_energy {
		height: 55%;
		overflow: hidden;
	}
	
	.robotInfo {
		border: 1px solid #ccc;
		color: #f3f3f3;
		height: 41vh;
		overflow: hidden;
		background: #0F375F;
		font-size: 0.8em;
	}
	
	.robotInfo h3 {
		text-align: center;
	}
</style>