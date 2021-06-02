<template>
  <div class="common-main com-box-main">
    <div class="com-box-title">预报模式</div>
    <el-tabs v-model="day" class="day-tab">
      <el-tab-pane label="1天" name="1">
      </el-tab-pane>
      <el-tab-pane label="3天" name="2">
      </el-tab-pane>
      <el-tab-pane label="5天" name="3">
      </el-tab-pane>
    </el-tabs>
    <div class="distribute-chart">
      <echarts
        id="distributeCharts"
        :chart-style="chartStyle"
        :option="option"
        @getChartInstance="getInstance"
      />
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      day:'',
      chartStyle: {
        width: '100%',
        height: '90%'
      },
      option: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        grid: {
          left: '20%',
          top: '8%',
          right: '2%',
          bottom: '8%'
        },
        xAxis: {
          interval: 10,
          position: 'top',
          type: 'value',
          splitLine: {
            show: false
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: '#ffffff',
              opacity: 0.3
            }
          },
          axisTick: {
            show: true,
            lineStyle: {
              color: '#ffffff',
              opacity: 0.3
            }
          },
          axisLabel: {
            color: '#fff',
            fontSize: 12,
            fontWeight: 400
          }
        },
        yAxis: {
          type: 'category',
          data: [
            '滑动平均', '最佳系数', '双权重', '多项式拟合', 'EC'
          ],
          inverse: true,
          axisTick: {
            show: true
          },
          axisLine: {
            show: false
          },
          splitLine: {
            show: false
          },
          axisLabel: {
            color: '#fff',
            fontSize: 14,
            fontWeight: 400,
            align: 'left',
            margin: 75
          }
        },
        series: [
          {
            selectedMode: 'single',
            select: {
              label: {
                show: true
              },
              itemStyle: {
                color: '#645aa5'
              }
            },
            data: [88, 95, 75, 64, 53],
            type: 'bar',
            barWidth: '13',
            barGap:'5%',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  {
                    offset: 0,
                    color: '#82ffc2' // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: '#2c84a3' // 100% 处的颜色
                  }
                ],
                globalCoord: false // 缺省为 false
              }
            },
            emphasis: {
              itemStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 1,
                  y2: 0,
                  colorStops: [
                    {
                      offset: 0,
                      color: '#82ffc2' // 0% 处的颜色
                    },
                    {
                      offset: 1,
                      color: '#2c84a3' // 100% 处的颜色
                    }
                  ],
                  globalCoord: false // 缺省为 false
                }
              }
            },
            markLine: {
              lineStyle: {
                type: 'dashed',
                color: '#fff',
                opacity: 0.2
              },
              symbol: ['none', 'none'],
              data: []
            }
          }
        ]
      },
      instance: '',
    }
  },
  watch: {
  },
  created() {
    // this.setData(this.distributeData)
  },
  methods: {
    
    getInstance(instance) {
      this.instance = instance

      instance.dispatchAction({
        type: 'select',
        seriesIndex: 0,
        dataIndex: 0,
      })
      instance.on('selectchanged', (params) => {
        if (params.selected) {
          this.$emit('selectedGrade', params.selected[0].dataIndex[0])
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.com-box-title {
  margin: 6px 30px;
  font-size: 18px;
  color: #fff;
}
.distribute-chart {
  width: 100%;
  height: 100%;
}
</style>
<style lang="scss">
.day-tab{
  &.el-tabs{
    background-color:rgba(0,0,0,0)!important;
    border: 1px solid rgba(44,40,59,1);
    .el-tabs__item{
       color:#fff;
    }
   
  }
  
}
</style>
