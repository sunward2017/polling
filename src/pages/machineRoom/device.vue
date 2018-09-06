<template>
  <section>
       <el-col :span="24" class="toolbar">
			<el-form :inline="true" :model="filters">
				<el-col :span="4">
					<el-select v-model="filters.roomId" style="width:90%" @change="getDevList">
						<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
						</el-option>
					</el-select>
				</el-col>
				<el-form-item>
					<el-button icon="search" v-on:click="getDevList">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button class="filter-item" icon="plus" type="success" @click="handleAdd">新增</el-button>
				</el-form-item>
				<el-form-item>
					<el-button icon="upload2" type="info" @click="handleUpload">导入设备EXCEL</el-button>
				</el-form-item>
			</el-form>
		</el-col>
		 <el-table :data="devRows" v-loading="devListLoading">
			<el-table-column prop="index" label="#" width="50"> </el-table-column>
			<el-table-column prop="deviceName" label="设备名称" width="220"> </el-table-column>
			<el-table-column  prop="nvPointId" label="导航点" width="180" :formatter="formatStag">
			</el-table-column>
			<el-table-column prop="name" label="姓名" width="300">
			</el-table-column>
			<el-table-column prop="address" label="地址">
			</el-table-column>
			<el-table-column prop="action" label="操作" width="200">
				<template scope="scope">
					<el-button size="small" icon="edit" @click="handleEdit(scope.row)">编辑</el-button>
			    	<el-button type="warning" icon="delete" size="small" @click="handleDel(scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		 <el-dialog title="设备编辑" v-model="devFormVisible" top="25%" size="tiny">
            <el-form label-width="80px"  :model="devEditForm" ref="editForm">
				 <el-form-item label="名称" prop="roomId" required>
					<el-select v-model="devEditForm.roomId" style="width:100%">
                       <el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
					   </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="设备名称" prop="deviceName" required>
					<el-input v-model="devEditForm.deviceName"></el-input>
				</el-form-item>
				<el-form-item label="导航点" prop="nvPointId" required>
				   <el-select v-model="devEditForm.nvPointId" style="width:100%">
                      <el-option v-for="item in points" :key="item.nvPointId" :label="item.nvPointName" :value="item.nvPointId">
					  </el-option>
				   </el-select>
				</el-form-item>
			</el-form>
			<div slot="footer">
			   <el-button @click="devFormVisible = false">取 消</el-button>
               <el-button type="primary" @click.native="editSubmit">提交</el-button>
			</div>
		 </el-dialog>
		<el-dialog title="上传设备EXCEL" v-model="uploadVisible" size="tiny" top="25%">
			<Upload @closeUp="closeUp"></Upload>
		</el-dialog>
 </section>		 
</template>

<script>
// import util from '../../common/util'
import NProgress from "nprogress";
import {
  getRoomList,
  devList,
  stagList,
  saveDevices,
  delDevice
} from "api/room";
import Upload from "components/upload/upload";

export default {
  components: {
    Upload
  },
  data() {
    return {
      filters: {
        roomId: ""
      },
      rooms: [],
      devRows: [],
      uploadVisible: false,
      devListLoading: false,
      points: [],
      devEditForm: {},
      devFormVisible: false
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
      getRoomList(self, para).then(res => {
        if (res.data.data) {
          this.rooms = res.body.data.rows;
          let id = (this.filters.roomId = this.rooms[0].roomId);
          this.getStagList(id);
        }
      });
    },
    getDevList() {
      let _this = this;
      NProgress.start();
      this.devListLoadingb = true;
      devList(_this, { roomId: _this.filters.roomId }).then(res => {
        NProgress.done();
        this.devListLoadingb = false;
        if (res.data.result === 200) {
          this.devRows = res.data.data;
        } else {
          this.devRows = [];
        }
      });
    },
    handleAdd() {
      this.devEditForm = { roomId: this.filters.roomId };
      this.devFormVisible = true;
      this.getStagList();
    },
    handleEdit(r) {
	  this.devEditForm = { ...r };
	  delete this.devEditForm.point
      this.devFormVisible = true;
    },
    editSubmit() {
      let _this = this;
      _this.$refs.editForm.validate(valid => {
        if (valid) {
		  _this.devEditForm.customerId = _this.$store.state.user.customId;
          saveDevices(_this, _this.devEditForm).then(res => {
            if (res.data.result === 200) {
              _this.$message({
                message: "保存成功",
                type: "success"
              });
            } else {
              _this.$message.error("保存失败，请重试");
            }
            _this.devFormVisible = false;
            _this.getDevList();
          });
        }
      });
    },
    handleDel(row) {
      var _this = this;
      this.$confirm("确认删除设备: " + row.deviceName + "？", "提示", {
        type: "danger"
      }).then(() => {
        NProgress.start();
        let para = {
          deviceId: row.deviceId
        };
        delDevice(_this, para).then(res => {
          NProgress.done();
          if (res.data.result === 200) {
            _this.$notify({
              title: "成功",
              message: "删除成功",
              type: "success"
            });
          } else {
            _this.$notify({
              title: "失败",
              message: res.body.message,
              type: "error"
            });
          }
          _this.getDevList();
        });
      });
    },
    getStagList(id) {
      let _this = this;
      let roomId = id || _this.devEditForm.roomId;
      stagList(_this, { roomId }).then(res => {
        if (res.data.result === 200) {
          this.points = res.data.data.map(i => ({
            nvPointName: i.nvPointName,
            nvPointId: i.nvPointId
          }));
        } else {
          this.points = [];
        }
      });
    },

    formatStag(r, c) {
      const stag = this.points.find(c => c.nvPointId === r.nvPointId);
      return stag ? stag.nvPointName : "未知";
    },
    handleUpload() {
      this.uploadVisible = true;
    },
    closeUp() {
      this.uploadVisible = false;
    }
  },
  mounted() {
    this.getRooms();
  }
};
</script>

<style scoped>
</style>