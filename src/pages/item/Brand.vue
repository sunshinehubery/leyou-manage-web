<template>
  <v-card>
    <v-card-title>
      <v-btn fab dark color="indigo" @click="addBrand">
      <v-icon class="pt-3" dark>add</v-icon>
    </v-btn>
      <v-btn fab dark color="error" @click="deleteAllBrand">
        <v-icon class="pt-3" dark>delete</v-icon>
      </v-btn>
      <!--搜索框，与search属性关联-->
      <v-spacer/>
      <v-flex xs3>
      <v-text-field label="输入关键字搜索" v-model.lazy="search" append-icon="search" hide-details/>
      </v-flex>
    </v-card-title>
    <v-divider/>
    <v-data-table
      :headers="headers"
      :items="brands"
      :pagination.sync="pagination"
      :total-items="totalBrands"
      :loading="loading"
      class="elevation-10"
      select-all
      v-model="selected"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-center">
          <v-checkbox v-model="props.selected" primary hide-details>
          </v-checkbox>
        </td>
        <td class="text-xs-center">{{ props.item.id }}</td>
        <td class="text-xs-center">{{ props.item.name }}</td>
        <td class="text-xs-center">
          <img v-if="props.item.image" :src="props.item.image" width="130" height="40">
          <span v-else>无</span>
        </td>
        <td class="text-xs-center">{{ props.item.letter }}</td>
        <td class="justify-center layout px-0">
          <div class="text-xs-center">
            <v-btn flat icon color="indigo" @click="editBrand(props.item)">
              <v-icon>edit</v-icon>
            </v-btn>

            <v-btn flat icon color="error" @click="deleteBrand(props.item)">
              <v-icon>delete</v-icon>
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
          <v-toolbar-title>{{isEdit ? '修改' : '新增'}}品牌</v-toolbar-title>
          <v-spacer/>
          <!--关闭窗口的按钮-->
          <v-btn icon @click="closeWindow"><v-icon>close</v-icon></v-btn>
        </v-toolbar>
        <!--对话框的内容，表单-->
        <v-card-text class="px-5" style="height:400px">
          <brand-form @close="closeWindow" :oldBrand="oldBrand" :isEdit="isEdit"/>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
  // 导入自定义的表单组件
  import BrandForm from './BrandForm'

  export default {
    name: "brand",
    data() {
      return {
        search: '', // 搜索过滤字段
        totalBrands: 0, // 总条数
        brands: [], // 当前页品牌数据
        loading: true, // 是否在加载中
        pagination: {}, // 分页信息
        headers: [
          {text: 'id', align: 'center', value: 'id'},
          {text: '名称', align: 'center', sortable: false, value: 'name'},
          {text: 'LOGO', align: 'center', sortable: false, value: 'image'},
          {text: '首字母', align: 'center', value: 'letter', sortable: true,},
          {text: '操作', align: 'center', value: 'id', sortable: false}
        ],
        show: false,// 控制对话框的显示
        oldBrand: {}, // 即将被编辑的品牌数据
        isEdit: false, // 是否是编辑
        selected:[], //选择的条目
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
      getDataFromServer() { // 从服务的加载数的方法。
        // 发起请求
        this.$http.get("/item/brand/page", {
          params: {
            key: this.search, // 搜索条件
            page: this.pagination.page,// 当前页
            rows: this.pagination.rowsPerPage,// 每页大小
            sortBy: this.pagination.sortBy,// 排序字段
            desc: this.pagination.descending// 是否降序
          }
        }).then(resp => { // 这里使用箭头函数
          this.brands = resp.data.items;
          this.totalBrands = resp.data.total;
          // 完成赋值后，把加载状态赋值为false
          this.loading = false;
        })
      },
      addBrand() {
        // 修改标记
        this.isEdit = false;
        // 控制弹窗可见：
        this.show = true;
        // 把oldBrand变为null
        this.oldBrand = null;
      },
      editBrand(oldBrand){
        // 根据品牌信息查询商品分类
        this.$http.get("/item/category/bid/" + oldBrand.id)
          .then(({data}) => {
            // 修改标记
            this.isEdit = true;
            // 控制弹窗可见：
            this.show = true;
            // 获取要编辑的brand
            this.oldBrand = oldBrand
            // 回显商品分类
            this.oldBrand.categories = data;
          })
      },
      deleteBrand(oldBrand){
        if (this.selected.length === 1 && this.selected[0].id === oldBrand.id) {
          this.$message.confirm('此操作将永久删除该品牌, 是否继续?').then(
            () => {
              //发起删除请求，删除单条数据
              this.$http.delete("/item/brand/bid/" + oldBrand.id).then(() => {
                this.getDataFromServer();
              }).catch();
            }
          ).catch(() => {
            this.$message.info("删除已取消！");
          });
        }else {
          this.$message.info("选中后再进行操作！");
        }
      },
      deleteAllBrand(){
        //拼接id数组
        const ids = this.selected.map(s => s.id);
        if(ids.length > 0){
          this.$message.confirm('此操作将永久删除该品牌, 是否继续?').then(
            () => {
              //发起删除请求
              this.$http.delete("/item/brand/bid/" + ids.join("-")).then(
                () => {
                  this.getDataFromServer();
                }).catch();
            }
          ).catch(() => {
            this.$message.info("删除已取消！");
          });
        }else {
        this.$message.info("选中后再进行操作！");
        }
      },
      closeWindow(){
        // 重新加载数据
        this.getDataFromServer();
        // 关闭窗口
        this.show = false;
      }
    },
    components:{
        BrandForm
    }
  }
</script>

<style scoped>

</style>
