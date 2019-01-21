<template>
    <div :class="type"  ref="wap" @click="setting" :id="id">
        <div>{{type ==='gauge_d'?"双行纵向仪表":type==="gauge_t"?"双向横向仪表":'单行仪表'}}</div>
        <div :class="type!=='gauge_t'?'gauge_n':'gauge_c'">{{value1}}</div>
        <div v-if="type!=='gauge_o'" :class="type!=='gauge_t'?'gauge_n':'gauge_c'">{{value2}}</div>
    </div>           
</template>
<script>
export default {
    name:"Gauge",
    props:{
       id:String,
       numbers:Array,
    },
    data(){
      return {
        dialogVisible:false,
      }
    },
    computed:{
       type:function(){
          return this.numbers.length>1?"gauge_d":this.numbers[0].length>1?"gauge_t":'gauge_o' 
       },
       value1:function(){
          return this.numbers[0][0].lower?(this.numbers[0][0].lower+'~'+this.numbers[0][0].high)+this.numbers[0][0].unit:"xxx~xxx"
       },
       value2:function(){
          if(this.type==='gauge_d'){
             return this.numbers[1][0].lower?(this.numbers[1][0].lower+'~'+this.numbers[1][0].high)+this.numbers[1][0].unit:"xxx~xxx" 
          }else if(this.type==="gauge_t"){
            return this.numbers[0][1].lower?(this.numbers[0][1].lower+'~'+this.numbers[0][1].high)+this.numbers[0][1].unit:"xxx~xxx"
          }
       }
    },
    methods:{
      setting(){
        this.$emit('configGauge',this.id);
      },
    },
    mounted(){
      if(this.numbers[0][0].type){
        this.$refs.wap.style.background="rgba(0,200,200,.3)";
      }
    }
}
</script>
<style>
.gauge_d,
.gauge_t,
.gauge_o {
  color: #fff;
  border: 1px solid rgba(250,250,250,0.35);
  padding: 10px;
  float: left;
  background: gray;
  font-size: 14px;
  margin: 10px;
  cursor: pointer;
  text-align: center;
}

.gauge_n {
  width: 200px;
  height: 20px;
  border: 1px solid rgba(250,250,250,0.35);
  line-height: 20px;
  color: #b7c9cf;
  margin-top: 5px;
  background:rgba(0,0,0,.7);
  font-size:10px;
}   
.gauge_c {
  float: left;
  font-size:10px;
  width: 100px;
  border: 1px solid rgba(250,250,250,0.35);
  color: #b7c9cf;
  background:rgba(0,0,0,.7);
}
.gauge_o .gauge_n,
.gauge_t .gauge_c {
  height: 30px;
  margin-top: 11px;
  margin-bottom: 11px;
  line-height: 30px;
}
.label_t {
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
  line-height: 115px;
  padding: 0 22px 0 0;
  box-sizing: border-box;
}
</style>


