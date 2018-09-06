 <template>
	<section>
		<el-col :span="24" class="toolbar">
      <el-form :inline="true" :model="filters">
				<el-form-item label="巡检机房">
					<el-select style="width:90%" @change="getList" v-model="filters.roomId">
						<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
						</el-option>
					</el-select>
				</el-form-item>   
				<!-- <el-form-item>
					<el-button icon="search" type="primary" v-on:click="getList">搜索</el-button>
				</el-form-item> -->
				<el-form-item>
					<el-button icon="edit" type="primary" @click="handlerAdd">临时任务制定</el-button>
				</el-form-item>
			</el-form>
		</el-col>
		<template>
			<el-table :data="rows" highlight-current-row v-loading="listLoading">
				<el-table-column type="index" width="80" label="序号" align="center">
				</el-table-column>
				<el-table-column prop="roomId" label="巡检机房" align="center" width="260">
				</el-table-column>
				<el-table-column prop="robotName" label="巡检机器人" width="220" align="center">
				</el-table-column>
				<el-table-column prop="taskName" label="任务名称" align="center" width="180">
				</el-table-column>
        <el-table-column prop="taskStatus" label="执行状态" align="center" width="120">
				</el-table-column>
				<el-table-column prop="startTime" label="开始时间" align="center" width="240" sortable>
				</el-table-column>
				<el-table-column prop="createTime" label="创建时间" width="240" align="center" sortable :formatter="formatTime">
				</el-table-column>
				<el-table-column prop="status" label="操作" align="center" width="280">
					<template scope="scope">
					  <router-link :to="{path:'workerDetail',query:{taskId:scope.row.taskId}}" >
					     <el-button type="darnge" icon="share" size="small">执行详情</el-button>
				    </router-link>
					  <el-button type="warning" icon="delete" size="small" @click="handleStop(scope.row)">终止任务</el-button>
					</template>
				</el-table-column>
			</el-table>
		</template>
		<!--分页-->
		<!-- <el-col :span="24" class="toolbar" style="padding-bottom:10px;">
			<el-pagination layout="prev, pager, next,total,sizes,jumper" @current-change="handleCurrentChange" :page-sizes="[10, 15, 30, 40]" :page-size="size" :current-page="page" :total="total" style="float:right;" @size-change="handleSizeChange">
			</el-pagination>
		</el-col> -->
		<!--编辑界面-->
		<el-dialog :title="editFormTtile" v-model="editFormVisible" :close-on-click-modal="false" size="tiny" @close="cancel">
			<el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
				<el-form-item label='巡检房间' prop="roomId">
					<el-select style="width:100%" @change="getDevices" v-model="editForm.roomId">
						<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="任务名称" prop="taskName">
					<el-input v-model="editForm.taskName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label='巡检机器人' prop="robotId">
					<el-select v-model="editForm.robotId" style="width:100%">
						<el-option v-for="item in roomRobots" :key="item.robotId" :label="item.robotName" :value="item.robotId">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label='巡检设备' prop="devices" style="max-height:200px;overflow-y:auto;">
					<el-tree show-checkbox default-expand-all node-key="id" ref="tree" highlight-current :data="devices">
					</el-tree>
				</el-form-item>
				<el-form-item v-for="(domain, index) in editForm.domains" :label="'巡检时间' + index" :key="domain.key" :prop="'domains.' + index + '.value'" :rules="{
				     type: 'date', required: true, message: '时间不能为空', trigger: 'change'
				    }">
					<el-time-picker v-model="domain.value" placeholder="请选择时间" style="width:80%">
					</el-time-picker>
					<el-button @click.prevent="removeDomain(domain)" style="float:right">删除</el-button>
			  </el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible=false" icon="circle-cross">取 消</el-button>
				<el-button icon="plus" type="info" @click="addDomain">新增时间</el-button>
				<el-button icon="upload2" type="primary" @click.native="editSubmit" :loading="editLoading">{{btnEditText}}</el-button>
			</div>
		</el-dialog>
		<el-dialog title="临时任务" v-model="tempTaskVisible" :close-on-click-modal="false" size="tiny">
			<el-row :gutter="20">
				<el-col :span="18">
					<el-select v-model="address" placeholder="请选择地址" style="width:100%">
						<el-option v-for="item in robots" :key="item.robotId" :label="item.robotName" :value="item.robotId">
						</el-option>
					</el-select>
				</el-col>
				<el-col :span="6">
					<el-button type="success">开始执行</el-button>
				</el-col>
			</el-row>
			<el-row :gutter="20">
				<el-col :span="18">
					<el-autocomplete style="width:100%" v-model="tempTaskDeviceId" :fetch-suggestions="querySearch" placeholder="请输入设备名称" :trigger-on-focus="false" @select="handleSelect"></el-autocomplete>
				</el-col>
				<el-col :span="3">
					<el-button type="success">开始执行</el-button>
				</el-col>
			</el-row>
			<el-row :gutter="20">
				<el-col :span="18">
					<el-button>随工监督</el-button>
				</el-col>
				<el-col :span="6">
					<el-button type="success">开始执行</el-button>
				</el-col>
			</el-row>
		</el-dialog>
	</section>
