<template>
	<section>
		<el-col :span="24" class="toolbar" lable-width='70'>
			<el-form :inline="true" :model="filters">
				<el-form-item label="巡检机房">
					<el-select style="width:90%" v-model="filters.roomId" @change="getTaskByRoom">
						<el-option v-for="item in rooms" :key="item.roomId" :label="item.roomName" :value="item.roomId">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button class="fa fa-refresh" type="primary" @click="getTaskByRoom">刷新</el-button>
				</el-form-item>
                <el-form-item>
					<el-button  type="primary" @click="tempTask">制定任务</el-button>
				</el-form-item>
			</el-form>
		</el-col>
		<template>
			<el-table :data="rows" highlight-current-row v-loading="listLoading">
				<el-table-column type="index" width="60" label="#" align="center">
				</el-table-column>
				<el-table-column prop="roomId" label="巡检机房" width="160" :formatter="formatRoom">
				</el-table-column>
        <el-table-column prop="robotId" label="巡检机器人"  align="center">
          <template scope="scope">
              <el-tag>{{formatRobot(scope.row.robotId)}}</el-tag>
          </template>
				</el-table-column>
				<el-table-column prop="details" label="导航点" align="center" min-width="180" :formatter="formatNav">
				</el-table-column>
          <el-table-column prop="startTime" label="开始时间" :formatter="formatTime" align="center">
          </el-table-column>
				<el-table-column  prop="cmd" label="操作" align="center" width="100">
          <template scope="scope">
              <i :class="scope.row.cmd?'fa fa-pause-circle-o cmd':'fa fa-play-circle-o cmd'" @click="handleTempTask(scope.row)"></i>
              <!-- <el-progress style="width:90%;float:right;margin-top:7px;"  :stroke-width="6" :percentage="70"></el-progress>  -->
          </template>   
				</el-table-column>
			</el-table>
		</template>
    <!--分页-->
		<el-col :span="24" class="toolbar" style="padding-bottom:10px;">
			<el-pagination 
				layout="prev, pager, next,total,sizes,jumper" 
				@current-change="handleCurrentChange" 
				:page-sizes="[10, 20, 30, 40]" 
				:page-size="size" 
				:current-page="page"
				:total="total" 
				style="float:right;"
				@size-change="handleSizeChange"
				>
			</el-pagination>
		</el-col>
    <!-- 临时任务 -->  
    <el-dialog title="临时任务" v-model="tempVisible" :close-on-click-modal="false" size="mini">
		<el-form :model="tempForm" label-width="80px" :rules="tempRules" ref="tempForm">
        <el-form-item prop="robotId" label="机器人">
          <el-select style="width:100%" v-model="tempForm.robotId"  placeholder="请选择机器人">
            <el-option v-for="item in robots" :key="item.roomId" :label="item.robotName" :value="item.robotId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="语音类型">
           <el-radio-group v-model="tempForm.type"  @change="changeType">
            <el-radio label="1">语音播报</el-radio>
            <el-radio label="2">带人讲解</el-radio>
          </el-radio-group>
        </el-form-item>
        <template v-if="tempForm.type==='1'">    
          <el-form-item prop="audioUrl"  label="音频文件">
              <el-select style="width:100%" v-model="tempForm.audioUrl" multiple placeholder="机房音频">
                <el-option v-for="item in audios" :key="item.fileId" :label="item.fileName" :value="item.fileUrl">
                </el-option>
              </el-select>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item prop="devs" label="讲解机柜" >
            <el-select style="width:100%" v-model="tempForm.devs" placeholder="请选择设备" multiple >
               <el-option v-for="item in devs" :key="item.deviceId" :label="item.deviceName" :value="item.deviceId">
              </el-option>
            </el-select>
          </el-form-item>
        </template>
      </el-form>
    
      <span slot="footer" class="dialog-footer">
        <el-button @click="tempVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleTempTask()">确 定</el-button>
      </span>
    </el-dialog>
	</section>
</template>

<script>
import NProgress from "nprogress";
import { parseTime } from "utils";
import { currentTask, sendTempTask } from "api/results";
import { roadwayList, stagList, getAudiosByRoom,devList } from "api/room";
import { TASKEXECTYPES, CMDTYPES, CMDSTATUS } from "@/const";
import Sortable from "sortablejs";

