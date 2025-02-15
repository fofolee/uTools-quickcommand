<template>
  <div class="composer-list">
    <div class="section-header">
      <q-input
        v-model="searchQuery"
        dense
        borderless
        placeholder="搜索命令..."
        class="search-input"
        ref="searchInput"
        autofocus
      >
        <template v-slot:prepend>
          <q-icon name="search" size="sm" />
        </template>
      </q-input>
    </div>

    <q-scroll-area class="command-scroll">
      <div>
        <q-list separator class="rounded-borders">
          <template
            v-for="category in filteredCategories"
            :key="category.label"
          >
            <q-expansion-item
              :label="category.label"
              :icon="category.icon"
              :model-value="isExpanded(category)"
              @update:model-value="updateExpanded(category, $event)"
              dense-toggle
              class="category-item"
              header-class="category-header"
            >
              <template v-slot:header>
                <div class="category-header-content">
                  <q-icon
                    :name="category.icon"
                    color="primary"
                    size="sm"
                    class="category-icon"
                  />
                  <span class="text-weight-medium">{{ category.label }}</span>
                </div>
              </template>

              <q-item
                v-for="command in getCategoryCommands(category)"
                :key="command.value"
                class="command-item"
                draggable="true"
                @dragstart="onDragStart($event, command)"
              >
                <div class="drag-icon-left">
                  <q-icon name="drag_indicator" color="grey-6" size="16px" />
                </div>
                <q-item-section>
                  <q-item-label
                    class="text-weight-medium q-px-lg"
                    v-html="highlightText(command.label)"
                  />
                </q-item-section>
              </q-item>
            </q-expansion-item>
          </template>
        </q-list>
      </div>
    </q-scroll-area>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { commandCategories } from "js/composer/composerConfig";
import pinyinMatch from "pinyin-match";

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
      searchQuery: "",
      expandedCategories: new Set(),
    };
  },
  created() {
    this.commandCategories.forEach((category) => {
      if (category.defaultOpened) {
        this.expandedCategories.add(category.label);
      }
    });
  },
  computed: {
    filteredCategories() {
      if (!this.searchQuery) return this.commandCategories;

      const query = this.searchQuery.toLowerCase();
      const filtered = this.commandCategories
        .map((category) => ({
          ...category,
          commands: this.commands
            .filter(
              (cmd) =>
                (cmd.label && pinyinMatch.match(cmd.label, query)) ||
                (cmd.value && pinyinMatch.match(cmd.value, query))
            )
            .filter((cmd) => cmd.type === category.label),
        }))
        .filter((category) => category.commands.length > 0);

      if (filtered.length > 0) {
        filtered.forEach((category) => {
          this.expandedCategories.add(category.label);
        });
      }

      return filtered;
    },
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
    highlightText(text) {
      if (!this.searchQuery) return text;

      const matches = pinyinMatch.match(text, this.searchQuery);
      if (!matches) return text;

      const [start, end] = matches;
      return (
        text.slice(0, start) +
        `<span class="highlight">${text.slice(start, end + 1)}</span>` +
        text.slice(end + 1)
      );
    },
    isExpanded(category) {
      return this.expandedCategories.has(category.label);
    },
    updateExpanded(category, value) {
      if (value) {
        this.expandedCategories.add(category.label);
      } else {
        this.expandedCategories.delete(category.label);
      }
    },
  },
  mounted() {
    this.$refs.searchInput.focus();
  },
});
</script>

<style scoped>
.composer-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 10px;
  user-select: none;
}

.section-header {
  flex-shrink: 0;
  padding: 0 8px;
  height: 30px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.command-scroll {
  flex: 1;
  overflow: hidden;
  border-radius: 10px;
  padding: 4px 0;
}

.search-input {
  width: 100%;
}

.search-input :deep(.q-field__control) {
  height: 100%;
  padding: 0 4px;
  border-radius: 10px;
}

.search-input :deep(.q-field__native) {
  padding: 0;
  font-size: 12px;
}

.search-input :deep(.q-field__marginal) {
  height: 100%;
}

.composer-list :deep(.q-expansion-item) {
  margin: 0;
  border: none;
}

.composer-list :deep(.q-expansion-item .q-item) {
  justify-content: space-between;
}

.body--dark .composer-list {
  background-color: #232323;
}

.category-item {
  margin: 4px 0;
  border-radius: 4px;
  overflow: hidden;
}

:deep(.q-item.category-header) {
  min-height: 30px;
  margin: 0 8px;
  padding: 0 4px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
}

:deep(.q-item.category-header .q-item__section--side) {
  position: absolute;
  right: 4px;
  padding: 0;
  height: 100%;
  display: flex;
  align-items: center;
}

.category-header-content {
  position: absolute;
  left: 0;
  right: 0;
  height: 100%;
  display: flex;
  align-items: center;
}

.category-icon {
  position: absolute;
  left: 4px;
  height: 100%;
  display: flex;
  align-items: center;
}

.category-header-content span {
  flex: 1;
  text-align: center;
  padding: 0 24px;
  line-height: 1;
}

:deep(.q-expansion-item__toggle-icon) {
  font-size: 1.2em;
  line-height: 1;
}

.command-item.q-item-type {
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  margin: 4px 8px;
  padding: 0 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--transparent-bg-color);
  cursor: grab;
  font-size: 12px;
  min-height: 40px;
  display: flex;
  align-items: center;
  position: relative;
}

.command-item.q-item-type :deep(.q-item__section) {
  padding: 0;
  min-height: unset;
  flex: 1;
}

.command-item.q-item-type :deep(.q-item__label) {
  line-height: 1;
  text-align: center;
}

.command-item.q-item-type:hover {
  transform: translateX(3px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.command-item.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.body--dark .section-header {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.command-item :deep(.highlight) {
  color: var(--q-primary);
  font-weight: bold;
  padding: 0 1px;
  border-radius: 2px;
}

.drag-icon-left {
  position: absolute;
  left: 8px;
  height: 100%;
  display: flex;
  align-items: center;
}

.section-header .q-field--focused .q-field__prepend .q-icon {
  animation: shake 0.8s ease;
  color: var(--q-primary);
}
</style>
