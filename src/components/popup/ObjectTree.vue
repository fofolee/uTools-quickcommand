<template>
  <div class="q-gutter-sm">
    <q-tree
      :nodes="trees"
      no-connectors
      node-key="id"
      @lazy-load="showChildren"
    >
      <template v-slot:default-header="prop">
        <div class="text-primary">{{ prop.node.key }}</div>
        <div v-show="!!prop.node.key" v-text="':'" style="margin-right: 5px" />
        <div class="text-italic">{{ prop.node.summary }}</div>
      </template></q-tree
    >
  </div>
</template>

<script>
import { toRaw } from "vue";

const maxSize = {
  txt: 80,
  obj: 3,
  ary: 3,
  buff: 50,
};

export default {
  data() {
    return {
      trees: [
        {
          key: "",
          summary: this.liteItem(this.obj),
          lazy: true,
          value: this.obj,
          id: "root",
        },
      ],
    };
  },
  props: {
    obj: Object,
  },
  methods: {
    liteItem(item) {
      if (item === null) return "null";
      if (typeof item === "undefined") return "undefined";
      if (typeof item === "string")
        return window.lodashM.truncate(item, { length: maxSize.txt });
      if (typeof item === "number") return item;
      if (typeof item === "function")
        return `f ${item.name ? item.name + "()" : "anonymous()"}`;
      if (typeof item !== "object") return item.toString();
      if (window.lodashM.isBuffer(item)) {
        var bufferString = `[Buffer ${item
          .slice(0, maxSize.buff)
          .toString("hex")
          .match(/\w{1,2}/g)
          .map((x) => parseInt(x, 16))
          .join(" ")}`;
        if (item.length > maxSize.buff)
          bufferString += `...${(item.length / 1000).toFixed(2)} kb `;
        return bufferString + "]";
      }
      if (item instanceof ArrayBuffer) return `ArrayBuffer(${item.byteLength})`;
      if (item instanceof Blob)
        return `Blob { size: ${item.size}, type: "${item.type}" }`;
      if (item instanceof Array) {
        return (
          "[" +
          item
            .map((i) => {
              if (typeof i === "function") return `f`;
              if (i instanceof Array) return `Array(${i.length})`;
              if (i instanceof Object) return `{...}`;
              return i;
            })
            .slice(0, maxSize.ary)
            .join(", ") +
          (item.length > maxSize.ary ? "..." : "") +
          "]"
        );
      }
      let keys = this.getObjKeys(item);
      if (keys.length === 0 && item.toString() !== "[object Object]")
        return item.toString();
      return (
        "{" +
        keys.slice(0, maxSize.obj).join(", ") +
        (keys.length > maxSize.obj ? "..." : "") +
        "}"
      );
    },
    getObjKeys(item) {
      // 一些特殊对象用 Object.keys() 无法获取
      let keys = [];
      for (const key in item) {
        keys.push(key);
      }
      return keys;
    },
    showChildren({ node, key, done, fail }) {
      let children = [];
      if (typeof node.value === "string") {
        children.push({
          summary: node.value,
          id: node.id + "." + key,
        });
      } else {
        for (let key in node.value) {
          let value = toRaw(node.value)[key];
          children.push({
            key: key,
            summary: this.liteItem(value),
            lazy: this.hasChildren(value),
            value: value,
            id: node.id + "." + key,
          });
        }
      }
      done(children);
    },
    hasChildren(item) {
      if (typeof item === "object")
        return item !== null && this.getObjKeys(item).length > 0;
      if (typeof item === "string") {
        return item.length > maxSize.txt;
      }
      return false;
    },
  },
};
</script>
