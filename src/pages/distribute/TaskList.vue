<template>
	<section>
		<el-col :span="24" class="toolbar">
			<el-form :inline="true" :model="filters">
				<el-form-item label="巡检机房">
					<el-select style="width:90%" @change="changeRoom" v-model="filters.roomId">
						<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="任务状态">
					<el-select style="width:90%" v-model="filters.active" clearable>
						<el-option label="执行" value="1"></el-option>
						<el-option label="挂起" value="0"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button icon="refreash" type="primary" @click="getTaskByRoom">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button icon="edit" type="primary" @click="handlerAdd">任务计划</el-button>
				</el-form-item>
			</el-form>
		</el-col>
		<template>
			<el-table :data="rows" highlight-current-row v-loading="listLoading">
				<el-table-column type="index" width="60" label="#" align="center">
				</el-table-column>
				<el-table-column prop="roomId" label="巡检机房" width="160" :formatter="formatterRoom">
				</el-table-column>
				<el-table-column prop="taskName" label="任务名称" align="center" width="120">
				</el-table-column>
				<el-table-column prop="status" label="计划状态" align="center" width="120">
					<template scope="scope">
						<el-tag type="success">{{formatStatus(scope.row)}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="robotId" label="巡检机器人" width="160" align="center" :formatter="formatterRobot">
				</el-table-column>
				<el-table-column  label="避开时间区间" width="360" align="center" :formatter="formatTimeSction">
				</el-table-column>
				<el-table-column prop="prohibitedAreaId" label="避开巷道" width="240" align="center" sortable :formatter="formatArea">
				</el-table-column>
				<el-table-column prop="active" label="状态">
					<template scope="scope">
						<el-tag :type="scope.row.active?'success':'danger'">{{scope.row.active?"执行":"挂起"}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="status" label="操作" align="center" width="300">
					<template scope="scope">
						<el-button type="darnge" icon="edit" size="small" @click="handleDetail(scope.row)">修改</el-button>
						<el-button type="warning" icon="delete" size="small" @click="handleDel(scope.row)" v-loading="delLoading">删除</el-button>
						<el-button :type="scope.row.active?'danger':'success'" size="small" @click="pause(scope.row)">{{scope.row.active?"挂起":"执行"}}</el-button>
					</template>
				</el-table-column>
			</el-table>
		</template>
		 
		<!--编辑界面-->
		<el-dialog :title="editFormTile" v-model="editFormVisible" :close-on-click-modal="false" size="samll">
			<el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
				<el-form-item label='巡检机房' prop="roomId">
					<el-select style="width:100%" v-model="editForm.roomId" @change="changeFormRoom">
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
				<!-- <el-form-item prop="active" label="任务状态">
					<el-radio-group v-model="editForm.active">
						<el-radio-button :label="true" size="small">启用</el-radio-button>
						<el-radio-button :label="false" size="small">禁用</el-radio-button>
					</el-radio-group>
				</el-form-item> -->
				<el-form-item required label="使用模版">
					<el-col :span="12">
						<el-form-item prop="useTemplate">
							<el-radio-group v-model="editForm.useTemplate">
								<el-radio-button :label="true">是</el-radio-button>
								<el-radio-button :label="false">否</el-radio-button>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="12" v-if="editForm.useTemplate">
						<el-form-item prop="templateId">
							<el-select v-model="editForm.templateId" placeholder="请选择模版" style="width:100%">
								<el-option v-for="item in templates" :key="item.templateId" :label="item.templateName" :value="item.templateId">
								</el-option>
							</el-select>
						</el-form-item>
					</el-col>
          <el-col :span="12" v-else>
              <el-form-item>
                <el-button @click="addcmd">任务指令</el-button>
              </el-form-item>
          </el-col>
				</el-form-item>
				<el-form-item label="避开巷道" prop="prohibitedAreaId">
					<el-select v-model="editForm.prohibitedAreaId" placeholder="请选择避开巷道" style="width:100%">
						<el-option v-for="(k,v,index) in prohibitedAreas" :key="v" :label="k" :value="v">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="避开时区">
					 <el-date-picker
            v-model="editForm.timeSection"
            type="datetimerange"
            :picker-options="dateOpt"
            placeholder="选择时间范围">
          </el-date-picker>
				</el-form-item>
				<el-form-item v-for="(domain, index) in editForm.domains" :label="'巡检时间' + index" :key="domain.key" :prop="'domains.' + index + '.value'" :rules="{
				     type: 'date', required: true, message: '时间不能为空', trigger: 'change'
				    }">
					<el-time-picker v-model="domain.value" placeholder="请选择时间" style="width:80%">
					</el-time-picker>
					<el-button @click.prevent="removeDomain(domain)" style="float:right">删除</el-button>
				</el-form-item>
			</el-form>
      <div slot='footer' class="dialog-footer">
					<el-button type="info" @click="addDomain">新增时间</el-button>
          <el-button type="primary" @click.native="editSubmit" :loading="editLoading">{{btnEditText}}</el-button>
			</div>
		</el-dialog>

    <!-- 导航点指令 -->
    <el-dialog title="导航点指令" v-model="cmdVisible" :close-on-click-modal="false">
         <el-table :data="cmdData"  ref="multipleTable">
            <el-table-column type="index" width="55"></el-table-column>
            <el-table-column prop="nvPointName" label="导航点名称" width="150"></el-table-column>
            <el-table-column property="areaId" label="所属巷道" :formatter="formatArea1" width="200"></el-table-column>
            <el-table-column property="commandTypes" label="导航点指令">
               <template scope="scope">
                  <el-checkbox-group v-model="scope.row.cmdType">
                     <el-checkbox v-for="type in scope.row.commandTypes" :label="`${type}`" :key="type">{{cmdName(type)}}</el-checkbox>
                  </el-checkbox-group>
               </template>
            </el-table-column>
         </el-table>
         <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="selectCmd" size="small">确 定</el-button>
         </div>
    </el-dialog>
	</section>
</template>

<script>
import NProgress from "nprogress";
import { parseTime, compare } from "utils";
import { getRobotList } from "api/robot";
import {
  getTaskList,
  addTask,
  updateTask,
  deleteTask,
  templateList,
  cmdListByRoom,
  pauseTask
} from "api/results";
import { getRoomList, getRoomDetail, roadwayList } from "api/room";
import { TASKEXECTYPES, CMDTYPES } from "@/const";

export default {
  data() {
    return {
      filters: {
        roomId: "",
        roomName: "",
        active: "1"
      },
      robotList: [],
      roomRobots: [],
      rows: [],
      rooms: [],
      templates: [],
      roadwayData: [],
      prohibitedAreas: {},
      listLoading: false,
      editFormTile: "新增",
      editFormVisible: false,
      editForm: {
        roomId: "",
        robotId: "",
        useTemplate: "",
        prohibitedAreaId: "",
        timeSection: [],
        templateId: "",
        domains: [
          {
            value: ""
          }
        ]
      },
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
      delLoading:false,
      btnEditText: "提交",
      cmdVisible: false,
      cmdData: [],
      selectCmdData: [],
      dateOpt: {
        disabledDate(time) {
            return time.getTime() < Date.now() - 8.64e7
        }
      },
    };
  },
  methods: {
    handleCurrentChange(val) {
      this.page = val;
      this.getList();
    },
    handleSizeChange(size) {
      this.page = 1;
      this.size = size;
      this.getList();
    },
    getTaskByRoom() {
      let para = {
        roomId: this.filters.roomId,
        active: this.filters.active
      };
      this.listLoading = true;
      NProgress.start();
      let self = this;
      getTaskList(self, para).then(res => {
        if (res.data.result === 200) {
          this.rows = res.data.data?res.data.data:[];
        } else {
          this.rows = [];
        }
        this.listLoading = false;
        NProgress.done();
      });
    },
    handlerAdd() {
      this.editFormTile = "新增";
      this.editFormVisible = true;
      this.editForm = {
        roomId: this.filters.roomId,
        domains: [
          {
            value: ""
          }
        ],
        useTemplate: false
      };
      let id = this.editForm.roomId,
        _this = this;
      this.roomRobots = this.rooms.find(item => item.roomId === id).robotList;
      this.roadwayData
        .find(item => item.roomId === id)
        .rbAreaInfoList.forEach(r => {
          _this.prohibitedAreas[r.areaId] = r.areaName;
        });
    },
    getRoadway() {
      let self = this;
      roadwayList(self, {
        customerId: self.$store.state.user.customId
      }).then(res => {
        if (res.data.result === 200) {
          self.roadwayData = res.data.data;
          self.getRooms();
        } else {
          self.roadwayData = [];
          self.$message("通信故障");
        }
      });
    },
    editSubmit() {
      var _this = this;
      let detail = this.editFormDetail || this.selectCmdData;
    
      _this.$refs.editForm.validate(valid => {
        if (valid) {
          if(!this.editForm.useTemplate&&detail.length===0){
              this.$message.error('指令不可为空');
              return;
          }
          _this.editLoading = true;
          _this.btnEditText = "提交中...";
          let times = _this.editForm.domains.map(item => {
            return parseTime(item.value, "{h}:{i}:{s}");
          });
          let params = {
            roomId: _this.editForm.roomId,
            taskName: _this.editForm.taskName,
            robotId: _this.editForm.robotId,
            prohibitedAreaId: _this.editForm.prohibitedAreaId?_this.editForm.prohibitedAreaId:null,
            useTemplate: _this.editForm.useTemplate,
            templateId: _this.editForm.templateId&&_this.editForm.useTemplate?_this.editForm.templateId:null,
            taskTimes: times.join(","),
            taskDetails: _this.editForm.useTemplate?null:JSON.stringify(detail)
          };
          if(_this.editForm.timeSection&&_this.editForm.timeSection.length>1){
              params.prohibitedStartTime= parseTime(_this.editForm.timeSection[0]);
              params.prohibitedEndTime=parseTime(_this.editForm.timeSection[1]);
          }
          if (!_this.editForm.scheduleId) {
            addTask(_this, params).then(res => {
              _this.editLoading = false;
              _this.btnEditText = "提交";
              this.filters.roomId = this.editForm.roomId;
              if (res.data.result == 200) {
                _this.$notify({
                  title: "成功",
                  message: "任务计划创建成功",
                  type: "success"
                });
              } else {
                _this.$notify({
                  title: "失败",
                  message: "任务计划创建失败",
                  type: "error"
                });
              }
              _this.editFormVisible = false;
              _this.getTaskByRoom();
            });
          } else {
            params.scheduleId = _this.editForm.scheduleId;
            updateTask(_this, params).then(res => {
              if (res.body.result == 200) {
                _this.$notify({
                  title: "成功",
                  message: "任务计划更新成功",
                  type: "success"
                });
              } else {
                _this.$notify({
                  title: "失败",
                  message: "任务计划更新失败",
                  type: "error"
                });
              }
              _this.editLoading = false;
              _this.btnEditText = "提交";
              _this.editFormVisible = false;
              _this.getTaskByRoom();
            });
          }
        }
      });
    },
    handleDetail(r) {
      let  id = r.roomId,
        _this = this;
      this.editFormTile = "编辑";
      this.roomRobots = this.rooms.find(item => item.roomId === id).robotList;
      this.roadwayData
        .find(item => item.roomId === id)
        .rbAreaInfoList.forEach(r => {
          _this.prohibitedAreas[r.areaId] = r.areaName;
        });
      this.editForm = {
        ...r,
        timeSection:r.prohibitedStartTime&&r.prohibitedEndTime? [
          new Date(r.prohibitedStartTime),
          new Date(r.prohibitedEndTime)
        ]:[],
        templateId:r.templateId?r.templateId:'',
        domains: r.taskTimes
          .split(",")
          .map(item => ({ value: new Date("2020-12-12 " + item) }))
      };
      this.editFormVisible = true;
    },
    handleDel(row) {
      var _this = this;
      this.$confirm("确认删除吗", "提示", {
        //type: 'warning'
      }).then(() => {
        _this.delLoading = true;
        NProgress.start();
        let para = {
          scheduleId: row.scheduleId
        };
        deleteTask(_this, para).then(res => {
          NProgress.done();
          _this.delLoading =false;
          if (res.data.result === 200) {
            _this.$message({
              message: "删除成功",
              type: "success"
            });
          } else {
            _this.$message.error("删除失败");
          }
          _this.getTaskByRoom();
        });
      });
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
          this.getTaskByRoom();
          this.getTemplates(); 
        } else {
          this.rooms = [];
          this.filters.roomId = "";
        }
      });
    },
    changeRoom() {
      let id = this.filters.roomId;
      const currentroom = this.rooms.find(item => item.roomId === id);
      this.robotList = currentroom.robotList;
      this.filters.roomName = currentroom.roomName;
    },
    changeFormRoom(v) {
      let id = this.editForm.roomId;
      this.roomRobots = this.rooms.find(item => item.roomId === id).robotList;
    },
    addcmd() {
      this.cmdVisible = true;
      this.getCmdByRoom();
    },
    cmdName(type) {
      return CMDTYPES.find(i => i.value == type).label;
    },
    getCmdByRoom() {
      let _this = this;
      cmdListByRoom(_this, { roomId: _this.editForm.roomId }).then(res => {
        if (res.data.result === 200) {
          _this.cmdData = res.data.data
            .filter(r => r.commandTypes.length > 0)
            .map(r => {
              r.cmdType = [];
              return r;
            });
          if (this.editForm.scheduleId) {
            const data =this.editForm.taskDetails?JSON.parse(this.editForm.taskDetails):[];
            let cmdData = _this.cmdData;
            for (var i = 0, l = cmdData.length; i < l; i++) {
              for (var k = 0, len = data.length; k < len; k++) {
                if (cmdData[i].nvPointId == data[k].nvPointId) {
                  cmdData[i].cmdType = data[k].commandTypes.split(",");
                }
              }
            }
          }
        } else {
          _this.cmdData = [];
        }
      });
    },
    selectCmd() {
      this.cmdVisible = false;
      let areas = this.prohibitedAreas;
      this.selectCmdData = this.cmdData
        .filter(i => i.cmdType.length > 0)
        .map(i => ({
          nvPointId: i.nvPointId,
          areaName: areas[i.areaId],
          commandTypes: i.cmdType.join(",")
        }));
    },
    formatterRoom(r, c) {
      return this.rooms.find(item => r.roomId === item.roomId).roomName;
    },
    formatterRobot(r, c) {
      const robot = this.robotList.find(item => r.robotId === item.robotId);
      return robot ? robot.robotName : r.robotId;
    },
    formatTimeSction(r, c) {
      if(r.prohibitedStartTime&&r.prohibitedEndTime){
        return (
          parseTime(r.prohibitedStartTime) + "~" + parseTime(r.prohibitedEndTime)
        );
      }else{
         return  '';
      }
    },
    formatStatus(r) {
      return r.status===1?"已下发":"未下发";
    },
    formatArea(r, c) {
      const area = this.roadwayData
        .find(m => m.roomId === r.roomId)
        .rbAreaInfoList.find(i => i.areaId === r.prohibitedAreaId);
      return area ? area.areaName : "未知";
    },
    formatArea1(r, c) {
      return r.areaName || this.prohibitedAreas[r.areaId] || "未知";
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
    },
    getTemplates() {
      let _this = this;
      templateList(_this, { roomId: _this.filters.roomId }).then(res => {
        if (res.data.result === 200) {
          this.templates = res.data.data?res.data.data:[];
        } else {
          this.$message.error("查询模版失败");
           this.templates =[];
        }
      });
    },
    pause(r){
      let _this = this;
      let para = {
            active:r.active?"0":"1",
            scheduleId:r.scheduleId,
          }; 
      pauseTask(_this, para).then(res => {
         let state = para.active==="0"?"挂起":"执行" 
         if(res.data.result===200){
            _this.$message({
              message:"任务"+state+"成功",
              type: "success" 
            })
         }else{
            _this.$message.error("任务"+state+"失败");
         }
          _this.getTaskByRoom();
      })  
    }
  },
  mounted() {
    this.getRoadway();
  }
};
</script>

<style>
.el-row {
  margin-bottom: 20px;
}
</style>