const { ipcRenderer } = require("electron");
const pinyinMatch = require("pinyin-match");

// 等待 DOM 加载完成
document.addEventListener("DOMContentLoaded", () => {
  let parentId = null;
  let dialogType = null;

  // 监听父窗口发来的对话框配置
  ipcRenderer.on("dialog-config", (event, config) => {
    parentId = event.senderId;
    dialogType = config.type;

    // 设置主题
    document.documentElement.setAttribute(
      "data-theme",
      config.isDark ? "dark" : "light"
    );

    // 设置对话框标题
    document.getElementById("title-text").textContent = config.title || "提示";

    // 设置对话框内容
    if (config.content) {
      document.getElementById("content").textContent = config.content;
    }

    // 根据类型设置不同的对话框内容
    switch (config.type) {
      case "message":
        document.body.classList.add("dialog-message"); // 添加消息对话框的类
        break;

      case "input":
        document.getElementById("input").style.display = "block";
        document.body.classList.add("dialog-input");
        // 创建输入框
        const inputContainer = document.getElementById("input-container");
        inputContainer.innerHTML = ""; // 清空现有内容
        config.inputOptions.forEach((inputOption, index) => {
          console.log(inputOption);
          const div = document.createElement("div");
          div.className = "input-group";

          const label = document.createElement("label");
          label.textContent =
            typeof inputOption === "string" ? inputOption : inputOption.label;

          const input = document.createElement("input");
          input.type = "text";
          input.id = `input-${index}`;
          if (typeof inputOption !== "string") {
            input.value = inputOption.value || "";
            input.placeholder = inputOption.hint || "";
          }

          div.appendChild(label);
          div.appendChild(input);
          inputContainer.appendChild(div);
        });
        document.getElementById("input-0").focus();
        break;

      case "confirm":
        document.getElementById("confirm").style.display = "block";
        document.body.classList.add("dialog-confirm");
        break;

      case "buttons":
        document.getElementById("buttons").style.display = "block";
        document.body.classList.add("dialog-buttons");
        // 创建按钮
        const buttonContainer = document.getElementById("button-container");
        buttonContainer.innerHTML = "";
        config.buttons.forEach((btn, index) => {
          const button = document.createElement("button");
          button.textContent = btn;
          button.onclick = () => {
            ipcRenderer.sendTo(parentId, "dialog-result", {
              id: index,
              text: btn,
            });
          };
          buttonContainer.appendChild(button);
        });
        break;

      case "textarea":
        document.getElementById("textarea").style.display = "block";
        document.body.classList.add("dialog-textarea");
        const textarea = document.getElementById("text-content");
        if (config.placeholder) {
          textarea.placeholder = config.placeholder;
        }
        if (config.defaultText) {
          textarea.value = config.defaultText;
        }
        textarea.focus();
        break;

      case "select":
        document.getElementById("select").style.display = "block";
        document.body.classList.add("dialog-select");
        const selectContainer = document.getElementById("select-container");
        const filterInput = document.getElementById("filter-input");
        const selectList = document.querySelector(".select-list");
        selectContainer.innerHTML = "";
        let currentSelected = null;
        let allItems = [];
        let filteredItems = [];
        let hoverTimeout = null;
        let isKeyboardNavigation = false;

        if (!config.enableSearch) {
          filterInput.style.display = "none";
        }

        if (config.placeholder) {
          filterInput.placeholder = config.placeholder;
        }

        // 创建选项
        const createSelectItem = (item, index) => {
          const div = document.createElement("div");
          div.className = "select-item";

          // 点击事件
          div.onclick = () => {
            const originalIndex = allItems.indexOf(item);
            const result =
              typeof item === "string"
                ? {
                    id: originalIndex,
                    text: item,
                  }
                : item;
            ipcRenderer.sendTo(parentId, "dialog-result", result);
          };

          // 鼠标移入事件
          div.onmouseenter = () => {
            if (isKeyboardNavigation) return;
            if (hoverTimeout) {
              clearTimeout(hoverTimeout);
            }
            hoverTimeout = setTimeout(() => {
              if (currentSelected) {
                currentSelected.classList.remove("selected");
              }
              div.classList.add("selected");
              currentSelected = div;
            }, 0);
          };

          // 鼠标移动事件
          div.onmousemove = () => {
            if (isKeyboardNavigation) {
              isKeyboardNavigation = false;
              selectList.classList.remove("keyboard-nav");
            }
          };

          // 高亮文本
          const highlightText = (text, filterText) => {
            if (!filterText) return text;
            const matchResult = pinyinMatch.match(text, filterText);
            if (!matchResult) return text;

            const [start, end] = matchResult;
            return (
              text.slice(0, start) +
              `<span class="highlight">${text.slice(start, end + 1)}</span>` +
              text.slice(end + 1)
            );
          };

          if (typeof item === "string" || typeof item === "number") {
            const highlightedText = highlightText(
              String(item),
              filterInput.value
            );
            div.innerHTML = `
              <div class="select-item-content">
                <p class="select-item-title">${highlightedText}</p>
              </div>
            `;
          } else {
            const highlightedTitle = highlightText(
              item.title,
              filterInput.value
            );
            const highlightedDesc = item.description
              ? highlightText(item.description, filterInput.value)
              : "";
            div.innerHTML = `
              ${
                item.icon
                  ? `
                <div class="select-item-icon">
                  <img src="${item.icon}" alt="">
                </div>
              `
                  : ""
              }
              <div class="select-item-content">
                <p class="select-item-title">${highlightedTitle}</p>
                ${
                  item.description
                    ? `
                  <p class="select-item-description">${highlightedDesc}</p>
                `
                    : ""
                }
              </div>
            `;
          }
          return div;
        };

        // 过滤并更新列表
        const updateList = (filterText = "") => {
          selectContainer.innerHTML = "";
          filteredItems = allItems.filter((item) => {
            if (typeof item === "string" || typeof item === "number") {
              return (
                filterText === "" || pinyinMatch.match(String(item), filterText)
              );
            } else {
              const titleMatch = pinyinMatch.match(item.title, filterText);
              const descMatch = item.description
                ? pinyinMatch.match(item.description, filterText)
                : false;
              return filterText === "" || titleMatch || descMatch;
            }
          });

          filteredItems.forEach((item, index) => {
            const div = createSelectItem(item, index);
            selectContainer.appendChild(div);
          });

          // 默认选中第一项
          if (selectContainer.firstChild) {
            selectContainer.firstChild.classList.add("selected");
            currentSelected = selectContainer.firstChild;
          }
        };

        // 初始化列表
        allItems = config.items;
        updateList();

        // 添加筛选功能
        if (config.enableSearch) {
          let filterTimeout = null;
          filterInput.addEventListener("input", (e) => {
            if (filterTimeout) {
              clearTimeout(filterTimeout);
            }
            filterTimeout = setTimeout(() => {
              updateList(e.target.value);
            }, 100);
          });
        }

        // 添加键盘导航
        const keydownHandler = (e) => {
          const items = selectContainer.children;
          if (!items.length) return;

          if (
            !isKeyboardNavigation &&
            (e.key === "ArrowUp" || e.key === "ArrowDown")
          ) {
            isKeyboardNavigation = true;
            selectList.classList.add("keyboard-nav");
          }

          const currentIndex = Array.from(items).indexOf(currentSelected);
          let newIndex = currentIndex;

          switch (e.key) {
            case "ArrowUp":
              e.preventDefault();
              if (currentIndex > 0) {
                newIndex = currentIndex - 1;
              }
              break;
            case "ArrowDown":
              e.preventDefault();
              if (currentIndex < items.length - 1) {
                newIndex = currentIndex + 1;
              }
              break;
            case "Enter":
              e.preventDefault();
              if (currentSelected) {
                currentSelected.click();
              }
              break;
            case "Escape":
              e.preventDefault();
              cancelDialog();
              break;
          }

          if (newIndex !== currentIndex) {
            if (currentSelected) {
              currentSelected.classList.remove("selected");
            }
            items[newIndex].classList.add("selected");
            currentSelected = items[newIndex];
            currentSelected.scrollIntoView({ block: "nearest" });
          }
        };

        document.addEventListener("keydown", keydownHandler);

        // 聚焦筛选框
        if (config.enableSearch) {
          filterInput.focus();
        }
        break;

      case "wait-button":
        document.getElementById("wait-button").style.display = "block";
        document.body.classList.add("dialog-wait-button");

        // 创建按钮组
        const waitButtonContainer = document.getElementById("wait-button");
        const buttonGroup = document.createElement("div");
        buttonGroup.className = "wait-button-group";

        // 创建主按钮
        const waitBtn = document.createElement("button");
        waitBtn.id = "wait-btn";
        waitBtn.textContent = config.text;
        waitBtn.onclick = () => {
          ipcRenderer.sendTo(parentId, "dialog-result", true);
        };

        buttonGroup.appendChild(waitBtn);

        // 如果需要显示取消按钮
        if (config.showCancel) {
          const cancelBtn = document.createElement("button");
          cancelBtn.id = "wait-cancel-btn";
          cancelBtn.innerHTML = "&#x2715;"; // 使用 × 符号
          cancelBtn.onclick = () => {
            ipcRenderer.sendTo(parentId, "dialog-result", false);
          };
          buttonGroup.appendChild(cancelBtn);
        }

        waitButtonContainer.appendChild(buttonGroup);
        break;
    }
    ipcRenderer.sendTo(parentId, "dialog-ready", calculateHeight());
  });

  const calculateHeight = () => {
    const titleBar = document.querySelector(".title-bar");
    const buttonBar = document.querySelector(".button-bar");
    const contentWrapper = document.querySelector(".content-wrapper");

    // 计算总高度
    const totalHeight =
      titleBar.offsetHeight +
      contentWrapper.scrollHeight +
      (buttonBar.style.display !== "none" ? buttonBar.offsetHeight : 0);

    const maxHeight = dialogType === "select" ? 620 : 520;

    // 确保高度在最小值和最大值之间
    return Math.min(Math.max(totalHeight, 100), maxHeight);
  };

  // 确定按钮点击事件
  document.getElementById("ok-btn").onclick = () => {
    let result;

    switch (dialogType) {
      case "message":
        result = true;
        break;

      case "input":
        const inputs = document.querySelectorAll("#input-container input");
        result = Array.from(inputs).map((input) => input.value);
        break;

      case "confirm":
        result = true;
        break;

      case "textarea":
        result = document.getElementById("text-content").value;
        break;
    }

    ipcRenderer.sendTo(parentId, "dialog-result", result);
  };

  const cancelDialog = () => {
    let result;
    switch (dialogType) {
      case "input":
        result = [];
        break;
      case "textarea":
        result = "";
        break;
      case "confirm":
        result = false;
        break;
      case "buttons":
        result = {};
        break;
      case "select":
        result = {};
        break;
      default:
        result = null;
    }
    ipcRenderer.sendTo(parentId, "dialog-result", result);
  };

  // 取消按钮点击事件
  document.getElementById("cancel-btn").onclick = () => {
    cancelDialog();
  };

  // ESC键关闭窗口
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      cancelDialog();
    }
  });

  // 回车键确认
  document.addEventListener("keydown", (e) => {
    // 如果是文本区域且按下回车，不触发确认
    if (e.key === "Enter") {
      if (dialogType === "textarea" && !e.ctrlKey) {
        return;
      }
      document.getElementById("ok-btn").click();
    }
  });

  // 关闭按钮点击事件
  document.querySelector(".close-btn").onclick = () => {
    cancelDialog();
  };
});
