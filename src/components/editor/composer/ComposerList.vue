<template>
  <div class="composer-list">
    <q-list separator class="rounded-borders">
      <template v-for="category in commandCategories" :key="category.label">
        <q-item-label header class="q-py-sm">
          <div class="row items-center">
            <q-icon
              :name="category.icon"
              color="primary"
              size="sm"
              class="q-mr-sm"
            />
            <span class="text-weight-medium">{{ category.label }}</span>
          </div>
        </q-item-label>

        <q-item
          v-for="command in getCategoryCommands(category)"
          :key="command.value"
          class="command-item q-py-xs"
          draggable="true"
          @dragstart="onDragStart($event, command)"
        >
          <q-item-section>
            <q-item-label class="text-weight-medium">{{
              command.label
            }}</q-item-label>
          </q-item-section>
          <q-item-section side style="padding-left: 8px">
            <q-icon name="drag_indicator" color="grey-6" size="16px" />
          </q-item-section>
        </q-item>
      </template>
    </q-list>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { commandCategories } from "js/composer/composerConfig";

export default defineComponent({
  name: "ComposerList",
  props: {
    commands: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      commandCategories,
    };
  },
  methods: {
    getCategoryCommands(category) {
      return this.commands.filter((cmd) =>
        category.commands.some(
          (catCmd) => catCmd.value === cmd.value || catCmd.value === cmd.cmd
        )
      );
    },
    onDragStart(event, command) {
      event.dataTransfer.setData(
        "action",
        JSON.stringify({
          ...command,
          value: command.value,
        })
      );
      event.target.classList.add("dragging");
      event.target.addEventListener(
        "dragend",
        () => {
          event.target.classList.remove("dragging");
        },
        { once: true }
      );
    },
  },
});
</script>

<style scoped>
.composer-list {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border-color: transparent;
}

.body--dark .composer-list {
  background-color: rgba(32, 32, 32, 0.8);
}

.command-item.q-item-type {
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  margin: 4px 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.8);
  cursor: grab;
  font-size: 12px;
}

.command-item.q-item-type:hover {
  background-color: rgba(255, 255, 255, 0.9);
  transform: translateX(4px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.command-item.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

/* 分类标题样式 */
.q-item-label.header {
  min-height: 32px;
  padding: 4px 12px;
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background-color: rgba(255, 255, 255, 0.9);
}

/* 暗色模式适配 */
.body--dark .command-item.q-item-type {
  border-color: rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.05);
}

.body--dark .command-item.q-item-type:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.body--dark .q-item-label.header {
  border-color: rgba(255, 255, 255, 0.05);
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
