<template>
    <section>
        <el-row  :gutter="20">
            <el-col :span="4">
                <el-tree
                  class="rfidTree"
                  :data="rfids"
                  :props="defaultProps"
                  node-key="detectSettingId"
                  default-expand-all
                  highlight-current  
                  :render-content="renderContent">
                </el-tree>
             </el-col>
             <el-col :span="20">
              <div class="label_t">
                  <span>标签面板</span>
                  <el-button type="success" style="float:right;margin-right:10px;" size="small" @click.native="add">新增面板行</el-button>
                  <el-button  style="float:right;margin-right:10px;" type="success" @click="save" size="small">提交保存</el-button>      
              </div> 
              <div id="right">
                  <div class="rf_item" v-for="(item,index) in row" :key="item.init||index"><!--row-->
                    <label class="label_c" >第{{++index}}行</label>
                    <div  :id="`item_${index}`" class="rf_content">
                       <template v-for="(col,index) in item"> <!--col-->
                         <Light v-if="col.type==='1'||col.type==='2'" :type="col.type" :value="col.value" :key="col.value+index"/> 
                         <Gauge v-else-if="col.type==='3'"  :type="computedType(col.numbers)" :key="col.type+index" :id="col.id" @set="setGauge"/> 
                       </template>
                    </div>
                    <div class="closed" @click="remove(item)">x</div>
                  </div> 
              </div>
             </el-col>
          </el-row>
          <el-dialog title="仪表配置"  v-model="dialogVisible" size="small">
              <template v-for="(gauge,index) in gaugeData">
                <el-form :inline="true" :model="gauge" :key="index"> 
                  <el-form-item :label="formatConfig(index)">
                      <el-select v-model="gauge.type" placeholder="仪表类型" @change="changeType(gauge)" style="width:160px;">
                          <el-option label="温度" value="5"></el-option>
                          <el-option label="湿度" value="6"></el-option>
                          <el-option label="电流" value="7"></el-option>
                          <el-option label="电压" value="8"></el-option>
                      </el-select>
                  </el-form-item>
                  <el-form-item label="正常值区间">
                      <el-input v-model="gauge.lower" placeholder="低位值" style="width:100px;"></el-input>
                      <span>~</span>
                      <el-input v-model="gauge.high" placeholder="高位值"  style="width:100px;"></el-input>
                      <span style="font-weight:bold;font-size:20px;"> &nbsp;{{gauge.unit}}&emsp;</span>
                  </el-form-item>
                  <el-form-item label="识别位数">
                      <el-input v-model="gauge.digits"  style="width:100px;"></el-input>
                  </el-form-item>
                </el-form>
              </template>   
               <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addGauges">确 定</el-button>
              </span>
          </el-dialog>
          <el-popover
            ref="popover"
            placement="right"
            width="470"
            trigger="click">
              <div class="label_t">标签集</div>
              <div id="left">
                 <Light type="1" value="red_on"/>
                 <Light type="1" value="yellow_on"/>
                 <Light type="1" value="green_on"/>
                 <Light type="2" value="red_on"/>
                 <Light type="2" value="yellow_on"/>
                 <Light type="2" value="green_on"/>
                 <Gauge type="3"/>
                 <Gauge type="4"/>
                 <Gauge type="5"/>
              </div>
          </el-popover>
          <el-button v-show="isEdit" type="warning" class="affix" v-popover:popover>仪表标签集</el-button>
    </section>
</template>
<script>
import NProgress from "nprogress";
import dragula from "dragula";
import "dragula/dist/dragula.min.css";
import { cloneObj } from "utils";
import { editRfidTpl,listRfidTpl,deleteRfidTpl} from 'api/template'
import {guid} from 'utils'


