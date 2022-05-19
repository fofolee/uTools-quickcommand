<template>
  <q-card style="width: 600px">
    <q-list>
      <q-item
        v-for="plugin in plugins"
        :key="plugin.name"
        clickable
        @click="jumpTo(plugin.plugin_name)"
      >
        <q-item-section avatar
          ><q-img :src="'https://res.u-tools.cn/plugins' + plugin.logo" />
        </q-item-section>
        <q-item-section>
          <q-item-label
            class="text-weight-bolder"
            v-text="plugin.plugin_name"
          />
          <q-item-label caption v-text="plugin.description" />
        </q-item-section>
        <q-item-section side>
          <q-rating v-model="plugin.rating" readonly color="primary" />
          <div class="text-caption">
            {{ plugin.rating ? `${plugin.voters} 人评分` : "评分不足" }}
            <q-badge :label="plugin.rating" v-if="plugin.rating" />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script>
const url = `http://open.u-tools.cn/plugins?same_author=9a1d1d03&tag_id=0&mid=d1fef324-b4fd-5f81-b05e-4d4d822277b3&nid=f1960e006c87cf1107f2017711668d6c&platform=${window.processPlatform}`;

export default {
  data() {
    return {
      plugins: [],
    };
  },
  mounted() {
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        this.plugins = res.plugins;
      });
  },
  methods: {
    jumpTo(plugin) {
      utools.redirect(plugin);
    },
  },
};
</script>
