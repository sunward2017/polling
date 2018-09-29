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
                  <el-button type="success" style="float:right;margin-right:10px;" size="small" @click.native="addRow">新增面板行</el-button>
                  <el-button  style="float:right;margin-right:10px;" type="success" @click="save" size="small">提交保存</el-button>      
              </div> 
              <div id="right">
                  <div class="rf_item" v-for="(item,index) in row" :key="index+uuid()"><!--row-->
                    <label class="label_c" >第{{index+1}}行</label>
                    <div  :id="`item_${index}`" class="rf_content">
                       <template v-for="(col,index) in item"> <!--col-->
                         <Light v-if="col.type==='1'||col.type==='2'" :type="col.type" :value="col.value" :key="col.value+index"/> 
                         <Gauge v-else-if="col.type==='3'" :key="col.type+index" :numbers="gauges[col.id]" :id="col.id" @configGauge="configGauge"/> 
                       </template>
                    </div>
                    <div class="closed" @click="remove(index)">x</div>
                  </div> 
              </div>
             </el-col>
          </el-row>
           <el-dialog title="仪表配置"  :visible.sync="dialogVisible" size="small">
              <template v-for="(item,r) in data">
                  <template v-for="(gauge,index) in item">
                    <el-form :inline="true" :model="gauge" :key="r+'_'+index"> 
                        <el-form-item label="仪表参数" :prop="gauge.type" :rules="{ required: true, message: '请选择仪表类型', trigger: 'change' }">
                            <el-select v-model="gauge.type" placeholder="仪表类型" @change="changeType(gauge)" style="width:160px;">
                                <el-option label="温度" value="5"></el-option>
                                <el-option label="湿度" value="6"></el-option>
                                <el-option label="电流" value="7"></el-option>
                                <el-option label="电压" value="8"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="正常值区间" >
                            <el-form-item :prop="gauge.lower" :rules="{ validator: checkNum, trigger: 'blur' }">
                                <el-input v-model="gauge.lower" placeholder="低位值" style="width:80px;"></el-input>
                            </el-form-item>
                            <span>~</span>
                            <el-form-item :prop="gauge.high" :rules="{ validator: checkNum, trigger: 'blur' }">
                                <el-input v-model="gauge.high" placeholder="高位值"  style="width:80px;"></el-input>
                            </el-form-item>
                            <span style="font-weight:bold;"> &nbsp;{{gauge.unit}}&emsp;</span>
                        </el-form-item>
                        <el-form-item label="识别位数" :prop="gauge.digits" :rules="checkNum">
                            <el-input v-model="gauge.digits"  style="width:80px;"></el-input>
                        </el-form-item>
                    </el-form>
                 </template>
              </template>   
               <span slot="footer" class="dialog-footer">
                <el-button @click="handleNum">确定</el-button>
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
                 <Gauge :numbers="[[{}],[{}]]"/>
                 <Gauge :numbers="[[{},{}]]"/>
                 <Gauge :numbers="[[{}]]"/>
              </div>
          </el-popover>
          <el-button v-show="isEdit" type="warning" class="affix" v-popover:popover>仪表标签集</el-button>
    </section>
</template>
<script>
import NProgress from "nprogress";
import dragula from "dragula";
import { cloneObj } from "utils";
import { editRfidTpl, listRfidTpl, deleteRfidTpl } from "api/template";
import { guid } from "utils";

import Gauge from "components/rComponent/Gauge";
import Light from "components/rComponent/Light";

