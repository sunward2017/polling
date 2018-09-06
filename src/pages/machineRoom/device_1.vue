<template>
	<div>
		<el-col :span="24" class="toolbar">
			<el-form :inline="true" :model="filters">
				<el-col :span="6">
					<el-select v-model="filters.roomId" style="width:90%" @change="getList">
						<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
						</el-option>
					</el-select>
				</el-col>
				<el-form-item>
					<el-button icon="search" v-on:click="getList">刷新</el-button>
				</el-form-item>
				<el-form-item>
					<el-button class="filter-item" icon="plus" type="success" @click="handleAdd">新增</el-button>
				</el-form-item>
				<el-form-item>
					<el-button icon="upload2" @click="handleUpload">导入设备EXCEL</el-button>
				</el-form-item>
				<el-form-item>
					<el-button icon="upload2" type="primary" @click.native="editSubmit" :loading="editLoading">{{btnEditText}}</el-button>
				</el-form-item>
			</el-form>
		</el-col>
		<el-col :span="24">
			<el-row class="thead">
				<el-col :span="2">
					设备名称
				</el-col>
				<el-col :span="2">
					设备编号
				</el-col>
				<el-col :span="2">
					打点名称
				</el-col>
				<el-col :span="2">
					升降高度
				</el-col>
				<el-col :span="2">
					头部仰角
				</el-col>
				<el-col :span="2">
					水平转角
				</el-col>
				<el-col :span="2">
					是否巡检
				</el-col>
				<el-col :span="2">
					是否拍照
				</el-col>
				<el-col :span="2">
					图像识别
				</el-col>
				<el-col :span="6">
					操作
				</el-col>
			</el-row>
		</el-col>
		<el-col :span="24" v-if="isEmpty" class="empty">
			{{currentStatus}}
		</el-col>
		<draggable v-model="rows" :move="getData">
			<transition-group>
				<div v-for="(item ,index) in rows" v-bind:key="index">
					<el-col :span="24" :class="item.isActive?'active':'common'">
						<el-row class="thead">
							<el-col :span="2">
								{{item.deviceName?item.deviceName:'&nbsp;'}}
							</el-col>
							<el-col :span="2">
								{{item.deviceSerial?item.deviceSerial:'&nbsp;'}}
							</el-col>
							<el-col :span="2">
								{{ item.rfidId? item.rfidId :'&nbsp;' }}
							</el-col>
							<el-col :span="2">
								{{ item.neckHeight? item.neckHeight :'0' }}
							</el-col>
							<el-col :span="2">
								{{ item.elevation? item.elevation :'0' }}
							</el-col>
							<el-col :span="2">
								{{ item.levelAngle? item.levelAngle :'0' }}
							</el-col>
							<el-col :span="2">
								{{ item.isPolling?"是":"否"}}
							</el-col>
							<el-col :span="2">
								{{item.isDiscern?"是":"否"}}
							</el-col>
							<el-col :span="2">
								{{item.isPhoto?"是":"否"}}
							</el-col>
							<el-col :span="6">
								<el-button size="small" @click="handleEditTag(item)">标签配置</el-button>
								<el-button size="small" type="info" @click="handleEditVedio(item)">上传语音</el-button>
								<el-button size="small" icon="edit" @click="handleEdit(item)">编辑</el-button>
								<el-button type="warning" icon="delete" size="small" @click="handleDel(item)">删除</el-button>

							</el-col>
						</el-row>
					</el-col>
				</div>
			</transition-group>
		</draggable>
		<!--编辑界面-->
		<el-dialog :title="editFormTitle" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="100px" :rules="rules" ref="editForm">
				<el-form-item label="所属机房" prop="custom">
					<el-select v-model="editForm.roomId" disabled>
						<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="设备名称" prop="deviceName" class="item">
					<el-input v-model="editForm.deviceName" placeholder="设备名称"></el-input>
				</el-form-item>
				<el-form-item label="打点名称" prop="rfidId" class="item">
					<el-input v-model="editForm.rfidId" placeholder="打点名称"></el-input>
				</el-form-item>
				<el-form-item label="设备编号" prop="deviceSerial" class="item">
					<el-input v-model="editForm.deviceSerial" placeholder="设备编号"></el-input>
				</el-form-item>
				<el-form-item label="升降高度" prop="neckHeight" class="item">
					<el-input v-model="editForm.neckHeight" placeholder="单位( mm )"></el-input>
				</el-form-item>
				<el-form-item label="水平转角" prop="levelAngle" class="item">
					<el-input v-model="editForm.levelAngle" placeholder="水平转角"></el-input>
				</el-form-item>
				<el-form-item label="头部仰角" prop="elevation" class="item">
					<el-input v-model="editForm.elevation" placeholder=""></el-input>
				</el-form-item>

				<el-form-item label="设备类型" prop="deviceType" class="item" v-if="isMore">
					<el-input v-model="editForm.deviceType" placeholder="设备类型"></el-input>
				</el-form-item>
				<el-form-item label="设备型号" prop="deviceModel" class="item" v-if="isMore">
					<el-input v-model="editForm.deviceModel" placeholder="设备型号"></el-input>
				</el-form-item>
				<el-form-item label="设备高度" prop="deviceHeight" class="item" v-if="isMore">
					<el-input v-model="editForm.deviceHeight" placeholder="单位( mm )"></el-input>
				</el-form-item>
				<el-form-item label="设备长度" prop="deviceLength" class="item" v-if="isMore">
					<el-input v-model="editForm.deviceLength" placeholder="单位( mm )"></el-input>
				</el-form-item>
				<el-form-item label="设备宽度" prop="deviceWide" class="item" v-if="isMore">
					<el-input v-model="editForm.deviceWide" placeholder="单位( mm )"></el-input>
				</el-form-item>
				<el-form-item label="仪表宽度" prop="meterWide" class="item" v-if="isMore">
					<el-input v-model="editForm.meterWide" placeholder="单位( mm )"></el-input>
				</el-form-item>
				<el-form-item label="仪表高度" prop="meterHeight" class="item" v-if="isMore">
					<el-input v-model="editForm.meterHeight" placeholder="单位( mm )"></el-input>
				</el-form-item>
				<el-form-item label="水平位" prop="meterLiftoff" class="item" v-if="isMore">
					<el-input v-model="editForm.meterLiftoff" placeholder="单位( mm )"></el-input>
				</el-form-item>
				<el-form-item label="仪表偏移量" prop="meterOffset" class="item" v-if="isMore">
					<el-input v-model="editForm.meterOffset" placeholder="单位( mm )"></el-input>
				</el-form-item>
				<el-form-item label="生产厂商" prop="deviceCompany" class="item" v-if="isMore">
					<el-input v-model="editForm.deviceCompany" placeholder="设备厂商"></el-input>
				</el-form-item>
				<el-form-item label="X坐标" prop="deviceX" class="item" v-if="isMore">
					<el-input v-model="editForm.deviceX" placeholder="单位( mm )"></el-input>
				</el-form-item>
				<el-form-item label="Y坐标" prop="deviceY" class="item" v-if="isMore">
					<el-input v-model="editForm.deviceY" placeholder="单位( mm )"></el-input>
				</el-form-item>
				<el-form-item label="指示灯类型" prop="lightType" class="item" v-if="isMore">
					<el-select v-model="editForm.lightType" placeholder="请选择">
						<el-option v-for="item in lightTypes" :key="item.value" :label="item.label" :value="item.value">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="测试类型" prop="testType" class="item" v-if="isMore">
					<el-select v-model="editForm.testType" placeholder="请选择">
						<el-option v-for="item in testTypes" :key="item.value" :label="item.label" :value="item.value">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="仪表朝向" prop="meterOrientation" class="item" v-if="isMore">
					<el-input v-model="editForm.meterOrientation" placeholder=""></el-input>
				</el-form-item>
				<el-form-item label="设备距离" prop="deviceDistance" class="item" v-if="isMore">
					<el-input v-model="editForm.deviceDistance" placeholder="单位( mm )"></el-input>
				</el-form-item>
				<el-form-item label="照明状态">
					<el-col :span="8">
						<el-radio-group v-model="editForm.illumination" size="medium">
							<el-radio-button label="0">关闭</el-radio-button>
							<el-radio-button label="1">默认</el-radio-button>
							<el-radio-button label="2">强制</el-radio-button>
						</el-radio-group>
					</el-col>
					<el-col :span="5">
						<el-checkbox v-model="editForm.isPolling">巡检</el-checkbox>
					</el-col>
					<el-col :span="5">
						<el-checkbox v-model="editForm.isDiscern">拍照</el-checkbox>
					</el-col>
					<el-col :span="6">
						<el-checkbox v-model="editForm.isPhoto">图像识别</el-checkbox>
					</el-col>
				</el-form-item>

				<el-form-item>
					<el-button type="text" @click="open" class="msg">{{message}}</el-button>
				</el-form-item>
			</el-form>
			<el-row>
				<el-col :span="24">
					<div class="title">&nbsp;&nbsp;告警配置</div>
					<el-table :data="editForm.warnList" highlight-current-row v-loading="listLoading1" style="width: 100%;" border>
						<el-table-column type="index" width="80" label="序号" align="center">
						</el-table-column>
						<el-table-column prop="warnType" label="告警类型" width="120" sortable>
							<template scope="scope">
								<el-popover trigger="hover" placement="right">
									<p>测试类型：<b>{{ scope.row.warnType}}</b></p>
									<p>正&ensp;常&ensp;值：<b>{{ scope.row.normalValue}}{{warnTypesForObj[scope.row.warnType]}}</b></p>
									<p v-if="scope.row.warnType=='指示灯'">序&emsp;&emsp;号：<b>{{scope.row.serial}}</b></p>
									<div v-else>
										<p>一般告警下限范围：<b>{{ scope.row.generalMin1}}~{{scope.row.generalMax1}}{{warnTypesForObj[scope.row.warnType]}}</b></p>
										<p>一般告警上限范围：<b>{{ scope.row.generalMin2}}~{{scope.row.generalMax2}}{{warnTypesForObj[scope.row.warnType]}}</b></p>
										<p>严重告警：<b>{{ scope.row.warnMax}}{{warnTypesForObj[scope.row.warnType]}}>=&nbsp;或&nbsp;<={{scope.row.warnMin}}{{warnTypesForObj[scope.row.warnType]}}</b></p>
									</div>
									<div slot="reference">
										<el-tag>{{scope.row.warnType}}</el-tag>
									</div>
								</el-popover>
							</template>
						</el-table-column>

						<el-table-column label="简要说明" prop="warnDescription">
						</el-table-column>
						<el-table-column inline-template :context="_self" label="操作" width="160" align="center" fixed="right">
							<span>
								<el-button size="small"   @click="edtiWarning(row)">编辑</el-button>
								<el-button type="warning"   size="small" @click="warningDel(row)">删除</el-button>
							</span>
						</el-table-column>
					</el-table>
				</el-col>
			</el-row>

			<div slot="footer" class="dialog-footer">
				<el-button icon="plus" type="success" @click.native="addWarning">新增告警</el-button>
				<el-button icon="circle-cross" @click.native="closeEditFrom">取 消</el-button>
				<el-button icon="save" type="info" @click.native="handleSave">保存</el-button>
			</div>
		</el-dialog>

		<!-- 告警编辑 -->
		<el-dialog :title="warnFormTtile" v-model="warnFormVisible" :close-on-click-modal="false" size="tiny">
			<el-form :model="warnForm" label-width="140px" :rules="warnFormRules" ref="warningForm">
				<el-form-item label="告警类型" prop="warnType">
					<el-select v-model="warnForm.warnType" placeholder="请选择" style="width:82%" @change="setUnit">
						<el-option v-for="item in warnTypes" :key="item.value" :label="item.value" :value="item.value">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="正常值" prop="normalValue" v-if="type">
					<el-col :span="20">
						<el-input v-model="warnForm.normalValue" auto-complete="off"></el-input>
					</el-col>
					<el-col :span="2" class="unit">{{unit}}</el-col>
				</el-form-item>
				<el-form-item label="一般告警下限范围" prop="generalMin1" v-if="type">
					<el-col :span="9">
						<el-input v-model="warnForm.generalMin1" auto-complete="off"></el-input>
					</el-col>
					<el-col :span="2" class="unit">~</el-col>
					<el-col :span="9">
						<el-input v-model="warnForm.generalMax1" auto-complete="off"></el-input>
					</el-col>
					<el-col :span="2" class="unit">{{unit}}</el-col>
				</el-form-item>
				<el-form-item label="一般告警上限范围" prop="generalMin2" v-if="type">
					<el-col :span="9">
						<el-input v-model="warnForm.generalMin2" auto-complete="off"></el-input>
					</el-col>
					<el-col :span="2" class="unit">~</el-col>
					<el-col :span="9">
						<el-input v-model="warnForm.generalMax2" auto-complete="off"></el-input>
					</el-col>
					<el-col :span="2" class="unit">{{unit}}</el-col>
				</el-form-item>
				<el-form-item label="严重告警上限" prop="warnMax" v-if="type">
					<el-col :span="8">
						<el-input v-model="warnForm.warnMin"></el-input>
					</el-col>
					<el-col :span="4" class="unit">&gt;or&nbsp;&lt;= </el-col>
					<el-col :span="8">
						<el-input v-model="warnForm.warnMax"></el-input>
					</el-col>
					<el-col :span="2" class="unit">{{unit}}</el-col>
				</el-form-item>
				<el-form-item label="正常指示" v-else>
					<el-col :span="2"><strong>序号:</strong></el-col>
					<el-col :span="9">
						<el-input v-model="warnForm.serial"></el-input>
					</el-col>
					<el-col :span="1">&nbsp;</el-col>
					<el-col :span="9">
						<el-select v-model="warnForm.normalValue" placeholder="请选择" style="width:84%">
							<el-option v-for="item in lamps" :key="item" :label="item" :value="item">
							</el-option>
						</el-select>
					</el-col>
				</el-form-item>
				<el-form-item label="简要说明">
					<el-col :span="20">
						<el-input v-model="warnForm.warnDescription"></el-input>
					</el-col>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button icon="circle-cross" @click.native="cancel">取 消</el-button>
				<el-button icon="check" type="primary" @click.native="warnSubmit">确定</el-button>
			</div>
		</el-dialog>
		<el-dialog title="语音上传" v-model="dialogVisible" size="tiny" top="25%">
			<RadioUpload :deviceId="deviceId"></RadioUpload>
		</el-dialog>
		<el-dialog v-if="isFj" :title="tagFormTtile" :visible.sync="tagFormVisible" :close-on-click-modal="false" size="tiny">
			<el-form label-width="100px">
				<el-form-item label="指示灯颜色">
					<el-radio-group v-model="tagData.lightColor">
						<el-radio-button label="red">红色</el-radio-button>
						<el-radio-button label="yellow">黄色</el-radio-button>
					</el-radio-group>
				 
					<el-button style="float:right;margin-right:20px" icon="upload2"   @click.native="rfidSubmit" :loading="rfidLoading">{{rfidBtnText}}</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>

		<el-dialog v-else :title="tagFormTtile" custom-class="custom_rfid" :visible.sync="tagFormVisible" :close-on-click-modal="false" >
			<TagForm v-if="tagFormVisible" :tagData="tagData" @closeTagForm="closeTagForm" @refreshList="refreshList" ref="tag_form"></TagForm>
		</el-dialog>

		<el-dialog title="上传设备EXCEL" v-model="uploadVisible" size="tiny" top="25%">
			<Upload @closeUp="closeUp"></Upload>
		</el-dialog>
	</div>
