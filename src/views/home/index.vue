<template>
  <div class="home-main">
    <el-tabs v-model="activeName" @tab-click="typeClick" class="typeTab">
      <el-tab-pane label="最高气温" name="1"></el-tab-pane>
      <el-tab-pane label="最低气温" name="2"></el-tab-pane>
      <!-- <el-tab-pane label="降水量" name="3"></el-tab-pane> -->
    </el-tabs>

    <el-tabs
      v-model="tabTime"
      type="card"
      @tab-click="handleClick"
      class="timeTab"
    >
      <el-tab-pane
        :label="item.label"
        :name="item.name"
        v-for="(item, index) in tabList"
        :key="index"
      ></el-tab-pane>
    </el-tabs>
    <div class="table1" v-loading="loading">
      <template v-for="(item, index) in todos">
        <!-- :class="{'table-scale':islarge===index}" -->
        <el-table
          :key="index"
          border
          style="width: 100%"
          :data="item.tableData"
          size="mini"
          :fit="true"
          @row-dblclick="scale($event, item)"
        >
          <el-table-column :label="item.title" align="center">
            <el-table-column prop="time" label="时间" align="center">
              <template slot-scope="scope">
                {{ scope.row.time | lookupFormatter(areaLookUp) }}
              </template>
            </el-table-column>
            <el-table-column
              :prop="time"
              width="55px"
              :label="time"
              v-for="(time, tindex) in timeColumn"
              :key="tindex"
              align="center"
            >
              <template slot-scope="scope">
                <span
                  v-if="
                    parseFloat(scope.row[time]) -
                      parseFloat(scope.row[time + 'a']) >
                    2
                  "
                  class="high"
                  >{{ scope.row[time] || '-' }}</span
                >
                <span
                  v-else-if="
                    parseFloat(scope.row[time]) -
                      parseFloat(scope.row[time + 'a']) <
                    -2
                  "
                  class="low"
                  >{{ scope.row[time] || '-' }}</span
                >
                <span v-else>{{ scope.row[time] || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="area" align="center">
              <template slot="header">
                <span>误差</span>
                <br />
                <span>范围</span>
              </template>
            </el-table-column>
            <el-table-column prop="midium" align="center">
              <template slot="header">
                <span>误差</span>
                <br />
                <span>中数</span>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </template>
    </div>
    <el-dialog
      :title="largeData.title"
      :visible.sync="islarge"
      width="100%"
      fullscreen
      :before-close="handleClose"
    >
      <el-table
        border
        :data="largeData.tableData"
        header-row-class-name="big-header"
      >
        <el-table-column prop="time" label="时间" align="center">
          <template slot-scope="scope">
            {{ scope.row.time | lookupFormatter(areaLookUp) }}
          </template></el-table-column
        >
        <el-table-column
          :prop="time"
          :label="time"
          v-for="(time, tindex) in timeColumn"
          :key="tindex"
          align="center"
        >
          <template slot-scope="scope">
            <span
              v-if="
                parseFloat(scope.row[time]) -
                  parseFloat(scope.row[time + 'a']) >
                2
              "
              class="high"
              >{{ scope.row[time] || '-' }}</span
            >
            <span
              v-else-if="
                parseFloat(scope.row[time]) -
                  parseFloat(scope.row[time + 'a']) <
                -2
              "
              class="low"
              >{{ scope.row[time] || '-' }}</span
            >
            <span v-else>{{ scope.row[time] || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="area" align="center">
          <template slot="header">
            <span>误差</span>
            <br />
            <span>范围</span>
          </template>
        </el-table-column>
        <el-table-column prop="midium" align="center">
          <template slot="header">
            <span>误差</span>
            <br />
            <span>中数</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { getDate, getTableData } from '@/api/map'
export default {
  data() {
    return {
      loading: false,
      activeName: '1',
      timeColumn: [
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
      ],
      areaLookUp: [{
        value: '瓮安',
        key: '57728'
      }, {
        value: '福泉',
        key: '57821'
      }, {
        value: '贵定',
        key: '57824'
      }, {
        value: '龙里',
        key: '57913'
      }, {
        value: '惠水',
        key: '57912'
      }, {
        value: '长顺',
        key: '57818'
      }, {
        value: '罗甸',
        key: '57916'
      }, {
        value: '平塘',
        key: '57921'
      }, {
        value: '独山',
        key: '57922'
      }, {
        value: '荔波',
        key: '57926'
      }, {
        value: '三都',
        key: '57923'
      }, {
        value: '都匀',
        key: '57827'
      }],
      timestrampColumn: [],
      tabTime: '',
      todos: [
        {
          title: "滑动平均",
          tableData: [

          ]
        },
        {
          title: "最佳系数",
          tableData: [

          ]
        },
        {
          title: "双权重",
          tableData: [

          ]
        },
        {
          title: "多项式拟合",
          tableData: [

          ]
        }
      ],
      tabList: [],
      islarge: false,
      largeData: {}
    };
  },
  methods: {
    typeClick() {
      this.fetchTable()
    },
    handleClick() {
      this.setTableTime()
      this.fetchTable()
    },
    fetchTable() {
      this.loading = true
      getTableData({ area: JSON.stringify(this.timestrampColumn), date: this.tabTime, way: 0, type: this.activeName }).then(res => {
        this.todos[0].tableData = res
        this.loading = false
      })
      getTableData({ area: JSON.stringify(this.timestrampColumn), date: this.tabTime, way: 1, type: this.activeName }).then(res => {
        this.todos[1].tableData = res
        this.loading = false
      })
      getTableData({ area: JSON.stringify(this.timestrampColumn), date: this.tabTime, way: 2, type: this.activeName }).then(res => {
        this.todos[2].tableData = res
        this.loading = false
      })
      getTableData({ area: JSON.stringify(this.timestrampColumn), date: this.tabTime, way: 3, type: this.activeName }).then(res => {
        this.todos[3].tableData = res
        this.loading = false
      })
    },
    setTableTime(){
      this.timestrampColumn = []
      this.timeColumn = []
      for (let index = 0; index < 10; index++) {
          this.timestrampColumn.push(parseInt(this.tabTime)-1000*12*60*60*(index+1))
          this.timeColumn.push(this.$moment(parseInt(this.tabTime)-1000*12*60*60*(index+1)).format('DD-HH'))
      }
    },
    fetchData() {
      getDate({ count: 10 }).then(res => {
        this.timeColumn = []
        for (let index = 0; index < 10; index++) {
          this.tabList[index] = { label: this.$moment(res[0].dtime_ec + 1000 * 12 * 60 * 60 * (-8 + index - 2)).format('DD日HH时'), name: res[0].dtime_ec + 1000 * 12 * 60 * 60 * (index -10) + '' }
        }
        for (let index = 10; index < 24; index++) {
          this.tabList[index] = { label: this.$moment(res[0].dtime_ec + 1000 * 12 * 60 * 60 * (index -10)).format('DD日HH时'), name: res[0].dtime_ec + 1000 * 12 * 60 * 60 * (index -10) + '' }
        }
        this.tabTime = this.tabList[0].name
        
        this.setTableTime()
        // res.map(item => {
        //   this.timestrampColumn.push(item.dtime_ec)
        //   this.timeColumn.push(this.$moment(item.dtime_ec).format('DD-HH'))
        // })
        this.fetchTable()
      })

    },
    scale: function (e, item) {
      this.largeData = item;
      this.islarge = true
    },
    handleClose() {
      this.islarge = false
    }
  },
  created() {
    this.todos.map((item, index) => { });
    this.fetchData()
  }
};
</script>
<style lang="scss" scoped>
.home-main {
  margin-top: 5px;
}
.timeTab {
  // margin-top: 15px;
}
</style>
<style lang="scss">
.big-header {
  th {
    background: #f5f7fa;
  }
}
.typeTab {
  background-color: #f9f9f9;
  padding: 0 18px;
  .el-tabs__header {
    margin: 0;
  }
  .el-tabs__item {
    font-weight: 700;
    color: #304156;
  }
  .el-tabs__item:hover {
    color: #42b983;
    cursor: pointer;
  }
  .el-tabs__item.is-active {
    color: #42b983;
  }
  .el-tabs__active-bar {
    display: none;
  }
  .el-tabs__nav-wrap::after {
    display: none;
  }
}
.timeTab {
  .el-tabs__header {
    margin: 0;
  }
  .el-tabs__item {
    height: 30px;
    line-height: 30px;
  }
}
.table1 {
  // display: flex;
  // justify-content: center;
  // flex-wrap: wrap;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 10px;
  row-gap: 10px;
  padding: 10px 20px;
  .el-table--mini td,
  .el-table--mini th {
    padding: 2px 0;
  }
  .el-table .cell {
    line-height: 21px;
  }
}
.table-main {
  width: calc((100vw - 280px) / 2);
  margin-bottom: 15px;
  margin-right: 10px;
}
.high {
  color: #f56c6c;
}
.low {
  color: #e6a23c;
}
</style>