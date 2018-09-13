<template>
	<section>
		<!--工具条-->
		<div class="toolbar">
			<el-form :inline="true" :model="filters">
				 <el-form-item label="巡检机房">
					<el-select v-model="filters.roomId" style="width:90%">
						<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
						</el-option>
					</el-select>
				 </el-form-item>
				<el-form-item>
					<el-button icon="search" type="primary" v-on:click="getList">查询</el-button>
				</el-form-item>
			</el-form>
		</div>
		<el-row :gutter="20">
			<el-col :span="6">
				<el-tree style="height:70vh; margin-bottom:20px;overflow-y:auto" @node-click="changeTpl"  default-expand-all highlight-current :data="tplTreeData" :props="defaultProps" node-key="id" accordion :expand-on-click-node="false" :render-content="renderContent">
				</el-tree>
			</el-col>
			<el-col :span="18">
        <el-table :data="tplData" highlight-current-row v-loading="listLoading" style="width: 100%;">
            <el-table-column type="index" width="80" label="序号" align="center">
            </el-table-column>
            <el-table-column prop="nvPointName" label="导航点" align="center">
            </el-table-column>
            <el-table-column prop="areaId" label="所属巷道" :formatter="formatArea">
            </el-table-column>
            <el-table-column prop="commandTypes" label="操作指令"  :formatter="formatCmd">
                <template scope="scope">
                      <el-tag v-for="item in formatCmd(scope.row)" :type="item.statu" :key="item.name" style="margin-right:5px">&nbsp;{{item.name}}&nbsp;</el-tag>
                </template>
            </el-table-column>
        </el-table>
      </el-col>
		</el-row>
    <el-dialog title="模版编辑" :visible.sync="dialogVisible" size="small">
      <el-form :inline="true"  label-width="80px" :model="editForm" ref="tplForm" class="tpl-form" >
        <el-form-item label="巡检机房" prop="roomId" required>
            <el-select v-model="editForm.roomId" @change="changeTplRoom" >
                <el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="模版名称" prop="templateName" required>
            <el-input v-model="editForm.templateName" placeholder="模板名称"></el-input>
        </el-form-item>
      </el-form>
      <el-table :data="stagData" style="margin-bottom:20px;" height="400" v-loading="stagLoading"  highlight-current-row>
        <el-table-column type="index" label="#" width="50">
        </el-table-column>
        <el-table-column prop="nvPointName" label="导航点名称" width="130" >
        </el-table-column>
                  <el-table-column prop="areaId" label="所属巷道" :formatter="formatArea" width="130">
        </el-table-column>
        <el-table-column prop="orderId" label="排序" width="100">
        </el-table-column>
        <el-table-column property="commandTypes" label="导航点指令">
          <template scope="scope">
            <el-checkbox-group v-model="scope.row.actions">
              <el-checkbox v-for="type in scope.row.commandTypes" :label="`${type}`" :key="type" @change="handleCheckedActionChange">{{cmdName(type)}}</el-checkbox>
            </el-checkbox-group>
          </template>
        </el-table-column>
      </el-table>
      <el-row class="tpl">
          <el-col :span="6">
            <el-select   v-model="types" multiple placeholder="指令筛选" @change="filterType">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="6" :offset="10">
            <el-select  v-model="values" multiple placeholder="批量选取" @change="handleSelectedAction" :disabled="stagData.length===0">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="2">
            &emsp;<el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
          </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="editSubmit" v-loading="submitLoading">提交</el-button>
      </div>
    </el-dialog>
	</section>
</template>
<script>
import NProgress from "nprogress";
import { getRoomList, roadwayList, stagList } from "api/room";
import { templateList, createTaskTemplate, deleteTemplate } from "api/results";
import { CMDTYPES, CMDSTATUS } from "@/const";

