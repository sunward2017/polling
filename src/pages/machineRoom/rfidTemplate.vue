<template>
    <section>
      
              <div id="left">
                 <span class="red">红灯</span> <span class="green">绿灯</span>
              </div>
          
              <div id="right"></div>
          
       
       
    </section>
</template>
<script>
import dragula from 'dragula';
import 'dragula/dist/dragula.min.css'
export default {
  data(){
      return{

      }
  },
  methods:{
    init(){
        dragula([document.querySelector('#left'), document.querySelector('#right')], {
        isContainer: function (el) {
            return false; // only elements in drake.containers will be taken into account
        },
        moves: function (el, source, handle, sibling) {
            return true; // elements are always draggable by default
        },
        // accepts: function (el, target, source, sibling) {
        //     return true; // elements can be dropped in any of the `containers` by default
        // },
        invalid: function (el, handle) {
            return false; // don't prevent any drags from initiating by default
        },
        copy: function (el, source) {
            return source === document.getElementById(left)
        },
        accepts: function (el, target) {
            return target !== document.getElementById(left)
        },
        direction: 'vertical',             // Y axis is considered when determining where an element would be dropped
        copy: false,                       // elements are moved by default, not copied
        copySortSource: false,             // elements in copy-source containers can be reordered
        revertOnSpill: true,              // spilling will put the element back where it was dragged from, if this is true
        removeOnSpill: true,              // spilling will `.remove` the element, if this is true
        mirrorContainer: document.body,    // set the element that gets mirror elements appended
        ignoreInputTextSelection: true     // allows users to select input text, see details below
        });
    } 
  },
  mounted(){
    this.init()
  }
}
</script>
<style lang="less">
#left,#right{
    width:40%;
    border:1px solid #fff;
    min-height:40vh;
}
.red,.green{
    display:inline-block;
    width:80px;
    height:80px;
    margin:10px;
    border:2px solid black;
    border-radius:40px;
    cursor:pointer;
    text-align: center;
    line-height: 80px;
}
.red{
    background:#F00;
}
.green{
    background:rgb(6, 124, 55)
}
</style>


