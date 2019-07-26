<template>
	<div>
	  <iframe id="frame" src="/live.html" frameborder="0" style="width:100%;height:calc(100vh - 175px)"></iframe> 
	  <input type="hidden" id="custom"  :value="custom" />	
	</div>
</template>

<script>
	export default {
	        beforeDestroy(){
		    var childWin = document.getElementById('frame').contentWindow;
		    childWin.onbeforeunload()
		}
		data(){
		  return 	{custom:JSON.stringify({adminId:this.$store.state.user.adminId,customId:this.$store.state.user.customId})}
		}
	}
</script>

<style>
</style>