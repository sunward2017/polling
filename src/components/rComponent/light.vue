<template>
    <span :class="className" @click="changeState" :id="id">{{state}}</span>
</template>
<script>
export default {
  name:'Light',
  props: {
  	id:String,
    data: Object,
  },
  methods:{
  	 changeState(){
  	 	this.$emit('configLight',this.id);
  	 }
  },
  computed:{
      className:function(){
          let light = this.data.type==="1"?"light large ":"light small ";
          return light+this.data.value;
      },
      state:function(){
      	switch(this.data.value.split("_")[1]){
<<<<<<< HEAD
      		case 'on': return "开";
      		case 'off': return "关";
=======
      		case 'on': return "亮";
      		case 'off': return "灭";
>>>>>>> xmdx
      		default: return "未设置"; 
      	}
      }
  }
};
</script>
<style>
 .light{
  float: left;
  border: 2px solid black;
  cursor: pointer;
  text-align: center;
  background:#ccc;
}
 .small{
  width: 40px;
  height: 40px;
  margin: 36px 0px 35px 20px;
  line-height: 40px;
  border-radius: 20px;
  font-size: 12px;
  color: #333;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.25) inset;
}
 .large{
  width: 60px;
  height: 60px;
  margin: 26px 0px 25px 10px;
  line-height: 60px;
  border-radius: 30px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.25) inset;
}
 
.red_on{
   background:#F00
}
.red_off{
	background:#800;
}
.green_on {
  background: rgb(9, 212, 94);
}
.green_off{
   background: rgb(0,120,60)
}
.yellow_on{
  background: yellow;
}
.yellow_off{
  background:#b5b90d;	
}
.info{
  background:#ccc;
}
</style>


