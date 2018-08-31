<template>
  <section>
    <el-row :gutter="20">
		<el-col :span="6">
			 <el-tree
			    style="height:330px;overflow-y:scroll"
				:data="data2"
				:props="defaultProps"
				node-key="id"
				accordion
				:expand-on-click-node="false"
				:render-content="renderContent">
			</el-tree>
		</el-col>
		<el-col :span="18">
            <div class="toolbar">
				<el-button type="success" icon="plus" size="small">新增导航点</el-button>
			</div>
			<el-table
				:data="tableData"
				height="250"
				 >
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
	<div class="banner">
		导航点巡检操作：<el-button icon="plus" type="success" size="small">新增巡检操作</el-button>
	</div>
	<el-table
				:data="tableData"
				height="250"
				 >
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
  </section>	
</template>
<script>
let id = 1000;

export default {
  data() {
    return {
      data2: [
        {
          id: 1,
          label: "一级 1",
          children: [
            {
              id: 4,
              label: "二级 1-1"
            }
          ]
        },
        {
          id: 2,
          label: "一级 2",
          children: [
            {
              id: 5,
              label: "二级 2-1"
            },
            {
              id: 6,
              label: "二级 2-2"
            }
          ]
        },
        {
          id: 3,
          label: "一级 3",
          children: [
            {
              id: 7,
              label: "二级 3-1"
            },
            {
              id: 8,
              label: "二级 3-2"
            }
          ]
        }
      ],
      defaultProps: {
        children: "children",
        label: "label"
      },
      tableData: [
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
        },
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
      ]
    };
  },

  methods: {
    append(store, data) {
      console.log(data);
      // store.append({ id: id++, label: 'testtest', children: [] }, data);
    },

    remove(store, data) {
      console.log(store);
      //store.remove(data);
    },

    renderContent(h, { node, data, store }) {
      if (data.children) {
        return (
          <span>
            <span>
              <span>{node.label}</span>
            </span>
            <span style="float: right; margin-right: 20px">
              <el-button size="mini" on-click={() => this.append(store, data)}>
                添加巷道
              </el-button>
            </span>
          </span>
        );
      }else{
		  return(
        <span>
		   	  <span>
            <span>{node.label}</span>
           </span>
            <span style="float: right; margin-right: 20px">
              <el-button size="mini" on-click={() => this.remove(store, data)}>
                删除巷道
              </el-button>
            </span>
        </span>  
		  ) 
	  }
    }
  }
};
</script>
<style>
.banner {
  background: #c7cdde;
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #dee5e7;
  border-radius: 4px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 20px;
}
</style>
