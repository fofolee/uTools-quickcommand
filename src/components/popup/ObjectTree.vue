<template>
  <div class="q-pa-xs q-gutter-sm">
    <q-tree :nodes="trees" node-key="label" @lazy-load="showChildren" />
  </div>
</template>

<script>
import { toRaw } from "vue";

export default {
  data() {
    return {
      trees: [
        {
          label: "object",
          lazy: true,
          item: this.obj,
        },
      ],
    };
  },
  props: {
    obj: Object,
  },
  methods: {
    liteItem(item) {
      if (typeof item === "undefined") return "undefined";
      if (typeof item === "number") return item;
      if (typeof item === "function")
        return `[Function: ${item.name ? item.name : "(anonymous)"}]`;
      if (typeof item !== "object") return item.toString();
      if (_.isBuffer(item)) {
        var bufferString = `[Buffer ${item
          .slice(0, 50)
          .toString("hex")
          .match(/\w{1,2}/g)
          .join(" ")}`;
        if (item.length > 50)
          bufferString += `...${(item.length / 1000).toFixed(2)} kb `;
        return bufferString + "]";
      }
      if (item instanceof ArrayBuffer) return `ArrayBuffer(${item.byteLength})`;
      if (item instanceof Blob)
        return `Blob { size: ${item.size}, type: "${item.type}" }`;
      return "object";
    },
    showChildren({ node, key, done, fail }) {
      let children = [];
      for (let key in node.item) {
        let value = toRaw(node.item)[key];
        children.push({
          label: `${key}: ${this.liteItem(value)}`,
          lazy: typeof value === "object",
          item: value,
        });
      }
      done(children);
      this.$emit("expandTrees");
    },
  },
};
</script>
