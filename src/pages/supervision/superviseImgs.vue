<template>
  <section>
    <el-form :inline="true" v-model="filters" class="toolbar">
      <el-form-item>
        <el-select v-model="filters.roomId" placeholder="请选择机房" @change="changeRoom">
          <el-option
            v-for="item in rooms"
            :key="item.roomId"
            :label="item.roomName"
            :value="item.roomId"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="filters.robotId" placeholder="请选择机器人" @change="changeRobot">
          <el-option
            v-for="item in robots"
            :key="item.roomId"
            :label="item.robotName"
            :value="item.robotId"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
         <el-date-picker
            v-model="filters.dateArea"
            type="datetimerange"
            :picker-options="pickerOptions"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button icon="search" type="primary" @click.native="getList">查询</el-button>
      </el-form-item>
    </el-form>
    <el-row class="section" >
      <template v-for="(imgs,key) in imgGather">
         <div
            class="floor-item-content-wrap"
            v-for="item in imgs"
            :key="item.fileUrl"
            :style="{background:bgGather[key]}"
          >
            <img class="floor-item-img" v-lazy="baseImgUrl+item.thumbnailUrl">
            <div class="floor-item-title" >
              <span @click="showBigImg(item.timeStamp,item.fileUrl)">点击看原始图</span>
            </div>
            <div>{{ item.timeStamp}}</div>
          </div>
      </template>
    </el-row>
    <!--分页-->
    <el-col class="toolbar" :span="24"  style="padding-bottom:10px;">
        <el-pagination layout="prev, pager, next,total,sizes,jumper" @current-change="handleCurrentChange" :page-sizes="[18, 24, 30, 36]" :page-size="size" :current-page="page" :total="total" style="float:right;" @size-change="handleSizeChange">
        </el-pagination>
    </el-col>
    <el-dialog :title="bigImgTitle" v-model="bigImgVisible" style="text-align: center;" :size="dialogSize" >
      <img :src="currentUrl" alt="异常图片,无法识别" width="100%" @click="changeSize()">
    </el-dialog>
  </section>
</template>
<script>
import NProgress from "nprogress";
import { parseTime,randomColor } from "utils";
import { getFilesByRoom } from "api/room";
import { baseImgUrl } from "api/api";
import { mapState } from "vuex";

export default {
  data() {
    return {
      filters: {
        roomId: "",
        robotId: "",
        dateArea:[new Date(new Date().getTime()-3600*1000*24*7),new Date()],
      },
      colors:['#354788','#2aad3b','#7350f1','#3fc081','#ff8d1c','#324654','#7aacdf','#104aae','#3bb8e8','#fdd51d',],
      bgGather:{},
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
      }],
      },
      baseImgUrl: baseImgUrl,
      robots: [],
      imgGather: [],
      bigImgTitle: "随工截图",
      currentUrl: "",
      dialogSize: "small",
      bigImgVisible: false,
      total: 0,
      page: 1,
      size:24,
      lastIndex:0, 
    }
  },
  computed: {
    ...mapState(["rooms", "room"])
  },
  methods: {
    changeRoom(v) {
      this.robots = this.rooms.find(i => i.roomId === v).robotList;
      this.filters.robotId = this.robots.length > 0 ? this.robots[0].robotId : "";
    },
    formatTTime(t) {
      return parseTime(t, "{y}-{m}-{d} {h}:{i}:{s}");
    },
    changeRobot() {
       this.getList()
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getList();
    },
    handleSizeChange(size) {
				this.page = 1;
				this.size = size;
				this.getList();
		},
    getList() {
      NProgress.start();
      let self = this,
        para = {
          page: this.page,
          pageSize:this.size,
          robotId: this.filters.robotId,
          fileType: "7",
          starttime:parseTime(this.filters.dateArea[0], '{y}-{m}-{d} {h}:{i}:{s}'),
          endtime:parseTime(this.filters.dateArea[1], '{y}-{m}-{d} {h}:{i}:{s}')
        };
      getFilesByRoom(self, para).then(res => {
        const {result,data} = res.body;
        if(result===200){
            let list = data?data.list:[];
            let imgGather = list.map(item=>({thumbnailUrl:item.thumbnailUrl,timeStamp:parseTime(item.timeStamp, "{y}-{m}-{d} {h}:{i}:{s}"),fileUrl:item.fileUrl})).reduce((p, c) => [p[c.timeStamp.split(" ")[0]] = p[c.timeStamp.split(" ")[0]] || [], p[c.timeStamp.split(" ")[0]].push(c), p][2], {});
            for(var key in imgGather){
              if(!this.bgGather[key]){
                this.bgGather[key] = this.colors[this.lastIndex];
                if(this.lastIndex>9){
                  this.lastIndex=0;
                }else{
                  this.lastIndex+=1;
                }
              }
            } 
            this.imgGather = imgGather;
            this.total = data?data.total:0;
        }else{
            this.imgGather = [];
            this.total=0;
        }
        NProgress.done();
      });
    },
    showBigImg(t, url) {
      NProgress.start();
      this.dialogSize = "small";
      let img = new Image(),
        _this = this;
      img.src = baseImgUrl + url;
      img.onload = () => {
        NProgress.done();
        _this.currentUrl = baseImgUrl + url;
        _this.bigImgVisible = true;
      };
    },
    changeSize() {
      this.dialogSize = this.dialogSize === "small" ? "full" : "small";
    }
  },
  mounted() {
    this.robots = this.rooms.find(i => i.roomId === this.room).robotList;
    this.filters.roomId = this.room;
  }
};
</script>

<style scoped>
.floor-item-content-wrap {
  float: left;
  width: 16%;
  margin-right: 0.4%;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  font-size: 0.8rem;
  color:#fff;
}
.floor-item-content-wrap:hover {
  border: 1px solid #f00;
}

.section {
  min-height: 70vh;
  background: rgba(0, 0, 0, 0.35);
}
.floor-item-content-wrap > div {
  text-align: center;
  line-height: 22px;
  font-weight: 600;
  font-family: Arial, Helvetica, sans-serif;
}
.floor-item-img {
  display: block;
  width: 100%;
  height: 150px;
}

.floor-item-title > span {
  cursor: pointer;
}
.floor-item-title:hover{
  color:#f00;
}
.floor-item-title,
.floor-item-time {
  height: 25px;
}
</style>