</template>

<script>
import NProgress from "nprogress";
import { parseTime, compare } from "utils";
import { currentTask } from "api/results";
import { getRoomList, getRoomDetail } from "api/room";

export default {
  data() {
    var checkDev = (rule, value, callback) => {
      setTimeout(() => {
        if (value && value.length <= 0) {
          callback(new Error("请选择设备"));
        } else {
          callback();
        }
      }, 500);
    };
    return {
      filters: {
        roomId: ""
      },
      robots: [],
      rows: [],
      rooms: [],
      listLoading: false,
      editFormTtile: "新增",
      editFormVisible: false,
      editForm: {
        roomId: "",
        robotId: "",
        devices: [],
        domains: [
          {
            value: ""
          }
        ]
      },
      roomRobots: [],
      editFormRules: {
        roomId: [
          {
            required: true,
            message: "请选择机房",
            trigger: "change"
          }
        ],
        taskName: [
          {
            required: true,
            message: "请输入任务名称",
            trigger: "blur"
          }
        ],
        robotId: [
          {
            required: true,
            message: "请选择巡检机器人",
            trigger: "change"
          }
        ],
        execTime: [
          {
            type: "date",
            required: true,
            message: "请选择日期",
            trigger: "change"
          }
        ]
      },
      editLoading: false,
      btnEditText: "提交",
      //tempTask
      tempTaskVisible: false,
      devices: [],
      tempTaskDeviceId: "",
      address: ""
    };
  },
  methods: {
    formatTime(r, c) {
      return parseTime(r.createTime, "{y}-{m}-{d} {h}:{i}");
    },
    formatterStatus(row, column) {
      
    },
    cancel() {
      this.$refs.editForm.resetFields();
    },
    getList() {
      let para = {
        roomId: this.filters.roomId
      };
      this.listLoading = true;
      NProgress.start();
      let self = this;
      currentTask(self, para).then(res => {
        if (res.data.result === 200) {
          this.rows = res.data.data ? res.data.data : [];
        } else {
          this.rows = [];
        }
        this.listLoading = false;
        NProgress.done();
      });
    },
    handlerAdd() {
      this.editFormTitle = "新增";
      this.editFormVisible = true;
      this.editForm.roomId = "";
      this.devices = [];
      this.roomRobots = [];
      this.editForm.domains = [{ value: "" }];
    },
    editSubmit() {},
    handleDetail(row) {},
    handleStop(row) {
      var _this = this;
      this.$confirm("确定要终止吗?终止后任务将不在执行", "提示", {
        //type: 'warning'
      })
        .then(() => {
          _this.listLoading = true;
          NProgress.start();
          let para = {
            taskId: row.taskId
          };
        })
        .catch(() => {});
    },
    getRooms() {
      let para = {
        page: 0,
        roomstatus: 1,
        pageSize: 0
      };
      let self = this;
      getRoomList(self, para).then(res => {
        if (res.body.data && res.body.data.rows) {
          this.rooms = res.body.data.rows;
          this.filters.roomId = this.rooms[0].roomId;
        } else {
          this.rooms = [];
          this.filters.roomId = "";
        }
      });
    },
    getDevices(roomId) {
      this.editForm.robotId = "";
      this.editForm.devices = [];
      this.editForm.execTime = "";
      let self = this;
      let para = {
        roomId: roomId
      };
      NProgress.start();
      getRoomDetail(self, para).then(res => {
        //console.log(res)
        NProgress.done();
        if (res.body.data) {
          if (res.body.data.deviceList) {
            var devices = res.body.data.deviceList.map(item => {
              return {
                id: item.deviceId,
                label: item.deviceName,
                rfid: item.rfidId,
                orderBy: item.orderBy
              };
            });
            this.devices = [
              {
                id: "ALL",
                label: "全选",
                children: devices
              }
            ];
          } else {
            this.devices = [];
          }

          if (res.body.data.robotList) {
            this.roomRobots = res.body.data.robotList.map(item => {
              return {
                robotId: item.robotId,
                robotName: item.robotName
              };
            });
          } else {
            this.roomRobots = [];
          }
        } else {
        }
      });
    },

    handleSelect(item) {
      //console.log(item)
    },
    removeDomain(item) {
      var index = this.editForm.domains.indexOf(item);
      if (index !== -1) {
        this.editForm.domains.splice(index, 1);
      }
    },
    addDomain() {
      this.editForm.domains.push({
        value: "",
        key: Date.now()
      });
    }
  },
  mounted() {
    this.getRooms();
  }
};
</script>

<style>
.el-row {
  margin-bottom: 20px;
}
</style>