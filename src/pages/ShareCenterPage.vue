<template>
  <div>
    <div class="flex">
      <div
        style="width: 50%"
        class="q-pa-sm"
        v-for="count in perPage"
        :key="count"
      >
        <q-card class="my-card">
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
              <q-item-label class="text-h5">{{
                commands[count - 1]?.features?.explain
              }}</q-item-label>
              <q-item-label caption>{{
                commands[count - 1]?.program
              }}</q-item-label>
              <q-item-label caption>{{
                commands[count - 1]?.features?.cmds[0]?.type || "key"
              }}</q-item-label>
            </q-item-section>
            <q-btn flat>导入</q-btn>
          </q-item>
        </q-card>
      </div>
    </div>
    <div class="q-pa-sm flex flex-center">
      <q-pagination v-model="currentPage" :max="maxPages" input />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentPage: 1,
      commandTree: [],
      commands: [],
      perPage: 12,
      loading: true,
    };
  },
  computed: {
    maxPages() {
      return this.commandTree.length || 1;
    },
  },
  watch: {
    currentPage(val) {
      this.updateCommands(val);
    },
  },
  mounted() {
    window.fetchGitee("/contents/commands").then((res) => {
      this.commandTree = res;
      this.updateCommands(1);
    });
  },
  methods: {
    updateCommands(page) {
      this.loading = true;
      this.commands = [];
      this.commandTree
        .slice((page - 1) * this.perPage, page * this.perPage)
        .forEach(async (x) => {
          let res = await window.fetchGitee(`/contents/commands/${x.name}`);
          let command = JSON.parse(window.base64Decode(res.content));
          this.commands.push(command);
        });
    },
  },
};
</script>
