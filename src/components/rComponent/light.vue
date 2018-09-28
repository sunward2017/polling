<template>
    <span :class="className">{{type ==="1"?"大灯":"小灯"}}</span>
</template>
<script>
export default {
  name:'Light',
  props: {
    type: String,
    value: String
  },
  
  computed:{
      className:function(){
          let color = this.value.split("_")[0];
          return this.type==="1"?color:color+'_s'
      },
  }
};
</script>
<style lang="less">
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
}
.red_s,
.green_s,
.yellow_s {
  width: 40px;
  height: 40px;
  margin: 36px 0px 35px 20px;
  line-height: 40px;
  border-radius: 20px;
  font-size: 12px;
  color: #333;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.75) inset;
}
.red,
.green,
.yellow {
  width: 60px;
  height: 60px;
  margin: 26px 0px 25px 10px;
  line-height: 60px;
  border-radius: 30px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.75) inset;
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
</style>


