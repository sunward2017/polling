<template>
  <section>
      <el-row :gutter="16">
          <el-col :span="5">
              <el-tree style="height:80vh; margin-bottom:20px;overflow-y:auto;border:1px solid green;" @node-click="changeArea" default-expand-all highlight-current :data="areaData" :props="defaultProps" node-key="id" accordion :expand-on-click-node="false" :render-content="renderContent">
			  </el-tree>
          </el-col>
          <el-col :span="19">
             <div class="container">
                <div class="pannel">
                   <p>导航点:{{1}} </p>
                   <p>排序:{{12}}emsp;emsp; 坐标：{{1234}},{{5678}}</p>
                   <div class="label">指令集</div>
                   <div class="cmdGather">
                      <template>
                        <el-tag>
                          
                        </el-tag>
                      </template> 
                   </div>  
                </div>
             </div>
          </el-col>
      </el-row>  
  </section>
</template>
<script>
import NProgress from "nprogress";
import { CMDTYPES } from "@/const";
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
  deleteArea
} from "api/room";
import { mapState } from "vuex";
export default {
  data() {
    return {
      areaData: [],
      defaultProps: {
        children: "rbAreaInfoList",
        label: "areaName"
      },
      navData: [],
      currentAreaNode:{}
    };
  },
  computed: mapState(["user"]),
  methods: {
    getArea() {
      let self = this;
      roadwayList(self, {
        customerId: self.user.customId
      }).then(res => {
        if (res.data.result === 200) {
          self.areaData = res.data.data.map(item => {
            item.areaName = item.roomName;
            return item;
          });
        } else {
          self.areaData = [];
        }
      });
    },
    changeArea(data, node, store) {
      if (!data.parentId) return;
      this.currentAreaNode = data;
      this.workerData = [];
      this.getNav();
    },
    renderContent(h, { node, data, store }) {
      if (data.rbAreaInfoList) {
        return (
          <span>
            <span>
              <span>{node.label}</span>
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
              <span>{node.label}</span>
            </span>
            <span style="float: right; margin-right: 20px">
              <el-button
                type="warning"
                size="mini"
                on-click={() => this.removeRoadway(store, data)}
              >
                删除巷道
              </el-button>
            </span>
          </span>
        );
      }
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
            NProgress.start();
            _this.areaSubmitLoading = false;
            if (res.body.result == 200) {
              _this.getArea();
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
      this.$confirm("确认删除：" + data.areaName + "？", "提示", {}).then(
        () => {
          NProgress.start();
          deleteArea(_this, {
            areaId: data.areaId
          }).then(res => {
            if (res.data.result === 200) {
              _this.$message({
                message: "删除成功",
                type: "success"
              });
            } else {
              _this.$message.error("删除失败");
            }
            _this.getArea();
          });
        }
      );
    },
    getNav() {
      let _this = this;
      this.navLoading = true;
      stagList(_this, {
        areaId: _this.currentAreaNode.areaId
      }).then(res => {
        if (res.data.result === 200) {
          this.navData = res.data.data;
        } else {
          this.stagData = [];
          this.$message.error("导航点获取失败");
        }
        this.stagLoading = false;
      });
    }
  },
  mounted() {
    this.getArea();
  }
};
</script>
<style lang="less">
.container {
  width: 100%;
  background: rgba(0, 0, 0, 0.35);
}
</style>

