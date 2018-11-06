<template>
	<section>
		<div v-if="routeType==='index'">
			<el-col :span="24" class="toolbar">
				<el-form :inline="true" :model="filters" ref="ruleForm">
					<el-form-item  prop="roomId">
						<el-select v-model="filters.roomId">
							<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
							</el-option>
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-col :span="11">
							<el-form-item prop="startTime">
								<el-date-picker type="date" placeholder="选择开始日期" v-model="filters.startTime" style="width: 100%;"></el-date-picker>
							</el-form-item>
						</el-col>
						<el-col class="line" :span="1">~&nbsp;</el-col>
						<el-col :span="11">
							<el-form-item prop="endTime">
								<el-date-picker type="date" placeholder="选择结束日期" v-model="filters.endTime" tyle="width: 100%;"></el-date-picker>
							</el-form-item>
						</el-col>
					</el-form-item>

					<el-form-item>
						<el-button type="primary" v-on:click="getList" :loading="listLoading">查询</el-button>
					</el-form-item>
				</el-form>
			</el-col>
			<el-row class="toolbar">
				<el-col :span="4" style="min-width:200px;"> 
					<span class="d_title">需要识别的机柜总数:</span><span class="d_content">{{cabinetTotal}}</span>
				</el-col>
				<el-col :span="4"  style="min-width:200px;">
					<span class="d_title">单个机柜总U位数:</span><span class="d_content">{{47}}</span>
				</el-col>
			</el-row>
			<!--机柜-->
			<template>
				<el-table :data="rows" highlight-current-row v-loading="listLoading" style="width: 100%;">
					<el-table-column type="index" width="80" label="序号" align="center">
					</el-table-column>
					<el-table-column prop="timeField" width="380" label="巡检时间" align="center">
					</el-table-column>
					<el-table-column prop="taskName" width="280" label="任务名称" align="center">
					</el-table-column>
					<el-table-column prop="recognizedDevices" width="180" label="已识别机柜数" align="center">
					</el-table-column>
					<el-table-column prop="serverNumbers" width="180" label="已识别设备数" align="center">
					</el-table-column>
					<el-table-column prop="usedUNumbers" width="180" label="设备已用U位" align="center">
					</el-table-column>
					<el-table-column prop="remainingUNumbers"  label="剩余U位" align="center">
					</el-table-column>
					<el-table-column label="操作" width="200" align="center">
						<template scope="scope">
							<el-button type="text" @click="go('detail',scope.row)" class="msg">查看</el-button>
						</template>
					</el-table-column>
				</el-table>
			</template>
			<!--分页-->
			<el-col :span="24" class="toolbar" style="padding-bottom:10px;">
				<el-pagination layout="prev, pager, next,total,sizes,jumper" @current-change="handleCurrentChange" :page-sizes="[10, 20, 30, 40]" :page-size="size" :current-page="page" :total="total" style="float:right;" @size-change="handleSizeChange">
				</el-pagination>
			</el-col>
		</div>

		<!--机柜详情-->
		<div v-if="routeType==='detail'">
			<el-row style="margin-bottom:20px;font-size:16px;" >
				<el-col :span='1' style="min-width:100px">
					<span @click="go('index')" class="back">&nbsp;&lt;&lt;&nbsp;返回</span>
				</el-col>
				<el-col :span='4' :offset='9'> 单次巡检结果详情</el-col>
			</el-row>
			<div class="toolbar" style="font-size:14px;">
				<el-row class="list_item">
					<el-col :span="8"><span class="d_title">机房:</span><span class="d_content">{{rooms.find(i=>(i.roomId===filters.roomId)).roomName}}</span></el-col>
				</el-row>
				<el-row class="list_item">
					<el-col :span="6"><span class="d_title">需要识别的机柜数:</span><span class="d_content">{{detail.totalDevices}}</span></el-col>
					<el-col :span="8"><span class="d_title">巡检时间:</span><span class="d_content">{{detail.timeField}}</span></el-col>
					<el-col :span="5"><span class="d_title">已识别机柜数:</span><span class="d_content">{{detail.recognizedDevices}}</span></el-col>
					<el-col :span="5"><span class="d_title">设备已用U位:</span><span class="d_content">{{detail.usedUNumbers}}</span></el-col>
				</el-row>
				<el-row class="list_item">
					<el-col :span="6"><span class="d_title">单个机柜U位数:</span><span class="d_content">{{47}} </span></el-col>
					<el-col :span="8"><span class="d_title">巡检任务名称:</span><span class="d_content">{{detail.taskName}} </span></el-col>
					<el-col :span="5"><span class="d_title">已识别设备数量:</span><span class="d_content">{{detail.serverNumbers}}</span></el-col>
					<el-col :span="5"><span class="d_title">剩余U位:</span><span class="d_content">{{detail.remainingUNumbers}}</span></el-col>
				</el-row>
			</div>
			<el-tabs v-model="activeName" type="border-card" @tab-click="changeTab()">
				<el-tab-pane label="按机柜查看" name="first">
					<el-row style="margin-bottom:15px;">
						<el-col :span='5' :offset="17">
							<el-input placeholder="请输入机柜名称" v-model="cabinetName"></el-input>
						</el-col>
					  <el-col :span="2" style="text-align: center;">
							<el-button type="primary" v-on:click="getCabinet()">查询</el-button>
						</el-col>
					</el-row>
					<el-table :data="detailCabinetRows" highlight-current-row v-loading="cabinetListLoading" style="width: 100%">
						<el-table-column type="index" width="80" label="序号" align="center">
						</el-table-column>
						<el-table-column prop="deviceName" width="180" label="机柜名称" align="center">
						</el-table-column>
						<el-table-column prop="detectedSeverNumber" label="已识别设备数量" align="center">
						</el-table-column>
						<el-table-column prop="usedUNumbers" label="已用U位" align="center">
						</el-table-column>
						<el-table-column prop="remainingUNumbers" label="剩余U位" align="center">
						</el-table-column>
						<el-table-column label="操作" width="200" align="center">
							<template scope="scope">
								<el-button type="text" @click="go('jgDetail',scope.row)" class="msg">查看</el-button>
							</template>
						</el-table-column>
					</el-table>

				</el-tab-pane>
				<!--设备详情-->
				<el-tab-pane label="按设备查看" name="second">
					<el-row style="margin-bottom:15px;">
						<el-col :span='5' :offset="12">
							<el-input placeholder="设备ip" v-model="ip" style="width:90%"></el-input>
						</el-col>

						<el-col :span='5'>
							<el-input placeholder="请输入机柜名称" v-model="devCabinet"></el-input>
						</el-col>
						<el-col :span="2" style="text-align: center;">
							<el-button type="primary" v-on:click="getDevCabinet()">查询</el-button>
						</el-col>
					</el-row>

					<el-table :data="detailDevRows" highlight-current-row v-loading="devLoading" style="width: 100%;">
						<el-table-column prop="ip" label="已识别设备IP" align="center">
						</el-table-column>
						<el-table-column prop="deviceName" label="所在机柜" align="center">
						</el-table-column>
						<el-table-column prop="uDetails" label="所在U位" align="center" sortable>
						</el-table-column>
						<el-table-column prop="uNumber" label="所占U位数量" align="center">
						</el-table-column>
						<el-table-column label="原始图" align="center" width="180">
							<template scope="scope">
								<el-button v-if="scope.row.fileUrl" type="info" @click="showDetail(1,scope.row)" size="small">原始图</el-button>
							</template>
						</el-table-column>
						<el-table-column label="识别图" align="center" width="180">
							<template scope="scope">
								<el-button v-if="scope.row.detectResultUrl" type="primary" @click="showDetail(2,scope.row)" size="small">
									识别图
								</el-button>
							</template>
						</el-table-column>

					</el-table>

				</el-tab-pane>
			</el-tabs>
		</div>
		<!--机柜图-->
		<div v-if="routeType==='jgDetail'">
			<el-row style="margin-bottom:20px;font-size:16px;" >
				<el-col :span='1' style="min-width:100px;">
					<span @click="go('detail')" class="back">&nbsp;&lt;&lt;&nbsp;返回</span>
				</el-col>
				<el-col :span='4' :offset='9'> 单个机柜识别详情</el-col>
			</el-row>
			<div class="toolbar" style="font-size:14px;">
				 <div style="width:75%;float:left">
						<div>
							<el-col :span="8"><span class="d_title">机柜名称:</span><span class="d_content">{{jgField.deviceName}} </span></el-col>
							<el-col :span="16"><span class="d_title">设备已用U位:</span><span class="d_content">{{jgField.usedUNumbers}}</span></el-col>
						</div>
						<div>
							<el-col :span="8"><span class="d_title">已识别设备数量:</span><span class="d_content">{{jgField.detectedSeverNumber}}</span></el-col>
							<el-col :span="16"><span class="d_title">剩余U位:</span><span class="d_content">{{jgField.remainingUNumbers}}</span></el-col>
						</div>
					</div>
					<div style="width:25%;float:right;text-align:center;">
						<el-button type="info" size="small" @click="showDetail(3)">设备全图</el-button>
						<el-button type="warning" size="small" @click="showDetail(4)">识别全图</el-button>
					</div>
			</div>

			<el-row style="margin-bottom:15px;">
				<el-col :span='5' :offset="12">
					<el-input placeholder="请输入设备IP" v-model="ip" style="width:90%"></el-input>
				</el-col>
				<el-col :span="5">
					<el-input placeholder="请输入U位" v-model="uDetails"></el-input>
				</el-col>
				<el-col :span="2" style="text-align: center;">
					<el-button type="primary" @click="getDevCabinet()" v-loading="devLoading">查询</el-button>
				</el-col>
			</el-row>
			<el-table :data="jgRows" highlight-current-row v-loading="devLoading" style="width: 100%;">
				<el-table-column type="index" width="80" label="序号" align="center">
				</el-table-column>
				<el-table-column prop="ip" label="已识别设备IP" align="center">
				</el-table-column>
				<el-table-column prop="uDetails" label="所在U位" align="center">

				</el-table-column>
				<el-table-column prop="uNumber" label="所占U位数量" align="center">
				</el-table-column>
				<el-table-column label="原始图" align="center" width="180">
					<template scope="scope">
						<el-button v-if="scope.row.fileUrl" type="text" @click="showDetail(1,scope.row)" size="small">原始图</el-button>
					</template>
				</el-table-column>
				<el-table-column label="识别图" align="center" width="180">
					<template scope="scope">
						<el-button v-if="scope.row.detectResultUrl" type="text" @click="showDetail(2,scope.row)" size="small">
							识别图
						</el-button>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<el-dialog :title="bigImgTitle" v-model="bigImgVisible" style="text-align: center;" :size="dialogSize">
			<el-row :gutter="20">
				<el-col :span='5'>{{jgDetail.title}}：</el-col>
				<el-col :span="19">{{jgDetail.ip}}</el-col>
			</el-row>
			<el-row :gutter="20">
				<el-col :span="5">所在机柜：</el-col>
				<el-col :span="19">{{jgDetail.deviceName}}</el-col>
			</el-row>
			<el-row :gutter="20">
				<el-col :span="5">拍摄时间：</el-col>
				<el-col :span="19">{{jgDetail.time}}</el-col>
			</el-row>
			<img :src="currentUrl" alt="异常图片,无法识别" width="100%" />
		</el-dialog>
		<el-dialog v-model="allVisible" style="text-align: center;" :size="dialogSize" :title="`机柜 : ${jgField.deviceName}`">
			<div v-for='(item,index) in allImgs' :key="index">
				<el-row>
					<el-col :span='24'>拍摄时间:{{item.psTime}}</el-col>
				</el-row>
				<el-row>
					<img :src="item.imgUrl" alt="异常图片,无法识别" width="100%" />
				</el-row>
			</div>
		</el-dialog>

	</section>
