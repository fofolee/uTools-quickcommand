<template>
  <div>
    <div class="flex absolute-top" style="bottom: 60px; overflow-y: auto">
      <div
        style="width: 50%"
        class="q-pa-sm wrapper"
        v-for="count in currentPageCounts"
        :key="count"
      >
        <q-card
          class="my-card"
          :style="{
            padding: '8px',
            background: $q.dark.isActive ? '#ffffff08' : '#00000008',
          }"
        >
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
                >{{ commands[count - 1]?.updateTime }}</q-item-label
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
                    : 'primary'
                "
                icon="download"
                label="导入"
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
        @update:model-value="updateSearch"
        placeholder="搜索，支持拼音首字母"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
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
import commandTypes from "../js/options/commandTypes.js";
import pinyinMatch from "pinyin-match";

export default {
  data() {
    return {
      currentPage: 1,
      commands: [],
      allCommands: [],
      matchedCommands: [],
      perPage: 8,
      commandSearchKeyword: "",
      releaseRepo: "fofolee/qcreleases",
      shareRepo: "fofolee/qcshares",
      commandTypes: commandTypes,
      platform: window.processPlatform,
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
      return this.currentPage === this.maxPages
        ? this.matchedCommands.length % this.perPage
        : this.perPage;
    },
  },
  mounted() {
    window.yuQueClient(`repos/${this.releaseRepo}/docs`).then((res) => {
      console.log(res.data);
      this.allCommands = res.data.data;
      this.matchedCommands = _.cloneDeep(this.allCommands);
      this.fetchCommandDetails(1);
    });
  },
  watch: {
    currentPage(val) {
      this.fetchCommandDetails(val);
    },
  },
  methods: {
    fetchCommandDetails(page) {
      this.commands = [];
      this.matchedCommands
        .slice((page - 1) * this.perPage, page * this.perPage)
        .forEach((item) => {
          window
            .yuQueClient(`repos/${this.releaseRepo}/docs/${item.slug}?raw=1`)
            .then((res) => {
              let command = JSON.parse(
                res.data?.data.body.match(/```json([\s\S]*)```/)?.[1]
              );
              if (!command) return;
              command.authorName = item.last_editor.name;
              command.updateTime = item.content_updated_at.slice(0, 10);
              this.commands.push(command);
            });
        });
    },
    importCommand(command) {
      let code = command?.features?.code;
      if (!code)
        return quickcommand.showMessageBox("该命令格式有误！", "error");
      let pushData = _.cloneDeep(command);
      if (!pushData?.tags.includes("来自分享")) pushData.tags.push("来自分享");
      this.$utools.putDB(_.cloneDeep(pushData), this.$utools.DBPRE.QC + code);
      quickcommand.showMessageBox("导入成功！可到「来自分享」标签查看");
    },
    updateSearch() {
      if (!this.commandSearchKeyword) this.matchedCommands = this.allCommands;
      else
        this.matchedCommands = this.allCommands.filter((x) =>
          pinyinMatch.match(x.title, this.commandSearchKeyword)
        );
      this.fetchCommandDetails(1);
    },
  },
};
</script>

<style scoped>
.q-card {
  user-select: none;
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
  transform: translateY(-1px);
  filter: drop-shadow(1px 1px 5px #0000008e);
}
</style>
