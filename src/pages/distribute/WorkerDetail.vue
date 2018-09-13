<template>
	<section>
		<div class="toolbar">
			<el-col :span="12">
				当前任务名称:&emsp; {{taskName}} &emsp;&emsp;
				<router-link :to="{path:'taskDetail'}" >
					     <el-button type="info" icon="d-arrow-left" size="small">任务切换</el-button>
			    </router-link>
			</el-col>
		</div>
		<el-row :gutter="20">
			<el-col :span="6">
				<div class="working-box"></div>
			</el-col>
			<el-col :span="6">
				<div class="working-box"></div>
			</el-col>
			<el-col :span="12">
				<div class="log-view">
				</div>
			</el-col>
		</el-row>
		<table width="100%" border="1" cellspacing="0" colspacing="0" class="table">
			<tr>
				<th>导航点</th>
				<th>指令名称</th>
				<th>指令类型</th>
				<th>执行情况</th>
				<th style="width:40%">执行结果</th>
			</tr>
			<template v-for="point in tableData">
        <tr v-for="(cmd,index) in point.details" :key="cmd.id">
            <td :rowspan="point.details.length" v-if="index<1">{{point.nvPointName}}</td>
            <td>{{cmd.commandInfo.commandName}}</td>
            <td><el-tag :type="types[cmd.commandInfo.commandType+'']">{{formatType(cmd.commandInfo.commandType)}}</el-tag></td>
            <td><el-tag type="danger">{{formatStatus(cmd.commandStatus)}}</el-tag></td>
            <td>{{"无"}}</td>
			  </tr>
			</template>
		</table>
	</section>
</template>
<script>
import { currentTaskDetail } from "api/results";
import { TASKEXECTYPES, CMDTYPES, CMDSTATUS} from "@/const";
export default {
  name: "",
  data() {
    return {
      taskName: "one",
      tableData: [],
      types:CMDSTATUS,
    };
  },
  methods: {
    getCurrentTaskDetail(taskId) {
      let _this = this;
      currentTaskDetail(_this, { taskId }).then(res => {
        if (res.data.result === 200) {
          _this.tableData = res.data.data;
        } else {
          _this.tableData = [];
          _this.$message.error("获取任务详情失败");
        }
      });
    },
    formatType(type) {
      return CMDTYPES.find(i=>(i.value==type)).label;
    },
    formatStatus(type) {
      return TASKEXECTYPES[type + ""];
    }
  },
  mounted() {
    const taskId = this.$route.query.taskId;
    this.getCurrentTaskDetail(taskId);
  }
};
</script>
<style>
.working-box {
  width: 100%;
  height: 300px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
}
.log-view {
  width: 100%;
  height: 300px;
  background-color: #000;
}
.table {
  color: #fff;
  background: rgba(0, 0, 0, 0.35);
  border: none;
}
.table td,
.table th {
  border-color: rgba(250, 250, 250, 0.35);
  text-align: center;
  line-height: 34px;
  font-size: 14px;
}
</style>