<template>
<section>
   <el-row>
      <el-col :span="12">
          当前任务名称:&emsp; {{taskName}} &emsp;&emsp;<el-button size="small">切换任务</el-button>
      </el-col>
    </el-row>
    <el-row>
        <el-col :span="6">
            <div class="working-box">视频</div>
            <div class="working-box">轨迹</div>
        </el-col>
        <el-col :span="18">
            <el-table
                :data="tableData"
                stripe
                style="width: 100%">
                <el-table-column
                prop="date"
                label="日期"
                width="180">
                </el-table-column>
                <el-table-column
                prop="name"
                label="姓名"
                width="180">
                </el-table-column>
                <el-table-column
                prop="address"
                label="地址">
                </el-table-column>
            </el-table>
        </el-col>
    </el-row>
   </section> 
</template>
<script>
export default {
  name: "",
  data() {
    return {
      taskName: "one",
      tableData: [
        {
          date: "2016-05-02",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄"
        },
        {
          date: "2016-05-04",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1517 弄"
        },
        {
          date: "2016-05-01",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1519 弄"
        },
        {
          date: "2016-05-03",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1516 弄"
        }
      ]
    };
  },
  methods: {}
};
</script>
<style>
.working-box {
  width: 300px;
  height: 300px;
  margin: 0 auto;
  margin-bottom: 20px;
  border: 1px solid #ccc;
}
</style>

