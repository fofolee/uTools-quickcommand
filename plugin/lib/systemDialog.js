const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { getQuickcommandFolderFile } = require("./getQuickcommandFile");

// 添加一个辅助函数来执行命令
const execCommand = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

// 添加一个辅助函数来检查命令是否存在
const checkZenity = async () => {
  try {
    await execCommand("which zenity");
    return true;
  } catch (error) {
    window.utools.showNotification(
      "请先安装 zenity：\nsudo apt install zenity 或\nsudo yum install zenity 或\nsudo pacman -S zenity"
    );
    return false;
  }
};

// 定义通用样式
const commonStyles = `
  static void ApplyModernStyle(Form form) {
    form.Font = new Font("Microsoft YaHei UI", 9F);
    form.BackColor = Color.White;
    form.Padding = new Padding(15);
  }

  static void ApplyButtonStyle(Button button) {
    button.FlatStyle = FlatStyle.Flat;
    button.BackColor = Color.FromArgb(0, 120, 212);
    button.ForeColor = Color.White;
    button.Font = new Font("Microsoft YaHei UI", 9F);
    button.Cursor = Cursors.Hand;
    button.FlatAppearance.BorderSize = 0;
    button.Height = 30;
    button.Width = 85;
  }

  static void ApplySecondaryButtonStyle(Button button) {
    button.FlatStyle = FlatStyle.Flat;
    button.BackColor = Color.FromArgb(240, 240, 240);
    button.ForeColor = Color.Black;
    button.Font = new Font("Microsoft YaHei UI", 9F);
    button.Cursor = Cursors.Hand;
    button.FlatAppearance.BorderSize = 1;
    button.FlatAppearance.BorderColor = Color.FromArgb(200, 200, 200);
    button.Height = 30;
    button.Width = 85;
  }

  static void ApplyTextBoxStyle(TextBox textBox) {
    textBox.BorderStyle = BorderStyle.FixedSingle;
    textBox.Font = new Font("Microsoft YaHei UI", 9F);
  }

  static void ApplyLabelStyle(Label label) {
    label.Font = new Font("Microsoft YaHei UI", 9F);
    label.ForeColor = Color.FromArgb(51, 51, 51);
  }

  static void ApplyListBoxStyle(ListBox listBox) {
    listBox.Font = new Font("Microsoft YaHei UI", 9F);
    listBox.BorderStyle = BorderStyle.FixedSingle;
    listBox.BackColor = Color.White;
  }`;

