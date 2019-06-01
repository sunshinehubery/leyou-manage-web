<template>
  <v-container fluid grid-list-md>
    <v-layout row wrap>
      <v-flex xs4>
        <v-data-table
          :headers="headers"
          :items="rankBos"
          class="elevation-10"
          style="width: 100%;height:380px"
        >
          <template slot="items" slot-scope="props">
            <td class="text-xs-center">{{ props.item.rankName }}</td>
            <td class="text-xs-center">{{ props.item.amount }}</td>
          </template>
        </v-data-table>
      </v-flex>

      <v-flex xs8>
        <h1 align="center">消费榜单前五</h1>
            <table
              style="width: 100%;height:310px;display: block"
              :items="members"
            >
              <tr>
                <td style="width:300px;height: 50px" align="center">真实姓名</td>
                <td style="width:300px;height: 50px" align="center">电话号码</td>
                <td style="width:300px;height: 50px" align="center">积分</td>
              </tr>
              <tr v-for="member in members">
                <td style="width:300px;height: 50px" align="center">{{member.true_Name}}</td>
                <td style="width:300px;height: 50px" align="center">{{member.phone}}</td>
                <td style="width:300px;height: 50px" align="center">{{member.member_Score}}</td>
              </tr>
            </table>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>

  // 引入 ECharts 主模块
  var echarts = require('echarts/lib/echarts');
  require('echarts/lib/chart/bar');
  require('echarts/lib/chart/pie');

    export default {
      name: "statistics",
      data() {
        return {
          timer: 0,
          rankBos: [],
          members: [],
          headers: [
            {text: '会员等级', align: 'center', sortable: false, value: 'rankName'},
            {text: 'amount', align: 'center', sortable: false, value: 'amount'},
          ],
        }
      },
      mounted() {
        this.getDataFromServer();
        if(this.timer){
          clearInterval(this.timer);
        }else{
          this.timer = setInterval(()=>{
            this.getDataFromServer();
          },3000)
        }
      },
      destroyed(){
        clearInterval(this.timer)
      },
      methods: {
        getDataFromServer() {     // 从服务的加载数的方法。
          // 发起请求
          this.$http.get("/item/member/rankBo").then(resp => { // 这里使用箭头函数
            this.rankBos = resp.data;
          });
          this.$http.get("/item/member/desc").then(result => {
            this.members = result.data;
          });
        },
      },
    }
</script>

<style scoped>

</style>
