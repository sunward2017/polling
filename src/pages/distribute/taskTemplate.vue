 <template>
  <section>
    <el-row :gutter="20">
	 <el-col :span="6">
     <el-tree
	    style="height:80vh"
      :data="data"
      :props="defaultProps"
      accordion
      @node-click="handleNodeClick">
	    </el-tree>
	 </el-col>
	 <el-col :span="18">
		
   <el-form :inline="true" :model="formInline" class="tpl">
      <el-col :span="16">
          <el-form-item label="动作属性">
          <el-select v-model="types" multiple placeholder="请选择" @change="filterType" style="width:200%">
            <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="选取项">
          <el-select v-model="values" multiple placeholder="请选择" @change="handleSelectedAction">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                </el-option>
            </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="2">
        <el-form-item>
           <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
        </el-form-item>
      </el-col>
    </el-form>
		<el-table
			:data="rfidData1"
			style="margin-bottom:20px;">
			<el-table-column
			prop="date"
			label="日期"
			width="180">
			</el-table-column>
			<el-table-column
			prop="name"
			label="姓名"
			width="180">
			</el-table-column>
		  <el-table-column
      label="操作"
       >
      <template scope="scope">
        <el-checkbox-group v-model="scope.row.actions" @change="handleCheckedActionChange">
          <el-checkbox v-for="item in scope.row.address" :label="item.id" :key="item.id">{{item.type}}</el-checkbox> 
        </el-checkbox-group>
      </template>
    </el-table-column>
		</el-table>
		 <el-form class="tpl" :inline="true" :model="formInline" style="padding-left:5px;">
			<el-form-item label="任务名称">
				<el-input v-model="formInline.taskName" placeholder="请输入任务名称"></el-input>
			</el-form-item>
			<el-form-item label="制作人">
				 <el-input v-model="formInline.user" placeholder="制作人"></el-input>
			</el-form-item>
			<el-form-item label="备注">
				 <el-input v-model="formInline.remark"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" >保存</el-button>
			</el-form-item>
		 </el-form>
		<el-table
			:data="rfidData"
			style="width: 100%">
			<el-table-column
			prop="date"
			label="日期"
			width="180">
			</el-table-column>
			<el-table-column
			prop="name"
			label="姓名"
			width="180">
			</el-table-column>
			<el-table-column
			prop="address"
			label="地址">
			</el-table-column>
		</el-table>
	</el-col>	
	</el-row> 
  </section>	 
 </template>
 <script>
export default {
  data() {
    return {
      data: [
        {
          label: "一级 1",
          children: [
            {
              label: "二级 1-1"
            }
          ]
        },
        {
          label: "一级 2",
          children: [
            {
              label: "二级 2-1",
              children: [
                {
                  label: "三级 2-1-1"
                }
              ]
            },
            {
              label: "二级 2-2",
              children: [
                {
                  label: "三级 2-2-1"
                }
              ]
            }
          ]
        },
        {
          label: "一级 3",
          children: [
            {
              label: "二级 3-1",
              children: [
                {
                  label: "三级 3-1-1"
                }
              ]
            },
            {
              label: "二级 3-2",
              children: [
                {
                  label: "三级 3-2-1"
                }
              ]
            }
          ]
        }
      ],
      defaultProps: {
        children: "children",
        label: "label"
      },
      options: [
        {
          value: "1",
          label: "拍摄"
        },
        {
          value: "2",
          label: "气味监测"
        },
        {
          value: "3",
          label: "温度"
        },
        {
          value: "4",
          label: "烟雾"
        }
      ],
      types: [],
      values: [],
      isIndeterminate: true,
      checkAll: true,
      originalData: [
        {
          date: "2016-05-02",
          name: "王小虎",
          address: [
            { id: "1", type: "拍摄" },
            { id: "2", type: "气味监测" },
            { id: "3", type: "温度" },
            { id: "4", type: "烟雾" }
          ],
          actions: []
        },
        {
          date: "2016-05-04",
          name: "王小虎",
          address: [
            { id: "1", type: "拍摄" },
            { id: "3", type: "温度" },
            { id: "4", type: "烟雾" }
          ],
          actions: []
        },
        {
          date: "2016-05-01",
          name: "王小虎",
          address: [
            { id: "1", type: "拍摄" },
            { id: "2", type: "气味监测" },
            { id: "4", type: "烟雾" }
          ],
          actions: []
        },
        {
          date: "2016-05-03",
          name: "王小虎",
          address: [
            { id: "1", type: "拍摄" },
            { id: "2", type: "气味监测" },
            { id: "3", type: "温度" }
          ],
          actions: []
        }
      ],
      rfidData1: [],
      rfidData: [
        {
          date: "2016-05-02",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄"
        },
        {
          date: "2016-05-04",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1517 弄"
        },
        {
          date: "2016-05-01",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1519 弄"
        },
        {
          date: "2016-05-03",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1516 弄"
        }
      ],
      formInline: {
        taskName: "",
        user: "",
        remark: ""
      }
    };
  },
  methods: {
    handleNodeClick(data) {},
    handleCheckAllChange(e) {
      const state = e.target.checked;
      this.rfidData1.map(item => {
        item.actions = state ? item.address.map(m => m.id) : [];
        return item;
      });
      this.isIndeterminate = false;
    },
    handleCheckedActionChange() {
      this.checkAll = this.rfidData1.every(
        item => item.actions.length === item.address.length
      );
      this.isIndeterminate =this.rfidData1.some(item => item.actions.length > 0)&&this.rfidData1.some(item => item.actions.length < item.address.length);
    },
    filterType() {
      const types = this.types;
      if (types.length === 0) {
        this.rfidData1 = this.originalData;
      } else {
        this.rfidData1 = this.originalData.filter(item => {
          return item.address.some(i => types.includes(i.id));
        });
      }
    },
    handleSelectedAction(){
       const values = this.values;
       this.rfidData1.map(item=>{
            item.actions=[];
            item.address.forEach(m=>{
               if(values.includes(m.id)){
                 item.actions.push(m.id);
               }
            })
            return item;
       })
       this.handleCheckedActionChange() 
    }
  },
  mounted() {
    this.rfidData1 = this.originalData;
  }
};
</script>
 <style scoped>
.tpl {
  background: #9da4b7;
  padding: 5px 0;
  border: 1px solid #dee5e7;
  border-radius: 4px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 20px;
}
.custom-theme .el-form-item {
  margin: 0;
}
.rfid-action {
  margin-right: 10px;
}
</style>
 
 