<template>
  <section>
       <el-col :span="24" class="toolbar">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-select v-model="filters.roomId" style="width:90%" @change="getDevList">
						<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
						</el-option>
					</el-select>
				</el-form-item>
        <el-form-item>
           <el-input v-model="filters.deviceName" placeholder="请输入设备名称"></el-input>
        </el-form-item>
				<el-form-item>
          <el-button class="filter-item" icon="search" type="primary" @click="getDevList">查询</el-button>
					<el-button class="filter-item" icon="plus" type="success" @click="handleAdd">新增</el-button>
				</el-form-item>
				<el-form-item>
					<el-button icon="upload2" type="info" @click="handleUpload">导入设备EXCEL</el-button>
				</el-form-item>
			</el-form>
		</el-col>
		  
      <el-table :data="devRows" v-loading="devListLoading">
			<el-table-column type="index" width="60" label="#" align="center"></el-table-column>
			<el-table-column prop="deviceName" label="机柜名称"   align="center"> </el-table-column>
			<el-table-column  prop="nvPointId" label="导航点" :formatter="formatStag" align="center">
			</el-table-column>
			<el-table-column prop="units" label="总U位数"   align="center">
			</el-table-column>
      <el-table-column prop="action" label="语音讲解"  align="left">
				<template scope="scope">
          <el-upload
              class="upload"
             :action="uploadUrl"
             :data="{deviceId:scope.row.deviceId}"
             :file-list="fileList"
             :before-upload ="handlePreview"
             :on-success="handleSuccess"
             :on-error="handleError"
           >
					  <el-button  type="text" size="small">点击上传</el-button>
          </el-upload>
				</template>
			</el-table-column>
      <el-table-column prop="audioUrl" label="语音标记"   align="center">
          <template scope="scope">
              <el-tag  :type="scope.row.audioUrl?'success':'danger'"  style="cursor:pointer" @click.native="showAudio(scope.row)">
                  {{scope.row.audioUrl?'播放':'未上传'}}
              </el-tag>
          </template>
			</el-table-column>
			<el-table-column prop="action" label="操作" width="240" align="center">
				<template scope="scope">
					  <el-button size="small" icon="edit" @click="handleEdit(scope.row)">编辑</el-button>
			    	<el-button type="warning" icon="delete" size="small" @click="handleDel(scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
    <!--分页-->
		<el-col :span="24" class="toolbar" style="padding-bottom:10px;">
			<el-pagination layout="prev, pager, next,total,sizes,jumper" @current-change="handleCurrentChange" :page-sizes="[10, 20, 30, 40]" :page-size="size" :current-page="page" :total="total" style="float:right;" @size-change="handleSizeChange">
			</el-pagination>
		</el-col>
		<el-dialog title="设备编辑" v-model="devFormVisible" top="25%" size="tiny">
       <el-form label-width="80px"  :model="devEditForm" ref="editForm" :rules="rules">
				 <el-form-item label="机房名称" prop="roomId" >
					<el-select v-model="devEditForm.roomId" style="width:100%" @change="getStagList"> 
              <el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
					   </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="设备名称" prop="deviceName" >
					<el-input v-model="devEditForm.deviceName"></el-input>
				</el-form-item>
				<el-form-item label="导航点" prop="nvPointId" >
				   <el-select v-model="devEditForm.nvPointId" style="width:100%" clearable>
            <el-option v-for="item in points" :key="item.nvPointId" :label="item.nvPointName" :value="item.nvPointId">
					  </el-option>
				   </el-select>
				</el-form-item>
        <el-form-item label="U位数" prop="units">
				   <el-input v-model.number="devEditForm.units" placeholder="范围1~99数值"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer">
			   <el-button @click="devFormVisible = false">取 消</el-button>
         <el-button type="primary" @click.native="editSubmit" v-loading="subLoading">提交</el-button>
			</div>
		 </el-dialog>
		<el-dialog title="上传设备EXCEL" v-model="uploadVisible" size="tiny" top="25%">
			<Upload @closeUp="closeUp"></Upload>
		</el-dialog>
    <el-dialog title="语音播放" v-model="audioVisible" size="small" top="25%">
      <audio class="audio" id="audio" controls="" preload="">
				<source :src="audioUrl">
			</audio>
    </el-dialog>
 </section>		 
</template>

<script>
// import util from '../../common/util'
import NProgress from "nprogress";
import {
  devList,
  stagList,
  saveDevices,
  delDevice
} from "api/room";
import Upload from "components/upload/upload";
import { uploadAudioUrl } from "api/api";

