<template>
  <v-card>
    <v-divider/>
    <v-data-table
      :headers="headers"
      :items="skuBos"
      :pagination.sync="pagination"
      :total-items="totalSkuBos"
      :loading="loading"
      class="elevation-10"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-center">{{ props.item.id }}</td>
        <td class="text-xs-center">{{ props.item.title }}</td>
        <td class="text-xs-center">{{ props.item.stock }}</td>
        <td class="justify-center layout px-0">
          <div class="text-xs-center">
            <v-btn flat icon color="indigo" @click="getStock(props.item)">
              <v-icon>edit</v-icon>
            </v-btn>
          </div>
        </td>
      </template>
    </v-data-table>
    <!--弹出的对话框-->
    <v-dialog max-width="500" v-model="show" persistent scrollable>
      <v-card>
        <!--对话框的标题-->
        <v-toolbar dense dark color="primary">
          <v-toolbar-title>进货清单</v-toolbar-title>
          <v-spacer/>
          <!--关闭窗口的按钮-->
          <v-btn icon @click="closeWindow"><v-icon>close</v-icon></v-btn>
        </v-toolbar>
        <!--对话框的内容，表单-->
        <v-card-text class="px-3" style="height: 500px">
          <promotion-form @close="closeWindow" :oldSkuBo="oldSkuBo" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>

  import PromotionForm from './PromotionForm'
    export default {
        name: "Promotion",
      data() {
        return {
          search: '', // 搜索过滤字段
          totalSkuBos: 0, // 总条数
          skuBos: [], // 当前页会员数据
          loading: true, // 是否在加载中
          pagination: {}, // 分页信息
          headers: [
            {text: 'id', align: 'center', value: 'id'},
            {text: '名称', align: 'center', sortable: false, value: 'title'},
            {text: '数量', align: 'center', sortable: false, value: 'stock'},
            {text: '操作', align: 'center', value: 'id', sortable: false}
          ],
          show: false,// 控制对话框的显示
          oldSkuBo: {}, // 即将被编辑的会员数据
        }
      },
      mounted() { // 渲染后执行
        // 查询数据
        this.getDataFromServer();
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
        getDataFromServer() {     // 从服务的加载数的方法。
          // 发起请求
          this.$http.get("/item/goods/needStock").then(resp =>{
            this.skuBos = resp.data;
            this.loading = false;
          })
        },
        getStock(oldSkuBo){
          this.$http.get("/item/goods/getStock/?id=" + oldSkuBo.id)
            .then(resp => {
              // 控制弹窗可见：
              this.show = true;
              // 获取要编辑的oldSkuBo
              this.oldSkuBo = resp.data;
            })
        },
        closeWindow(){
          // 重新加载数据
          this.getDataFromServer();
          // 关闭窗口
          this.show = false;
        },
      },
      components: {
        PromotionForm
      }
    }
</script>

<style scoped>

</style>
