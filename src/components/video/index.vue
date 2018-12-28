<template>
    <el-dialog title="视频播放"  v-model="visible" style="text-align: center;" :before-close="closeVideo">
        <video id="wrap" class="video-js vjs-default-skin vjs-big-play-centered" controls>
            <source :src="source" type="video/mp4">
            Your browser does not support the video tag.
        </video>
    </el-dialog>
</template>
<script>
import videoJs from 'video.js';
import 'video.js/dist/video-js.min.css';

export default {
    props:{
        source:{
            type:String,
        },
    },
    data(){
      return{
          player:null,
          visible:true,
      }
    },
    methods:{
        closeVideo(done){
		    this.$emit('close')
        }
    },
    beforeDestroy(){
	    this.player&&this.player.dispose();
    },
    mounted(){
       this.$nextTick(()=>{
            this.player = videoJs('wrap',{
                    autoplay : true,
                    loop : false,
                    muted : false,
                    preload:'auto',
                    bigPlayButton : false,
                    textTrackDisplay : false,
                    posterImage: false, 
                    control : {
                        captionsButton : false,
                        chaptersButton: false,
                        subtitlesButton:false,
                        liveDisplay:false,
                        playbackRateMenuButton:false
                    }
                })
        })
      
    }
}
</script>
<style>
.video-js{
    width:100%;
    height:40vh;
}
</style>