export default {
  components: {
    Upload
  },
  data() {
    var checkNum = (rule, value, callback) => {
      setTimeout(() => {
        if (!Number.isInteger(value)) {
          callback(new Error("请输入数字型"));
        } else if (value < 0 || value > 99) {
          callback(new Error("输入的数值已超出范围"));
        } else {
          callback();
        }
      }, 0);
    };
    return {
      filters: {
        roomId: "",
        deviceName: ""
      },
      total: 0,
      page: 1,
      size: 10,
      uploadUrl: uploadAudioUrl,
      rooms: [],
      devRows: [],
      uploadVisible: false,
      devListLoading: false,
      points: [],
      devEditForm: {},
      devFormVisible: false,
      rules: {
        roomId: [{ required: true, message: "请选择机房", trigger: "change" }],
        deviceName: [
          { required: true, message: "请输入设备名称", trigger: "change" }
        ],
        nvPointId: [
          { required: true, message: "请选择导航点", trigger: "change" }
        ],
        units: [{ required: true, validator: checkNum, trigger: "change" }]
      },
      fileList: [],
      audioVisible: false,
      audioUrl: null,
      subLoading: false
    };
  },
  methods: {
    getRooms() {
      this.rooms = this.$store.state.rooms;
      let id = (this.filters.roomId = this.$store.state.room);
      this.getStagList(id);
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getDevList();
    },
    handleSizeChange(size) {
      this.page = 1;
      this.size = size;
      this.getDevList();
    },
    getDevList() {
      let _this = this;
      NProgress.start();
      this.devListLoading = true;
      let para = {
        roomId: _this.filters.roomId,
        deviceName: _this.filters.deviceName,
        page: _this.page,
        pageSize: _this.size
      };
      devList(_this, para).then(res => {
        NProgress.done();
        this.devListLoading = false;
        if (res.data.data) {
          this.total = res.body.data.total;
          this.devRows = res.data.data.list;
        } else {
          this.devRows = [];
          this.total = 0;
        }
      });
    },
    handleAdd() {
      this.devEditForm = { roomId: this.filters.roomId };
      this.devFormVisible = true;
      this.getStagList();
    },
    handleEdit(r) {
      this.devEditForm = {
        ...r,
        nvPointId: r.nvPointId != "undefined" ? r.nvPointId : ""
      };
      this.devFormVisible = true;
    },
    editSubmit() {
      let _this = this;

      _this.$refs.editForm.validate(valid => {
        if (valid) {
          _this.$confirm("确认提交吗？", "提示", {}).then(() => {
            _this.subLoading = true;
            _this.devEditForm.customerId = _this.$store.state.user.customId;
            let para = {
              roomId: _this.devEditForm.roomId,
              nvPointId: _this.devEditForm.nvPointId,
              deviceName: _this.devEditForm.deviceName,
              units: _this.devEditForm.units
            };
            if (_this.devEditForm.deviceId) {
              para.deviceId = _this.devEditForm.deviceId;
            }
            saveDevices(_this, para).then(res => {
              _this.subLoading = false;
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
          }).catch(()=>{});
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
        if (res.data.data) {
          this.points = res.data.data.map(i => ({
            nvPointName: i.nvPointName,
            nvPointId: i.nvPointId
          }));
        } else {
          this.points = [];
        }
      });
    },
    handlePreview(file) {
      var strRegex = "(.CD|.OGG|.MP3)$";
      var reg = new RegExp(strRegex);
      if (reg.test(file.name.toUpperCase())) {
        return true;
      } else {
        this.$notify.info({
          title: "提示",
          message: "文件格式不正确",
          duration: 2000,
          offset: 300
        });
        return false;
      }
    },
    handleSuccess(response, file, fileList) {
      this.$notify.success({
        title: "成功",
        message: "文件上传成功",
        duration: 2000,
        offset: 300
      });
      this.getDevList();
      this.fileList = [];
    },
    handleError(e, file, fileList) {
      this.$notify.error({
        title: "失败",
        message: "文件上传失败",
        duration: 2000,
        offset: 300
      });
      this.fileList = [];
    },
    formatStag(r, c) {
      return r.point ? r.point.nvPointName : "";
    },
    handleUpload() {
      this.uploadVisible = true;
    },
    closeUp() {
      this.uploadVisible = false;
    },
    showAudio(r) {
      if (r.audioUrl) {
        this.audioUrl = r.audioUrl;
        this.audioVisible = true;
        this.$nextTick(() => {
          document.getElementById("audio").load();
        });
      }
    }
  },
  mounted() {
    this.getRooms();
  }
};
</script>
<style scoped>
.upload {
  display: flex;
  align-items: center;
}
.audio {
  width: 100%;
  display: block;
  background: rgb(1, 41, 41);
  height: 32px;
  color: #fff;
}
</style>