export default {
  data() {
    return {
      filters: {
        roomId: ""
      },
      roadwayData: [],
      rooms: [],
      tplData: [],
      tplTreeData: [],
      listLoading: false,
      dialogVisible: false,
      cmdData: [],
      editForm: {},
      options: CMDTYPES,
      types: [],
      values: [],
      isIndeterminate: true,
      checkAll: true,
      originalData: [],
      stagData: [],
      stagLoading: false,
      defaultProps: {
        children: "children",
        label: "templateName"
      },
      submitLoading:false,
    };
  },
  methods: {
    getRooms() {
      let para = {
        page: 0,
        roomstatus: 1,
        pageSize: 0
      };
      let self = this;
      NProgress.start();
      getRoomList(self, para).then(res => {
        NProgress.done();
        if (res.data.data) {
          this.rooms = res.body.data.rows;
          this.filters.roomId = this.rooms[0].roomId;
          this.getList();
        }
      });
    },
    getList() {
      let _this = this;
      templateList(_this, { roomId: _this.filters.roomId }).then(res => {
        if (res.data.result === 200) {
          this.tplTreeData = res.data.data
            ? [{ templateName: "全部", children: res.data.data }]
            : [{ templateName: "全部", children: [] }];
          this.tplData =[];
        } else {
          this.$message.error("查询模版失败");
          this.tplTreeData = [{ templateName: "全部", children: [] }];
           this.tplData =[];
        }
      });
    },
    filterType() {
      const types = this.types;
      if (types.length === 0) {
        this.stagData = this.originalData;
      } else {
        this.stagData = this.originalData.filter(item => {
          return item.commandTypes.some(i => types.includes(i + ""));
        });
      }
    },
    handleSelectedAction() {
      const values = this.values;
      this.stagData.map(item => {
        item.actions = [];
        item.commandTypes.forEach(m => {
          if (values.includes(m + "")) {
            item.actions.push(m + "");
          }
        });
        return item;
      });
      this.handleCheckedActionChange();
    },
    handleCheckAllChange(e) {
      const state = e.target.checked;
      this.stagData.map(item => {
        item.actions = state ? item.commandTypes.map(m => m + "") : [];
        return item;
      });
      this.isIndeterminate = false;
    },
    handleCheckedActionChange() {
      this.checkAll = this.stagData.every(
        item => item.actions.length === item.commandTypes.length
      );
      this.isIndeterminate =
        this.stagData.some(item => item.actions.length > 0) &&
        this.stagData.some(
          item => item.actions.length < item.commandTypes.length
        );
    },

    getRoadway() {
      let self = this;
      roadwayList(self, {
        customerId: self.$store.state.user.customId
      }).then(res => {
        self.getRooms();
        if (res.data.result === 200) {
          if (res.data.data) {
            let arr = [];
            res.data.data.forEach(item => {
              self.roadwayData = arr.concat(item.rbAreaInfoList);
            });
          }
        } else {
          self.roadwayData = [];
        }
      });
    },
    changeTplRoom() {
      this.getPointByRoom();
    },
    getPointByRoom() {
      let _this = this;
      this.stagLoading = true;
      stagList(_this, { roomId: _this.editForm.roomId }).then(res => {
        if (res.data.result === 200) {
          this.stagData = this.originalData = res.data.data? res.data.data.filter(r => r.commandTypes.length > 0).map(i => {
                i.actions = [];
                return i;
              }):[];
        } else {
          this.stagData = this.originalData = [];
          this.$message.error("导航点获取失败");
        }
        this.stagLoading = false;
      });
    },

    handleAdd() {
      this.dialogVisible = true;
      this.editForm = { roomId: this.filters.roomId };
      this.changeTplRoom();
    },
    cmdName(type) {
      return CMDTYPES.find(i => i.value == type).label;
    },
    editSubmit() {
      let _this = this;
      this.$refs.tplForm.validate(valid => {
        if (valid) {
          const details = this.stagData
            .filter(i => i.actions.length > 0)
            .map(i => ({
              nvPointName: i.nvPointName,
              nvPointId: i.nvPointId,
              areaId: i.areaId,
              commandTypes: i.actions.join(",")
            }));
          if (details.length === 0) {
            _this.$message.error("模版指令没有创建");
            return;
          }
          NProgress.start();
          _this.submitLoading = true;

          let para = {
            ..._this.editForm,
            details: JSON.stringify(details)
          };
          delete para.createTime;
          createTaskTemplate(_this, para).then(res => {
             NProgress.done();
             _this.submitLoading = false;
            if (res.data.result === 200) {
              _this.$message({
                message: "模版保存成功",
                type: "success"
              });
            } else {
              _this.$message.error("模版保存失败");
            }
            _this.dialogVisible = false;
            _this.filters.roomId = _this.editForm.roomId;
            _this.getList();
          });
        }
      });
    },
    formatArea(r, c) {
      const area = this.roadwayData.find(i => i.areaId == r.areaId);
      return area ? area.areaName : "未知";
    },
    formatCmd(r, c) {
      const cmds = r.commandTypes ? r.commandTypes.split(",") : [];
      return cmds.map(i => ({
        statu: CMDSTATUS[i + ""],
        name: CMDTYPES.find(k => k.value == i).label
      }));
    },
    renderContent(h, { node, data, store }) {
      if (data.children) {
        return (
          <span>
            <span>
              <span>{node.label}</span>
            </span>
            <span style="float: right; margin-right: 20px">
              <el-button
                type="success"
                size="mini"
                on-click={() => this.handleAdd()}
              >
                添加模版
              </el-button>
            </span>
          </span>
        );
      } else {
        return (
          <span>
            <span>
              <span>{node.label}</span>
            </span>
            <span style="float: right; margin-right: 20px">
              <el-button
                size="mini"
                type="primary"
                on-click={() => this.editTpl(store, data)}
              >
                编辑
              </el-button>
              <el-button
                type="warning"
                size="mini"
                on-click={() => this.removeTpl(store, data)}
              >
                删除
              </el-button>
            </span>
          </span>
        );
      }
    },
    changeTpl(data, node, store) {
      this.tplData = data.details ? JSON.parse(data.details) : [];
    },
    removeTpl(store, data) {
      var _this = this;
      this.$confirm("确认删除：" + data.templateName + "？", "提示", {
        //type: 'warning'
      }).then(() => {
        NProgress.start();
        deleteTemplate(_this, { templateId: data.templateId }).then(res => {
          NProgress.done();
          if (res.data.result === 200) {
            _this.$message({
              message: "删除成功",
              type: "success"
            });
          } else {
            _this.$message.error("删除失败");
          }
          _this.getList();
        });
      },()=>{});
    },
    editTpl(store, data) {
      this.editForm = { ...data };
      this.dialogVisible = true;
      this.changeTplRoom();
    }
  },
  mounted() {
    this.getRoadway();
  }
};
</script>

<style scoped>
.tpl {
  padding: 10px;
  border: 1px solid rgba(250, 250, 250, 0.15);
  border-radius: 4px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 20px;
  line-height: 36px;
}
.tpl-form{
  margin-bottom:20px;
}
.custom-theme .el-form-item {
  margin: 0;
}

.rfid-action {
  margin-right: 10px;
}

.el-tag {
  margin-right: 10px;
}
</style>