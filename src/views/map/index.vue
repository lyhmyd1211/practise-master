<template>
  <div class="map-main">
    <!-- <div class="center-disc box-inside">
      <radar :selected="selected"></radar>
    </div>-->
    <div class="top">
      <div class="time-box">
        <el-button
          v-for="(item, index) in timeBtn"
          :key="index"
          @click="timeClick(item.time)"
          :class="{ 'btn-active': curBtn == item.time }"
          >{{ item.name }}</el-button
        >
      </div>
      <el-slider
        v-model="slider"
        :step="step"
        :class="['slider', { isChoose }]"
        :marks="marks"
        :show-tooltip="false"
        @change="sliderChange"
      ></el-slider>
    </div>
    <grade class="grade" @selectedGrade="getGrade"></grade>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="最高气温" name="1"></el-tab-pane>
      <el-tab-pane label="最低气温" name="2"></el-tab-pane>
      <!-- <el-tab-pane label="降水量" name="3"></el-tab-pane> -->
    </el-tabs>
    <div class="map-content">
      <div
        v-loading="loading"
        element-loading-text="加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
        class="map-chart"
      >
        <echarts
          id="mapCharts"
          :chart-style="chartStyle"
          :option="option"
          @getChartInstance="getInstance"
        />
        <el-breadcrumb separator="/" class="bread">
          <el-breadcrumb-item v-for="(item, index) in areaRoute" :key="index">
            <a @click="mapClick(item)">{{ item.name }}</a>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="describle">
        <div>
          <span>预报方法：</span>
          <span>{{ gradeName[gradeSelect] }}</span>
        </div>
        <div>
          <span>起报时间：</span>
          <span>{{ curBtn | timeFormatter('DD日HH时') }}</span>
        </div>
        <div>
          <span>预报时间：</span>
          <span>{{
            marks[toFix(slider, 2)] ? marks[toFix(slider, 2)].label : ''
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
var geojsonMerge = require("@mapbox/geojson-merge");
// import gzMap from '../../../../assets/json/520000.json'
// import china1 from '../../../../assets/json/china1.json'
// import areaData from '../../../../assets/json/area.json'
import gzMap from "../../assets/area/province/520000.json";
import china1 from "../../assets/area/china.json";
import areaData from "../../assets/area/area.json";
import locationData from "../../assets/area/location.json";
import Axios from "axios";
import { getAreaCodeType } from "@/utils/tools";
import { mapGetters } from "vuex";
import { CodeToText } from "element-china-area-data";
import { toFix } from '@/utils/tools'
import { getDate, getMapByDate } from '@/api/map'
import Grade from './grade.vue';

export default {
  components: { Grade },
  // props: {
  //   mapData: {
  //     type: Array,
  //     default() {
  //       return [];
  //     }
  //   }
  // },

  data() {
    return {
      toFix,
      timer: '',
      slider: 0,
      curTime: {},
      switchData: '',
      isChoose: true,
      marks: {

      },
      gradeName: ['滑动平均', '最佳系数', '双权重', '多项式拟合', 'EC'],
      step: 100 / 13,
      curBtn: "",
      timeBtn: {},
      hideTip: false,
      activeName: "1",
      mapData: [
        {
          name: "57818",
          value: [
            "106.450000",
            "26.033333",

          ]
        },
        { name: "57913", value: ["106.983333", "26.450000"] },
        { name: "57821", value: ["107.500000", "26.700000"] },
        { name: "57824", value: ["107.233333", "26.583333"] },
        { name: "57921", value: ["107.350000", "25.850000"] },
        { name: "57728", value: ["107.466667", "27.050000"] },
        { name: "57923", value: ["107.866667", "25.983333"] },
        { name: "57922", value: ["107.550000", "25.833333"] },
        { name: "57926", value: ["107.883333", "25.416667"] },
        { name: "57916", value: ["106.766667", "25.433333"] },
        { name: "57912", value: ["106.633333", "26.133333"] },
        { name: "57827", value: ["107.500000", "26.316667"] }
      ],
      userInfo: {
        province: "",
        city: "",
        county: ""
      },
      instance: "",
      china1: "",
      gzMap: "",
      areaData: "",
      locationData: "",
      loading: false,
      areaRoute: [],
      areaType: ["province", "city", "county"],
      selected: {
        data: [],
        name: ""
      },
      gradeSelect: 0,
      chartStyle: {
        width: "100%",
        height: "100%"
      },
      parentStyle: {
        // clickable: true,
        itemStyle: {
          areaColor: "rgba(34,30,62,0.6)",
          borderColor: "rgba(80,71,139,0.6)",
          borderWidth: 0,
          shadowBlur: 10,
          shadowColor: "rgba(0, 0, 0, 0.8)",
          shadowOffsetX: -5,
          shadowOffsetY: 10
        }
      },
      childrenStyle: {
        clickable: true,
        // selected: true,
        itemStyle: {
          areaColor: "rgba(34,30,62,0)",
          borderColor: "rgba(80,71,139,1)",
          borderWidth: 1,
          shadowBlur: 10,
          shadowColor: "rgba(0, 0, 0, 1)",
          shadowOffsetX: 5,
          shadowOffsetY: 10
        },
        label: {
          show: true,
          color: "#55E5FF",
          fontSize: 14
        },
        emphasis: {
          show: false,
          label: {
            show: false,
            color: "#55E5FF",
            fontSize: 14
          },
          itemStyle: {
            areaColor: "rgba(246,205,97,1)",
            borderColor: "rgba(44,40,59,1)",
            borderWidth: 2,
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 1)",
            shadowOffsetX: 5,
            shadowOffsetY: 10
          }
        }
      },
      option: {
        tooltip: {
          // alwaysShowContent: true,
          triggerOn: "none",
          backgroundColor: "rgba(81,72,136,0.5)",
          borderColor: "#a9a2d2",
          borderWidth: 1,
          padding: 0,
          // enterable: true,
          transitionDuration: 0,
          textSyle: {
            width: 500
          },
          formatter: param => {
            let td = "";
            if (param.data.value[2]) {
              for (
                let index = 0;
                index < param.data.value[2].productList.length;
                index++
              ) {
                const element = param.data.value[2].productList[index];
                td += `<tr >
                 <td>
                              ${element.highT && element.highT != 0
                    ? element.highT
                    : "-"
                  }
                              </td>
                                <td>
                               ${element.downT && element.downT != 0
                    ? element.downT
                    : "-"
                  }
                              </td>
                              <td>
                              ${element.R}
                              </td>
                             
                            
                            </tr>`;
              }
              return (
                `<div class="tool-box">
                      <div class="tool-box-title">${param.data.num}</div>
                      <div class="tool-box-content">
                         <table >
                          <thead>
                              <td>
                                最高气温（℃）
                              </td>
                              <td>
                                最低气温（℃）
                              </td>
                              <td>
                                降水量（mm）
                              </td>
                          </thead>
                          <tbody>` +
                td +
                `</tbody>
                        </table>
                        <div class="tool-box-text">预报方法：${param.data.value[2].industrialOutputValue}</div>
                        <div class="tool-box-text">起报时间：${param.data.value[2].time}</div>
                        <div class="btn">
                        <a class="btn-content" href="/credit/detail?s=${param.name}">查看详情>></a>
                        </div>
                      </div>
                    </div>
                    `
              );
            }
          }
        },
        geo: [
          {
            scaleLimit: {
              min: 5,
              max: 25
            },

            zoom: 15,
            roam: true,
            left: "20%",
            top: "15%",
            center: [105.713478, 26.578343],
            show: true,
            map: "china",
            label: {
              show: false,
              color: "#55E5FF",
              fontSize: 14
            },
            silent: false,
            itemStyle: {
              areaColor: "rgba(25,21,39,1)",
              borderColor: "rgba(44,40,59,1)",
              borderWidth: 2
            },
            emphasis: {
              label: {
                show: false
              },
              itemStyle: {
                areaColor: "rgba(25,21,39,1)",
                borderColor: "rgba(44,40,59,1)",
                borderWidth: 2
              }
            },
            regions: []
          }
        ],
        series: [
          {
            name: "scatterPointer",
            type: "effectScatter",
            coordinateSystem: "geo",
            data: this.mapData,
            symbolSize: 8,
            showEffectOn: "emphasis",
            rippleEffect: {
              color: "rgba(69, 36, 61, 1)",
              scale: 5
              // brushType: "stroke"
            },
            hoverAnimation: true,
            label: {
              formatter: (param) => {
                return param.data.num + '\n' + param.data.name
              },
              position: "right",
              show: true,
              align: 'left',
              color: "rgba(223,66,79,1)"
            },
            itemStyle: {
              color: "rgba(223,66,79,1)"
            },
            emphasis: {
              label: {
                formatter: (param) => {
                  return param.data.num + '\n' + param.data.name
                },
                position: "right",
                show: true,
                align: 'left',
                color: "rgba(223,66,79,1)"
              },
              itemStyle: {
                color: "rgba(223,66,79,1)",
                borderColor: "rgba(127, 46, 65, 1)",
                borderWidth: 3
              }
            },
            zlevel: 3
          }
        ]
      }
    };
  },
  computed: {
    // ...mapGetters(["userInfo"]),
    isMatch() {
      return this.selected.name && this.instance;
    }
  },
  watch: {
    mapData: {
      handler(val) {
        console.log("val", val);
        // this.selected =
        //   val && val.length > 0
        //     ? val[0]
        //     : {
        //         data: [],
        //         name: ""
        //       };
        this.option.series[0].data = val;
      },
      immediate: true
    },
    isMatch() {
      this.$nextTick(() => {
        this.instance.dispatchAction({
          type: "highlight",
          seriesName: "scatterPointer",
          name: this.selected.name
        });
        this.instance.dispatchAction({
          type: "showTip",
          seriesIndex: 0,
          name: this.selected.name
        });
      });
    }
  },
  beforeCreate() {
    echarts.registerMap('china', china1)
  },
  async created() {
    this.loading = true;
    // await Axios.get(`/admin/area/china.json`).then(res => {
    //   this.china1 = res.data;
    // });
    // await Axios.get(`/admin/area/province/520000.json`).then(res => {
    //   this.gzMap = res.data;
    // });
    // await Axios.get(`/admin/area/area.json`).then(res => {
    //   this.areaData = res.data;
    // });
    // await Axios.get(`/admin/area/gz_location.json`).then(res => {
    //   this.locationData = res.data;
    //   this.loading = false;
    // });
    this.china1 = china1;
    this.gzMap = gzMap;
    this.areaData = areaData;
    this.locationData = [locationData];
    const { province, city, county } = {
      province: "",
      city: "",
      county: ""
    };
    if (county) {
      this.mapClick({ code: county, name: CodeToText[county] });
    } else if (city) {
      this.mapClick({ code: city, name: CodeToText[city] });
    } else {
      this.mapClick({ code: "520000", name: "贵州省" });
    }
    // this.mapClick({})
    // const maps = await geojsonMerge.merge([this.china1, this.gzMap])
    // await echarts.registerMap('china', maps)
    // await this.setAreaData(this.areaData, 1, { name: '贵州省', code: '520000' })
    this.fetchData()

    this.mapData.map(item => {
      item.num = '-'
      item.value = [...item.value, {
        industrialOutputValue: '-',
        productList: [
          { R: "-", highT: "-", downT: "-" },
        ],
        time: "-"
      }]
    })

  },
  // created() {},
  methods: {
    getGrade(index) {
      this.gradeSelect = index
      this.fetchMap(this.curBtn, this.curTime.value, this.gradeSelect)
    },
    sliderEnter() {
      clearTimeout(this.timer)
    },
    sliderLeave() {
      this.timer = setTimeout(() => {
        this.isChoose = false
      }, 5000);
    },
    chooseClick() {
      this.isChoose = true
    },
    resetCurTime() {
      this.marks[0] = {
        style: {
          color: '#55E5FF'
          
        },
        label: this.marks[0].label,
        value: this.marks[0].value
      }
      this.curTime = {
        name: this.marks[0].label,
        value:this.marks[0].value,
        pos: Object.keys(this.marks).findIndex(i => i == 0) + 1
      }
      this.slider = 0
    },
    resetSlider() {
      for (let index = 0; index < 15; index += 2) {
        this.marks[toFix(this.step * (index), 2)] = {
        style: {
          // color: '#55E5FF'
          
        },
        label: this.$moment(this.curBtn + 1000 * 12 * 60 * 60 * (index+1)).format('HH时'),
        value: this.curBtn + 1000 * 12 * 60 * 60 * (index+1)
      }
        // this.marks[toFix(this.step * (index), 2)] = this.$moment(this.curBtn + 1000 * 12 * 60 * 60 * (index+1)).format('HH时')
        this.marks[toFix(this.step * (index + 1), 2)] = {
        style: {
          // color: '#55E5FF'
          
        },
        label: this.$moment(this.curBtn + 1000 * 12 * 60 * 60 * (index+2)).format('HH时DD日'),
        value: this.curBtn + 1000 * 12 * 60 * 60 * (index+2)
      }
        // this.$moment(this.curBtn + 1000 * 12 * 60 * 60 * (index+2)).format('HH时DD日')
      }
      this.marks = { ...this.marks }
    },
    sliderChange() {
      this.resetSlider()
      this.marks[toFix(this.slider, 2)] = {
        style: {
          color: '#55E5FF'
        },
        label: this.marks[toFix(this.slider, 2)].label,
        value: this.marks[toFix(this.slider, 2)].value
      }
      this.curTime = {
        name: this.marks[toFix(this.slider, 2)].label,
        value:this.marks[toFix(this.slider, 2)].value,
        pos: Object.keys(this.marks).findIndex(i => i == toFix(this.slider, 2))
      }
      this.fetchMap(this.curBtn, this.curTime.value, this.gradeSelect)
      // this.isChoose = false
    },
    fetchMap(date1, date2, way) {
      getMapByDate({ date1, date2, way }).then(res => {
        this.mapData = this.mapData.map(el => {
          if (res.data.data.length > 0) {
            res.data.data.map(item => {
              if (item.stationid === el.name) {
                el.num = this.activeName === '1' ? (item.hT>50||item.hT<-20)?'-':item.hT : this.activeName === '2' ? (item.dT>50||item.dT<-20)?'-':item.dT: '-'
                el.value[2] = {
                  industrialOutputValue: this.gradeName[this.gradeSelect],
                  productList: [
                    { R: "-", highT: (item.hT>50||item.hT<-20)?'-':item.hT, downT: (item.dT>50||item.dT<-20)?'-':item.dT },
                  ],
                  time: this.$moment(date1).format('DD日HH时')
                }
              }
            })
          } else {
            el.num = '-'
            el.value[2] = {
              industrialOutputValue: '-',
              productList: [
                { R: "-", highT: "-", downT: "-" },
              ],
              time: "-"
            }
          }

          return el
        })
        this.selected = {
          data: [],
          name: ""
        }
      })
    },
    fetchData() {
      getDate({ count: 5 }).then(res => {
        this.timeBtn = res.map((item, index) => {
          return {
            name: this.$moment(item.dtime_ec).format('DD日HH时'),
            time: item.dtime_ec
          }
        })
        this.curBtn = res[0].dtime_ec
        this.resetSlider()
        this.resetCurTime()
        this.fetchMap(res[0].dtime_ec, this.curTime.value, this.gradeSelect)

      })
    },
    timeClick(btn) {
      this.curBtn = btn;
      this.resetSlider()
      this.resetCurTime()
      this.fetchMap(this.curBtn, this.curTime.value, this.gradeSelect)
    },
    handleClick() {
      this.fetchMap(this.curBtn, this.curTime.value, this.gradeSelect)
    },
    mapClick(region) {
      this.$emit("mapClick", region);
      this.loading = true;


      Axios.get(
        `/admin/area/${this.areaType[getAreaCodeType(region.code) - 1]}/${region.code
        }.json`
      )
        .then(res => {
          const tmp = this.areaRoute.filter(i => i.code == region.code);
          // let type = region.type
          if (tmp && tmp.length > 0) {
            this.areaRoute = this.areaRoute.slice(
              0,
              this.areaRoute.findIndex(i => i.code == region.code) + 1
            );
          } else {
            this.areaRoute.push(region);
          }
          const areas = this.getArea(
            this.areaData,
            getAreaCodeType(region.code) - 1,
            region.code
          );
          if (
            areas.length > 0 &&
            areas[0].children &&
            getAreaCodeType(region.code) !== 1
          ) {
            this.setAreaData(areas[0].children, {
              name: region.name,
              code: region.code
            });
          } else {
            this.setAreaData(areas, { name: region.name, code: region.code });
          }
          const maps = geojsonMerge.merge([this.china1, this.gzMap, res.data]);
          console.log('aaaaaaaaaa', maps);
          echarts.registerMap("china", maps);
          this.setZoom(getAreaCodeType(region.code) - 1);
          this.setLocation(region.code);
          this.loading = false;
        })
        .catch(err => {
          console.log("err", err);
          this.loading = false;
        });
    },
    setZoom(level) {
      const data = [
        {
          zoom: 15,
          scaleLimit: {
            min: 5,
            max: 25
          }
        },
        {
          zoom: 25,
          scaleLimit: {
            min: 5,
            max: 45
          }
        },
        {
          zoom: 45,
          scaleLimit: {
            min: 5,
            max: 65
          }
        }
      ];
      this.option.geo[0].zoom = data[level].zoom;
      this.option.geo[0].scaleLimit = data[level].scaleLimit;
    },
    setLocation(code) {
      const tmp = Object.keys(this.locationData[0]).filter(i => i == code);
      if (tmp && tmp.length > 0) {
        this.option.geo[0].center = this.locationData[0][tmp[0]].center.map(
          (i, index) => {
            if (index == 0) {
              i = i - 0.5;
            }
            return i;
          }
        );
      }
    },
    getArea(areaData, level, code) {
      if (level == 0) {
        return areaData;
      } else if (level == 1) {
        return areaData.filter(item => item.value == code);
      } else {
        const area = areaData.filter(
          item => item.value.slice(0, 4) == code.slice(0, 4)
        );
        if (area && area.length > 0 && area[0].children) {
          return area[0].children.filter(i => i.value == code);
        }
      }
      return areaData;
    },
    setAreaData(area, parentData) {
      let region = [];
      if (parentData) {
        region = [{ ...parentData, ...this.parentStyle }];
      }
      area.map(item => {
        region.push({
          name: item.label,
          code: item.value,
          ...this.childrenStyle
        });
      });
      this.option.geo[0].regions = region;
    },
    getInstance(instance) {
      this.instance = instance;

      instance.on("georoam", param => {
        if (this.selected.name) {
          // this.instance.dispatchAction({
          //   type: "highlight",
          //   seriesName: "scatterPointer",
          //   name: this.selected.name
          // });
          instance.dispatchAction({
            type: "showTip",
            seriesIndex: 0,
            name: this.selected.name
          });
        }
      });
      instance.dispatchAction({
        type: "highlight",
        seriesName: "scatterPointer",
        name: this.selected.name
      });
      instance.on("mouseout", params => {
        if (this.selected.name == params.name) {
          instance.dispatchAction({
            type: "highlight",
            seriesName: "scatterPointer",
            name: params.name
          });
        }
      });

      instance.on("click", params => {
        if (params.seriesName == "scatterPointer") {
          if (this.selected.name === params.name) {
            instance.dispatchAction({
              type: "hideTip",
            });
            instance.dispatchAction({
              type: "downplay",
              seriesName: "scatterPointer",
              name: this.selected.name
            });
            this.selected = {
              name: '',
              data: []
            }
          } else {
            instance.dispatchAction({
              type: "downplay",
              seriesName: "scatterPointer",
              name: this.selected.name
            });
            this.selected = params.data;
            instance.dispatchAction({
              type: "highlight",
              seriesName: "scatterPointer",
              name: params.name
            });
            instance.dispatchAction({
              type: "showTip",
              seriesIndex: 0,
              name: params.name
            });
          }

        } else if (params.region.clickable) {
          // if (params.region.code.split("00").length > 1) {
          this.mapClick(params.region);
          // }
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.map-main {
  width: 100%;
  height: calc(100vh - 45px);
  position: relative;
}
.map-content {
  background-color: rgba(25, 21, 39, 1);
  height: 100%;
  position: relative;
}
.map-chart {
  height: 100%;
  width: 100%;
  position: relative;
}
.box-inside {
  position: absolute;
  margin: 2% 0;
  background: url('../../assets/map/cndt_box_4.png') no-repeat;
  background-size: contain;
  width: 35.5%;
  height: 29%;
  min-width: 227px;
  min-height: 198px;
}
.top {
  position: absolute;
  top: 50px;
  z-index: 1;
  left: 20px;
  display: flex;
  justify-content: space-between;
  width: calc(100% - 70px);
}
.time-box {
  // position: absolute;
  // top: 50px;
  // z-index: 1;
  // left: 20px;
  width: 600px;
  .el-button {
    color: #fff;
    height: 30px;
    line-height: 8px;
    background-color: hsla(0, 0%, 100%, 0.1);
    border-color: #645aa5;
  }
  .btn-active {
    background-color: rgba(64, 158, 255, 0.6);
  }
}
.slider {
  margin-top: -12px;
  width: 0;
  opacity: 0;
  transition: all 0.8s ease-in-out;
  pointer-events: none;
  &.isChoose {
    width: calc(100% - 700px);
    opacity: 1;
    transition: all 0.8s ease-in-out;
    pointer-events: auto;
  }
}
.curTime {
  color: rgb(85, 229, 255);
  font-size: 18px;
  cursor: pointer;
  font-weight: bold;
  width: auto;
  transition: all 0.8s ease-in-out;
  opacity: 1;
  visibility: 1;
  &.isChoose {
    // width: 0;
    visibility: 0;
    opacity: 0;
    transition: all 0.8s ease-in-out;
  }
}
.grade {
  background: url('../../assets/map/cndtzs_box_1.png') no-repeat;
  width: 456px;
  height: 455px;

  padding: 20px;
  background-size: 100% 100%;
  position: absolute;
  top: 15%;
  z-index: 1;
}
.describle {
  position: absolute;
  bottom: 80px;
  right: 20px;
  line-height: 25px;
  color: #fff;
}
</style>
<style lang="scss">
.map-main {
  .tool-box {
    // min-width: 300px;
    // padding: 15px;
    // margin:20px
    color: #fff;
    .tool-box-title {
      text-align: center;
      font-size: 16px;
      line-height: 50px;
      // padding-bottom: 5px;
      border-bottom: 1px solid #a9a2d2;
    }
    .tool-box-text {
      margin: 5px 0;
    }
    .tool-box-content {
      padding: 10px;
      font-size: 14px;
      table {
        max-width: 700px;
        // width: 700px;
        table-layout: fixed;
        margin: auto;
        // table-layout: fixed;
        // background-color: rgba(255, 255, 255, 1);
        text-align: center;
        thead {
          border: 1px solid #eee;
        }
        td {
          // border:1px solid #eee;
          padding: 5px;
          text-align: center;
          background-color: rgba(81, 72, 136, 0.5);
          max-width: 200px;
          min-width: 100px;
          white-space: normal;
          word-break: break-all;
        }
      }
      .btn {
        text-align: right;
      }
      .btn-content {
        color: rgba(116, 216, 181, 1);
        cursor: pointer;
        pointer-events: all;
      }
    }
  }
  .bread {
    position: absolute;
    top: 65px;
    right: 5%;
    .el-breadcrumb__item {
      .el-breadcrumb__inner {
        color: #fff;
      }
      a {
        &:hover {
          cursor: pointer;
          // color: rgba(246, 205, 97, 1);
        }
        color: #fff;
      }
      font-size: 18px;
    }
  }
  .el-tabs__header {
    margin: 0;
  }
  .el-tabs {
    background-color: #f9f9f9;
    padding: 0 18px;
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
.slider {
  .el-slider__stop {
    background-color: #645aa5;
  }
  .el-slider__marks-text {
    color: #fff;
    // min-width: 80px;
    width: 33px;
    text-align: center;
    font-weight: bold;
    // font-size: 12px;
  }
  .el-slider__bar {
    opacity: 0;
  }
  .el-slider__runway {
    background-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
