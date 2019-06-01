<template>
  <v-card>
    <v-card-title>
      <v-btn color="primary" @click="lessStock">库存不足</v-btn>
      <v-btn color="primary" @click="notStock">缺货</v-btn>
      <!--搜索框，与search属性关联-->
      <v-spacer/>
      <v-flex xs3>
        <v-text-field label="输入关键字搜索" v-model.lazy="search" append-icon="search" hide-details/>
      </v-flex>
    </v-card-title>
    <v-divider/>
    <v-data-table
      :headers="headers"
      :items="SkuBos"
      :pagination.sync="pagination"
      :total-items="totalSkuBos"
      :loading="loading"
      class="elevation-10"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-center">{{ props.item.id }}</td>
        <td class="text-xs-center">{{ props.item.title }}</td>
        <td class="text-xs-center">¥{{ props.item.price/100 }}</td>
        <td class="text-xs-center">{{ props.item.stock }}</td>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
    export default {
      name: "Stock",
      data() {
        return {
          timer: 0,
          search: '', // 搜索过滤字段
          SkuBos: [], // 当前页品牌数据
          totalSkuBos: 0, // 总条数
          loading: true, // 是否在加载中
          pagination: {}, // 分页信息
          headers: [
            {text: 'id', align: 'center', value: 'id'},
            {text: '名称', align: 'center', sortable: false, value: 'title'},
            {text: '价格', align: 'center', sortable: true, value: 'price'},
            {text: '数量', align: 'center', sortable: false, value: 'stock'},
          ],
        }
      },
      mounted() { // 渲染后执行
        this.getDataFromServer();
        if(this.timer){
          clearInterval(this.timer);
        }else{
          this.timer = setInterval(()=>{
            this.getDataFromServer();
          },300000)
        }
      },
      watch: {
        pagination: { // 监视pagination属性的变化
          deep: true, // deep为true，会监视pagination的属性及属性中的对象属性变化
          handler() {
            // 变化后的回调函数，这里我们再次调用getDataFromServer即可
            this.getDataFromServer();
          }
        },
        search: { // 监视搜索字段
          handler() {
            this.getDataFromServer();
          }
        }
      },
      methods: {
        getDataFromServer() { // 从服务的加载数的方法。
          // 发起请求
          this.$http.get("/item/goods/sku/page", {
            params: {
              key: this.search, // 搜索条件
              page: this.pagination.page,// 当前页
              rows: this.pagination.rowsPerPage,// 每页大小
              sortBy: this.pagination.sortBy,// 排序字段
              desc: this.pagination.descending// 是否降序
            }
          }).then(resp => { // 这里使用箭头函数
            this.SkuBos = resp.data.items;
            this.totalSkuBos = resp.data.total;
            // 完成赋值后，把加载状态赋值为false
            this.loading = false;
          })
        },
        lessStock(){
          this.$http.get("/item/goods/lessStock").then(resp =>{
            this.SkuBos = resp.data;
            this.loading = false;
          })
        },
        notStock(){
          this.$http.get("/item/goods/notStock").then(resp =>{
            this.SkuBos = resp.data;
            this.loading = false;
          })
        }
      }
    }
</script>

<style scoped>

</style>
