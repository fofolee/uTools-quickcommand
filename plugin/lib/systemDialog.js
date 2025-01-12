const fs = require("fs");
const path = require("path");
const { getQuickcommandFolderFile } = require("./getQuickcommandFile");

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
            static void Main() {
              Form form = new Form();
              ${
                escapedIconPath
                  ? `using (var bmp = new Bitmap("${escapedIconPath}"))
                {
                  form.Icon = Icon.FromHandle(bmp.GetHicon());
                }`
                  : ""
              }
              MessageBox.Show(form, "${content}", "${title}",
                MessageBoxButtons.OK,
                MessageBoxIcon.Information);
              form.Dispose();
            }
          }`;
    await this.runCsharp(csharpScript);
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
          static void Main() {
            Form form = new Form();
            form.Text = "${title}";
            form.ClientSize = new Size(300, ${50 + placeholders.length * 70});
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
            label${index}.Text = "${placeholder}";
            label${index}.SetBounds(10, ${10 + index * 70}, 280, 20);
            form.Controls.Add(label${index});

            TextBox textBox${index} = new TextBox();
            textBox${index}.SetBounds(10, ${35 + index * 70}, 280, 20);
            form.Controls.Add(textBox${index});`
              )
              .join("\n")}

            Button okButton = new Button();
            okButton.Text = "确定";
            okButton.DialogResult = DialogResult.OK;
            okButton.SetBounds(120, ${20 + placeholders.length * 70}, 75, 23);
            form.Controls.Add(okButton);

            Button cancelButton = new Button();
            cancelButton.Text = "取消";
            cancelButton.DialogResult = DialogResult.Cancel;
            cancelButton.SetBounds(210, ${
              20 + placeholders.length * 70
            }, 75, 23);
            form.Controls.Add(cancelButton);

            form.AcceptButton = okButton;
            form.CancelButton = cancelButton;

            if (form.ShowDialog() == DialogResult.OK) {
              ${placeholders
                .map((_, index) => `Console.WriteLine(textBox${index}.Text);`)
                .join("\n              ")}
            }
            form.Dispose();
          }
        }`;
    const result = await this.runCsharp(csharpScript);
    const lines = result.trim().split("\n");
    return lines.length > 0 && lines[0] !== "" ? lines : null;
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
          static void Main() {
            Form form = new Form();
            ${
              escapedIconPath
                ? `using (var bmp = new Bitmap("${escapedIconPath}"))
              {
                form.Icon = Icon.FromHandle(bmp.GetHicon());
              }`
                : ""
            }
            DialogResult result = MessageBox.Show(form, "${content}", "${title}",
              MessageBoxButtons.OKCancel,
              MessageBoxIcon.Question);
            Console.WriteLine(result == DialogResult.OK);
            form.Dispose();
          }
        }`;
    const result = await this.runCsharp(csharpScript);
    return result.trim() === "True";
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
          static void Main() {
            Form form = new Form();
            ListBox listBox = new ListBox();
            Button okButton = new Button();
            Button cancelButton = new Button();

            form.Text = "${title}";
            form.ClientSize = new Size(300, 250);
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

            listBox.SetBounds(10, 10, 280, 180);
            ${items
              .map((item) => `listBox.Items.Add("${item}");`)
              .join("\n          ")}
            listBox.SelectedIndex = 0;
            form.Controls.Add(listBox);

            okButton.Text = "确定";
            okButton.DialogResult = DialogResult.OK;
            okButton.SetBounds(120, 200, 75, 23);
            form.Controls.Add(okButton);

            cancelButton.Text = "取消";
            cancelButton.DialogResult = DialogResult.Cancel;
            cancelButton.SetBounds(210, 200, 75, 23);
            form.Controls.Add(cancelButton);

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
          static void Main() {
            Form form = new Form();
            Label label = new Label();
            FlowLayoutPanel buttonPanel = new FlowLayoutPanel();

            form.Text = "${title}";
            form.ClientSize = new Size(400, 150);
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

            label.Text = "${content}";
            label.SetBounds(10, 10, 380, 40);
            label.AutoSize = true;
            form.Controls.Add(label);

            buttonPanel.SetBounds(10, 60, 380, 40);
            buttonPanel.FlowDirection = FlowDirection.RightToLeft;
            buttonPanel.WrapContents = false;
            form.Controls.Add(buttonPanel);

            ${buttons
              .map(
                (btn, index) => `
              Button button${index} = new Button();
              button${index}.Text = "${btn}";
              button${index}.DialogResult = DialogResult.OK;
              button${index}.Tag = "${index}";
              button${index}.SetBounds(0, 0, 80, 30);
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
          static void Main() {
            Form form = new Form();
            TextBox textBox = new TextBox();
            Button okButton = new Button();
            Button cancelButton = new Button();
            Label label = new Label();

            form.Text = "${title}";
            form.ClientSize = new Size(400, 300);
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

            label.Text = "${placeholder}";
            label.SetBounds(10, 10, 380, 20);
            form.Controls.Add(label);

            textBox.Multiline = true;
            textBox.ScrollBars = ScrollBars.Vertical;
            textBox.SetBounds(10, 40, 380, 180);
            textBox.Text = "${defaultText}";
            textBox.AcceptsReturn = true;
            form.Controls.Add(textBox);

            okButton.Text = "确定";
            okButton.DialogResult = DialogResult.OK;
            okButton.SetBounds(220, 230, 75, 23);
            form.Controls.Add(okButton);

            cancelButton.Text = "取消";
            cancelButton.DialogResult = DialogResult.Cancel;
            cancelButton.SetBounds(310, 230, 75, 23);
            form.Controls.Add(cancelButton);

            // 移除默认的 Enter 键行为
            form.AcceptButton = null;
            form.CancelButton = cancelButton;

            // 添加快捷键处理
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