export default {
  components: {
    Gauge,
    Light
  },
  data() {
    var checkVal=(value,callback)=>{
        console.log(value)
      
        // if (!value) {
        //   return callback(new Error('不可为空'));
        // }
        // setTimeout(() => {
        //   if (!/(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)/.test(value)){
        //     callback(new Error('请输入数字值'));
        //   } else {
        //     callback();
        //   }
        // }, 1000);
    };
    return {
      row: [[]],
      drake: null,
      dialogVisible: false,
      rfids: [
        {
          detectSettingId: "1",
          detectSettingName: "所有模板",
          children: []
        }
      ],
      defaultProps: {
        children: "children",
        label: "detectSettingName"
      },
      data: [],
      isEdit: false,
      gauges: {},
      currentTpl: null,
      checkNum:{
        validator:checkVal, trigger: 'blur'
      }
    };
  },
  methods: {
    uuid() {
      return guid();
    },
    
    editTpl(store, data) {
      this.currentTpl = data;
      this.isEdit = true;
      this.row = JSON.parse(data.detectSetting).map(item => {
        return item.map(m => {
          if (m.type === "3") {
            let key = guid();
            this.gauges[key] = m.numbers;
            m.id = key;
          }
          return m;
        });
      });
    },
    handleNum(){
      
    },
    removeTpl(store, data) {
      var _this = this;
      this.$confirm(
        "确认删除标签模板：" + data.detectSettingName + "？",
        "提示",
        {
          //type: 'warning'
        }
      ).then(() => {
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
    addTpl() {
      this.isEdit = true;
      this.row = [[]];
    },
    renderContent(h, { node, data, store }) {
      if (data.hasOwnProperty("children")) {
        return (
          <span>
            <span>
              <span>{node.label}</span>
            </span>
            <span style="float: right; margin-right: 20px">
              <el-button
                size="mini"
                on-click={() => this.addTpl()}
                type="success"
              >
                新增模板
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
                size="mini"
                type="primary"
                on-click={() => this.editTpl(store, data)}
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                type="warning"
                on-click={() => this.removeTpl(store, data)}
              >
                删除
              </el-button>
            </span>
          </span>
        );
      }
    },
    getTpls() {
      let self = this;
      listRfidTpl(self).then(res => {
        if (res.data.result === 200) {
          this.rfids[0].children = res.data.data;
        } else {
          this.rfids[0].children = [];
        }
      });
    },
    init() {
      let _this = this;
      this.drake = dragula([document.getElementById("left")], {
        isContainer: function(el) {
          return el.classList.contains("rf_content");
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
        _this.configPanel(el);
      });
    },
    configPanel(el) {
      //添加仪表
      if (el.className.indexOf("gauge") >= 0 && !el.id) {
        el.id = guid();
        this.gauges[el.id] =
          el.className === "gauge_d"
            ? [[{ unit: "℃" }], [{ unit: "℃" }]]
            : el.className === "gauge_t"
              ? [[{ unit: "℃" }, { unit: "℃" }]]
              : [[{ unit: "℃" }]];
      }
      let data = [];
      var content = document.getElementsByClassName("rf_content");
      for (var i = 0, l = content.length; i < l; i++) {
        let arr = [];
        for (var j = 0, k = content[i].childNodes.length; j < k; j++) {
          let r = {};
          switch (content[i].childNodes[j].className) {
            case "red":
              r = { type: "1", value: "red_on" };
              break;
            case "green":
              r = { type: "1", value: "green_on" };
              break;
            case "yellow":
              r = { type: "1", value: "yellow_on" };
              break;
            case "red_s":
              r = { type: "2", value: "red_on" };
              break;
            case "green_s":
              r = { type: "2", value: "green_on" };
              break;
            case "yellow_s":
              r = { type: "2", value: "yellow_on" };
              break;
            default:
              r = { type: "3", id: content[i].childNodes[j].id };
          }
          arr.push(r);
        }
        data.push(arr);
      }

      this.row = data;
    },
    addRow() {
      this.row.push([]);
    },

    remove(index) {
      this.row.splice(index, 1);
    },
    save() {
      let tpl = this.currentTpl;
      let _this = this;
      if (this.row.length === 0) {
        _this.$message.error("模板没有配置");
        return;
      }
      for (var i = 0, l = _this.row.length; i < l; i++) {
        if (_this.row[i].length === 0) {
          _this.$message("请删除空白面板行");
          return;
        }
      }
      for (var k in _this.gauges) {
        if (!_this.gauges[k][0][0].type) {
          _this.$message.error("仪表参数没有配置");
          return;
        }
      }

      this.$prompt("请输入模板名称", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputValue: tpl ? tpl.detectSettingName : "",
        inputPattern: /^(?![0-9])[\u4e00-\u9fa5a-zA-Z0-9]+$/,
        inputErrorMessage:
          "模板名称只能是中文、英文、数字组合，且不可以数字开头！"
      })
        .then(({ value }) => {
          let row = cloneObj(_this.row);
          let para = row.map(r =>
            r.map(c => {
              if (c.type === "3") {
                return { type: "3", numbers: _this.gauges[c.id] };
              } else {
                return c;
              }
            })
          );
          let params = {
            detectSettingName: value,
            detectSetting: JSON.stringify(para)
          };
          let msg = "";
          if (tpl) {
            params.detectSettingId = tpl.detectSettingId;
            msg = "标签模板修改";
          } else {
            msg = "标签模板新增";
          }

          editRfidTpl(_this, params).then(res => {
            _this.getTpls();
            if (res.data.result === 200) {
              _this.$notify({
                title: "成功",
                message: msg + "成功",
                type: "success"
              });
            } else {
              _this.$notify({
                title: "失败",
                message: msg + "失败",
                type: "error"
              });
            }
          });
          this.row = [[]];
          this.isEdit = false;
        })
        .catch(() => {});
    },
    configGauge(key) {
      this.data = this.gauges[key];
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
    }
  },
  beforeDestroy() {
    if (this.drake) {
      this.drake.destroy();
      this.drake = null;
    }
  },
  mounted() {
    this.getTpls();
    this.init();
  }
};
</script>
<style lang="less">
#left,
#right,
.rfidTree {
  border: 1px solid rgba(250, 250, 250, 0.35);
}
#left {
  background: #191d22;
}
.rfidTree {
  min-height: 80vh;
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


