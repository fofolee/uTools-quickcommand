<template>
  <q-card style="width: 400px">
    <q-card-section class="text-h5"> 快捷动作 </q-card-section>
    <q-card-section class="q-gutter-md">
      <q-select
        outlined
        v-model="action"
        :options="actions"
        label="需要添加的动作"
        :display-value="action.label"
      >
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label v-html="scope.opt.label" />
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <q-input outlined v-model="argv" type="text" :label="action.desc" />
    </q-card-section>
    <q-card-actions align="right">
      <q-btn flat color="gray" v-close-popup>退出</q-btn>
      <q-btn flat color="primary" @click="addAction">添加</q-btn>
    </q-card-actions>
  </q-card>
</template>

<script>
const quickActions = [
  {
    value: "open",
    label: "打开文件/文件夹/软件",
    desc: "文件、文件夹或软件的绝对路径",
  },
  {
    value: "locate",
    label: "在文件管理器中定位文件",
    desc: "要在文件管理器里显示的文件路径",
  },
  {
    value: "visit",
    label: "用默认浏览器打开网址",
    desc: "要访问的网址链接",
  },
  {
    value: "utools.ubrowser.goto",
    label: "用ubrowser打开网址",
    desc: "要访问的网址链接",
  },
  {
    value: "system",
    label: "执行系统命令",
    desc: "要执行的命令行",
  },
  {
    value: "copyTo",
    label: "将内容写入剪贴板",
    desc: "要写入剪切板的内容",
  },
  {
    value: "message",
    label: "发送系统消息",
    desc: "要发送的系统消息文本",
  },
  {
    value: "alert",
    label: "弹窗显示消息",
    desc: "要弹窗显示的消息文本",
  },
  {
    value: "send",
    label: "发送文本到活动窗口",
    desc: "要发送到窗口的文本内容",
  },
  {
    value: "utools.redirect",
    label: "转至指定插件(自定义关键字)",
    desc: "要跳转至的插件名称",
  },
  {
    value: "quickcommand.sleep",
    label: "添加延时",
    desc: "延迟的毫秒数",
  },
];

export default {
  data() {
    return {
      action: quickActions[0],
      actions: quickActions,
      argv: "",
    };
  },
  methods: {
    addAction() {
      let argv =
        this.action.value !== "quickcommand.sleep"
          ? `"${this.argv}"`
          : this.argv;
      let payload = `${this.action.value}(${argv})\n`;
      this.$emit("addAction", payload);
    },
  },
};
</script>
