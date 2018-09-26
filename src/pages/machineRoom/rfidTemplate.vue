<template>
    <section>
        <el-row  :gutter="20">
            <el-col :span="4">
              <div class="label_t">标签集</div>
              <div id="left">
                 <span class="red">大灯</span> 
                 <span class="green">大灯</span>
                 <span class="yellow">大灯</span>
                   <span class="red_s">小灯</span> 
                 <span class="green_s">小灯</span>
                 <span class="yellow_s">小灯</span>
                 <div class="gauge_d" >
                     <div> 双行纵向仪表:</div>
                     <div class="gauge_n">xxx</div>
                     <div class='gauge_n'>xxx</div>
                 </div>
                 <div class="gauge_t">
                     <div> 双行横向仪表:</div>
                     <div class="gauge_c">xxx</div>
                     <div class="gauge_c">xxx</div>
                 </div>
                 <div class="gauge_o">
                     <div> 单行仪表:</div>
                     <div class="gauge_n">xxx</div>
                 </div>
              </div>
             </el-col>
             <el-col :span="20">
              <div class="label_t">
                  标签面板
                  <el-button type="success" style="float:right;margin-right:10px;" size="small" @click.native="add">
                    新增面板行    
                  </el-button> 
              </div> 
              <div id="right">
                  <div class="rf_item" v-for="(item,index) in row" :key="index">
                    <label class="label_c" >第{{++index}}行</label>
                    <div :id="`item_${item}`" class="rf_content"></div>
                    <div class="closed" @click="remove(item)">x</div>
                  </div> 
                 <div style="padding-right:20px;">
                   <el-button class="foot-btn" type="primary" @click="save">保存</el-button>     
                 </div> 
              </div>
             </el-col>
          </el-row>
          <el-dialog title="仪表配置"  v-model="dialogVisible" size="small">
              <template v-for="(gauge,index) in gaugeData">
                <el-form :inline="true" :model="gauge" :key="index"> 
                  <el-form-item label="仪表类型">
                      <el-select v-model="gauge.type" placeholder="仪表类型" @change="changeType(gauge)" style="width:160px;">
                          <el-option label="温度" value="5"></el-option>
                          <el-option label="湿度" value="6"></el-option>
                          <el-option label="电流" value="7"></el-option>
                          <el-option label="电压" value="8"></el-option>
                      </el-select>
                  </el-form-item>
                  <el-form-item label="正常区间">
                      <el-input v-model="gauge.lower" placeholder="低位值" style="width:100px;"></el-input>
                      <span>~</span>
                      <el-input v-model="gauge.high" placeholder="高位值"  style="width:100px;"></el-input>
                      <span style="font-weight:bold;font-size:20px;"> &nbsp;{{gauge.unit}}&emsp;</span>
                  </el-form-item>
                  <el-form-item label="精准度">
                      <el-input v-model="gauge.digits"  style="width:100px;"></el-input>
                  </el-form-item>
                </el-form>
              </template>   
               <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addGauges">确 定</el-button>
              </span>
          </el-dialog>    
    </section>
