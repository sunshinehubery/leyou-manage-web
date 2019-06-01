<template>
  <v-form v-model="valid" ref="myMemberForm">
    <v-text-field v-model="member.loginName" label="请输入登录账号" required/>
    <v-text-field v-model="member.memberName" label="请输入昵称" required/>
    <v-text-field v-model="member.trueName" label="请输入真实姓名" required/>
    <v-text-field v-model="member.phone" label="请输入手机号码" required/>
    <v-radio-group v-model="member.sex" row>
      <v-radio label="男" value="1"></v-radio>
      <v-radio label="女" value="2"></v-radio>
    </v-radio-group>
    <v-layout class="my-4" row>
      <v-spacer/>
      <v-btn @click="submit" color="primary">提交</v-btn>
      <v-btn @click="clear">重置</v-btn>
    </v-layout>
  </v-form>
</template>

<script>
    export default {
      name: "MemberForm",
      props: {
        oldMember: {
          type: Object
        },
        isEdit: {
          type: Boolean,
          default: false
        }
      },
      data() {
        return {
          valid: false, // 表单校验结果标记
          member: {
            loginName: '', // 登录账号
            sex: '',// 性别
            memberName: '', // 会员名称
            trueName: '', //真实姓名
            phone: '', //手机号码
          },
        }
      },
      methods: {
        submit() {
          // 表单校验
          if (this.$refs.myMemberForm.validate()) {
            const params = this.member;
            this.$http({
              method: this.isEdit ? 'put' : 'post',
              url: '/item/member',
              data: this.$qs.stringify(params)
            }).then(() => {
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
          this.$refs.myMemberForm.reset();
        },
      },
      watch: {
        oldMember: {// 监控oldMember的变化
          handler(val) {
            if (val) {
              // 注意不要直接复制，否则这边的修改会影响到父组件的数据，copy属性即可
              this.member = Object.deepCopy(val)
            } else {
              // 为空，初始化brand
              this.member = {
                loginName: '', // 登录账号
                sex: '',// 性别
                memberName: '', // 会员名称
                trueName: '', //真实姓名
                phone: '', //手机号码
              }
            }
          },
          deep: true
        }
      }
    }
</script>

<style scoped>

</style>
