<template>
  <q-card>
    <q-card-section>
      <div v-show="!!yuQueInfo.avatar" class="q-pa-sm">
        <q-avatar class="q-mr-sm">
          <q-img :src="yuQueInfo.avatar" />
        </q-avatar>
        {{ yuQueInfo.authorName }}
      </div>
      <div class="full-width">
        <q-input
          standout="bg-primary text-white"
          v-model="yuQueInfo.yuQueToken"
          type="text"
          label="语雀 token"
        >
          <template v-slot:append>
            <q-btn flat dense icon="save" @click="queryUser" />
          </template>
        </q-input>
      </div>
      <div class="full-width text-center q-pa-sm q-gutter-xs">
        <q-radio
          v-for="count in 5"
          :key="count"
          v-model="yuQueInfo.repo"
          :val="count"
          :label="`库 ${count}`"
        />
        <q-btn flat color="primary" icon="person_add" @click="joinRepo"
          ><q-tooltip> 申请加入当前选中的库 </q-tooltip></q-btn
        >
      </div>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn
        flat
        color="grey"
        icon="arrow_back_ios_new"
        label="返回"
        v-close-popup
      />
      <q-btn flat color="info" icon="help" label="帮助" @click="showHelp" />
      <q-btn
        flat
        autofocus
        color="primary"
        icon="share"
        :disable="disableShare"
        @click="shareCommand"
        label="分享"
      />
    </q-card-actions>
  </q-card>
</template>

<script>
const joinLink = [
  "https://www.yuque.com/g/fofolee/qcshares1/collaborator/join?token=6LZn2vc34dqfIQdC#",
  "https://www.yuque.com/g/fofolee/qcshares2/collaborator/join?token=nmzw84L5Uj2Ltp0w#",
  "https://www.yuque.com/g/fofolee/qcshares3/collaborator/join?token=7xRDGvUaOwAXTLLk#",
  "https://www.yuque.com/g/fofolee/qcshares4/collaborator/join?token=DXb4XAVatwn2OoGK#",
  "https://www.yuque.com/g/fofolee/qcshares5/collaborator/join?token=tw1kyfD2T4jjsQHc#",
];
import { dbManager } from "js/utools.js";
export default {
  data() {
    return {
      yuQueInfo: {
        yuQueToken: "",
        authorId: "",
        authorName: "",
        avatar: "",
        repo: 1,
      },
      maxCommandSize: 5 * 1024 * 1024,
      shareLock: false,
      releaseRepo: "fofolee/qcreleases",
      shareRepo: "fofolee/qcshares",
    };
  },
  props: {
    command: Object,
  },
  computed: {
    disableShare() {
      return this.shareLock || !this.yuQueInfo.yuQueToken;
    },
  },
  mounted() {
    Object.assign(this.yuQueInfo, this.loadYuQueInfo());
  },
  methods: {
    async shareCommand() {
      this.shareLock = true;
      let commandStr = JSON.stringify(this.command, null, 4);
      if (commandStr.length > this.maxCommandSize)
        return quickcommand.showMessageBox(
          "命令大小超过5M无法分享，请检查图标或脚本内容是否过大",
          "error"
        );
      let parameters = {
        title: this.command.features.explain,
        slug: this.command.features.code,
        public: 1,
        format: "markdown",
        body: "```json\n" + commandStr + "\n```",
      };
      try {
        await this.shareToYuQue(parameters);
      } catch (e) {
        return quickcommand.showMessageBox(
          "还未加入该库，请选择正确的库，如有疑问，请查看帮助",
          "error"
        );
      } finally {
        setTimeout(() => {
          this.shareLock = false;
        }, 1000);
      }
    },
    async shareToYuQue(parameters) {
      window.yuQueClient.defaults.headers["X-Auth-Token"] =
        this.yuQueInfo.yuQueToken;
      let repo =
        this.yuQueInfo.authorId === 1496740
          ? this.releaseRepo
          : this.shareRepo + this.yuQueInfo.repo;
      let res = await window.yuQueClient.post(`repos/${repo}/docs`, parameters);
      if (!res.data.data)
        return quickcommand.showMessageBox("分享失败，不知道为啥", "error");
      let docId = res.data.data.id;
      res = await window.yuQueClient.put(
        `repos/${repo}/docs/${docId}`,
        parameters
      );
      if (!res.data.data)
        return quickcommand.showMessageBox("分享失败，不知道为啥", "error");
      this.saveYuQueInfo();
      quickcommand.showMessageBox("分享成功！");
    },
    async queryUser() {
      if (!this.yuQueInfo.yuQueToken) return;
      window.yuQueClient.defaults.headers["X-Auth-Token"] =
        this.yuQueInfo.yuQueToken;
      try {
        let res = await window.yuQueClient("user");
        this.yuQueInfo.authorId = res.data.data.account_id;
        this.yuQueInfo.authorName = res.data.data.name;
        this.yuQueInfo.avatar = res.data.data.avatar_url;
        this.saveYuQueInfo();
        quickcommand.showMessageBox("设置成功~");
      } catch (e) {
        quickcommand.showMessageBox("Token 校验失败", "error");
      }
    },
    showHelp() {
      window.showUb.help("#rWU2i");
    },
    joinRepo() {
      quickcommand
        .showConfirmBox(
          `将申请加入「库 ${this.yuQueInfo.repo}」，请勿重复申请，一般来说你只需要加入 5 个库的其中之一即可，如果当前库已满，则可尝试申请其他的库`
        )
        .then(() => {
          utools.shellOpenExternal(joinLink[this.yuQueInfo.repo - 1]);
        });
    },
    loadYuQueInfo() {
      return dbManager.getDB("cfg_extraInfo");
    },
    saveYuQueInfo() {
      dbManager.putDB(
        window.lodashM.cloneDeep(this.yuQueInfo),
        "cfg_extraInfo"
      );
    },
  },
};
</script>