export default {
  data() {
    var checkNull = (rule, value, callback) => {
      setTimeout(() => {
        if (!value || !value.replace(/(^\s*)|(\s*$)/g, "")) {
          callback(new Error("请输入任务名称"));
        } else {
          callback();
        }
      }, 500);
    };
    return {
      filters: {
        roomId: ""
      },
      rows: [],
      currentRoom: "",
      rooms: [],
      robots: [],
      listLoading: false,
      total: 0,
      page: 1,
      size: 10,
      tempVisible: false,
      robots: [],
      audios: [],
      devs:[],
      tempForm: {
        robotId: "",
        audioUrl: [],
        type:'',
        devs:[]
      },
      tempRules: {
        robotId: [
          { required: true, message: "请选择机器人", trigger: "change" }
        ],
        nvPointName:[{
          required: true, type:'array', message: '导航点不可为空',trigger:'change'
        }],
        audioUrl: [{ 
          required: true, type:'array', message: "播放文件不可为空", trigger: "change" 
        }],
        devs: [{ 
          required: true, type:'array', message: "设备不能为空", trigger: "change" 
        }]
      }
    };
  },
  methods: {
    sortPoint(obj) {
      this.cmdData.reverse();
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getTaskByRoom();
    },
    formatNav(r, c) {
      let taskDetails = JSON.parse(r.taskDetails);
      return taskDetails.nvPointName;
    },
    handleSizeChange(size) {
      this.page = 1;
      this.size = size;
      this.getTaskByRoom();
    },
    getTaskByRoom() {
      let id = this.filters.roomId;
      this.currentRoom = this.rooms.find(i => i.roomId ===id);
      let para = {
        roomId: this.filters.roomId,
        page: this.page,
        pageSize: this.size,
        taskType: "2"
      };
      this.listLoading = true;
      NProgress.start();
      let self = this;
      currentTask(self, para).then(res => {
        if (res.data.data) {
          this.rows = res.data.data ? res.data.data.list.map(r=>({...r,cmd:true,})) : [];
          
          this.total = res.data.data.total;
        } else {
          this.rows = [];
          this.total = 0;
        }
        this.listLoading = false;
        NProgress.done();
      });
    },
    getRooms() {
      this.rooms = this.$store.state.rooms;
      this.filters.roomId = this.$store.state.robotId.roomId;
    },
    formatRoom() {
      return this.currentRoom.roomName;
    },
    formatRobot(id) {
      let robot = this.currentRoom.robotList.find(i => i.robotId === id);
      return robot ? robot.robotName : id;
    },
    formatTime(r) {
      return parseTime(r.startTime);
    },
   
    changeType(v){
      if(v==='2'){
        this.tempForm.areaId='';
        this.tempForm.nvPointName=[];
        this.tempForm.audioUrl =[];
        let _this = this;
         devList(_this,{roomId:this.filters.roomId,page:1,pageSize:0}).then(res => {
            if(res.body.data){
              this.devs=res.body.data.list.filter(i=>{if(i.audioUrl&&i.point){ return i}});
            }
         })
      }else{
        this.tempForm.devs=[];
      }
    },
    tempTask() {
      let _this = this;
      (this.tempForm = {
        robotId: "",
        nvPointName: [],
        audioUrl: [],
        type:'1',
        devs:[],
      }),
        (this.robots = this.rooms.find(
          i => i.roomId === _this.filters.roomId
        ).robotList);
      getAudiosByRoom(_this, {
        roomId: this.filters.roomId,
        taskType: "4"
      }).then(res => {
        if (res.body.result == 200) {
          this.audios = res.body.data ? res.body.data : [];
          this.tempVisible = true;
        }
      });
      
    },
    handleTempTask(r) {
      let _this = this;
      if (r) {
        let flag = r.cmd?"_1":"_2"
        let param = {
          ...JSON.parse(r.taskDetails),
          command: r.cmd ? "5" : "6",
          taskId:r.taskId+flag
        };
        sendTempTask(_this, param).then(res => {
           let msg = r.cmd?"暂停":"播放"
          if (res.body.result === 200) {
            _this.$message({
              message: msg+"下发成功",
              type: "success"
            });
            r.cmd = !r.cmd
          } else {
            this.$message.error(msg+"下发失败");
          }
          this.tempVisible = false;
        });
      } else {
        this.$refs.tempForm.validate(valid => {
          if (valid) {
            let param = null;
            if(_this.tempForm.type==='1'){
              param = {
              customId: _this.$store.state.user.customId,
              nvPointName: "",
              audioUrl: _this.tempForm.audioUrl.join(","),
              command: "2",
              robotId: _this.tempForm.robotId,
              roomId: this.filters.roomId
              }
            }else{
              let points =[],audios=[],devices = this.tempForm.devs,l= devices.length, devs = this.devs;
              for(var i=0;i<l;i++){
                ((i)=>{
                let dev = devs.find(item=>(item.deviceId===devices[i]));
                     points.push(dev.point.nvPointName);
                     audios.push(dev.audioUrl);  
                })(i)  
              }
              param={
                  customId: _this.$store.state.user.customId,
                  nvPointName: points.join(','),
                  audioUrl: audios.join(","),
                  command: "2",
                  robotId: _this.tempForm.robotId,
                  roomId: this.filters.roomId 
              }
            }
            sendTempTask(_this, param).then(res => {
              if (res.body.result === 200) {
                _this.$message({
                  message: "临时任务下发成功",
                  type: "success"
                });
              } else {
                this.$message.error("临时任务下发失败");
              }
              this.tempVisible = false;
              this.getTaskByRoom();
            });
          }
        });
      }
    }, 
  },
  mounted() {
    this.getRooms();
  }
};
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
.sign {
  text-indent: 1rem;
  height: 30px;
  line-height: 30px;
  background: rgb(38, 144, 243);
  color: #fff;
  border: 1px solid transparent;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}
.tpl {
  padding: 10px;
  border: 1px solid rgba(250, 250, 250, 0.15);
  border-radius: 4px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  line-height: 9px;
}
.cmd {
  font-size: 20px;
  color: #00ffff;
  cursor:default,
}
</style>