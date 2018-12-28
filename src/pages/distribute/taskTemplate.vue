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
               <el-button type="info"  size="small" @click="editSubmit" style="float:right;margin:5px 5px 0 5px; " :disabled="!tplData.length>0">保存模板</el-button>
               <el-button type="success"  size="small" @click="showArea" style="float:right;margin:5px 5px 0 5px;" :disabled="!curTpl.templateName">导航点指令</el-button>
          </el-col>
        </el-row>
		<el-row :gutter="20">
			<el-col :span="8">
				<el-tree style="height:70vh; margin-bottom:20px;overflow-y:auto" @node-click="changeTpl"  default-expand-all highlight-current :data="tplTreeData" :props="defaultProps" node-key="templateId" accordion :expand-on-click-node="false" :render-content="renderContent">
				</el-tree>
			</el-col>
			<el-col :span="16">
        <el-table :data="tplData"  row-key="nvPointId" highlight-current-row v-loading="listLoading" style="width: 100%;" id="tplList">
            <el-table-column type="index" label="#" width="60">
            </el-table-column>
            <el-table-column prop="nvPointName" label="导航点"  width="200" align="center">
            </el-table-column>
            <el-table-column prop="commandTypes" label="操作指令"  :formatter="formatCmd">
                <template scope="scope">
                  <el-tag v-for="item in formatCmd(scope.row)" :type="item.statu" :key="item.name" style="margin-right:5px">&nbsp;{{item.name}}&nbsp;</el-tag>
                </template>
            </el-table-column>
            <el-table-column
                label="操作"
                width="120"
                align="center">
                <template scope="scope">
                    <el-button
                    @click.native.prevent="deleteRow(scope.$index,tplData)"
                    type="text"
                    size="small">
                        移除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
      </el-col>
		</el-row>
    <el-dialog title="模版编辑" :visible.sync="dialogVisible" size="small">
        <CmdByArea :roomId ='filters.roomId' @addArea="addArea" @brachAdd="brachAdd" ref="cmd"/>
    </el-dialog>
	</section>
</template>
<script>
import  { mapState } from 'vuex'
import NProgress from "nprogress";
import { roadwayList, stagList } from "api/room";
import { templateList, createTaskTemplate, deleteTemplate } from "api/results";
import { CMDTYPES, CMDSTATUS } from "@/const";
import Sortable from "sortablejs";
import CmdByArea from 'components/cmdByArea';
import  { guid } from 'utils'
export default {
  components:{
     CmdByArea,
  },
  data() {
    return {
      filters: {
        roomId: ""
      },
      areaData: [],
      tplData: [],
      tplTreeData: [],
      listLoading: false,
      dialogVisible: false,
      cmdData: [],
      options: CMDTYPES,
      submitLoading: false,
      defaultProps: {
        children: "children",
        label: "templateName"
      },
      curTpl:'',
    };
  },
  computed:{
     ...mapState(['rooms','room'])
  },
  methods: {
    //获取模板
    getList() {
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
    deleteRow(index, rows) {
        rows.splice(index, 1);
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
    addArea(r){
       const index = this.tplData.findIndex(i=>i.nvPointId===r.nvPointId)
       if(index!==-1){
          this.tplData.splice(index,1);
       }else{
          this.tplData.push(r);
       }
    },
    brachAdd(arr){
      for(var i=0,l=arr.length;i<l;i++){
         let index =this.tplData.findIndex(item=>(item.nvPointId===arr[i].nvPointId));
         if(index>-1){
           this.tplData.splice(index,1);
         } 
         this.tplData.push(arr[i]);
      }
      this.dialogVisible = false;
    },
    handleAdd() {
      this.$prompt("请输入模板名称", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        showClose:false,
        inputPattern: /^(?![0-9])[\u4e00-\u9fa5a-zA-Z0-9]+$/,
        inputErrorMessage: "模板名称只能是中文、英文、数字组合，且不可以数字开头！" }).then(({ value }) => {
          this.tplTreeData[0].children.push({templateName:value,tempId:guid()})
      }).then()
    },
    cmdName(type) {
      return CMDTYPES.find(i => i.value == type).label;
    },
    editSubmit() {
        let _this = this;
        NProgress.start();
        let para = {
           templateName:_this.curTpl.templateName,
           roomId:_this.filters.roomId,
           details:JSON.stringify(_this.tplData),
           templateId:_this.curTpl.templateId?_this.curTpl.templateId:null,
        }
        
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
        return (<span>
                   <span>{node.label}</span>
                   <span style="float: right;margin-right:5px">
                       <el-button type="success"  size="mini" on-click={()=>this.handleAdd()}>添加模板</el-button>
                    </span>
                </span>);
      } else {
        return (
          <span>
            <span>
              <span style="display:inline-block;vertical-align:middle;max-width:40%;overflow:hidden;text-overflow: ellipsis;">{node.label}</span>
            </span>
            <span style="float: right;margin-right:5px">
             <el-button
                type="primary"
                size="mini"
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
    editTpl(store,data){
      this.$prompt("请输入模板名称", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputValue:data.templateName,
        showClose:false,
        inputPattern: /^(?![0-9])[\u4e00-\u9fa5a-zA-Z0-9]+$/,
        inputErrorMessage:"模板名称只能是中文、英文、数字组合，且不可以数字开头！"
      }).then(({ value }) => {
          this.tplTreeData[0].children.find(i=>(i.templateId===data.templateId||i.tempId===data.tempId)).templateName=value;
      })
    },
    changeTpl(data, node, store) {
      if(data.templateId||data.tempId){
        this.curTpl = data;
        this.tplData = data.details ? JSON.parse(data.details) : [];
      }else{
        this.curTpl = '';
        this.tplData =[];
      }
    },
    removeTpl(store, data) {
      var _this = this;
      this.$confirm("确认删除：" + data.templateName + "？", "提示", {
        //type: 'warning'
      }).then(
        () => {
          if(data.templateId){
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
          }else{
            let children=this.tplTreeData[0].children;
            let index = children.findIndex(i=>(i.tempId===data.tempId));
            children.splice(index,1);
          }
        },
        () => {}
      );
    },
    showArea(store, data) {
      this.dialogVisible = true;
      this.$nextTick(()=>{
           this.$refs.cmd.initial();
      })
    },
  },
  mounted() {
    this.filters.roomId = this.room;
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