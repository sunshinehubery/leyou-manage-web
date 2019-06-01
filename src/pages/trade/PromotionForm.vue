<template>
  <v-form v-model="valid" ref="myPromotionForm">
    <v-text-field v-model="oldSkuBo.id" label="商品id" required/>
    <v-text-field v-model="oldSkuBo.title" label="商品名称" required/>
    <v-text-field v-model="oldSkuBo.stock" label="请输入订单数量" required/>
    <v-layout class="my-4" row>
      <v-spacer/>
      <v-btn @click="submit" color="primary">提交</v-btn>
      <v-btn @click="clear">重置</v-btn>
    </v-layout>
  </v-form>
</template>

<script>
    export default {
        name: "PromotionForm",
      props: {
        oldSkuBo: {
          type: Object
        }
      },
      data() {
        return {
          valid: false, // 表单校验结果标记
          SkuBo: {
            id: '',
            title: '',
            stock: '',
          },
        }
      },
      methods: {
        submit() {
          // 表单校验
          if (this.$refs.myPromotionForm.validate()) {
            const params = this.oldSkuBo;
            this.$http.post("/item/goods/purchase/",this.$qs.stringify(params)).then(() => {
              // 关闭窗口
              this.$emit("close");
              this.$message.success("保存成功！");
              this.clear();
            }).catch(() => {
              this.$message.error("保存失败！");
            });
          }
        },
        clear() {
          // 重置表单
          this.$refs.myPromotionForm.reset();
        },
      },
    }
</script>

<style scoped>

</style>
