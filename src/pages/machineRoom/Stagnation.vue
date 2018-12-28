<template>
	<section>
		<el-row :gutter="20">
			<el-col :span="6">
				<el-tree style="height:330px; margin-bottom:20px;overflow-y:auto" @node-click="changeArea" default-expand-all highlight-current :data="roadwayData" :props="defaultProps" node-key="id" accordion :expand-on-click-node="false" :render-content="renderContent">
				</el-tree>
			</el-col>
			<el-col :span="18">
				<div class="banner">
					<el-button type="success" icon="plus" size="small" @click="addStag">新增导航点</el-button>
				</div>
				<!-- stagnation list -->
				<el-table :data="stagData" height="260" @row-click.self="changeStag" v-loading="stagLoading"  highlight-current-row border>
					<el-table-column type="index" width="80">
					</el-table-column>
					<el-table-column prop="nvPointName" label="导航点名称" align="center">
					</el-table-column>
					<el-table-column prop="x" label="X坐标" width="150">
					</el-table-column>
					<el-table-column prop="y" label="Y坐标" width="150">
					</el-table-column>
					<el-table-column label="操作" width="160">
						<template scope="scope">
							<el-button size="small" @click.stop="handleEditStag(scope.row)">编辑</el-button>
							<el-button size="small" type="warning" @click.stop="handleDeleteStag(scope.row)">删除</el-button>
						</template>
					</el-table-column>
				</el-table>
			</el-col>
		</el-row>
		<div class="banner">
			当前导航点：&nbsp;<el-button type="info" size="small">{{currentStag.nvPointName?currentStag.nvPointName:"未知"}}</el-button> &emsp;操作指令：
			<el-button icon="plus" type="success" size="small" @click="newWorker">新增巡检指令</el-button>
		</div>
		<!-- action list -->
		<el-table :data="workerData" height="400" v-loading="workerLoading"  highlight-current-row border>
      <el-table-column type="index" width="50">
			</el-table-column>
			<el-table-column prop="commandName" label="指令名称" width="180">
			</el-table-column>
			<el-table-column prop="commandType" label="指令类型">
         <template scope="scope">
            <el-tag :type="cmdStatus[scope.row.commandType+'']">{{formatCommandType(scope.row)}}</el-tag>
         </template>
			</el-table-column>
			<el-table-column prop="neckHeight" label="升降高度">
			</el-table-column>
      <el-table-column prop="levelAngle" label="水平转角">
			</el-table-column>
      <el-table-column prop="elevation" label="头部转角">
			</el-table-column>
      <el-table-column prop="cameraId" label="检测仪器">
         <template scope="scope">
             <span>{{formatCamera(scope.row)}}</span>
         </template>
			</el-table-column>
      <el-table-column prop="cameraZoom" label="焦距">
			</el-table-column>
      <el-table-column prop="cameraLight" label="闪光灯">
         <template scope="scope">
             <el-tag :type='scope.row.cameraLight===1?"success":scope.row.cameraLight==0?"danger":"warning"'>{{scope.row.cameraLight==1?"开启":scope.row.cameraLight==2?"自动":"关闭"}}</el-tag>
         </template>
			</el-table-column>
      <el-table-column prop="needDetect" label="图像识别">
        <template scope="scope">
          <el-tag  v-if="scope.row.commandType==1" :type="scope.row.needDetect==1?'success':'warning'">{{(scope.row.needDetect==1?"开启":"关闭")}}</el-tag>
         </template>
			</el-table-column>
      <!-- <el-table-column prop="waitTime" label="持续时长">
			</el-table-column> -->
      <el-table-column label="操作" width="160">
				<template scope="scope">
					<el-button size="small" @click.stop="handleEditWorker(scope.row)" >编辑</el-button>
					<el-button size="small" type="warning" @click.stop="handleDeleteWorker(scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<!-- Lane form-->
		<el-dialog :visible.sync="dialogFormVisible" size="tiny" :show-close="false">
			<el-form :inline="true" :model="editStagnation" :rules="areaRules" ref="areaForm">
					<el-form-item label="巷道名称" prop="name">
						<el-input v-model="editStagnation.name" placeholder="请输入巷道名称" ></el-input>
					</el-form-item>
					<el-form-item>
            <el-button type="primary" @click="dialogFormVisible=false">取消</el-button>
						<el-button type="primary" @click="areaSubmit" v-loading="areaSubmitLoading">提交</el-button>
					</el-form-item>
			</el-form>
		</el-dialog>
		<!-- Stagnation form -->
		<el-dialog title="导航点编辑" :visible.sync="stagVisible"  size="tiny" center>
			<el-form :model="stagnationForm" :rules="stagRules" ref="stagForm" label-width="100px">
				<el-form-item label="所属巷道">
					<span style="color:orange">{{stagnationForm.areaName}}</span>
				</el-form-item>
				<el-form-item label="导航点名称" prop="nvPointName">
					<el-input v-model="stagnationForm.nvPointName"></el-input>
				</el-form-item>
				<el-form-item label="导航点坐标" :rules="{required: true, message: '坐标不可为空', trigger: 'blur'}">
					<el-col :span="11">
						<el-form-item prop="x">
							<el-input v-model="stagnationForm.x" placeholder="请输入X轴坐标"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="2" class="line">
						&nbsp;
					</el-col>
					<el-col :span="11">
						<el-form-item prop="y">
							<el-input v-model="stagnationForm.y" placeholder="请输入Y轴坐标"></el-input>
						</el-form-item>
					</el-col>
				</el-form-item>
			</el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="stagVisible=false">取消</el-button>
        <el-button type="primary" @click="saveStag" v-loading="stagSubmitLoading">提交</el-button>
      </span>
		</el-dialog>
		<!-- action form -->
		<el-dialog title="指令编辑" :visible.sync="workerVisible" size="small" >
			<el-form :model="workerForm" ref="workerForm" label-width="90px" :rules="rules">
				<el-form-item label="所属导航点">
					<span style="color:orange">{{currentStag.nvPointName}}</span>
				</el-form-item>
				<el-form-item label="指令名称" prop="commandName" class="form_col">
					<el-input v-model="workerForm.commandName"></el-input>
				</el-form-item>
				<el-form-item label="指令类型" prop="commandType" class="form_col" >
           <el-select v-model="workerForm.commandType" placeholder="指令类型选择" style="width:100%">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
				  </el-select>
				</el-form-item>
        <template v-if="workerForm.commandType==='1'||workerForm.commandType==='2'||workerForm.commandType==='4'">
          <el-form-item label="升降高度" prop="neckHeight" class="form_col" >
              <el-input v-model="workerForm.neckHeight" placeholder="请输入升降高度（单位mm）"></el-input>
          </el-form-item>
          <el-form-item label="水平转角" prop="levelAngle" class="form_col">
              <el-input v-model="workerForm.levelAngle" placeholder="请输入水平转角"></el-input>
          </el-form-item>
          <el-form-item label="头部仰角" prop="elevation" class="form_col">
              <el-input v-model="workerForm.elevation" placeholder="请输入头部仰角"></el-input>
          </el-form-item>
          <el-form-item label="检测仪器" prop="cameraId" class="form_col" v-if="workerForm.commandType==='1'||workerForm.commandType==='4'" required>
              <el-select v-model="workerForm.cameraId" placeholder="检测仪器选择" style="width:100%">
              <el-option
                v-for="item in cameras"
                :key="item.label"
                :label="item.label"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="焦距" prop="cameraZoom" class="form_col" v-if="workerForm.commandType==='1'||workerForm.commandType==='4'">
            <el-input v-model="workerForm.cameraZoom" placeholder="请输入焦距"></el-input>
          </el-form-item>
          <el-form-item label="闪光灯" prop="cameraLight" class="form_col"  v-if="workerForm.commandType==='1'" required>
              <el-radio-group v-model="workerForm.cameraLight" size="small">
                <el-radio-button label="2">自动</el-radio-button>
                <el-radio-button label="1">开启</el-radio-button>
                <el-radio-button label="0">关闭</el-radio-button>
              </el-radio-group>
          </el-form-item>
          <el-form-item label="图像识别" prop="needDetect" class="form_col" v-if="workerForm.commandType==='1'" required >
               <el-radio-group v-model="workerForm.needDetect" size="small">
                <el-radio-button label="1">开启</el-radio-button>
                <el-radio-button label="0">关闭</el-radio-button>
              </el-radio-group>
           </el-form-item>
           <el-form-item v-if="workerForm.commandType==='1'&&workerForm.needDetect==1" prop="detectSettingId"  label='标签模板' class="form_col" :rules="{required:true,message:'不可为空',trigger:'change'}">
               <el-select v-model="workerForm.detectSettingId">
                   <el-option
                      v-for="item in tpls"
                      :key="item.detectSettingId"
                      :label="item.detectSettingName"
                      :value="item.detectSettingId">
                  </el-option>
               </el-select>
           </el-form-item>
        </template>
        <template v-if="workerForm.commandType==='3'||workerForm.commandType==='4'||workerForm.commandType==='7'">
          <el-form-item label="持续时长" prop="waitTime" class="form_col" required>
            <el-input v-model="workerForm.waitTime" placeholder="请输入时长（秒）">mm</el-input> 
          </el-form-item>
        </template>
        <el-form-item label="执行顺序" prop="orderId" class="form_col" required>
            <el-input v-model="workerForm.orderId" placeholder="请输入数字"></el-input> 
        </el-form-item> 
			</el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="workerVisible=false">取消</el-button>
        <el-button type="primary" @click="saveWorker" v-loading="cmdLoading">提交</el-button>
      </span> 
		</el-dialog>
	</section>
