<template>
    <el-row :gutter="20">
        <el-col :span="4">
           <el-tree
            class="menuTree"
            :data="menu"
            show-checkbox
            default-expand-all
            node-key="id"
            ref="tree"
            highlight-current
            :props="defaultProps"
             >
            </el-tree>
        </el-col>
        <el-col :span="20">
           <div class="banner">
			  <el-button icon="plus" type="success" size="small"  @click="handleAdd">新增角色</el-button>
		   </div>
           <el-table
                v-loading="tableLoading"
                highlight-current-row
                :data="data"
                @row-click="rowClick"
                style="width: 100%">
                <el-table-column
                    type="index"
                    width="50">
                </el-table-column>
                <el-table-column
                    align="center"
                    prop="roleName"
                    label="角色名称"
                    width="220">
                </el-table-column>
                <el-table-column
                    align="center"
                    prop="roleDescription"
                    label="简要描述">
                </el-table-column>
                <!-- <el-table-column
                    align="center"
                    prop="date"
                    label="创建日期"
                    width="200">
                </el-table-column> -->
                <el-table-column
                    label="操作"
                    align='right'
                    width="250">
                    <template slot-scope="scope">
                        <el-button v-if="scope.row.id===curId" @click="handleAuth(scope.row)" type="info" size="small">保存权限</el-button>
                        <el-button @click="handleEdit(scope.row)" type="primary" size="small">编辑</el-button>
                        <el-button type="warning" size="small" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- <el-col :span="24" class="toolbar" style="padding-bottom:10px;">
                <el-pagination layout="prev, pager, next,total,sizes,jumper" @current-change="handleCurrentChange" :page-sizes="[10, 20, 30, 40]" :page-size="size" :current-page="page" :total="total" style="float:right;" @size-change="handleSizeChange">
                </el-pagination>
            </el-col> -->
        </el-col>
        <el-dialog title="收货地址" :visible.sync="dialogFormVisible">
            <el-form :model="form" label-width="80px" :rules="rules" ref="roleForm">
                <el-form-item label="角色名称" >
                    <el-input v-model="form.roleName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="活动区域">
                   <el-input
                        type="textarea"
                        :rows="2"
                        placeholder="请输入内容"
                        v-model="form.roleDescription">
                    </el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleSubmit" v-loading="submitLoading">确 定</el-button>
            </div>
        </el-dialog>
    </el-row>
</template>
<script>
import { getRoles,getMenuTree,saveRole,deleteRole,saveRoleAuth} from "api/personnel";
import { mapState } from "vuex";
  
 
export default {
  data() {
    return {
      menu: [],
      data: [],
      defaultProps: {
        children: "children",
        label: "name"
      },
      total: 0,
      page: 1,
      size: 10,
      dialogFormVisible:false,
      form:{},
      tableLoading:false,
      rules:{
        roleName: [{
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
        }],
      },
      submitLoading:false,
      curId:'',
      gather:[]
    };
  },
  computed: {
    ...mapState(["user"])
  },
  methods: {
    handleCurrentChange(val) {
      this.page = val;
      
    },
    handleSizeChange(size) {
      this.page = 1;
      this.size = size;
      
    },
    rowClick(r,e,c){
      if(this.curId!==r.id){
       this.curId = r.id;
       this.handleMenu({rid:r.id});
      }
    },
    handleMenu(para) {
      let _this = this;
      getMenuTree(_this,para)
        .then(res => {
          let {result,data} = res.data
           if(result===200){   
             _this.menu = data?[data]:[];
               _this.gather =[];
               _this.getKey(data.children);
             _this.$refs.tree.setCheckedKeys(_this.gather);
           }else{
             _this.menu=[];
           }
        })
        .catch(e => {
          console.log(e);
        });
    },
    handleRoles(){
        let _this = this;
        const { customId} = this.user;
        this.tableLoading = true,
        getRoles(_this,{customId:customId}).then(res=>{
            _this.tableLoading =false;
            let {result,data} = res.data
           if(result===200){
               _this.data=data?data:[];
           }
        })
    },
    handleEdit(r) {
       this.form= {...r};
       this.dialogFormVisible = true;
    },
    handleAdd(){
      this.form = {roleName:'',roleDescription:''};
      this.dialogFormVisible = true;
    },
    handleDelete(r){
        let _this = this; 
       _this.$confirm("确认删除吗？", "提示", {}).then(() => { 
           deleteRole(_this,{id:r.id}).then(res=>{
               if (res.data.result === 200) {
                    _this.$message({
                    message: "删除成功",
                    type: "success"
                    });
                } else {
                    _this.$message.error("删除失败，请重试");
                }
                this.handleRoles();
           }).catch(e=>{}) 
       }).catch(e=>{})
    },
    handleSubmit(){
        let _this =this;
        const { customId } = this.user;
        _this.$refs.roleForm.validate(valid => {
        if (valid) {
          _this.$confirm("确认提交吗？", "提示", {}).then(() => {
               _this.submitLoading =true;
               saveRole(_this,{..._this.form,customId}).then(res=>{
                    _this.dialogFormVisible = false;
                    _this.submitLoading =false;
                    if (res.data.result === 200) {
                        _this.$message({
                        message: "保存成功",
                        type: "success"
                        });
                    } else {
                        _this.$message.error("保存失败，请重试");
                    }
                    this.handleRoles();
               }).catch(e=>{})
          }).catch()
        }
      })
    },
    handleAuth(r){
        let _this = this;
        const { customId } = this.user;
        let roles = this.$refs.tree.getCheckedKeys().map(item=>({pid:item}));
        if(roles.length>0){
           saveRoleAuth(_this,{_info:JSON.stringify({rid:r.id,customId,roles})}).then(res=>{
                if (res.data.result === 200) {
                    _this.$message({
                    message: "保存成功",
                    type: "success"
                    });
                } else {
                    _this.$message.error("保存失败，请重试");
                }
                _this.curId = '';
                _this.$refs.tree.setCheckedKeys([]);
                _this.handleRoles();
           })
        }else{
            _this.$message.error("权限不能为空");  
        }
    },
    getKey(data){
      data.forEach(item=>{
            if(item.checked){
                this.gather.push(item.id)
            }
            if(item.children){
                this.getKey(item.children);
            }
        })
            
    }
  },
  mounted() {
    this.handleMenu( {rid:0 });
    this.handleRoles();
  }
};
</script>
<style scoped="scpoed">
.menuTree {
  border: 1px solid rgba(250, 250, 250, 0.35);
  min-height: 80vh;
  min-width: 200px;
}
.banner {
  text-align:right;
  background: #9da4b7;
  border: 1px solid #dee5e7;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #333;
}
</style>


