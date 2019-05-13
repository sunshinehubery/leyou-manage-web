<template>
  <v-card>
    <v-toolbar class="elevation-0">
      <v-btn color="primary" @click="addGoods">新增商品</v-btn>
      <v-btn color="error" @click="deleteAllGoods">删除商品</v-btn>
      <v-btn color="secondary" @click="soldOutPutAll" v-if="filter.saleable === false">全部上架</v-btn>
      <v-btn color="secondary" @click="soldOutPutAll" v-else>全部下架</v-btn>
      <v-spacer/>
      <v-flex xs3>
        状态：
        <v-btn-toggle mandatory v-model.lazy="filter.saleable">
          <v-btn flat>
            全部
          </v-btn>
          <v-btn flat :value="true">
            上架
          </v-btn>
          <v-btn flat :value="false">
            下架
          </v-btn>
        </v-btn-toggle>
      </v-flex>
      <v-flex xs3>
        <v-text-field
          append-icon="search"
          label="搜索"
          single-line
          hide-details
          v-model="filter.search"
        />
      </v-flex>
    </v-toolbar>
    <v-divider/>
    <v-data-table
      :headers="headers"
      :items="goodsList"
      :pagination.sync="pagination"
      :total-items="totalGoods"
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
        <td class="text-xs-center">{{ props.item.title }}</td>
        <td class="text-xs-center">{{props.item.cname}}</td>
        <td class="text-xs-center">{{ props.item.bname }}</td>
        <td class="justify-center layout px-0">
          <v-btn icon @click="editGoods(props.item)">
            <i class="el-icon-edit"/>
          </v-btn>
          <v-btn icon>
            <i class="el-icon-delete"/>
          </v-btn>
          <v-btn icon v-if="props.item.saleable">下架</v-btn>
          <v-btn icon v-else>上架</v-btn>
        </td>
      </template>
      <template slot="pageText" slot-scope="props">
        共{{props.itemsLength}}条,当前:{{ props.pageStart }} - {{ props.pageStop }}
      </template>
    </v-data-table>
    <!--弹出的对话框-->
    <v-dialog max-width="900" v-model="show" persistent scrollable>
      <v-card>
        <!--对话框的标题-->
        <v-toolbar dense dark color="primary">
          <v-toolbar-title>{{isEdit ? '修改' : '新增'}}商品</v-toolbar-title>
          <v-spacer/>
          <!--关闭窗口的按钮-->
          <v-btn icon @click="closeWindow">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <!--对话框的内容，表单-->
        <v-card-text class="px-3" style="height: 600px">
          <goods-form @close="closeWindow" :isEdit="isEdit" :oldGoods="oldGoods" :step="step" :show="show" ref="goodsForm"/>
        </v-card-text>
        <!--底部按钮，用来操作步骤线-->
        <v-card-actions class="elevation-10">
          <v-flex class="xs3 mx-auto">
            <v-btn @click="lastStep" color="primary" :disabled="step === 1">上一步</v-btn>
            <v-btn @click="nextStep" color="primary" :disabled="step === 4">下一步</v-btn>
          </v-flex>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
  // 导入自定义的表单组件
  import GoodsForm from './GoodsForm'

  export default {
    name: "goods",
    data() {
      return {
        filter: {
          saleable: true, // 上架还是下架
          search: '', // 搜索过滤字段
        },
        totalGoods: 0, // 总条数
        goodsList: [], // 当前页品牌数据
        loading: true, // 是否在加载中
        pagination: {}, // 分页信息
        headers: [
          {text: 'id', align: 'center', sortable: false, value: 'id'},
          {text: '标题', align: 'center', sortable: false, value: 'title'},
          {text: '商品分类', align: 'center', sortable: false, value: 'cname'},
          {text: '品牌', align: 'center', value: 'bname', sortable: false,},
          {text: '操作', align: 'center', sortable: false}
        ],
        show: false,// 控制对话框的显示
        oldGoods: {}, // 即将被编辑的商品信息
        isEdit: false, // 是否是编辑
        step: 1, // 子组件中的步骤线索引，默认为1
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
      filter: {// 监视搜索字段
        handler() {
          this.getDataFromServer();
        },
        deep: true
      }
    },
    methods: {
      getDataFromServer() { // 从服务的加载数的方法。
        // 发起请求
        this.$http.get("/item/goods/spu/page", {
          params: {
            key: this.filter.search, // 搜索条件
            saleable: this.filter.saleable === 0 ? null : this.filter.saleable, // 上下架
            page: this.pagination.page,// 当前页
            rows: this.pagination.rowsPerPage,// 每页大小
          }
        }).then(resp => { // 这里使用箭头函数
          this.goodsList = resp.data.items;
          this.totalGoods = resp.data.total;
          // 完成赋值后，把加载状态赋值为false
          this.loading = false;
        })
      },
      addGoods() {
        // 修改标记
        this.isEdit = false;
        // 控制弹窗可见：
        this.show = true;
        // 把oldBrand变为null
        this.oldGoods = {};
      },
      deleteAllGoods(){
        const deleteGoodsId = this.selected.map(s => {
          return s.id;
        });
        if (deleteGoodsId.length > 0){
            this.$message.confirm("全部删除，不可恢复！").then(() => {
              this.$http.delete("/item/goods/spu/"+deleteGoodsId.join("-")).then(() => {
                this.getDataFromServer();
                this.selected = [];
              }).catch(() => {
                this.$message.error("删除失败！");
              })
            }).catch(() => {
              this.$message.info("删除取消！");
            })
        }else {
          this.$message.info("选中后再进行操作！");
        }
      },
      closeWindow(){
        this.oldGoods = null;
        //重新加载数据
        this.getDataFromServer();
        //关闭窗口
        this.show = false;
      },
      deleteItem(id){
        const selectId = this.selected.map( s => {
          return s.id;
        });
        if (selectId.length === 1 && selectId[0] === id) {
            this.$message.confirm("删除后，不可恢复！").then(() => {
              this.$http.delete("/item/goods/spu/"+id).then(() => {
                this.getDataFromServer();
                this.selected = [];
              }).catch(() => {
                this.$message.error("删除失败！");
              })
            }).catch(() => {
              this.$message.info("删除取消！");
            });
        }else {
          this.$message.info("选中后再进行操作！");
        }
      },
      soldOutPut(id){
        const selectId = this.selected.map( s => {
          return s.id;
        });
        if (selectId.length === 1 && selectId[0] === id) {
            this.$http.put("/item/goods/spu/out/" + id).then(() => {
              this.$message.success("操作成功！");
              this.getDataFromServer();
              this.selected = [];
            }).catch(() => {
              this.$message.error("操作失败！");
            });
        }else {
          this.$message.info("选中后再进行操作！");
        }
      },
      editGoods(oldGoods) {
        this.oldGoods = oldGoods;
        const names = oldGoods.cname.split("/");
        this.oldGoods.categories = [
          {id: oldGoods.cid1, name: names[0]},
          {id: oldGoods.cid2, name: names[1]},
          {id: oldGoods.cid3, name: names[2]}
        ];
        // 查询商品详情
        this.$http.get("/item/goods/spu/" + oldGoods.id)
          .then(({data}) => {
            this.oldGoods.skusList = data.skus;
            this.oldGoods.spuDetail = data.spuDetail;
            this.oldGoods.spuDetail.specTemplate = JSON.parse(data.spuDetail.specTemplate);
            this.oldGoods.spuDetail.specifications = JSON.parse(data.spuDetail.specifications);
          })
        this.isEdit = true;
        this.show = true;
      },
      soldOutPutAll(){
        const Ids = this.selected.map(s => {
          return s.id;
        });
        if (Ids.length > 0){
            this.$message.confirm(this.filter.saleable?"全部下架,，不可恢复！":"全部上架,，不可恢复！").then(() => {
              this.$http.put("/item/goods/spu/out/"+Ids.join("-")).then(() => {
                this.getDataFromServer();
                this.selected = [];
              }).catch(() => {
                this.$message.error(this.filter.saleable?"下架失败！":"上架失败！");
              })
            }).catch(() => {
              this.$message.info(this.filter.saleable?"下架取消！":"上架取消！");
            })
        }else {
          this.$message.info("选中后再进行操作！");
        }
      },
      addSeckill(goods){
        const selectId = this.selected.map( s => {
          return s.id;
        });
        if (selectId.length === 1 && selectId[0] === goods.id) {
          let temp = {};
          temp.goodsId = goods.id;
          temp.goodsTitle = goods.title;
          temp.goodsCname = goods.cname;
          temp.goodsBname = goods.bname;
          this.seckill_goods_message = temp;
          this.seckill_show = true;
        }else {
          this.$message.info("选中后再进行操作！");
        }
      },
      lastStep(){
        if(this.step > 1){
          this.step--
        }
      },
      nextStep(){
        if(this.step < 4 && this.$refs.goodsForm.$refs.basic.validate()){
          this.step++
        }
      }
    },
    components: {
      GoodsForm
    }
  }
</script>

<style scoped>

</style>