</template>
<script>
import dragula from "dragula";
import "dragula/dist/dragula.min.css";
import {cloneObj} from 'utils'
export default {
  data() {
    return {
      rowKey: 1,
      row: [1],
      drake: null,
      dialogVisible: false,
      gaugeKey: null,
      gaugeType: null,
      gaugeData:[{ type: "5",lower: "20",  high: "25", unit: "℃",digits: "2"}], 
      gauges: {}
    };
  },
  methods: {
    config(type, key) {
      this.gaugeType = type;
      this.gaugeKey = key;
      this.gaugeData = type ==="gauge_o"?[{ type: "5",lower: "20",  high: "25", unit: "℃",digits: "2"}]:[{ type: "5",lower: "20",  high: "25", unit: "℃",digits: "2"},{ type: "5",lower: "20",  high: "25", unit: "℃",digits: "2"}]
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
          default: gauge.unit = "℃";
      }
    },
    addGauges(){
      let key = this.gaugeKey;
      console.log(this.gaugeData)
      this.gauges[key] = cloneObj(this.gaugeData) 
      console.log(this.gauges)
      
    },
    init() {
      let config = this.config;
      this.drake = dragula([document.getElementById("left")], {
        isContainer: function(el) {
          return false; // only elements in drake.containers will be taken into account
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
        if (!el.id) el.id = new Date().getTime();
        if (!el.event && el.className.indexOf("gauge") !== -1) {
          el.event = true;
          el.addEventListener("click", function() {
            config(el.className, el.id);
          });
        }
      });
      this.drake.containers.push(document.getElementById("item_1"));
    },
    add() {
      let n = ++this.rowKey;
      this.row.push(n);
      this.$nextTick(() => {
        this.drake.containers.push(document.getElementById("item_" + n));
      });
    },
    remove(item) {
      let index = this.row.indexOf(item);
      this.row.splice(index, 1);
    },
    save() {
      var row = document.getElementsByClassName("rf_content");
      for (var i = 0, l = row.length; i < l; i++) {
        for (var j = 0, k = row[i].childNodes.length; j < k; j++) {
          console.log(row[i].childNodes[j]);
          console.log(row[i].childNodes[j].id);
        }
      }
    }
  },
  mounted() {
    this.init();
  }
};
</script>
<style lang="less">
#left,
#right {
  width: 100%;
  border: 1px solid rgba(250, 250, 250, 0.35);
  min-height: 70vh;
  background: rgba(0, 0, 0, 0.35);
}
.red_s,
.green_s,
.yellow_s,
.red,
.green,
.yellow {
  float: left;
  border: 2px solid black;
  cursor: pointer;
  text-align: center;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.75) inset;
}
.red_s,
.green_s,
.yellow_s {
  width: 40px;
  height: 40px;
  margin: 25px 0px 10px 25px;
  line-height: 40px;
  border-radius: 20px;
  font-size: 12px;
  color: #333;
}
.red,
.green,
.yellow {
  width: 60px;
  height: 60px;
  margin: 10px 0px 10px 10px;
  line-height: 60px;
  border-radius: 30px;
}
.line {
  width: 20px;
  text-align: cetner;
}
.red,
.red_s {
  background: #f00;
}
.green,
.green_s {
  background: rgb(9, 212, 94);
}
.yellow,
.yellow_s {
  background: yellow;
}
.gauge_d,
.gauge_t,
.gauge_o {
  color: #fff;
  border: 1px solid #fff;
  padding: 10px;
  float: left;
  background: gray;
  font-size: 14px;
  margin: 10px;
  cursor: pointer;
}

.gauge_n {
  width: 100px;
  height: 20px;
  border: 1px solid #fff;
  line-height: 20px;
  color: #b7c9cf;
  margin-top: 5px;
  margin-left: 10px;
  text-indent: 5px;
  background: #000;
}
.gauge_c {
  float: left;
  width: 50px;
  height: 30px;
  border: 1px solid #fff;
  line-height: 30px;
  color: #b7c9cf;
  margin-top: 5px;
  margin-left: 5px;
  text-indent: 5px;
  background: #000;
}
.gauge_o .gauge_n {
  height: 30px;
  line-height: 30px;
}
.label_t {
  width: 100%;
  color: #fff;
  border: 1px solid rgba(250, 250, 250, 0.35);
  border-bottom: none;
  padding: 15px 0;
  text-indent: 15px;
  background: #022c6b;
}
.label_c {
  width: 100px;
  text-align: right;
  vertical-align: middle;
  float: left;
  font-size: 14px;
  color: orange;
  line-height: 130px;
  padding: 0 22px 0 0;
  box-sizing: border-box;
}
.rf_content {
  text-align: center;
  height: 130px;
  border-bottom: 1px solid #ccc;
  margin: 10px;
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
}
.foot-btn{
  float:right;
}
</style>