</template>

<script>
import NProgress from "nprogress";
import { parseTime, compareU } from "utils";
import {  devList } from "api/room";
import {
  getServersInfos,
  getListCabinetsByTaskId,
  getListServers
} from "api/results";
import { baseImgUrl } from "api/api";
import { mapState} from 'vuex'

export default {
  data() {
    return {
      pickerOptions1: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              picker.$emit("pick", new Date());
            }
          },
          {
            text: "昨天",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", date);
            }
          },
          {
            text: "一周前",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", date);
            }
          }
        ]
      },

      filters: {
        roomId: "",
        startTime: "",
        endTime: ""
      },
      total: 0,
      page: 1,
      size: 10,
      rows: [],
      listLoading: false,
      routeType: "index",
      activeName: "first",
      dialogSize: "small",
      cabinetTotal: 0,
      detail: {},
      detailCabinetRows: [],
      cabinetListLoading: false,
      currentCabinetId: "",
      detailDevRows: [],
      bigImgTitle: "",
      bigImgVisible: false,
      dialogSize: "small",
      allVisible: false,
      currentUrl: "",
      jgDetails: [],
      devLoading: false,
      cabinetName: "",
      taskId: "",
      deviceId: "",
      ip: "",
      uDetails: "",

      jgRows: [],
      jgField: {},
      jgDetail: {},

      allImgs: [],
      devCabinet: "",
      devIp: ""
    };
  },
  computed:{
    ...mapState(['rooms','robotId'])
  },
  methods: {
    type(warnType) {
      if (warnType === "温湿度告警") {
        return "warning";
      } else if (warnType === "巡检红灯") {
        return "gray";
      } else {
        return "primary";
      }
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
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          let para = {
            page: this.page,
            pageSize: this.size,
            roomId: this.filters.roomId
          };
          if (this.filters.startTime) {
            let startTime = parseTime(
              this.filters.startTime,
              "{y}-{m}-{d} {h}:{i}:{s}"
            );
            para.starttime = startTime;
          }
          if (this.filters.endTime) {
            let end = parseTime(
              this.filters.endTime,
              "{y}-{m}-{d} {h}:{i}:{s}"
            );
            let times = end.split(" ")[1].split(":");
            let endTime = times.every(i => {
              return i === "00";
            })
              ? `${end.split(" ")[0]} 23:59:59`
              : end;
            para.endtime = endTime;
          }

          this.listLoading = true;
          NProgress.start();
          let self = this;
          devList(self,{roomId:this.filters.roomId}).then(res=>{
            this.cabinetTotal = res.body.data?res.body.data.length:0;
          })
          getServersInfos(self, para).then(res => {
            if (res.data.data && res.data.data.list.length > 0) {
              
              this.rows = res.data.data.list.map(i => {
                
                let timeStr =
                  parseTime(i.startTime, "{y}-{m}-{d} {h}:{i}:{s}") + "至";
                timeStr += i.endTime
                  ? parseTime(i.endTime, "{y}-{m}-{d} {h}:{i}:{s}")
                  : "--巡检中...";
                i.timeField = timeStr;
                return i;
              });
              this.total = res.data.data.total;
            } else {
              this.total = 0;
              this.rows = [];
            }
            this.listLoading = false;
            NProgress.done();
          });
        }
      });
    },
    go(type, r) {
      this.routeType = type;
      this.cabinetName = "";
      switch (type) {
        case "detail":
          if (r) {
            this.taskId = r.taskId;
            this.detail = Object.assign({}, r);
          }
          this.activeName = "first";
          this.getCabinet();
          break;

        case "jgDetail":
          this.jgField = Object.assign({}, r);
          this.deviceId = r.deviceId;
          this.getDevCabinet();
          break;
      }
    },
    getCabinet() {
      let self = this;
      let param = {
        taskId: this.taskId,
        deviceName: this.cabinetName ? this.cabinetName : ""
      };
      this.cabinetListLoading = true;
      NProgress.start();
      getListCabinetsByTaskId(self, param).then(res => {
       
        if (res.data.data && res.data.data.length > 0) {
          this.detailCabinetRows = res.data.data;
         
        } else {
          this.total = 0;
          this.detailCabinetRows = [];
        }
        this.cabinetListLoading = false;
        NProgress.done();
      });
    },
    getDevCabinet() {
      let param = {
        taskId: this.taskId
      };
      if (this.deviceId) {
        param.deviceId = this.deviceId;
      }
      if (this.ip) {
        param.ip = this.ip;
      }

      if (this.uDetails) {
        param.uDetails = this.uDetails;
      }
      let self = this;
      NProgress.start();
      this.devLoading = true;
      getListServers(self, param).then(res => {
        if (res.data.data && res.data.data.length > 0) {
          this.jgRows = res.data.data.sort(compareU("uDetails"));
          let ip = this.ip;
          let devCabinet = this.devCabinet;
          this.detailDevRows = res.data.data.map(item=>{
             item.deviceName=item.deviceInfo?item.deviceInfo.deviceName:"";
             item.fileUrl = item.fileInfo?item.fileInfo.fileUrl:null;
             item.detectResultUrl = item.fileInfo?item.fileInfo.detectResultUrl:null;
             return item;
          }).filter(devs => {
            if (devs.deviceName.indexOf(devCabinet) >= 0) return devs;
          });
        } else {
          this.detailDevRows = [];
          this.jgRows = [];
        }
        this.devLoading = false;
        NProgress.done();
      });
    },
    showDetail(type, r) {
      this.dialogSize = "small";
      this.allVisible = false;
      this.bigImgVisible = false;
      let _this = this;
      if (type === 1) {
        this.jgDetail = r;

        this.jgDetail.time = parseTime(r.timeStamp, "{y}-{m}-{d} {h}:{i}:{s}");
        this.jgDetail.time = parseTime(r.timeStamp, "{y}-{m}-{d} {h}:{i}:{s}");
        this.bigImgTitle = "原始图";
        this.jgDetail.title = "原始设备IP";
        this.currentUrl = baseImgUrl + r.fileUrl;

        this.$nextTick(() => {
          _this.bigImgVisible = true;
        });
      } else if (type === 2) {
        this.jgDetail = r;

        this.jgDetail.time = parseTime(r.timeStamp, "{y}-{m}-{d} {h}:{i}:{s}");
        this.jgDetail.time = parseTime(r.timeStamp, "{y}-{m}-{d} {h}:{i}:{s}");
        this.bigImgTitle = "识别图";
        this.jgDetail.title = "已识别设备IP";
        this.currentUrl = baseImgUrl + r.detectResultUrl;

        this.$nextTick(() => {
          _this.bigImgVisible = true;
        });
      } else {
        console.log(this.$refs.device_o)
        let hash = {};
        this.allImgs = [];
        this.jgRows.forEach(item => {
          if (!hash[item.ip]) {
            hash[item.ip] = true;
            this.allImgs.push({
              psTime: parseTime(item.timeStamp, "{y}-{m}-{d} {h}:{i}:{s}"),
              imgUrl: type === 3 ? item.fileUrl : item.detectResultUrl
            });
          }
        });

        this.$nextTick(() => {
          _this.allVisible = true;
        });
      }
    },
    changeSize() {
      this.dialogSize = this.dialogSize === "small" ? "full" : "small";
    },
    changeTab() {
      if (this.activeName === "second") {
        this.cabinetName = "";
        this.ip = "";
        this.deviceId = "";
        this.uDetails = "";
        this.detailDevRows = [];
        this.getDevCabinet();
      } else {
        this.devCabinet = "";
        this.ip = "";
        this.getCabinet();
      }
    }
  },
  mounted() {
      this.filters.roomId =this.robotId.roomId;
      this.getList(); 
  }
};
</script>

<style scoped>
.back {
  padding-bottom: 20px;
  color: #3480f1;
  cursor: default;
}

.back:hover {
  color: #00d3a9;
}

.d_title {
  padding: 10px;
  font-size: 15px;
  color:#ffffff;
  font-family: open-sans-light;
  text-shadow: 0 0 3px rgba(255,255,255,0.4);
}

.d_content {
  padding: 10px;
  font-size: 12px;
  color: rgb(234, 238, 25);
}

.list_item {
  line-height: 26px;
}
.el-dialog__body .el-col{
   line-height:30px;
   text-align:left;
}
.el-dialog__body .el-col-19{
  text-align:left;
}
</style>