</template>
<script>
import NProgress from "nprogress";
import { CMDTYPES ,CMDSTATUS} from "@/const";
import {
  roadwayList,
  createArea,
  stagList,
  editStag,
  updateStag,
  deleteStag,
  workerListByStag,
  addWorker,
  updateWorker,
  deleteWorker,
  deleteArea,
} from "api/room";
import { mapState } from "vuex";
import { listRfidTpl } from "api/template";

export default {
  data() {
    var checkNum=(rule, value, callback)=>{
        if (value!==0&&!value) {
          return callback(new Error('不能为空'));
        }
        let reg = null;
        switch(rule.field){
          case 'levelAngle':
          case 'elevation': reg = /^-?[0-9]+.?[0-9]*$/; break;
          case 'cameraZoom':
          case 'neckHeight': reg = /^[0-9]+.?[0-9]*$/;break;
          default: reg = /^[1-9]\d*$/
        }
				setTimeout(() => {
					if(!reg.test(value)) {
							callback(new Error('输入类型错误'));
					} else {
							callback();
					}
				 
				}, 500);
    };
    return {
      options: CMDTYPES,
      cmdStatus:CMDSTATUS,
      cameras: [
        {
          id: "1",
          label: "摄像头(上)"
        },
        {
          id: "2",
          label: "摄像头(中)"
        },
        {
          id: "3",
          label: "摄像头(下)"
        }
      ],
      roadwayData: [],
      defaultProps: {
        children: "rbAreaInfoList",
        label: "areaName"
      },
      dialogFormVisible: false,
      editStagnation: {},
      areaRules: {
        name: [
          {
            required: true,
            message: "请输入巷道名称",
            trigger: "blur"
          }
        ]
      },
      currentAreaNode: {},
      stagLoading: false,
      stagnationForm: {
        nvPointName: "",
        roomId: "",
        areaName: "",
        areaId: "",
        x: "",
        y: ""
      },
      stagVisible: false,
      stagData: [],
      stagRules: {
        nvPointName: [
          {
            required: true,
            message: "导航点名称不可为空",
            trigger: "blur"
          }
        ],
        x: [
          {
            required: true,
            validator: checkNum,
            trigger: "blur"
          }
        ],
        y: [
          {
            required: true,
            validator: checkNum,
            trigger: "blur"
          }
        ]
      },
      currentStag: {},
      workerLoading: false,
      workerVisible: false,
      workerData: [],
      workerForm: {},
      rules:{
          commandName: [{
						required: true,
						message: '指令名称不可为空',
						trigger: 'blur'
					}],
          commandType: [{
						required: true,
						message: '指令类型不可为空',
						trigger: 'change'
          }],
          cameraId:[{
            required:true,
            message:'请选择摄像头',
            trigger: 'change'
          }],
          neckHeight:[{  required: true,validator: checkNum,	trigger: 'blur'}],
          levelAngle:[{  required: true,validator: checkNum,	trigger: 'blur'}],
          elevation:[{   required: true,validator: checkNum,	trigger: 'blur'}],
          cameraZoom:[{  required: true,validator: checkNum,	trigger: 'blur'}],
          waitTime:[{  required: true,validator: checkNum,	trigger: 'blur'}],
          orderId:[{  required: true,validator: checkNum,	trigger: 'blur'}],
      },
      areaSubmitLoading:false,
      stagSubmitLoading:false,
      cmdLoading:false,
      tpls:[],
    };
  },
  computed: mapState(["user"]),
  methods: {
    formatCommandType(r) {
      let type = CMDTYPES.find(i => i.value == r.commandType);
      return type ? type.label : r.commandType;
    },

    getTpls() {
      let self = this;
      listRfidTpl(self).then(res => {
         if(res.body.result===200||res.body.result===204){
            self.tpls = res.body.data?res.body.data:[];   
         }else{
            self.tpls = [];
            self.$message.error('标签模板获取失败')
         }
      });
    },
    getRoadway() {
      let self = this;
      roadwayList(self, {
        customerId: self.user.customId
      }).then(res => {
        if (res.data.result === 200) {
          self.roadwayData = res.data.data.map(item => {
            item.areaName = item.roomName;
            return item;
          });
        } else {
          self.roadwayData = [];
        }
      });
    },
    appendRoadway(store, data) {
      this.dialogFormVisible = true;
      this.editStagnation = Object.assign(
        {
          name: ""
        },
        data
      );
    },
    areaSubmit() {
      this.$refs.areaForm.validate(valid => {
        if (valid) {
          const params = {
            roomId: this.editStagnation.roomId,
            parentId: this.editStagnation.roomId,
            areaName: this.editStagnation.name
          };
          let _this = this;
           NProgress.start();
          _this.areaSubmitLoading = true;
          createArea(_this, params).then(res => {
            NProgress.done();
          _this.areaSubmitLoading = false;
            if (res.body.result == 200) {
              _this.getRoadway();
              _this.$notify({
                title: "成功",
                message: "巷道创建成功",
                type: "success"
              });
            } else {
              _this.$notify({
                title: "失败",
                message: "巷道创建失败",
                type: "error"
              });
            }
            _this.dialogFormVisible = false;
          });
        }
      });
    },
    removeRoadway(store, data) {
        var _this = this;
         this.$confirm("确认删除：" + data.areaName + "？", "提示", {}).then(()=>{
            NProgress.start();
            deleteArea(_this, {
              areaId:data.areaId
            }).then(res => {
               NProgress.done();
              if (res.data.result === 200) {
                _this.$message({
                  message: "删除成功",
                  type: "success"
                });
              } else {
                _this.$message.error("删除失败");
              }
              _this.getRoadway();
            });
         })
    },
    changeArea(data, node, store) {
      if (!data.parentId) return;
      this.currentAreaNode = data;
      this.workerData = [];
      this.getStag();
    },
    getStag() {
      let _this = this;
      this.stagLoading = true
        stagList(_this, {
          areaId: _this.currentAreaNode.areaId
        }).then(res => {
          if (res.data.result === 200) {
            this.stagData = res.data.data;
          } else {
            this.stagData = [];
            this.$message.error("导航点获取失败");
          }
          this.stagLoading = false;
        });
    },
    addStag() {
      if (!this.currentAreaNode.areaId) {
        this.$message("请点击左边巷道");
        return;
      }
      this.stagnationForm = {
        roomId: this.currentAreaNode.roomId,
        areaId: this.currentAreaNode.areaId,
        areaName: this.currentAreaNode.areaName
      };
      this.stagVisible = true;
    },
    handleEditStag(r) {
      let curr = this.currentAreaNode;
      this.stagnationForm = {
        roomId: r.roomId,
        areaId: r.areaId,
        areaName: curr.areaName,
        x: r.x,
        y: r.y,
        nvPointName: r.nvPointName,
        nvPointId: r.nvPointId
      };
      this.stagVisible = true;
    },
    handleDeleteStag(r) {
      var _this = this;
      this.$confirm("确认删除：" + r.nvPointName + "？", "提示", {
        //type: 'warning'
      }).then(() => {
        NProgress.start();
        deleteStag(_this, {
          nvPointId: r.nvPointId
        }).then(res => {
           NProgress.done();
          if (res.data.result === 200) {
            _this.$message({
              message: "删除成功",
              type: "success"
            });
          } else {
            _this.$message.error("删除失败");
          }
          _this.getStag();
        });
      });
    },
    saveStag() {
      let _this = this;
     
      this.$refs.stagForm.validate(valid => {
        if (valid) {
           NProgress.start()
           _this.stagSubmitLoading = true;
          if (!_this.stagnationForm.nvPointId) {
            editStag(_this, _this.stagnationForm).then(res => {
               NProgress.done()
               _this.stagSubmitLoading = false;
              if (res.data.result == 200) {
                _this.getStag();
                _this.$notify({
                  title: "成功",
                  message: "导航点创建成功",
                  type: "success"
                });
              } else {
                _this.$notify({
                  title: "失败",
                  message: "导航点创建失败",
                  type: "error"
                });
              }
              _this.stagVisible = false;
            });
          } else {
            updateStag(_this, _this.stagnationForm).then(res => {
               NProgress.done()
               _this.stagSubmitLoading = false;
              if (res.data.result == 200) {
                _this.getStag();
                _this.$notify({
                  title: "成功",
                  message: "导航点更新成功",
                  type: "success"
                });
              } else {
                _this.$notify({
                  title: "失败",
                  message: "导航点更新失败",
                  type: "error"
                });
              }
              _this.stagVisible = false;
            });
          }
        }
      });
    },
    changeStag(r) {
      this.currentStag = r;
      this.getWorkerListByStag();
      this.getTpls();
    },
    getWorkerListByStag() {
      let _this = this;
      this.workerLoading = true;
      workerListByStag(_this, {
        nvPointId: _this.currentStag.nvPointId
      }).then(res => {
        this.workerLoading = false;
        if (res.data.result === 200) {
          this.workerData = res.data.data;
        } else {
          this.workerData = [];
          this.$message.error("导航点获取失败");
        }
      });
    },
    newWorker() {
      if (!this.currentStag.nvPointId) {
        this.$message("请点击导航点图表，选择导航点");
        return;
      }
      this.workerForm = { nvPointId: this.currentStag.nvPointId,cameraLight:"2",needDetect:"0" };
      this.workerVisible = true;
    },
    saveWorker() {
      let _this = this;

      this.$refs.workerForm.validate(valid => {
        if (valid) {
          NProgress.start();
          _this.cmdLoading= true;
          if (this.workerForm.commandId) {
            updateWorker(_this, _this.workerForm).then(res => {
               NProgress.done();
               _this.cmdLoading= false;
               _this.getWorkerListByStag();
              if (res.body.result == 200) {
                _this.$notify({
                  title: "成功",
                  message: "指令更新成功",
                  type: "success"
                });
              } else {
                _this.$notify({
                  title: "失败",
                  message: "指令更新失败",
                  type: "error"
                });
              }
              _this.workerVisible = false;
            });
          } else {
            addWorker(_this, _this.workerForm).then(res => {
               NProgress.start();
              _this.cmdLoading= false;
              _this.getWorkerListByStag();
              if (res.body.result == 200) {
                _this.$notify({
                  title: "成功",
                  message: "指令创建成功",
                  type: "success"
                });
              } else {
                _this.$notify({
                  title: "失败",
                  message: "指令创建失败",
                  type: "error"
                });
              }
              _this.workerVisible = false;
            });
          }
        }
      });
    },
    handleEditWorker(i) {
      i.commandType = i.commandType + "";
      i.cameraId = i.cameraId ? i.cameraId + "" : null;
      i.cameraLight =
        i.cameraLight || i.cameraLight === 0 ? i.cameraLight + "" : null;
      i.needDetect =
        i.needDetect || i.needDetect === 0 ? i.needDetect + "" : null;
      this.workerForm = {...i};
      this.workerVisible = true;
    },
    handleDeleteWorker(row) {
      var _this = this;
      this.$confirm("确认删除：" + row.commandName + "？", "提示", {
        //type: 'warning'
      }).then(() => {
        NProgress.start();
        deleteWorker(_this, {
          commandId: row.commandId
        }).then(res => {
          NProgress.done();
          if (res.data.result === 200) {
            _this.$message({
              message: "删除成功",
              type: "success"
            });
          } else {
            _this.$message.error("删除失败");
          }
          _this.getWorkerListByStag();
        });
      });
    },
    formatCamera(r) {
      return r.cameraId
        ? this.cameras.find(i => i.id == r.cameraId).label
        : "其他";
    },
    renderContent(h, { node, data, store }) {
      if (data.rbAreaInfoList) {
        return (
          <span>
            <span>
              <span style="display:inline-block;vertical-align:middle;max-width:30%;overflow:hidden;text-overflow: ellipsis;">{node.label}</span>
            </span>
            <span style="float: right; margin-right: 20px">
              <el-button
                type="success"
                size="mini"
                on-click={() => this.appendRoadway(store, data)}
              >
                添加巷道
              </el-button>
            </span>
          </span>
        );
      } else {
        return (
          <span>
            <span>
              <span style="display:inline-block;width:40%;overflow:hidden;text-overflow: ellipsis;">{node.label}</span>
            </span>
            <span style="float: right; margin-right: 20px">
              <el-button
                type="warning"
                size="mini"
                on-click={() => this.removeRoadway(store, data)}
              >
                删除
              </el-button>
            </span>
          </span>
        );
      }
    }
  },
  mounted() {
    this.getRoadway();
  }
};
</script>
<style scoped>
.banner {
  background: #9da4b7;
  border: 1px solid #dee5e7;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #333;
  text-align: right;
}

.line {
  text-align: center;
  color: #fff;
}
.stag_name {
  color: teal;
  font-weight: bold;
}
.form_col {
  width: 49%;
  display: inline-block;
}
</style>