export default {
  data() {
    return {
      row: [1],
      drake: null,
      dialogVisible: false,
      gaugeKey: null,
      gaugeType: null,
      gaugeData: [
        { type: "5", lower: "20", high: "25", unit: "℃", digits: "2" }
      ],
      gauges: {},
      rfids:[{
          detectSettingId:'1',
          detectSettingName: '所有模板',
          children:null, 
      }],
      defaultProps: {
        children: 'children',
        label: 'detectSettingName'
      },
      isEdit:false,
      currentTpl:null,
    };
  },
  methods: {
    editTpl(store, data) { 
       this.currentTpl = data;
       this.isEdit = true;
       this.gauges = {};
       this.row = JSON.parse(data.detectSetting).map(item=>{
          return item.map(m=>{
             if(m.type==="3"){
                let key = guid();
                this.gauges[key] = m.numbers;
                m.id = key;
             }
             return m;
          })
       })
    },
    removeTpl(store, data) {
      var _this = this;
      this.$confirm("确认删除标签模板：" +data.detectSettingName+ "？", "提示", {
        //type: 'warning'
      }).then(() => {
        NProgress.start();
        deleteRfidTpl(_this, {
          detectSettingId: data.detectSettingId
        }).then(res => {
          NProgress.done();
          if (res.data.result === 200) {
            _this.$message({
              message: "删除成功",
              type: "success"
            });
          } else {
            _this.$message.error("删除失败");
          }
          _this.getTpls();
        });
      });
    },
    addTpl(){
      this.isEdit = true;
      this.row = [[{init:guid()}]];
      this.$nextTick(()=>{
          this.drake.containers.push(document.getElementById("item_1"));
      })
    },
    renderContent(h, { node, data, store }) {
      if(data.hasOwnProperty('children')){
        return (
          <span>
            <span>
              <span>{node.label}</span>
            </span>
            <span style="float: right; margin-right: 20px">
              <el-button size="mini" on-click={ () => this.addTpl() }   type="success">新增模板</el-button>
            </span>
          </span>)
      }else{
      return (
        <span>
          <span>
            <span>{node.label}</span>
          </span>
          <span style="float: right; margin-right: 20px">
            <el-button size="mini"   type="primary" on-click={ () => this.editTpl(store, data) }>编辑</el-button>
            <el-button size="mini"   type="warning" on-click={ () => this.removeTpl(store, data) }>删除</el-button>
          </span>
        </span>);
      }
    },
    getTpls(){
      let self= this;
      listRfidTpl(self).then(res=>{
        if(res.data.result===200){
          this.rfids[0].children = res.data.data
        }else{
          this.rfids[0].children = null;
        }
      })
    },
    config(type, key) {
      this.gaugeType = type;
      this.gaugeKey = key;
      this.gaugeData =
        type === "gauge_o"
          ? [{ type: "5", lower: "20", high: "25", unit: "℃", digits: "2" }]
          : [
              { type: "5", lower: "20", high: "25", unit: "℃", digits: "2" },
              { type: "5", lower: "20", high: "25", unit: "℃", digits: "2" }
            ];
      this.dialogVisible = true;
    },
    changeType(gauge) {
      let val = gauge.type;
      switch (val) {
        case "6":
          gauge.unit = "%";
          break;
        case "7":
          gauge.unit = "A";
          break;
        case "8":
          gauge.unit = "V";
          break;
        default:
          gauge.unit = "℃";
      }
    },
    addGauges() {
      let key = this.gaugeKey;
      let type = this.gaugeType;
      let gaugeData = this.gaugeData;
      switch (type) {
        case "gauge_d":
          this.gauges[key] = [[gaugeData[0]], [gaugeData[1]]];
          break;
        case "gauge_t":
          this.gauges[key] = [[gaugeData[0], gaugeData[1]]];
          break;
        case "gauge_o":
          this.gauges[key] = [gaugeData];
      }

      document.getElementById(key).style.backgroundColor = "green";
      this.dialogVisible = false;
    },
    setGauge(key){
       let data = this.gauges[key];
      
       this.gaugeKey = key;
       if(data.length>1){
          this.gaugeType = 'gauge_d';
          this.gaugeData = [data[0][0],data[1][0]];
         
       }else if(data[0].length>1){
          this.gaugeType = "gauge_t";
          this.gaugeData = [data[0][0],data[0][1]];
       }else{
          this.gaugeType = "gauge_o";
          let d = data[0][0];
          this.gaugeData=[d]
       } 
       this.dialogVisible = true;
    },
    init() {
      let config = this.config;
      this.drake = dragula([document.getElementById("left")], {
        isContainer: function(el) {
          return el.classList.contains('rf_content')
         // return false; // only elements in drake.containers will be taken into account
        },
        moves: function(el, source, handle, sibling) {
          return true; // elements are always draggable by default
        },
        // accepts: function (el, target, source, sibling) {
        //     return true; // elements can be dropped in any of the `containers` by default
        // },
        invalid: function(el, handle) {
          return false; // don't prevent any drags from initiating by default
        },
        copy: function(el, source) {
          return source === document.getElementById("left");
        },
        accepts: function(el, target) {
          return target !== document.getElementById("left");
        },
        direction: "vertical", // Y axis is considered when determining where an element would be dropped
        copySortSource: false, // elements in copy-source containers can be reordered
        revertOnSpill: true, // spilling will put the element back where it was dragged from, if this is true
        removeOnSpill: true, // spilling will `.remove` the element, if this is true
        mirrorContainer: document.body, // set the element that gets mirror elements appended
        ignoreInputTextSelection: true // allows users to select input text, see details below
      }).on("dragend", function(el) {
        if (!el.id && el.className.indexOf("gauge") !== -1) {
          el.id = guid();
          el.addEventListener("click", function() {
            config(el.className, el.id);
          });
        }
      });
    },
    add() {
      let n=this.row.length
      this.row.push([{init:guid()}]);
    },
    remove(item) {
      let index = this.row.indexOf(item);
      this.row.splice(index, 1);
    },
    save() {
      let para = [],self = this;
      var row = document.getElementsByClassName("rf_content");
     
      let gauges = this.gauges;
      for (var i = 0, l = row.length; i < l; i++) {
        let rowData = [];
        for (var j = 0, k = row[i].childNodes.length; j < k; j++) {
          let type = row[i].childNodes[j].className;
          let key = row[i].childNodes[j].id;
          switch (type) {
            case "red":
              rowData.push({ type: "1", value: "red_on" });
              break;
            case "red_s":
              rowData.push({ type: "2", value: "red_on" });
              break;
            case "green":
              rowData.push({ type: "1", value: "green_on" });
              break;
            case "green_s":
              rowData.push({ type: "2", value: "green_on" });
              break;
            case "yellow":
              rowData.push({ type: "1", value: "yellow_on" });
              break;
            case "yellow_s":
              rowData.push({ type: "2", value: "yellow_on" });
              break;
            default:
              if(key){
                if (key&&gauges.hasOwnProperty(key)) {
                  rowData.push({ type: "3", numbers: gauges[key] });
                } else {
                  this.$message.error("仪表盘未设置参数");
                  return;
                }
              }
          }
        }
        if(rowData.length===0){
            this.$message.error("请删除空白的仪表行");
            return;
        }
        para.push(rowData);
      }
      if(para.length===0){
        this.$message.error("仪表面板未配置");
        return;
      }
      if(this.currentTpl){
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
               let params = {
                detectSettingName:self.currentTpl.detectSettingName,
                detectSettingId:self.currentTpl.detectSettingId,
                detectSetting:JSON.stringify(para)
              }
             editRfidTpl(self,params).then(res=>{
                 self.getTpls();
                 if(res.data.result===200){
                    self.$notify({
                      title: "成功",
                      message: "模板修改成功",
                      type: "success"
                    });
                  } else {
                    _this.$notify({
                      title: "失败",
                      message: "模板修改失败",
                      type: "error"
                    });
                  } 

             }).catch(()=>{})
              this.row = [[{init:guid()}]];
             this.isEdit = false;
          })
      }else{
         this.$prompt('请输入模板名称', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^(?![0-9])[\u4e00-\u9fa5a-zA-Z0-9]+$/,
          inputErrorMessage: '模板名称只能是中文、英文、数字组合，且不可以数字开头！'
        }).then(({ value }) => {
              let params = {
                detectSettingName:value,
                detectSetting:JSON.stringify(para)
              }
             editRfidTpl(self,params).then(res=>{
                 self.getTpls();
                 if(res.data.result===200){
                    self.$notify({
                      title: "成功",
                      message: "模板创建成功",
                      type: "success"
                    });
                  } else {
                    _this.$notify({
                      title: "失败",
                      message: "模板创建失败",
                      type: "error"
                    });
                  } 

                 
             })
              this.row = [[{init:guid()}]];
             this.isEdit = false;
        }).catch(() => {
           
        });
      }
    },
    formatConfig(i){
       let position=''; 
       const type = this.gaugeType;
       if(type==="gauge_d"){
          position= i===0?"(上)":"(下)"
       }else if(type==="gauge_t"){
          position= i===0?"(左)":"(右)"
       }
        return "仪表参数"+position;
    },
    computedType(n){
        if(n.length>1){
          return "3"
        }else{
          return n[0].length===1?"5":"4";
        }
    }
    
  },
  beforeDestroy(){
     if(this.drake){
     this.drake.destroy();
     this.drake = null;
     }
  },
  mounted() {
     this.getTpls();
     this.init()
  }
};
</script>
<style lang="less">
#left,
#right,.rfidTree {
  border: 1px solid rgba(250, 250, 250, 0.35);
}
#left {
  background: #191d22;
}
.rfidTree{
  min-height:80vh;
}
#right {
  min-height: 75vh;
  background: rgba(0, 0, 0, 0.35);
}
.rf_content {
  min-height: 120px;
  border-bottom: 1px solid #ccc;
  margin: 10px;
}
.rf_content:after,
#left:after {
  content: "020";
  display: block;
  height: 0;
  clear: both;
  visibility: hidden;
}

.rf_item {
  position: relative;
}
.closed {
  position: absolute;
  top: 10px;
  right: 10px;
  color: red;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #ccc;
  font-size: 20px;
  padding: 5px 10px;
  opacity: 0;
}
.rf_item:hover .closed {
  opacity: 1;
  cursor: pointer;
}

.affix {
  position: fixed;
  left: 300px;
  bottom: 300px;
}
</style>


