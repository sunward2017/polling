<template>
	<section>
		<el-col :span="24" class="toolbar" lable-width='70'>
			<el-form :inline="true" :model="filters">
				<el-form-item label="巡检机房">
					<el-select style="width:90%" v-model="filters.roomId">
						<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="任务状态">
					<el-select style="width:90%" v-model="filters.active" clearable>
            <el-option label="全部" value="2"></el-option>
						<el-option label="执行" value="1"></el-option>
						<el-option label="挂起" value="0"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button icon="refreash" type="primary" @click="getTaskByRoom">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button  type="primary" @click="handlerAdd">制定计划</el-button>
				</el-form-item>
         
			</el-form>
		</el-col>
		<template>
			<el-table :data="rows" highlight-current-row v-loading="listLoading">
				<el-table-column type="index" width="60" label="#" align="center">
				</el-table-column>
				<el-table-column prop="roomId" label="巡检机房" align="center" width="180" :formatter="formatterRoom">
				</el-table-column>
				<el-table-column prop="taskName" label="任务名称" align="center" width="160">
				</el-table-column>
				<el-table-column prop="status" label="计划状态" align="center" width="100">
					<template scope="scope">
						<el-tag type="success">{{formatStatus(scope.row)}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="robotId" label="巡检机器人"  min-width="200" align="center" :formatter="formatterRobot">
				</el-table-column>
				<!-- <el-table-column  label="避开时间区间" width="340" align="center" :formatter="formatTimeSction">
				</el-table-column>
				<el-table-column prop="prohibitedAreaId" label="避开巷道" width="240" align="center" sortable :formatter="formatArea">
				</el-table-column> -->
				
        <el-table-column prop="taskTimes" width="260" label="巡检时间" align="center">
        </el-table-column>
        <el-table-column prop="active" label="任务状态" width="100">
					<template scope="scope">
						<el-tag :type="scope.row.active?'success':'danger'">{{scope.row.active?" 可执行 ":"已挂起 "}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column  label="操作" align="center" width="300">
					<template scope="scope">
						<el-button type="darnge" icon="edit" size="small" @click="handleDetail(scope.row)">编辑</el-button>
						<el-button type="warning" icon="delete" size="small" @click="handleDel(scope.row)" v-loading="delLoading">删除</el-button>
						<el-button :type="scope.row.active?'danger':'success'" size="small" @click="pause(scope.row)">{{scope.row.active?"挂起":"恢复"}}</el-button>
					</template>
				</el-table-column>
			</el-table>
		</template>
    <!--分页-->
		<el-col :span="24" class="toolbar" style="padding-bottom:10px;">
			<el-pagination 
				layout="prev, pager, next,total,sizes,jumper" 
				@current-change="handleCurrentChange" 
				:page-sizes="[10, 20, 30, 40]" 
				:page-size="size" 
				:current-page="page"
				:total="total" 
				style="float:right;"
				@size-change="handleSizeChange"
				>
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog :title="editFormTile" v-model="editFormVisible" :close-on-click-modal="false" size="mini">
			<el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
				<el-form-item label='巡检机房' prop="roomId">
					<el-select style="width:100%" v-model="editForm.roomId" @change="changeFormRoom">
						<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="任务名称" prop="taskName" >
					<el-input v-model="editForm.taskName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label='巡检机器人' prop="robotId">
					<el-select v-model="editForm.robotId" style="width:100%">
						<el-option v-for="item in roomRobots" :key="item.robotId" :label="item.robotName" :value="item.robotId">
						</el-option>
					</el-select>
				</el-form-item>
			 
				<el-form-item required label="使用模版">
					<el-col :span="8">
						<el-form-item prop="useTemplate">
							<el-radio-group v-model="editForm.useTemplate">
								<el-radio-button :label="true">是</el-radio-button>
								<el-radio-button :label="false">否</el-radio-button>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="16" v-if="editForm.useTemplate">
						<el-form-item prop="templateId" :rules="{ required: true, message: '模板不能为空', trigger: 'change'}">
							<el-select v-model="editForm.templateId" placeholder="请选择指令模版" style="width:100%">
								<el-option v-for="item in templates" :key="item.templateId" :label="item.templateName" :value="item.templateId">
								</el-option>
							</el-select>
						</el-form-item>
					</el-col>
          <el-col :span="12" v-else>
              <el-form-item  prop="taskDetails" :rules="{ required: true, message: '指令不能为空',}">
                <el-button @click="addcmd" type="primary">配置任务指令</el-button>
              </el-form-item>
          </el-col>
				</el-form-item>
				<!-- <el-form-item label="避开巷道" prop="prohibitedAreaId">
					<el-select v-model="editForm.prohibitedAreaId" clearable  placeholder="请选择避开巷道" style="width:100%">
						<el-option v-for="(k,v,index) in prohibitedAreas" :key="index" :label="k" :value="v">
						</el-option>
					</el-select>
				</el-form-item> -->
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
					<el-button @click.prevent="removeDomain(domain)" v-if="index!=0" style="float:right">删除</el-button>
				</el-form-item>
			</el-form>
      <div slot='footer' class="dialog-footer">
			      <el-button type="info" @click="addDomain">新增时间</el-button>
            <el-button type="primary" @click.native="editSubmit" :loading="editLoading">{{btnEditText}}</el-button>
			</div>
		</el-dialog>

    <!-- 导航点指令 -->
    <el-dialog title="导航点指令" v-model="cmdVisible" :close-on-click-modal="false" size="large" >
        <el-row :gutter="16">
            <el-col :span="3">
               <div class="sign">机房巷道</div>
               <el-tree :data="areaData" :props="defaultProps" highlight-current @node-click="handleNodeClick" style="min-height:40vh" default-expand-all></el-tree>
            </el-col>
            <el-col :span="11">
               <div class="sign">导航点指令</div>
               <el-table :data="cmdData" v-loading="cmdLoading" @sort-change="sortPoint">
                    <el-table-column prop="nvPointName" label="导航点" width="150" sortable></el-table-column>
                    <el-table-column property="commandTypes" label="导航点指令">
                    <template scope="scope">
                        <el-checkbox-group v-model="scope.row.cmdType">
                            <el-checkbox v-for="type in scope.row.commandTypes" :label="`${type}`" :key="type">{{cmdName(type)}}</el-checkbox>
                        </el-checkbox-group>
                    </template>
                    </el-table-column>
                     <el-table-column
                        label="操作"
                        width="100"
                        align="center">
                        <template scope="scope">
                            <el-button
                            @click.native.prevent="addArea(scope.row)"
                            type="text"
                            size="small">
                             添加
                            </el-button>
                        </template>
                     </el-table-column>
                </el-table>
                <el-col class="tpl">
                  <el-col :span="10">
                      <el-select   v-model="filterTypes" multiple placeholder="指令筛选" @change="filterType" style="width:100%">  
                        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                      </el-select>
                  </el-col>
                  <el-col :span="11">
                      <el-select  v-model="values" multiple placeholder="批量选取" @change="handleSelectedAction" :disabled="cmdData.length===0" style="width:100%">
                        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                      </el-select>
                  </el-col>
                  <el-col :span="1">
                      &emsp;<el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
                  </el-col>
                </el-col>
                <el-col :span="24" class="toolbar" style="text-align:right">
                    <el-button type="info" size="small" @click="batchAddNav">批量添加</el-button>
                </el-col>
            </el-col>
            <el-col :span="10">
                <div class="sign">任务导航点队列(拖动排序)</div>
                <el-table 
                  :data="execArea"  
                  ref="multipleTable"
                  row-key="nvPointId"
                  id="sortTable"
                  >
                    <el-table-column type="index" width="55"></el-table-column>
                    <el-table-column prop="nvPointName" label="导航点" width="150"></el-table-column>
                    <el-table-column prop="commandTypes" label="导航点指令">
                        <template scope="scope">
                          <el-tag v-for="type in scope.row.cmdType"  :type="types[type+'']" :key="type" style="margin-right:5px;">{{cmdName(type)}}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column
                        label="操作"
                        width="100"
                        align="center">
                        <template scope="scope">
                            <el-button
                            @click.native.prevent="deleteRow(scope.$index, execArea)"
                            type="text"
                            size="small">
                             移除
                            </el-button>
                        </template>
                     </el-table-column>
                </el-table>
            </el-col>
        </el-row>
         <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="selectCmd" size="small">确定</el-button>
         </div>
    </el-dialog>
    
	</section>
</template>

<script>
import NProgress from "nprogress";
import { parseTime,compare,cloneObj } from "utils";
import { getRobotList } from "api/robot";
import {
  getTaskList,
  addTask,
  updateTask,
  deleteTask,
  templateList,
  pauseTask,
  sendTempTask
} from "api/results";
import { getRoomDetail, roadwayList,stagList } from "api/room";
import { TASKEXECTYPES, CMDTYPES,CMDSTATUS } from "@/const";
import Sortable from 'sortablejs'

export default {
  data() {
    var checkNull = (rule, value, callback) => {
       	setTimeout(() => {
				   if(!value||!value.replace(/(^\s*)|(\s*$)/g,"")){
           	callback(new Error('请输入任务名称'));
           }else{
               callback()
            }
				}, 500);
    };
    return {
      filters: {
        roomId: "",
        roomName: "",
        active: "2"
      },
      options:CMDTYPES,
      filterTypes:[],
      values:[],
      checkAll:true,
      isIndeterminate: true,
      types:CMDSTATUS,
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
        useTemplate: null,
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
            validator: checkNull,
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
      navPointData:[],
      cmdData: [],
      execArea:[],
      dateOpt: {
        disabledDate(time) {
            return time.getTime() < Date.now() - 8.64e7
        }
      },
      total: 0,
			page: 1,
			size:10,
      areaData:[],
      cmdLoading:false,
      defaultProps: {
        children: 'children',
        label: 'areaName'
      },
     
      
    };
  },
  methods: {
    changeCmd(){
       this.cmd =!this.cmd
    },
    sortPoint(obj){
       this.cmdData.reverse();
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getTaskByRoom();
    },
    handleSizeChange(size) {
      this.page = 1;
      this.size = size;
      this.getTaskByRoom();
    },
    getTaskByRoom() {
       let id = this.filters.roomId;
      const currentroom = this.rooms.find(item => item.roomId === id);
      this.robotList = currentroom.robotList;
      this.filters.roomName = currentroom.roomName;
      let para = {
        roomId: this.filters.roomId,
        page: this.page,
				pageSize: this.size
      };
      if(this.filters.active!=="2"){
        para.active = this.filters.active;
      }
      this.listLoading = true;
      NProgress.start();
      let self = this;
      getTaskList(self, para).then(res => {
        if (res.data.data) {
          this.rows = res.data.data?res.data.data.list.filter(i=>(i.type!==2)):[];
          this.total= res.data.data.total
        } else {
          this.rows = [];
          this.total =0;
        }
        this.listLoading = false;
        NProgress.done();
      });
    },
    handlerAdd() {
      this.editFormTile = "新增任务";
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
      let id = this.filters.roomId;
      this.changeFormRoom(id)
    },
    getRoadway() {
      let self = this;
      roadwayList(self, {
        customerId: self.$store.state.user.customId
      }).then(res => {
        if (res.data.result === 200) {
          self.roadwayData = res.data.data;
        } else {
          self.roadwayData = [];
          console.log('get area error')
        }
         self.getRooms();
      });
    },
    editSubmit() {
      var _this = this;
      _this.$refs.editForm.validate(valid => {
        if (valid) {
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
            templateId:_this.editForm.useTemplate?_this.editForm.templateId:null,
            taskTimes: times.join(","),
            taskDetails: _this.editForm.useTemplate?null:_this.editForm.taskDetails
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
      this.changeFormRoom(r.roomId)
      this.roadwayData
        .find(item => item.roomId === id)
        .rbAreaInfoList.forEach(r => {
          _this.prohibitedAreas[r.areaId] = r.areaName;
        });
      this.editForm={
        ...r,
        timeSection:r.prohibitedStartTime&&r.prohibitedEndTime? [
          new Date(r.prohibitedStartTime),
          new Date(r.prohibitedEndTime)
        ]:[],
        templateId:r.templateId?r.templateId:'',
        domains: r.taskTimes
          .split(",")
          .map(item => ({ value: new Date("2020/12/12 " + item) }))
      };
       
      this.execArea= r.taskDetails?JSON.parse(r.taskDetails).map(item=>({...item,cmdType:item.commandTypes.split(',')})):[];
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
       this.rooms = this.$store.state.rooms;
       this.filters.roomId =  this.$store.state.room;
       this.getTaskByRoom();
    },
    
    changeFormRoom(id) {
       /* roomRobots;
        * areaData
        * this.prohibitedAreas
        * cmdData
        */
       this.editForm = Object.assign({},{roomId:id,useTemplate:false,domains: [{value: ''}]});
       let  _this = this,room = this.roadwayData.find(item=>item.roomId===id);
            _this.prohibitedAreas ={};
            this.execArea=[]; 
       this.roomRobots = this.rooms.find(item=>item.roomId===id).robotList;
       this.areaData=[{
          areaName: room.roomName,
          children:room.rbAreaInfoList
       }];
        room.rbAreaInfoList.forEach(r => {
          this.prohibitedAreas[r.areaId] = r.areaName;
        });
        this.cmdData=[];
        this.getTemplates(id);
    },
    
    handleNodeClick(data){
       if(!data.areaId){
         return;
       }
      this.filterTypes=[];
      this.values=[];
      let _this = this;
      this.cmdLoading = true;
      stagList(_this,{areaId:data.areaId}).then(res=>{
        this.cmdLoading= false;
        if(res.data.data){
          this.navPointData = res.data.data.map(r => {r.cmdType = [];return r;});
          this.cmdData = res.data.data.map(r => {r.cmdType = [];return r;});
        }else{
          this.navPointData = [];
          this.cmdData =[];
        }
      })
       
    },
    addArea(r){
        if(r.cmdType.length===0){
            this.$message.error("导航点没有配置指令");
            return;
        }
        const index = this.execArea.findIndex(i=>i.nvPointId===r.nvPointId)
       if(index!==-1){
          this.execArea.splice(index,1);
       }else{
          this.execArea.push(r);
       }
    },
    batchAddNav(){
      let arr = this.cmdData.filter(item=>(item.cmdType.length>0));
      for(var i=0,l=arr.length;i<l;i++){
         let index =this.execArea.findIndex(item=>(item.nvPointId===arr[i].nvPointId));
         if(index>-1){
           this.execArea.splice(index,1);
         } 
         this.execArea.push(arr[i]);
      }
    },
    deleteRow(index, rows) {
        rows.splice(index, 1);
    },
    rowDrop() {
      const tbody = document.querySelector('#sortTable .el-table__body-wrapper tbody');
      const _this = this
      Sortable.create(tbody, {
        onEnd({ newIndex, oldIndex }) {
          const currRow = _this.execArea.splice(oldIndex, 1)[0]
          _this.execArea.splice(newIndex, 0, currRow)
        }
      })
    },
    addcmd() {
      this.cmdVisible = true;
      this.$nextTick(()=>{this.rowDrop()})
    },
    cmdName(type) {
      return CMDTYPES.find(i => i.value == type).label;
    },
    filterType() {
      const types = this.filterTypes;
      if (types.length === 0) {
        this.cmdData= cloneObj(this.navPointData);
      } else {
        this.cmdData = cloneObj(this.navPointData).filter(item => {
          return item.commandTypes.some(i => types.includes(i + ""));
        });
      }
    },
    handleCheckAllChange(e) {
      const state = e.target.checked;
      this.cmdData.map(item => {
        item.cmdType = state ? item.commandTypes.map(m => m + "") : [];
        return item;
      });
      this.isIndeterminate = false;
    },
    handleSelectedAction() {
      const values = this.values;
      this.cmdData.map(item => {
        item.cmdType = [];
        item.commandTypes.forEach(m => {
          if (values.includes(m + "")) {
            item.cmdType.push(m + "");
          }
        });
        return item;
      });
      this.handleCheckedActionChange();
    },
    handleCheckedActionChange() {
      this.checkAll = this.cmdData.every(
        item => item.cmdType.length === item.commandTypes.length
      );
      this.isIndeterminate =
        this.cmdData.some(item => item.cmdType.length > 0) &&
        this.cmdData.some(
          item => item.cmdType.length < item.commandTypes.length
        );
    }, 
    selectCmd() {
      if(this.execArea.some(i=>i.cmdType.length===0)){
         this.$message.error("请删除没有指令的导航点");
         return
      }
      this.editForm.taskDetails =this.execArea.length>0?JSON.stringify(this.execArea.map(i => ({
          nvPointId: i.nvPointId,
          nvPointName:i.nvPointName,
          commandTypes: i.cmdType.join(",")
        }))):'';
      this.cmdVisible = false;
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
    formatTime(r){
       return parseTime(r.createTime)
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
    getTemplates(id) {
      let _this = this;
      templateList(_this, { roomId:id }).then(res => {
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
              message:"任务"+state+"指令下发成功",
              type: "success" 
            })
         }else{
            _this.$message.error("任务"+state+"下发失败");
         }
          _this.filters.active='2'; 
          _this.getTaskByRoom();
      })  
    }
  },
  mounted() {
    this.getRoadway();
  }
};
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
.sign {
  text-indent: 1rem;
  height: 30px;
  line-height: 30px;
  background: rgb(38, 144, 243);
  color: #fff;
  border: 1px solid transparent;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}
.tpl {
  padding: 10px;
  border: 1px solid rgba(250, 250, 250, 0.15);
  border-radius: 4px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  line-height: 9px;
}
.cmd{
  font-size:20px;
  color:#00ffff;
}
</style>