</template>

<script>
// import util from '../../common/util';
import NProgress from "nprogress";
import { guid, parseTime } from "utils";
import {
  warnTypes,
  warnTypesForObj,
  templateCls,
  LIGHTTYPES,
  TESTTYPES
} from "@/const";
import Upload from "components/upload/upload";
import { getRoomList } from "api/room";
import draggable from "vuedraggable";
import { Request, Response } from "utils/Cipher";

import RadioUpload from "components/upload";
import TagForm from "components/electronicTag";

export default {
  components: {
    Upload,
    draggable,
    RadioUpload,
    TagForm
  },
  data() {
    var checkNum = (rule, value, callback) => {
      value += "";
      setTimeout(() => {
        if (value !== "") {
          if (isNaN(value) || value.replace(/^\s+|\s+$/gm, "") === "") {
            callback(new Error("请输入数字型"));
          } else {
            callback();
          }
        } else {
          callback();
        }
      }, 500);
    };
    var checkEle = (rule, value, callback) => {
      value += "";
      setTimeout(() => {
        if (value !== "") {
          if (isNaN(value) || value.replace(/^\s+|\s+$/gm, "") === "") {
            callback(new Error("请输入数字型"));
          } else {
            callback();
          }
        } else {
          callback();
        }
      }, 500);
    };
    return {
      filters: {
        roomId: ""
      },
      rooms: [],
      rows: [],
      lightTypes: LIGHTTYPES,
      testTypes: TESTTYPES,
      listLoading1: false,
      customs: [],
      isMore: false,
      message: "More>>",
      allCustom: [],
      editFormVisible: false, //编辑界面显是否显示
      uploadVisible: false,
      columns: templateCls,
      editFormTitle: "编辑", //编辑界面标题
      //编辑界面数据
      currentStatus: "加载中",
      timmer: null,
      dialogVisible: false,
      deviceId: "",
      roomId: "",
      rfid: "",
      isFj: false,
      rfidLoading: false,
      rfidBtnText: "提交",

      //tagList
      tagFormTtile: "新增",
      tagFormVisible: false,
      tagData: {
        id: 0,
        roomId: "",
        rfidId: "",
        rfidTypes: [],
        lightDistribution: [],
        numDistribution: [],
        bgType: "0",
        bgDistribution: [],
        lightColor: ""
      },
      editForm: {
        deviceId: "",
        deviceName: "",
        deviceSerail: "",
        rfidId: "",
        deviceType: "",
        deviceModel: "",
        deviceCompany: "",
        deviceLength: "",
        deviceWide: "",
        deviceHeight: "",
        meterHeight: "",
        meterWide: "",
        meterLiftoff: "",
        meterOffset: "",
        warnList: [],
        deviceX: "",
        deviceY: "",
        meterOrientation: "",
        deviceDistance: "",
        neckHeight: "",
        levelAngle: "",
        elevation: "",
        lightType: "",
        testType: "",
        roomId: "",
        illumination: "1",
        isPhoto: true,
        isPolling: true,
        isDiscern: true,
        temp: ""
      },
      rules: {
        deviceName: [
          {
            required: true,
            message: "请输入设备名称",
            trigger: "blur"
          }
        ],
        deviceSerial: [
          {
            required: true,
            message: "请输入设备编号",
            trigger: "blur"
          }
        ],

        deviceLength: [
          {
            validator: checkNum,
            trigger: "blur"
          }
        ],
        deviceWide: [
          {
            validator: checkNum,
            trigger: "blur"
          }
        ],
        deviceHeight: [
          {
            validator: checkNum,
            trigger: "blur"
          }
        ],
        meterHeight: [
          {
            validator: checkNum,
            trigger: "blur"
          }
        ],
        meterWide: [
          {
            validator: checkNum,
            trigger: "blur"
          }
        ],
        meterLiftoff: [
          {
            validator: checkNum,
            trigger: "blur"
          }
        ],
        meterOffset: [
          {
            validator: checkNum,
            trigger: "blur"
          }
        ],
        deviceX: [
          {
            validator: checkNum,
            trigger: "blur"
          }
        ],
        deviceY: [
          {
            validator: checkNum,
            trigger: "blur"
          }
        ],
        deviceDistance: [
          {
            validator: checkNum,
            trigger: "blur"
          }
        ],
        neckHeight: [
          {
            validator: checkNum,
            trigger: "blur"
          }
        ],
        elevation: [
          {
            validator: checkEle,
            trigger: "blur"
          }
        ],
        levelAngle: [
          {
            validator: checkNum,
            trigger: "blur"
          }
        ]
      },
      editLoading: false,
      btnEditText: "提 交",
      //warning
      warnFormVisible: false,
      warnFormTtile: "新增",
      warnForm: {
        warnId: "",
        warnType: "仪表温度",
        normalValue: "",
        generalMin1: "",
        generalMax1: "",
        generalMin2: "",
        generalMax2: "",
        warnMin: "",
        warnMax: "",
        warnDescription: "",
        serial: "",
        lightColor: ""
      },
      warnTypes: warnTypes,
      warnTypesForObj: warnTypesForObj,
      type: true,
      lamps: ["亮", "灭", "闪烁"],
      unit: "",
      warnAction: "",
      warnFormRules: {
        warnType: [
          {
            required: true,
            message: "请输入告警类型",
            trigger: "blur"
          }
        ],
        normalValue: [
          {
            required: true,
            message: "请输入正确的值",
            trigger: "blur"
          }
        ],
        generalMin1: [
          {
            validator: checkNum,
            trigger: "blur"
          }
        ],
        generalMax1: [
          {
            validator: checkNum,
            trigger: "blur"
          }
        ],
        generalMin2: [
          {
            validator: checkNum,
            trigger: "blur"
          }
        ],
        generalMax2: [
          {
            validator: checkNum,
            trigger: "blur"
          }
        ],
        warnMin: [
          {
            validator: checkNum,
            trigger: "blur"
          }
        ],
        warnMax: [
          {
            validator: checkNum,
            trigger: "blur"
          }
        ],
        normalValue: [
          {
            validator: checkNum,
            trigger: "blur"
          }
        ]
      }
    };
  },
  computed: {
    isEmpty: function() {
      return this.rows.length === 0;
    }
  },
  methods: {
    //获取用户列表
    getList() {
      let param = {
        roomId: this.filters.roomId
      };
      NProgress.start();
      let _this = this;
      this.timmer = setInterval(function() {
        if (_this.currentStatus === "加载中...") {
          _this.currentStatus = "加载中";
        }
        _this.currentStatus += ".";
      }, 1000);
      Request(_this, "/web/getDevicesByRoomId.action", param).then(res => {
        clearInterval(_this.timmer);
        _this.timmer = null;
        NProgress.done();
        if (res.data.data) {
          this.rows = JSON.parse(Response(res.data.data)).map(item => {
            let opt = item.others.split(",");
            item.isPhoto = opt[0] === "1" ? true : false;
            item.isPolling = opt[1] === "1" ? true : false;
            item.isDiscern = opt[2] === "1" ? true : false;
            item.illumination = opt[3] ? opt[3] : 1;
            return item;
          });
        } else {
          this.rows = [];
          this.currentStatus = "无数据";
        }
      });
    },
    open() {
      this.isMore = !this.isMore;
      this.message = this.isMore ? "Hide>>" : "More>>";
    },
    getRooms() {
      let para = {
        page: 0,
        roomstatus: 1,
        pageSize: 0
      };
      let self = this;
      getRoomList(self, para).then(res => {
        if (res.data.data) {
          this.rooms = res.body.data.rows;
          this.filters.roomId = this.rooms[0].roomId;
          //this.getList();
        }
      });
    },
    getData(evt) {
      evt.draggedContext.element.isActive = true;
    },
    handleEditTag(r) {
      let _this = this;
      let param = {};
      param.roomId = this.tagData.roomId = r.roomId;
      param.rfidId = this.tagData.rfidId = r.rfidId;
      Request(_this, "/web/getDeviceRfidDetail.action", param).then(res => {
        if (res.data && res.data.data) {
          let tag = JSON.parse(Response(res.data.data));
          tag.lightDistribution = tag.lightDistribution
            ? tag.lightDistribution.split(",").map(i => {
                return {
                  value: i
                };
              })
            : [
                {
                  value: 1
                }
              ];
          tag.numDistribution = tag.numDistribution
            ? tag.numDistribution.split(",").map(i => {
                return {
                  value: i
                };
              })
            : [
                {
                  value: 1
                }
              ];
          tag.bgDistribution = tag.bgDistribution
            ? tag.bgDistribution.split(",").map(i => {
                return {
                  value: i
                };
              })
            : [
                {
                  value: 1
                }
              ];
          tag.rfidType = /^[0,1,2]/.test(tag.rfidType)
            ? tag.rfidType + ""
            : "0" + tag.rfidType;
          tag.bgType = tag.bgType + "";
          this.tagData = Object.assign(param, tag);
          (this.tagFormTtile = "编辑"), (this.tagFormVisible = true);
        } else {
          this.tagData = Object.assign(param, {
            id: 0,
            rfidType: "0",
            lightDistribution: [
              {
                value: 1
              }
            ],
            numDistribution: [
              {
                value: 1
              }
            ],
            bgType: "0",
            bgDistribution: [
              {
                value: 1
              }
            ]
          });
          this.tagFormTtile = "新增";
          this.tagFormVisible = true;
        }
        //					 console.log('get',this.tagData)
      });
    },
    handleEditVedio(r) {
      this.deviceId = r.deviceId;
      this.dialogVisible = true;
    },
    //显示编辑界面
    handleEdit(item) {
      this.editFormVisible = true;
      this.editFormTitle = "编辑";
      for (var k in this.editForm) {
        this.editForm[k] = "";
      }
      this.editForm.warnList = [];
      for (var k in item) {
        this.editForm[k] = item[k];
      }
      this.editForm.lightType += "";
      this.editForm.testType += "";
    },
    closeTagForm() {
      this.tagFormVisible = false;
    },
    refreshList() {
      this.tagFormVisible = false;
      this.$refs.tag_list.getRfids();
    },
    
    handleDel(row) {
      if (!row.deviceId) {
        let rows = this.rows,
          index;
        for (var i = 0, len = rows.length; i < len; i++) {
          if (rows[i].temp === row.temp) {
            index = i;
            break;
          }
        }
        this.rows.splice(index, 1);
        return;
      }
      var _this = this;
      this.$confirm("确认删除设备: " + row.deviceName + "？", "提示", {
        type: "danger"
      }).then(() => {
        NProgress.start();
        let para = {
          deviceId: row.deviceId
        };
        Request(
          _this,
          "/web/deletDevice.action",
          para,
          `删除设备${row.deviceName}`
        ).then(res => {
          NProgress.done();
          if (res.body.result == 200) {
            let param = JSON.parse(JSON.stringify(this.rows)).map(
              (item, index) => {
                item.orderBy = index;
                return item;
              }
            );
            Request(_this, "/web/updateDevices.action", {
              deviceList: param
            }).then(() => {
              _this.$notify({
                title: "成功",
                message: "删除成功",
                type: "success"
              });
              _this.getList();
            });
          } else {
            _this.$notify({
              title: "失败",
              message: res.body.message,
              type: "error"
            });
          }
        });
      });
    },
    closeEditFrom() {
      this.editFormVisible = false;
      this.$refs.editForm.resetFields();
    },
    //编辑 or 新增
    handleSave() {
      var _this = this;

      _this.$refs.editForm.validate(valid => {
        if (valid) {
          let para = JSON.parse(JSON.stringify(this.editForm));
          para.isActive = true;

          if (this.editFormTitle === "新增") {
            this.rows.push(para);
          } else {
            let deviceId = para.deviceId,
              temp = para.temp,
              rows = this.rows,
              index;
            index = deviceId
              ? rows.findIndex(v => v.deviceId === deviceId)
              : rows.findIndex(v => v.temp === temp);
            this.rows.splice(index, 1, para);
          }
          this.editFormVisible = false;
        }
      });
    },
    editSubmit() {
      let _this = this;
      _this
        .$confirm("确认提交吗？", "提示", {})
        .then(() => {
          _this.editLoading = true;
          NProgress.start();
          _this.btnEditText = "提交中";
          let param = JSON.parse(JSON.stringify(this.rows)).map(
            (item, index) => {
              item.orderBy = index;
              let isPhoto = item.isPhoto ? "1" : "0";
              let isPolling = item.isPolling ? "1" : "0";
              let isDiscern = item.isDiscern ? "1" : "0";
              item.others =
                isPhoto +
                "," +
                isPolling +
                "," +
                isDiscern +
                "," +
                item.illumination;
              return item;
            }
          );

          Request(
            _this,
            "/web/updateDevices.action",
            {
              deviceList: param
            },
            "更新设备列表"
          ).then(res => {
            _this.editLoading = false;
            NProgress.done();
            _this.btnEditText = "提 交";
            if (res.body.result == 200) {
              _this.$notify({
                title: "成功",
                message: "更新成功",
                type: "success"
              });
            } else {
              _this.$notify({
                title: "失败",
                message: "更新失败",
                type: "error"
              });
            }
            _this.editFormVisible = false;
            _this.getList();
          });
        })
        .catch(() => {});
    }, //显示新增界面
    handleAdd() {
      var _this = this;

      this.editFormVisible = true;
      this.editFormTitle = "新增";
      for (var k in _this.editForm) {
        _this.editForm[k] = "";
      }
      this.isMore = false;
      this.editForm.isPhoto = true;
      this.editForm.isPolling = true;
      this.editForm.isDiscern = true;
      this.editForm.warnList = [];
      this.editForm.roomId = this.filters.roomId;
      this.editForm.temp = new Date().valueOf();
      this.editForm.illumination = "1";
    },
    //告警编辑
    addWarning() {
      this.warnFormVisible = true;
      this.warnFormTtile = "新增";
      this.warnAction = "add";

      this.warnForm.warnId = guid();
      this.warnForm.warnType = "仪表温度";
      this.warnForm.normalValue = "";
      this.warnForm.generalMin1 = "";
      this.warnForm.generalMax1 = "";
      this.warnForm.generalMin2 = "";
      this.warnForm.generalMax2 = "";
      this.warnForm.warnMin = "";
      this.warnForm.warnMax = "";
      this.warnForm.warnDescription = "";
    },
    setUnit() {
      let curWarnType = this.warnForm.warnType;

      if (curWarnType && curWarnType != "指示灯") {
        this.type = true;
        let warnType = this.warnTypes.filter(function(v) {
          return v.value === curWarnType;
        });
        this.unit = warnType[0].unit;
      } else {
        (this.warnForm.serial = ""), (this.type = false);
      }
    },
    warnSubmit() {
      let _this = this;
      _this.$refs.warningForm.validate(valid => {
        if (valid) {
          if (_this.warnAction === "add") {
            let obj = JSON.parse(JSON.stringify(_this.warnForm));
            _this.editForm.warnList.push(obj);
          } else {
            let index,
              Id = _this.warnForm.warnId;
            for (
              let i = 0, warns = _this.editForm.warnList, len = warns.length;
              i < len;
              i++
            ) {
              if (warns[i].warnId == Id) {
                index = i;
                break;
              }
            }
            let obj = JSON.parse(JSON.stringify(_this.warnForm));
            _this.editForm.warnList.splice(index, 1, obj);
          }
          _this.warnFormVisible = false;
        }
      });
    },
    cancel() {
      this.type = true;
      this.$nextTick(() => {
        this.$refs.warningForm.resetFields();
        this.warnFormVisible = false;
      });
    },
    edtiWarning(r) {
      this.warnFormVisible = true;
      this.warnFormTtile = "编辑";
      this.warnAction = "edit";
      this.type = r.warnType == "指示灯" ? false : true;
      //this.warnForm = Object.assign({},r);
      this.warnForm = JSON.parse(JSON.stringify(r));
    },
    warningDel(r) {
      var _this = this;
      this.$confirm("确认删除该记录吗?", "提示", {
        //type: 'warning'
      })
        .then(() => {
          let index,
            Id = _this.warnForm.warnId;
          for (
            let i = 0, warns = _this.editForm.warnList, len = warns.length;
            i < len;
            i++
          ) {
            if (warns[i].warnId == Id) {
              index = i;
              break;
            }
          }
          _this.editForm.warnList.splice(index, 1);
        })
        .catch(() => {});
    },
    handleUpload() {
      this.uploadVisible = true;
    },
    closeUp() {
      this.uploadVisible = false;
    },
    rfidSubmit() {
      if (!this.tagData.lightColor) return;
      let _this = this;
      let param = _this.tagData;
      param.bgDistribution = null;
      param.lightDistribution = null;
      param.numDistribution = null;
      _this.rfidLoading = true;
      _this.rfidBtnText = "提交中...";
      Request(_this, "/web/setDeviceRfidDetail.action", param).then(res => {
        NProgress.done();
        _this.rfidLoading = false;
        _this.rfidBtnText = "提交";
        if (res.body.result == 200) {
          _this.$notify({
            title: "成功",
            message: "提交成功",
            type: "success"
          });
        } else {
          _this.$notify({
            title: "失败",
            message: "提交失败",
            type: "error"
          });
        }
        _this.tagFormVisible = false;
      });
    }
  },
  mounted() {
    this.getRooms();
    this.isFj = this.$store.state.user.customId === "a6a4b85d74d44341bfd53265521248a5";
  }
};
</script>

<style scoped>
.title {
  font-size: 16px;
  color: #fff;
  background: #2178f1
  linear-gradient(90deg, #2178f1 0%, #2178f1 0%, #20b6f9 100%, #20b6f9 100%);
  width: 100%;
  height: 35px;
  font-family: inherit;
  line-height: 35px;
  font-weight: 100;
  margin-bottom: 5px;
  border-bottom: 1px solid rgba(250,250,250,.15);
}

.empty {
  border: 1px solid rgba(250,250,250,.15);
  height: 50px;
  line-height: 50px;
  text-align: center;
}

.thead {
  min-height: 36px;
  line-height: 36px;
  border: 1px solid rgba(250,250,250,.15);
  font-size: 14px;
  text-align: center;
  margin-bottom: 0 !important;
  border-bottom: none;
  color:#fff;
  background:rgba(0,0,0,.35);
}

.active,.thead:hover {
  background-color: rgba(250,169,60,.35);
}


.msg {
  color: #0070d9;
  float: right;
  margin-right: 50px;
}

.msg:hover {
  color: #00d3a9;
}

.item {
  width: 32%;
  display: inline-block;
}

.unit {
  text-align: center;
  font-weight: bold;
  font-size: 16px;
}

</style>