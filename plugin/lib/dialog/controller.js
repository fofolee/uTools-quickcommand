const { ipcRenderer } = require("electron");

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

    // 确保高度在最小值和最大值之间
    return Math.min(Math.max(totalHeight, 100), 520);
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
