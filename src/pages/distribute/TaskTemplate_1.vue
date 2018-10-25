<template>
	<section>
		<!--工具条-->
    <el-row  class="label_t">
      <el-col :span="16">
          <el-select v-model="filters.roomId"  @change="getList">
            <el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
            </el-option>
          </el-select>
      </el-col>
      <el-col :span="8">
            <el-button type="info"  size="small" @click="editSubmit" style="float:right;margin:5px 5px 0 5px; ">保存模板</el-button>
            <el-button type="success"  size="small" @click="handleAdd" style="float:right;margin:5px 5px 0 5px;">添加模版</el-button>
      </el-col>
    </el-row>
		<el-row :gutter="20">
			<el-col :span="6">
				<el-tree style="height:70vh; margin-bottom:20px;overflow-y:auto" @node-click="changeTpl"  default-expand-all highlight-current :data="tplTreeData" :props="defaultProps" node-key="id" accordion :expand-on-click-node="false" :render-content="renderContent">
				</el-tree>
			</el-col>
			<el-col :span="18">
        <el-table :data="tplData"  row-key="nvPointId" highlight-current-row v-loading="listLoading" style="width: 100%;" id="tplList">
            <el-table-column type="index" label="#" width="60">
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
       <el-row class='tpl' :gutter="16">
         <el-col :span="10">
            <el-select   v-model="types" multiple placeholder="指令筛选" @change="filterType" style="width:100%">  
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
         </el-col>
         <el-col :span="11">
            <el-select  v-model="values" multiple placeholder="批量选取" @change="handleSelectedAction" :disabled="stagData.length===0" style="width:100%">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
         </el-col>
         <el-col :span="1">
             &emsp;<el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
         </el-col>
       </el-row>
      <el-table :data="stagData" style="margin-bottom:20px;" height="400" v-loading="stagLoading"  highlight-current-row>
        <el-table-column type="index" label="#" width="60">
        </el-table-column>
        <el-table-column prop="nvPointName" label="导航点名称" width="130" sortable>
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
      <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="addNavPoint">确定</el-button>
      </div>
    </el-dialog>
	</section>
</template>
<script>
import NProgress from "nprogress";
import { getRoomList, roadwayList, stagList } from "api/room";
import { templateList, createTaskTemplate, deleteTemplate } from "api/results";
import { CMDTYPES, CMDSTATUS } from "@/const";
import Sortable from "sortablejs";
export default {
  data() {
    return {
      filters: {
        roomId: ""
      },
      areaData: [],
      roadwayData:[],
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
      submitLoading: false,
      curTpl:'',
    };
  },
  methods: {
    //获取房间
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
          this.filters.roomId = this.$store.state.robotId?this.$store.state.robotId.roomId:this.rooms[0].roomId;
        }
      });
    },
    //获取模板
    getList() {
      this.getArea();
      let _this = this;
      let roomName = this.rooms.find(
        item => item.roomId === _this.filters.roomId
      ).roomName;
      templateList(_this, { roomId: _this.filters.roomId }).then(res => {
        if (res.data.data) {
          this.tplTreeData = res.data.data
            ? [{ templateName: roomName, children: res.data.data}]
            : [{ templateName: roomName, children: [] }];
          this.tplData = [];
        } else {
          this.tplTreeData = [{ templateName: roomName, children: [] }];
          this.tplData = [];
        }
      });
    },
    rowDrop() {
      const tbody = document.querySelector(
        "#tplList .el-table__body-wrapper tbody"
      );
      const _this = this;
      Sortable.create(tbody, {
        onEnd({ newIndex, oldIndex }) {
          const currRow = _this.tplData.splice(oldIndex, 1)[0];
          _this.tplData.splice(newIndex, 0, currRow);
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

    getArea() {
       let self = this;
      if(this.areaData.length>0){
        this.roadwayData = this.areaData.find(item=>(item.roomId===self.filters.roomId)).rbAreaInfoList;
      }else{
        roadwayList(self, {
          customerId: self.$store.state.user.customId
        }).then(res => {
            if (res.data.data) {
              this.areaData=res.data.data;
              this.roadwayData = this.areaData.find(item=>(item.roomId===self.filters.roomId)).rbAreaInfoList;
            }
        });
      }
     
    },
    getPointByRoom() {
      let _this = this;
      this.stagLoading = true;
      stagList(_this, { roomId: _this.filters.roomId }).then(res => {
        if (res.data.result === 200) {
          this.stagData = this.originalData = res.data.data
            ? res.data.data.filter(r => r.commandTypes.length > 0).map(i => {
                i.actions = [];
                return i;
              })
            : [];
        } else {
          this.stagData = this.originalData = [];
          this.$message.error("导航点获取失败");
        }
        this.stagLoading = false;
      });
    },

    handleAdd() {
      this.dialogVisible = true;
      this.curTpl =null;
      this.getPointByRoom();
    },
    cmdName(type) {
      return CMDTYPES.find(i => i.value == type).label;
    },
    addNavPoint(){
       this.tplData = this.stagData
            .filter(i => i.actions.length > 0)
            .map(i => ({
              nvPointName: i.nvPointName,
              nvPointId: i.nvPointId,
              areaId: i.areaId,
              commandTypes: i.actions.join(",")
            }));
         
      this.dialogVisible = false;
    },
    editSubmit() {
      let _this = this;
       if (this.tplData.length === 0) {
           this.$message.error("模版指令没有创建");
          return;
        }
       const tpl = this.curTpl;
       this.$prompt("请输入模板名称", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        showClose:false,
        inputValue: tpl ? tpl.templateName : "",
        inputPattern: /^(?![0-9])[\u4e00-\u9fa5a-zA-Z0-9]+$/,
        inputErrorMessage:
          "模板名称只能是中文、英文、数字组合，且不可以数字开头！"
      }).then(({ value }) => {
        NProgress.start();
        let para = {
           templateName:value,
           roomId:_this.filters.roomId,
           details:JSON.stringify(_this.tplData)
        }
        if(tpl)para.templateId = tpl.templateId;
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
            _this.getList();
          });
      }) 
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
        return (<span>{node.label}</span>);
      } else {
        return (
          <span>
            <span>
              <span style="display:inline-block;vertical-align:middle;max-width:30%;overflow:hidden;text-overflow: ellipsis;">{node.label}</span>
            </span>
            <span style="float: right">
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
      this.curTpl = data;
      this.tplData = data.details ? JSON.parse(data.details) : [];
    },
    removeTpl(store, data) {
      var _this = this;
      this.$confirm("确认删除：" + data.templateName + "？", "提示", {
        //type: 'warning'
      }).then(
        () => {
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
        },
        () => {}
      );
    },
    editTpl(store, data) {
      this.dialogVisible = true;
      this.getPointByRoom();
    }
  },
  mounted() {
    this.getRooms();
    this.rowDrop();
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
  line-height: 9px;
}
 
.custom-theme .el-form-item {
  margin: 0;
}

.rfid-action {
  margin-right: 10px;
}
.label_t {
  color: #fff;
  border: 1px solid rgba(250, 250, 250, 0.35);
  border-radius: 5px;
  padding: 15px 0;
  text-indent: 15px;
  background: #022c6b;
}
.el-tag {
  margin-right: 10px;
}
</style>