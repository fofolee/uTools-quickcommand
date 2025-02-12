<template>
  <div>
    <div class="flex absolute-top" style="bottom: 60px; overflow-y: auto">
      <div
        style="width: 50%"
        class="q-pa-sm wrapper"
        v-for="count in currentPageCounts"
        :key="count"
      >
        <q-card class="command">
          <q-item v-if="loading">
            <q-item-section avatar>
              <q-skeleton square width="48px" height="48px" animation="fade" />
            </q-item-section>
            <q-item-section>
              <q-skeleton type="text" square width="70%" animation="fade" />
              <q-skeleton type="text" square width="30%" animation="fade" />
              <q-skeleton type="text" square width="40%" animation="fade" />
            </q-item-section>
          </q-item>
          <q-item v-else>
            <q-item-section avatar>
              <q-avatar square size="48px">
                <q-img :src="commands[count - 1]?.features?.icon" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6" lines="1">{{
                commands[count - 1]?.features?.explain
              }}</q-item-label>
              <q-item-label caption lines="1"
                ><q-icon name="account_circle"></q-icon
                >{{ commands[count - 1]?.authorName }}
                <q-icon name="watch_later"></q-icon
                >{{
                  commands[count - 1]?.updateTime.slice(0, 10)
                }}</q-item-label
              >
              <q-item-label caption
                ><q-icon name="fiber_manual_record"></q-icon
                >{{ commands[count - 1]?.program }}</q-item-label
              >
              <q-item-label caption>
                <span
                  v-for="tag in [
                    commandTypes[
                      commands[count - 1]?.features.cmds[0].type || 'key'
                    ].label,
                    ...commands[count - 1]?.tags,
                  ]"
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
              </q-item-label>
            </q-item-section>
            <q-item-label side>
              <q-btn
                @click="importCommand(commands[count - 1])"
                flat
                dense
                :color="
                  !commands[count - 1]?.features.platform.includes(platform)
                    ? 'grey'
                    : needUpdateCodes.includes(
                        commands[count - 1]?.features.code
                      )
                    ? 'negative'
                    : 'primary'
                "
                icon="download"
                :label="
                  needUpdateCodes.includes(commands[count - 1]?.features.code)
                    ? '更新'
                    : '导入'
                "
                v-show="
                  !installedCodes.includes(commands[count - 1]?.features.code)
                "
                ><q-tooltip
                  v-if="
                    !commands[count - 1]?.features.platform.includes(platform)
                  "
                >
                  该命令不支持当前操作系统！但你仍可以导入它
                </q-tooltip></q-btn
              >
            </q-item-label>
          </q-item>
        </q-card>
      </div>
    </div>
    <div
      class="absolute flex flex-center"
      :style="{ left: 0, right: 0, bottom: '10px' }"
    >
      <q-pagination v-model="currentPage" :max="maxPages" input />
    </div>
    <div class="absolute" :style="{ left: '25px', bottom: '12px' }">
      <q-input
        v-model="commandSearchKeyword"
        debounce="200"
        standout="bg-primary text-white"
        dense
        @keydown="(e) => e.keyCode === 13 && updateSearch()"
        placeholder="搜索"
      >
        <template v-slot:append>
          <q-btn dense flat icon="search" @click="updateSearch" />
        </template>
      </q-input>
    </div>
    <div class="absolute" :style="{ right: '25px', bottom: '12px' }">
      <q-btn
        color="primary"
        flat
        to="/configuration"
        label="主配置界面"
        icon="tune"
      >
      </q-btn>
    </div>
  </div>
</template>

<script>
import commandTypes from "js/options/commandTypes.js";
import { dbManager } from "js/utools.js";

