<template>
  <div>
    <div class="flex absolute-top" style="bottom: 60px; overflow-y: auto">
      <div
        style="width: 50%"
        class="q-pa-sm wrapper"
        v-for="command in commands.slice(
          (currentPage - 1) * perPage,
          currentPage * perPage
        )"
        :key="command"
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
                <q-img :src="command?.avatar" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6" lines="1">{{
                command?.title
              }}</q-item-label>
              <q-item-label caption
                ><q-icon name="account_circle"></q-icon>{{ command?.user }}
                <q-icon name="watch_later"></q-icon
                >{{ command?.updateTime }}</q-item-label
              >
              <q-item-label caption
                ><q-icon name="fiber_manual_record"></q-icon
                >{{ command?.program }}</q-item-label
              >
              <q-item-label caption>
                <span
                  v-for="tag in [command?.type, ...command?.tags]"
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
              </q-item-label>
            </q-item-section>
            <q-item-label side>
              <q-btn
                @click="importCommand(command.slug)"
                flat
                dense
                color="primary"
                icon="download"
                label="导入"
              ></q-btn>
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentPage: 1,
      commands: [],
      perPage: 8,
      loading: true,
      releaseRepo: "fofolee/qcreleases",
      shareRepo: "fofolee/qcshares",
    };
  },
  computed: {
    maxPages() {
      return Math.ceil(this.commands.length / this.perPage) || 1;
    },
  },
  mounted() {
    this.loading = true;
    window.yuQueClient(`repos/${this.releaseRepo}/docs`).then((res) => {
      console.log(res.data);
      this.commands = res.data.data
        .map((item) => {
          let info = JSON.parse(item.custom_description);
          return {
            title: item.title,
            user: item.last_editor.name,
            updateTime: item.content_updated_at.slice(0, 10),
            avatar: item.last_editor.avatar_url,
            tags: info.tags.split(" ").filter((x) => x), // 历史原因，这里tag的格式不规范
            program: info.program,
            platform: info.platform,
            type: info.type,
            slug: item.slug,
          };
        })
        .filter((item) => item.platform.includes(window.processPlatform));
      this.loading = false;
    });
  },

  methods: {
    importCommand(slug) {
      window
        .yuQueClient(`repos/${this.releaseRepo}/docs/${slug}?raw=1`)
        .then((res) => {
          let command = JSON.parse(
            res.data?.data.body.match(/```json([\s\S]*)```/)?.[1]
          );
          if (!command)
            return quickcommand.showMessageBox("导入出错！", "error");
          command.tags.push("新添加");
          let code = command?.features?.code;
          if (!code)
            return quickcommand.showMessageBox("该命令格式有误！", "error");
          this.$utools.putDB(command, this.$utools.DBPRE.QC + code);
          quickcommand.showMessageBox("导入成功！可到「来自分享」标签查看");
        });
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
