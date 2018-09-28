<template>
   <div :class="className"  ref="wap" :id="id" @click="setting">
        <div>{{gaugeType}}</div>
        <div :class="className!=='gauge_t'?'gauge_n':'gauge_c'">xxx</div>
        <div v-if="className!=='gauge_o'" :class="className!=='gauge_t'?'gauge_n':'gauge_c'">xxx</div>
    </div>           
</template>
<script>
export default {
    name:"Gauge",
    props:{
       type:String,
       id:String,
    },
    computed:{
       className:function(){
            return this.type ==='3'?"gauge_d":this.type==="4"?"gauge_t":'gauge_o' 
       },
       gaugeType:function(){
           return this.type ==='3'?"双行纵向仪表":this.type==="4"?"双向横向仪表":'单行仪表'
       }
    },
    methods:{
      setting(){
        this.$emit('set',this.id)
      }
    },
    mounted(){
      if(this.id){
        this.$refs.wap.style.background="green";
      }
    }
}
</script>
<style lang='less'>
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
  text-align: center;
}

.gauge_n {
  width: 100px;
  height: 20px;
  border: 1px solid #fff;
  line-height: 20px;
  color: #b7c9cf;
  margin-top: 5px;
  margin-left: 10px;
  background: rgb(0, 0, 0);
}
.gauge_c {
  float: left;
  width: 50px;
  border: 1px solid #fff;
  color: #b7c9cf;
  margin-left: 5px;
  background: #000;
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