export default {
  data() {
    return {
      remoteCommands: [],
      matchedCommands: [],
      commands: [],
      installedCodes: [],
      needUpdateCodes: [],
      currentPage: 1,
      perPage: 8,
      commandSearchKeyword: "",
      releaseRepo: "fofolee/qcreleases",
      commandTypes: commandTypes,
      platform: window.processPlatform,
      errCommandsCount: 0,
    };
  },
  computed: {
    maxPages() {
      return Math.ceil(this.matchedCommands.length / this.perPage) || 1;
    },
    loading() {
      return this.commands.length === this.currentPageCounts ? false : true;
    },
    currentPageCounts() {
      return (
        (this.currentPage === this.maxPages
          ? this.matchedCommands.length % this.perPage
          : this.perPage) - this.errCommandsCount
      );
    },
  },
  mounted() {
    this.fetchCommands();
  },
  watch: {
    currentPage(val) {
      this.fetchCommandDetails(val);
    },
  },
  methods: {
    fetchCommandDetails(page) {
      this.errCommandsCount = 0;
      this.commands = [];
      this.matchedCommands
        .slice((page - 1) * this.perPage, page * this.perPage)
        .forEach((item) => {
          this.getCommand(
            item.slug,
            item.content_updated_at,
            item.last_editor.name,
            item.last_editor.id
          ).then((command) => {
            if (!command) {
              this.errCommandsCount++;
              return;
            }
            command.updated
              ? this.commands.unshift(command.data)
              : this.commands.push(command.data);
          });
        });
    },
    importCommand(command) {
      let code = command?.features?.code;
      if (!code)
        return quickcommand.showMessageBox("该命令格式有误！", "error");
      this.installedCodes.push(code);
      let pushData = window.lodashM.cloneDeep(command);
      pushData.fromShare = true;
      dbManager.putDB(window.lodashM.cloneDeep(pushData), "qc_" + code);
      // 通过模拟访问页面来统计下载量
      utools.ubrowser
        .goto(`https://www.yuque.com/${this.releaseRepo}/${code}`)
        .run({ show: false });
      quickcommand.showMessageBox("导入成功！可到「来自分享」标签查看");
    },
    updateSearch() {
      if (!this.commandSearchKeyword)
        this.matchedCommands = this.remoteCommands;
      else
        this.matchedCommands = this.remoteCommands.filter((x) =>
          x.title
            .toLowerCase()
            .includes(this.commandSearchKeyword.toLowerCase())
        );
      this.fetchCommandDetails(1);
    },
    // 如果远端更新时间和本地相同则读取本地缓存，否则更新
    async getCommand(id, updateTime, authorName, authorId) {
      let localCache = JSON.parse(localStorage.getItem(id));
      if (localCache?.updateTime === updateTime)
        return {
          data: localCache,
          updated: false,
        };
      let res = await window.yuQueClient(
        `repos/${this.releaseRepo}/docs/${id}?raw=1`
      );
      let command;
      try {
        command = JSON.parse(
          res.data?.data.body.match(/```json([\s\S]*)```/)?.[1]
        );
      } catch (error) {
        console.log("parseErr", command, error);
      }
      if (!command) return;
      Object.assign(command, { authorName, updateTime, authorId });
      localStorage.setItem(id, JSON.stringify(command));
      return {
        data: command,
        updated: true,
      };
    },
    fetchCommands() {
      window.yuQueClient(`repos/${this.releaseRepo}/docs`).then((res) => {
        // 按更新日期排序
        this.remoteCommands = res.data.data.sort((x, y) =>
          this.compareTime(y.content_updated_at, x.content_updated_at)
        );
        this.checkCommands();
        this.matchedCommands = window.lodashM.cloneDeep(this.remoteCommands);
        this.fetchCommandDetails(1);
      });
    },
    checkCommands() {
      let installed = [];
      let needUpdate = [];
      dbManager.getAll("qc_").forEach((item) => {
        if (!item.data.fromShare) return;
        let code = item._id.slice(3);
        let remote = this.remoteCommands.filter((cmd) => cmd.slug === code)[0];
        if (!remote) return;
        let localUpdateTime =
          item.data.updateTime || "2022-04-01T00:00:00.000Z";
        if (this.compareTime(remote.content_updated_at, localUpdateTime) > 0) {
          needUpdate.push(code);
          window.lodashM.pull(this.remoteCommands, remote);
          this.remoteCommands.unshift(remote);
        } else installed.push(code);
        this.installedCodes = installed;
        this.needUpdateCodes = needUpdate;
      });
      console.log("installedCodes", this.installedCodes);
      console.log("needUpdateCodes", this.needUpdateCodes);
      console.log("remoteCommands", this.remoteCommands);
    },
    compareTime(x, y) {
      return new Date(x).getTime() - new Date(y).getTime();
    },
  },
};
</script>

<style scoped>
.q-card.command {
  user-select: none;
  padding: 8px;
  background: #00000008;
}
.q-card--dark.command {
  background: #ffffff08;
}
.tag {
  background: var(--q-primary);
  border-radius: 2px;
  padding: 2px;
  margin-right: 2px;
  color: white;
}
.wrapper {
  transition: 0.5s;
}
.wrapper:hover {
  transition: 0.5s;
  transform: scale(0.97);
  filter: drop-shadow(1px 1px 5px #0000008e);
}
</style>
