<template>
	<section>
		<el-row :gutter="20">
			<el-col :span="6">
				<el-tree style="min-height:80vh;" @node-click="changeArea" default-expand-all highlight-current :data="roadwayData" :props="defaultProps" node-key="id" accordion :expand-on-click-node="false">
				</el-tree>
			</el-col>
			<el-col :span="18">
				<el-form :inline="true" :model="formInline" class="tpl" label-width="80px">
					<el-col :span="13">
						<el-form-item label="指令类型">
							<el-select v-model="types" multiple placeholder="请选择" @change="filterType" style="width:160%">
								<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
								</el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="9" >
						<el-form-item label="选取项">
							<el-select v-model="values" multiple placeholder="请选择" @change="handleSelectedAction" style="width:160%">
								<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
								</el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="2">
						<el-form-item>
							<el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
						</el-form-item>
					</el-col>
				</el-form>
				<el-table :data="stagData" style="margin-bottom:20px;" height="400" v-loading="stagLoading"  highlight-current-row>
					<el-table-column type="index" width="50">
					</el-table-column>
					<el-table-column prop="nvPointName" label="导航点名称">
					</el-table-column>
					<el-table-column prop="orderId" label="排序" width="120">
					</el-table-column>
					<el-table-column prop="x" label="X坐标" width="100">
					</el-table-column>
					<el-table-column prop="y" label="Y坐标" width="100">
					</el-table-column>
					<el-table-column property="commandTypes" label="导航点指令">
						<template scope="scope">
							<el-checkbox-group v-model="scope.row.actions">
								<el-checkbox v-for="type in scope.row.commandTypes" :label="`${type}`" :key="type" @change="handleCheckedActionChange">{{cmdName(type)}}</el-checkbox>
							</el-checkbox-group>
						</template>
					</el-table-column>
				</el-table>
				<el-form class="tpl" :inline="true" :model="formInline" style="padding-left:5px;" lable-width="80px">
					<el-form-item label="模版名称">
						<el-input v-model="formInline.taskName" placeholder="请输入模版名称"></el-input>
					</el-form-item>
					<el-form-item label="制作人">
						<el-input v-model="formInline.user" placeholder="制作人"></el-input>
					</el-form-item>
					<el-form-item label="备注">
						<el-input v-model="formInline.remark"></el-input>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click.native="editSubmit">保存</el-button>
					</el-form-item>
				</el-form>
				<el-table :data="rfidData" style="width: 100%">
					<el-table-column prop="templateName" label="模板名称" width="180">
					</el-table-column>
					<el-table-column prop="user" label="制作人" width="180">
					</el-table-column>
					<el-table-column prop="createTime" label="创建时间">
					</el-table-column>
					<el-table-column prop="remark" label="备注">
					</el-table-column>
				</el-table>
			</el-col>
		</el-row>
	</section>
</template>
<script>
import { roadwayList, stagList } from "api/room";
import { CMDTYPES } from "@/const";

export default {
  data() {
    return {
      roadwayData: [],
      defaultProps: {
        children: "rbAreaInfoList",
        label: "areaName"
      },
      options: CMDTYPES,
      types: [],
      values: [],
      isIndeterminate: true,
      checkAll: true,
      stagLoading: false,
      stagData: [],
      rfidData: [],
      formInline: {
        taskName: "",
		user: this.$store.state.user.account
		
		
		,
        remark: ""
      }
    };
  },
  methods: {
    handleNodeClick(data) {},
    handleCheckAllChange(e) {
      const state = e.target.checked;
      this.stagData.map(item => {
        item.actions = state ? item.commandTypes.map(m =>(m+'')) : [];
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
        this.stagData.some(item => item.actions.length < item.commandTypes.length);
    },
    filterType() {
      const types = this.types;
      if (types.length === 0) {
        this.stagData = this.originalData;
      } else {
		   
        this.stagData = this.originalData.filter(item => {
          return item.commandTypes.some(i => types.includes(i+""));
        });
      }
    },
    handleSelectedAction() {
      const values = this.values;
      this.stagData.map(item => {
        item.actions = [];
        item.commandTypes.forEach(m => {
          if (values.includes(m+"")) {
            item.actions.push(m+"");
          }
        });
        return item;
      });
      this.handleCheckedActionChange();
    },
    getRoadway() {
      let self = this;
      roadwayList(self, {
        customerId: self.$store.state.user.customId
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
    cmdName(type) {
      return CMDTYPES.find(i => i.value == type).label;
    },
    changeArea(data, node, store) {
      if (!data.parentId) return;
      this.currentAreaNode = data;
      this.getStag();
    },
    getStag() {
      let _this = this;
      (this.stagLoading = true),
        stagList(_this, {
          areaId: _this.currentAreaNode.areaId
        }).then(res => {
          if (res.data.result === 200) { 
            this.stagData = this.originalData = res.data.data?res.data.data.filter(r => r.commandTypes.length > 0).map(i => { i.actions = []; return i}):[];
          } else {
            this.stagData = this.originalData = [];
            this.$message.error("导航点获取失败");
          }
          this.stagLoading = false;
        });
	},
	editSubmit(){
		console.log(this.formInline);
		console.log(this.stagData.filter(i=>(i.actions.length>0)));
	}
  },
  mounted() {
    this.getRoadway();
  }
};
</script>
<style scoped>
.tpl {
  background: #9da4b7;
  padding: 5px 0;
  border: 1px solid #dee5e7;
  border-radius: 4px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 20px;
}

.custom-theme .el-form-item {
  margin: 0;
}

.rfid-action {
  margin-right: 10px;
}
</style>