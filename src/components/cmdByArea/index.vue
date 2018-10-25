<template>
   <el-row :gutter="16">
        <el-col :span="7">
            <div class="sign">机房巷道</div>
            <el-tree :data="areaData" :props="defaultProps" @node-click="handleNodeClick" style="min-height:40vh" default-expand-all></el-tree>
        </el-col>
       <el-col :span="17">
        <div class="sign">导航点指令</div>
        <el-table :data="cmdData" v-loading="cmdLoading" @sort-change="sortPoint">
            <el-table-column prop="nvPointName" label="导航点" width="150" sortable></el-table-column>
            <el-table-column property="commandTypes" label="导航点指令">
            <template scope="scope">
                <el-checkbox-group v-model="scope.row.cmdType">
                    <el-checkbox v-for="type in scope.row.commandTypes" :label="`${type}`" :key="type">{{cmdName(type)}}</el-checkbox>
                </el-checkbox-group>
            </template>
            </el-table-column>
                <el-table-column
                label="操作"
                width="100"
                align="center">
                <template scope="scope">
                    <el-button
                    @click.native.prevent="addArea(scope.row)"
                    type="text"
                    size="small">
                        添加
                    </el-button>
                </template>
                </el-table-column>
        </el-table>
        <el-col class="tpl">
            <el-col :span="10">
                <el-select   v-model="filterTypes" multiple placeholder="指令筛选" @change="filterType" style="width:100%">  
                    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
            </el-col>
            <el-col :span="11">
                <el-select  v-model="values" multiple placeholder="批量选取" @change="handleSelectedAction" :disabled="cmdData.length===0" style="width:100%">
                    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
            </el-col>
            <el-col :span="1">
                &emsp;<el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
            </el-col>
        </el-col>
        <el-col :span="24" class="toolbar" style="text-align:right">
            <el-button type="info" size="small" @click="brachAdd">批量添加</el-button>
        </el-col>
    </el-col>
   </el-row>
</template>
<script>
import NProgress from "nprogress";
import { cloneObj } from "utils";
import { roadwayList,stagList } from "api/room";
import { TASKEXECTYPES, CMDTYPES,CMDSTATUS } from "@/const";

export default {
   name:'cmdByArea',
   props:{
       roomId:String,
   },
   data(){
        return { 
            areaData:[],
            cmdData:[],
            navPointData:[],
            defaultProps: {
                children: 'children',
                label: 'areaName'
            },
            cmdLoading:false,
            filterTypes:[],
            options:CMDTYPES,
            values:[],
            isIndeterminate:true,
            checkAll:false,
        }
   },
   methods:{
        sortPoint(obj){
           this.cmdData.reverse();
        },
        handleNodeClick(data){
            if(!data.areaId){
                return;
            }
            this.filterTypes=[];
            this.values=[];
            let _this = this;
            this.cmdLoading = true;
            this.checkAll = false;
            stagList(_this,{areaId:data.areaId}).then(res=>{
                this.cmdLoading= false;
                if(res.data.data){
                    this.navPointData = res.data.data.map(r => {r.cmdType = [];return r;});
                    this.cmdData = res.data.data.map(r => {r.cmdType = [];return r;});
                }else{
                    this.navPointData = [];
                    this.cmdData =[];
                }
            })
        },
        handleSelectedAction() {
            const values = this.values;
            this.cmdData.map(item => {
                item.cmdType = [];
                item.commandTypes.forEach(m => {
                if (values.includes(m + "")) {
                    item.cmdType.push(m + "");
                }
                });
                return item;
            });
            //this.handleCheckedActionChange();
        },
        // handleCheckedActionChange() {
        //     this.checkAll = this.cmdData.every(
        //         item => item.cmdType.length === item.commandTypes.length
        //     );
        //     this.isIndeterminate =
        //         this.cmdData.some(item => item.cmdType.length > 0) &&
        //         this.cmdData.some(
        //         item => item.cmdType.length < item.commandTypes.length
        //         );
        // }, 
        cmdName(type) {
            return CMDTYPES.find(i => i.value == type).label;
        },
        addArea(r){
            if(r.cmdType.length===0){
                this.$message.error("导航点没有配置指令");
            }else{
                let row =cloneObj(r).map(i=>({nvPointName: i.nvPointName,nvPointId: i.nvPointId,areaId: i.areaId, commandTypes: i.cmdType.join(",")}));
                this.$emit('addArea',row)
            }
          
        },
        brachAdd(){
            let arr = this.cmdData.filter(item=>(item.cmdType.length>0)).map(i=>({
                    nvPointName: i.nvPointName,
                    nvPointId: i.nvPointId,
                    areaId: i.areaId,
                    commandTypes: i.cmdType.join(",")
                }));
             if(arr.length===0){
                this.$message.error("没有配置指令的导航点"); 
             }else{
                this.$emit('brachAdd',arr)
             }
        },
        handleCheckAllChange(e) {
            const state = e.target.checked;
            this.cmdData.map(item => {
                item.cmdType = state ? item.commandTypes.map(m => m + "") : [];
                return item;
            });
            this.isIndeterminate = false;
        },
        getArea(){
            let self = this;
            roadwayList(self, {
                customerId: self.$store.state.user.customId
            }).then(res => {
                if (res.body.data) {
                    let room =res.body.data.find(item=>(item.roomId===self.roomId)); 
                    this.areaData=[{
                        areaName:room.roomName,
                        children:room.rbAreaInfoList
                    }];
                } else {
                   console.log('get area null')
                }
            });
        },
        filterType() {
            const types = this.filterTypes;
            if (types.length === 0) {
                this.cmdData= cloneObj(this.navPointData);
            } else {
                this.cmdData = cloneObj(this.navPointData).filter(item => {
                   return item.commandTypes.some(i => types.includes(i + ""));
                });
            }
        },
        initial(){
            this.checkAll =false;
            this.cmdData= [];
            this.filterTypes =[];
            this.values=[];
        } 
   },
   mounted(){
       this.getArea()
   },
}
</script>
<style scoped>
.sign{
    text-indent:1rem;
    height:30px;
    line-height: 30px;
    background:rgb(38, 144, 243);
    color:#fff;
    border:1px solid transparent;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
}
.tpl {
  padding: 10px;
  border: 1px solid rgba(250, 250, 250, 0.15);
  border-radius: 4px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  line-height: 9px;
}
</style>