const getQuickcommandIconPath = () => {
  try {
    const iconPath = getQuickcommandFolderFile("logo", "png");
    if (!fs.existsSync(iconPath)) {
      fs.copyFileSync(path.join(__dirname, "..", "logo.png"), iconPath);
    }
    return iconPath;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const showSystemMessageBox = async function (content, title = "") {
  const iconPath = getQuickcommandIconPath();
  if (window.utools.isMacOs()) {
    let iconParam = "note";
    if (iconPath) {
      const posixPath = iconPath.replace(/\\/g, "/");
      iconParam = `alias POSIX file "${posixPath}"`;
    }
    const script = `display dialog "${content}" with title "${title}" buttons {"确定"} default button "确定" with icon ${iconParam}`;
    await this.runAppleScript(script);
  } else if (window.utools.isWindows()) {
    const escapedIconPath = iconPath ? iconPath.replace(/\\/g, "\\\\") : null;
    const csharpScript = `
        using System;
        using System.Windows.Forms;
        using System.Drawing;
        using System.IO;
        class Program {
          ${commonStyles}

          static void Main() {
            Form form = new Form();
            Label label = new Label();
            Button okButton = new Button();

            ApplyModernStyle(form);
            form.Text = "${title}";
            form.ClientSize = new Size(400, 130);
            form.FormBorderStyle = FormBorderStyle.FixedDialog;
            form.StartPosition = FormStartPosition.CenterScreen;
            form.MaximizeBox = false;
            form.MinimizeBox = false;
            ${
              escapedIconPath
                ? `using (var bmp = new Bitmap("${escapedIconPath}"))
              {
                form.Icon = Icon.FromHandle(bmp.GetHicon());
              }`
                : ""
            }

            ApplyLabelStyle(label);
            label.Text = "${content}";
            label.SetBounds(15, 15, 370, 60);
            label.AutoSize = true;
            form.Controls.Add(label);

            ApplyButtonStyle(okButton);
            okButton.Text = "确定";
            okButton.DialogResult = DialogResult.OK;
            okButton.SetBounds(300, 80, 85, 30);
            form.Controls.Add(okButton);

            form.AcceptButton = okButton;
            form.ShowDialog();
            form.Dispose();
          }
        }`;
    await this.runCsharp(csharpScript);
  } else if (window.utools.isLinux()) {
    if (!(await checkZenity())) return;
    try {
      const script = `zenity --info --title="${title}" --text="${content}" --width=400`;
      await execCommand(script);
    } catch (error) {
      console.error("执行 zenity 命令失败:", error);
    }
  }
};

// 系统级输入框
const showSystemInputBox = async function (placeholders, title = "") {
  if (!Array.isArray(placeholders)) {
    placeholders = [placeholders];
  }

  const iconPath = getQuickcommandIconPath();
  if (window.utools.isMacOs()) {
    let iconParam = "note";
    if (iconPath) {
      const posixPath = iconPath.replace(/\\/g, "/");
      iconParam = `alias POSIX file "${posixPath}"`;
    }

    const results = [];
    for (let i = 0; i < placeholders.length; i++) {
      const isLast = i === placeholders.length - 1;
      const buttons = isLast ? '{"取消", "确定"}' : '{"取消", "继续"}';
      const defaultButton = isLast ? '"确定"' : '"继续"';
      const script = `display dialog "${placeholders[i]}" with title "${title}" default answer "" buttons ${buttons} default button ${defaultButton} with icon ${iconParam}`;
      const result = await this.runAppleScript(script);
      const buttonClicked = isLast ? "确定" : "继续";
      if (!result.includes(`button returned:${buttonClicked}`)) {
        return null;
      }
      const text = result.match(/text returned:(.+)/)[1];
      results.push(text);
    }
    return results;
  } else if (window.utools.isWindows()) {
    const escapedIconPath = iconPath ? iconPath.replace(/\\/g, "\\\\") : null;
    const csharpScript = `
        using System;
        using System.Windows.Forms;
        using System.Drawing;
        using System.IO;

        class Program {
          ${commonStyles}

          static void Main() {
            Form form = new Form();
            ApplyModernStyle(form);
            form.Text = "${title}";
            form.ClientSize = new Size(350, ${45 + placeholders.length * 70});
            form.FormBorderStyle = FormBorderStyle.FixedDialog;
            form.StartPosition = FormStartPosition.CenterScreen;
            form.MaximizeBox = false;
            form.MinimizeBox = false;
            ${
              escapedIconPath
                ? `using (var bmp = new Bitmap("${escapedIconPath}"))
              {
                form.Icon = Icon.FromHandle(bmp.GetHicon());
              }`
                : ""
            }

            ${placeholders
              .map(
                (placeholder, index) => `
            Label label${index} = new Label();
            ApplyLabelStyle(label${index});
            label${index}.Text = "${placeholder}";
            label${index}.SetBounds(15, ${15 + index * 70}, 320, 20);
            form.Controls.Add(label${index});

            TextBox textBox${index} = new TextBox();
            ApplyTextBoxStyle(textBox${index});
            textBox${index}.SetBounds(15, ${40 + index * 70}, 320, 25);
            form.Controls.Add(textBox${index});`
              )
              .join("\n")}

            Button okButton = new Button();
            ApplyButtonStyle(okButton);
            okButton.Text = "确定";
            okButton.DialogResult = DialogResult.OK;
            okButton.SetBounds(160, ${20 + placeholders.length * 70}, 85, 30);
            form.Controls.Add(okButton);

            Button cancelButton = new Button();
            ApplySecondaryButtonStyle(cancelButton);
            cancelButton.Text = "取消";
            cancelButton.DialogResult = DialogResult.Cancel;
            cancelButton.SetBounds(250, ${
              20 + placeholders.length * 70
            }, 85, 30);
            form.Controls.Add(cancelButton);

            form.AcceptButton = okButton;
            form.CancelButton = cancelButton;

            if (form.ShowDialog() == DialogResult.OK) {
              ${placeholders
                .map((_, index) => `Console.WriteLine(textBox${index}.Text);`)
                .join("\n          ")}
            }
            form.Dispose();
          }
        }`;
    const result = await this.runCsharp(csharpScript);
    return result.trim() || null;
  } else if (window.utools.isLinux()) {
    if (!(await checkZenity())) return null;
    const results = [];
    for (let i = 0; i < placeholders.length; i++) {
      try {
        const script = `zenity --entry --title="${title}" --text="${placeholders[i]}" --width=400`;
        const result = await execCommand(script);
        if (!result) return null;
        results.push(result.trim());
      } catch (error) {
        console.error("执行 zenity 命令失败:", error);
        return null;
      }
    }
    return results;
  }
};

// 系统级确认框
const showSystemConfirmBox = async function (content, title = "") {
  const iconPath = getQuickcommandIconPath();
  if (window.utools.isMacOs()) {
    let iconParam = "note";
    if (iconPath) {
      const posixPath = iconPath.replace(/\\/g, "/");
      iconParam = `alias POSIX file "${posixPath}"`;
    }
    const script = `display dialog "${content}" with title "${title}" buttons {"取消", "确定"} default button "确定" with icon ${iconParam}`;
    const result = await this.runAppleScript(script);
    return result.includes("button returned:确定");
  } else if (window.utools.isWindows()) {
    const escapedIconPath = iconPath ? iconPath.replace(/\\/g, "\\\\") : null;
    const csharpScript = `
        using System;
        using System.Windows.Forms;
        using System.Drawing;
        using System.IO;
        class Program {
          ${commonStyles}

          static void Main() {
            Form form = new Form();
            Label label = new Label();
            Button okButton = new Button();
            Button cancelButton = new Button();

            ApplyModernStyle(form);
            form.Text = "${title}";
            form.ClientSize = new Size(400, 130);
            form.FormBorderStyle = FormBorderStyle.FixedDialog;
            form.StartPosition = FormStartPosition.CenterScreen;
            form.MaximizeBox = false;
            form.MinimizeBox = false;
            ${
              escapedIconPath
                ? `using (var bmp = new Bitmap("${escapedIconPath}"))
              {
                form.Icon = Icon.FromHandle(bmp.GetHicon());
              }`
                : ""
            }

            ApplyLabelStyle(label);
            label.Text = "${content}";
            label.SetBounds(15, 15, 370, 60);
            label.AutoSize = true;
            form.Controls.Add(label);

            ApplyButtonStyle(okButton);
            okButton.Text = "确定";
            okButton.DialogResult = DialogResult.OK;
            okButton.SetBounds(210, 80, 85, 30);
            form.Controls.Add(okButton);

            ApplySecondaryButtonStyle(cancelButton);
            cancelButton.Text = "取消";
            cancelButton.DialogResult = DialogResult.Cancel;
            cancelButton.SetBounds(300, 80, 85, 30);
            form.Controls.Add(cancelButton);

            form.AcceptButton = okButton;
            form.CancelButton = cancelButton;

            DialogResult result = form.ShowDialog();
            Console.WriteLine(result == DialogResult.OK);
            form.Dispose();
          }
        }`;
    const result = await this.runCsharp(csharpScript);
    return result.trim() === "True";
  } else if (window.utools.isLinux()) {
    if (!(await checkZenity())) return false;
    try {
      const script = `zenity --question --title="${title}" --text="${content}" --width=400`;
      await execCommand(script);
      return true;
    } catch (error) {
      return false;
    }
  }
};

// 系统级选择框
const showSystemSelectList = async function (items, title = "") {
  const iconPath = getQuickcommandIconPath();
  if (window.utools.isMacOs()) {
    const itemList = items.map((item) => `"${item}"`).join(", ");
    const script = `choose from list {${itemList}} with title "${title}" with prompt "请选择：" default items {"${items[0]}"}`;
    const result = await this.runAppleScript(script);
    if (result.includes("false")) return null;
    const text = result.trim();
    const id = items.findIndex((item) => item === text);
    return { id, text };
  } else if (window.utools.isWindows()) {
    const escapedIconPath = iconPath ? iconPath.replace(/\\/g, "\\\\") : null;
    const csharpScript = `
        using System;
        using System.Windows.Forms;
        using System.Drawing;
        using System.IO;

        class Program {
          ${commonStyles}

          static void Main() {
            Form form = new Form();
            ListBox listBox = new ListBox();
            Button okButton = new Button();
            Button cancelButton = new Button();
            Label titleLabel = new Label();

            ApplyModernStyle(form);
            form.Text = "${title}";
            form.ClientSize = new Size(350, 280);
            form.FormBorderStyle = FormBorderStyle.FixedDialog;
            form.StartPosition = FormStartPosition.CenterScreen;
            form.MaximizeBox = false;
            form.MinimizeBox = false;
            ${
              escapedIconPath
                ? `using (var bmp = new Bitmap("${escapedIconPath}"))
              {
                form.Icon = Icon.FromHandle(bmp.GetHicon());
              }`
                : ""
            }

            titleLabel.Text = "请选择：";
            titleLabel.AutoSize = true;
            titleLabel.SetBounds(15, 15, 320, 20);
            ApplyLabelStyle(titleLabel);
            form.Controls.Add(titleLabel);

            ApplyListBoxStyle(listBox);
            listBox.SetBounds(15, 45, 320, 180);
            ${items
              .map((item) => `listBox.Items.Add("${item}");`)
              .join("\n          ")}
            listBox.SelectedIndex = 0;
            form.Controls.Add(listBox);

            ApplyButtonStyle(okButton);
            okButton.Text = "确定";
            okButton.DialogResult = DialogResult.OK;
            okButton.SetBounds(160, 235, 85, 30);
            form.Controls.Add(okButton);

            ApplySecondaryButtonStyle(cancelButton);
            cancelButton.Text = "取消";
            cancelButton.DialogResult = DialogResult.Cancel;
            cancelButton.SetBounds(250, 235, 85, 30);
            form.Controls.Add(cancelButton);

            form.AcceptButton = okButton;
            form.CancelButton = cancelButton;

            if (form.ShowDialog() == DialogResult.OK && listBox.SelectedItem != null) {
              Console.WriteLine(listBox.SelectedIndex.ToString() + "|||||" + listBox.SelectedItem.ToString());
            }
            form.Dispose();
          }
        }`;
    const result = await this.runCsharp(csharpScript);
    if (result.trim()) {
      const [id, text] = result.trim().split("|||||");
      return { id: parseInt(id), text };
    }
    return null;
  } else if (window.utools.isLinux()) {
    if (!(await checkZenity())) return null;
    try {
      const itemsList = items
        .map((item, index) => `"${index}" "${item}"`)
        .join(" ");
      const script = `zenity --list --title="${title}" --text="请选择：" --column="序号" --column="选项" ${itemsList} --width=400 --height=300`;
      const result = await execCommand(script);
      if (!result) return null;
      const text = result.trim();
      const id = items.findIndex((item) => item === text);
      return { id, text };
    } catch (error) {
      console.error("执行 zenity 命令失败:", error);
      return null;
    }
  }
};

// 系统级按钮组弹窗
const showSystemButtonBox = async function (buttons, content, title = "") {
  const iconPath = getQuickcommandIconPath();
  if (window.utools.isMacOs()) {
    let iconParam = "note";
    if (iconPath) {
      const posixPath = iconPath.replace(/\\/g, "/");
      iconParam = `alias POSIX file "${posixPath}"`;
    }
    const buttonList = buttons.map((btn) => `"${btn}"`).join(", ");
    const script = `display dialog "${content}" with title "${title}" buttons {${buttonList}} default button "${buttons[0]}" with icon ${iconParam}`;
    const result = await this.runAppleScript(script);
    const match = result.match(/button returned:(.+)/);
    if (match) {
      const text = match[1];
      const id = buttons.findIndex((btn) => btn === text);
      return { id, text };
    }
    return null;
  } else if (window.utools.isWindows()) {
    const escapedIconPath = iconPath ? iconPath.replace(/\\/g, "\\\\") : null;
    const csharpScript = `
        using System;
        using System.Windows.Forms;
        using System.Drawing;
        using System.IO;

        class Program {
          ${commonStyles}

          static void Main() {
            Form form = new Form();
            Label label = new Label();
            FlowLayoutPanel buttonPanel = new FlowLayoutPanel();

            ApplyModernStyle(form);
            form.Text = "${title}";
            form.ClientSize = new Size(400, 160);
            form.FormBorderStyle = FormBorderStyle.FixedDialog;
            form.StartPosition = FormStartPosition.CenterScreen;
            form.MaximizeBox = false;
            form.MinimizeBox = false;
            ${
              escapedIconPath
                ? `using (var bmp = new Bitmap("${escapedIconPath}"))
              {
                form.Icon = Icon.FromHandle(bmp.GetHicon());
              }`
                : ""
            }

            ApplyLabelStyle(label);
            label.Text = "${content}";
            label.SetBounds(15, 15, 370, 60);
            label.AutoSize = true;
            form.Controls.Add(label);

            buttonPanel.SetBounds(15, 90, 370, 40);
            buttonPanel.FlowDirection = FlowDirection.RightToLeft;
            buttonPanel.WrapContents = false;
            buttonPanel.BackColor = Color.White;
            form.Controls.Add(buttonPanel);

            ${buttons
              .map(
                (btn, index) => `
              Button button${index} = new Button();
              button${index}.Text = "${btn}";
              button${index}.DialogResult = DialogResult.OK;
              button${index}.Tag = "${index}";
              ${
                index === 0 ? "ApplyButtonStyle" : "ApplySecondaryButtonStyle"
              }(button${index});
              button${index}.Margin = new Padding(5, 0, 0, 0);
              buttonPanel.Controls.Add(button${index});`
              )
              .join("\n")}

            DialogResult result = form.ShowDialog();
            if (result == DialogResult.OK) {
              foreach (Button btn in buttonPanel.Controls) {
                if (btn.DialogResult == result) {
                  Console.WriteLine(btn.Tag.ToString() + "|||||" + btn.Text);
                  break;
                }
              }
            }
            form.Dispose();
          }
        }`;
    const result = await this.runCsharp(csharpScript);
    if (result.trim()) {
      const [id, text] = result.trim().split("|||||");
      return { id: parseInt(id), text };
    }
    return null;
  } else if (window.utools.isLinux()) {
    if (!(await checkZenity())) return null;
    try {
      const script1 = `zenity --info --title="${title}" --text="${content}" --width=400`;
      await execCommand(script1);

      const itemsList = buttons
        .map((btn, index) => `"${index}" "${btn}"`)
        .join(" ");
      const script2 = `zenity --list --title="${title}" --text="请选择：" --column="序号" --column="选项" ${itemsList} --width=400 --height=300`;
      const result = await execCommand(script2);
      if (!result) return null;
      const text = result.trim();
      const id = buttons.findIndex((btn) => btn === text);
      return { id, text };
    } catch (error) {
      console.error("执行 zenity 命令失败:", error);
      return null;
    }
  }
};

// 系统级文本区域弹窗
const showSystemTextArea = async function (
  placeholder = "",
  defaultText = "",
  title = ""
) {
  const iconPath = getQuickcommandIconPath();
  if (window.utools.isWindows()) {
    const escapedIconPath = iconPath ? iconPath.replace(/\\/g, "\\\\") : null;
    const csharpScript = `
        using System;
        using System.Windows.Forms;
        using System.Drawing;
        using System.IO;

        class Program {
          ${commonStyles}

          static void Main() {
            Form form = new Form();
            TextBox textBox = new TextBox();
            Button okButton = new Button();
            Button cancelButton = new Button();
            Label label = new Label();

            ApplyModernStyle(form);
            form.Text = "${title}";
            form.ClientSize = new Size(450, 320);
            form.FormBorderStyle = FormBorderStyle.FixedDialog;
            form.StartPosition = FormStartPosition.CenterScreen;
            form.MaximizeBox = false;
            form.MinimizeBox = false;
            ${
              escapedIconPath
                ? `using (var bmp = new Bitmap("${escapedIconPath}"))
              {
                form.Icon = Icon.FromHandle(bmp.GetHicon());
              }`
                : ""
            }

            ApplyLabelStyle(label);
            label.Text = "${placeholder}";
            label.SetBounds(15, 15, 420, 20);
            form.Controls.Add(label);

            ApplyTextBoxStyle(textBox);
            textBox.Multiline = true;
            textBox.ScrollBars = ScrollBars.Vertical;
            textBox.SetBounds(15, 45, 420, 220);
            textBox.Text = "${defaultText}";
            textBox.AcceptsReturn = true;
            form.Controls.Add(textBox);

            ApplyButtonStyle(okButton);
            okButton.Text = "确定";
            okButton.DialogResult = DialogResult.OK;
            okButton.SetBounds(260, 275, 85, 30);
            form.Controls.Add(okButton);

            ApplySecondaryButtonStyle(cancelButton);
            cancelButton.Text = "取消";
            cancelButton.DialogResult = DialogResult.Cancel;
            cancelButton.SetBounds(350, 275, 85, 30);
            form.Controls.Add(cancelButton);

            form.AcceptButton = null;
            form.CancelButton = cancelButton;

            form.KeyPreview = true;
            form.KeyDown += (sender, e) => {
              if (e.KeyCode == Keys.Enter && e.Control) {
                okButton.PerformClick();
                e.Handled = true;
              }
            };

            if (form.ShowDialog() == DialogResult.OK) {
              Console.WriteLine(textBox.Text);
            }
            form.Dispose();
          }
        }`;
    const result = await this.runCsharp(csharpScript);
    return result.trim() || null;
  } else if (window.utools.isLinux()) {
    if (!(await checkZenity())) return null;
    try {
      const script = `zenity --text-info --title="${title}" --text="${placeholder}" --editable --width=450 --height=350 --filename=<(echo "${defaultText}")`;
      const result = await execCommand(script);
      return result ? result.trim() : null;
    } catch (error) {
      console.error("执行 zenity 命令失败:", error);
      return null;
    }
  }
};

module.exports = {
  showSystemMessageBox,
  showSystemInputBox,
  showSystemConfirmBox,
  showSystemSelectList,
  showSystemButtonBox,
  showSystemTextArea,
};
