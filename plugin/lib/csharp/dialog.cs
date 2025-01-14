using System;
using System.Windows.Forms;
using System.Drawing;
using System.Linq;
using System.Runtime.InteropServices;
using System.IO;
using System.Drawing.Drawing2D;

public class DialogGenerator
{
    [DllImport("user32.dll")]
    private static extern bool SetProcessDPIAware();

    [DllImport("gdi32.dll")]
    private static extern int GetDeviceCaps(IntPtr hdc, int nIndex);

    private const int LOGPIXELSX = 88;
    private const int LOGPIXELSY = 90;

    // 基础尺寸常量 (96 DPI下的尺寸，当前尺寸/2)
    private const int BASE_WIDTH = 450;        // 900/2 = 450
    private const int BASE_HEIGHT = 175;       // 350/2 = 175
    private const int BASE_PADDING = 15;       // 30/2 = 15
    private const int BASE_BUTTON_HEIGHT = 25; // 50/2 = 25
    private const int BASE_BUTTON_WIDTH = 70;  // 140/2 = 70
    private const int BASE_INPUT_HEIGHT = 20;  // 40/2 = 20
    private const int BASE_SPACING = 10;       // 20/2 = 10

    // 实际使用的缩放尺寸
    private static int DEFAULT_WIDTH;
    private static int DEFAULT_HEIGHT;
    private static int PADDING;
    private static int BUTTON_HEIGHT;
    private static int BUTTON_WIDTH;
    private static int INPUT_HEIGHT;
    private static int SPACING;

    // 添加获取DPI缩放比例的方法
    private static float GetScaleFactor()
    {
        using (Graphics g = Graphics.FromHwnd(IntPtr.Zero))
        {
            IntPtr desktop = g.GetHdc();
            int dpiX = GetDeviceCaps(desktop, LOGPIXELSX);
            g.ReleaseHdc(desktop);
            return dpiX / 96f;
        }
    }

    // 初始化缩放尺寸的方法
    private static void InitializeScaledSizes()
    {
        float scaleFactor = GetScaleFactor();

        DEFAULT_WIDTH = (int)(BASE_WIDTH * scaleFactor);
        DEFAULT_HEIGHT = (int)(BASE_HEIGHT * scaleFactor);
        PADDING = (int)(BASE_PADDING * scaleFactor);
        BUTTON_HEIGHT = (int)(BASE_BUTTON_HEIGHT * scaleFactor);
        BUTTON_WIDTH = (int)(BASE_BUTTON_WIDTH * scaleFactor);
        INPUT_HEIGHT = (int)(BASE_INPUT_HEIGHT * scaleFactor);
        SPACING = (int)(BASE_SPACING * scaleFactor);
    }

    private static void InitializeDPIAwareness()
    {
        if (Environment.OSVersion.Version.Major >= 6)
        {
            SetProcessDPIAware();
        }
    }

    public static DialogResult Show(string[] args)
    {
        InitializeScaledSizes(); // 初始化缩放尺寸

        string type = GetArgumentValue(args, "-type");
        string title = GetArgumentValue(args, "-title");
        string content = GetArgumentValue(args, "-content");
        string iconPath = GetArgumentValue(args, "-iconpath");

        if (string.IsNullOrEmpty(type) || string.IsNullOrEmpty(title))
        {
            ShowHelp();
            return DialogResult.None;
        }

        Form dialog = CreateBaseDialog(title);

        // 设置图标
        if (!string.IsNullOrEmpty(iconPath) && File.Exists(iconPath))
        {
            try
            {
                using (Bitmap bmp = new Bitmap(iconPath))
                {
                    dialog.Icon = Icon.FromHandle(bmp.GetHicon());
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("加载图标失败: " + ex.Message);
            }
        }

        switch (type.ToLower())
        {
            case "message":
                CreateMessageDialog(dialog, content);
                break;
            case "input":
                CreateInputDialog(dialog, content);
                break;
            case "confirm":
                CreateConfirmDialog(dialog, content);
                break;
            case "buttons":
                CreateButtonsDialog(dialog, content);
                break;
            case "textarea":
                CreateTextAreaDialog(dialog, content);
                break;
            default:
                MessageBox.Show("不支持的对话框类型");
                return DialogResult.None;
        }

        return dialog.ShowDialog();
    }

    private static Form CreateBaseDialog(string title)
    {
        Form dialog = new Form();
        dialog.Text = title;
        dialog.Width = DEFAULT_WIDTH;
        dialog.Height = DEFAULT_HEIGHT;
        dialog.StartPosition = FormStartPosition.CenterScreen;
        dialog.AutoScaleMode = AutoScaleMode.None; // 禁用自动缩放

        // 禁止调整窗口大小
        dialog.FormBorderStyle = FormBorderStyle.FixedDialog;
        dialog.MaximizeBox = false;
        dialog.MinimizeBox = false;

        float scaleFactor = GetScaleFactor();
        dialog.Font = new Font("Microsoft YaHei UI", 9F * scaleFactor, FontStyle.Regular, GraphicsUnit.Pixel);

        dialog.Paint += delegate(object sender, PaintEventArgs e) {
            e.Graphics.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;
        };

        return dialog;
    }

    private static void CreateMessageDialog(Form dialog, string content)
    {
        const int MAX_CONTENT_HEIGHT = 500;
        const int MIN_CONTENT_HEIGHT = 200;
        int iconSize = 96;

        // 先计算所需的内容高度
        int requiredHeight = Math.Max(
            TextRenderer.MeasureText(content,
                new Font("Microsoft YaHei UI", 10F, FontStyle.Regular),
                new Size(dialog.ClientSize.Width - PADDING * 3 - iconSize, int.MaxValue),
                TextFormatFlags.WordBreak | TextFormatFlags.TextBoxControl
            ).Height + 20,
            MIN_CONTENT_HEIGHT
        );

        int contentHeight = Math.Min(requiredHeight, MAX_CONTENT_HEIGHT);
        dialog.Height = contentHeight + PADDING * 3 + BUTTON_HEIGHT;

        // 创建内容面板
        Panel contentPanel = new Panel
        {
            AutoScroll = false,
            Width = dialog.ClientSize.Width - PADDING * 2,
            Height = dialog.ClientSize.Height - PADDING * 3 - BUTTON_HEIGHT,
            Location = new Point(PADDING, PADDING),
            BackColor = SystemColors.Control
        };

        dialog.Controls.Add(contentPanel);

        // 添加图标
        PictureBox iconBox = new PictureBox
        {
            Width = iconSize,
            Height = iconSize,
            Location = new Point(0, 0),
            SizeMode = PictureBoxSizeMode.Zoom,
            BackColor = Color.Transparent
        };

        try
        {
            Icon sysIcon = SystemIcons.Information;
            Bitmap bmp = new Bitmap(iconSize, iconSize);
            using (Graphics g = Graphics.FromImage(bmp))
            {
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.SmoothingMode = SmoothingMode.AntiAlias;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                g.DrawIcon(sysIcon, new Rectangle(0, 0, iconSize, iconSize));
            }
            iconBox.Image = bmp;
        }
        catch
        {
            iconBox.Visible = false;
        }
        contentPanel.Controls.Add(iconBox);

        // 使用普通TextBox替代RichTextBox
        TextBox messageBox = new TextBox
        {
            Text = content,
            ReadOnly = true,
            Multiline = true,
            BorderStyle = BorderStyle.None,
            BackColor = SystemColors.Control,
            Location = new Point(iconSize + PADDING, 0),
            Width = contentPanel.ClientSize.Width - iconSize - PADDING,
            Height = contentPanel.Height,
            Font = new Font("Microsoft YaHei UI", 10F, FontStyle.Regular),
            WordWrap = true,
            TabStop = false,
            Cursor = Cursors.IBeam,
            ScrollBars = requiredHeight > MAX_CONTENT_HEIGHT ? ScrollBars.Vertical : ScrollBars.None
        };

        // 隐藏光标但允许选择
        messageBox.GotFocus += delegate(object sender, EventArgs e) {
            if (messageBox.SelectionLength == 0)
            {
                NativeMethods.HideCaret(messageBox.Handle);
            }
        };

        contentPanel.Controls.Add(messageBox);

        // 添加确定按钮
        Button okButton = CreateStyledButton("确定", DialogResult.OK);
        okButton.Location = new Point(
            dialog.ClientSize.Width - BUTTON_WIDTH - PADDING,
            dialog.ClientSize.Height - PADDING - BUTTON_HEIGHT
        );
        dialog.Controls.Add(okButton);

        // 确保按钮始终在最上层
        okButton.BringToFront();
    }

    private static void CreateInputDialog(Form dialog, string content)
    {
        const int MAX_CONTENT_HEIGHT = 500;
        const int MIN_CONTENT_HEIGHT = 200;

        string[] prompts = content.Split(new[] { "|||||" }, StringSplitOptions.None);
        var textBoxes = new System.Collections.Generic.List<TextBox>();

        // 创建一个临时窗体和面板来准确计算高度
        using (Form tempForm = new Form())
        {
            tempForm.Width = dialog.Width;
            Panel tempPanel = new Panel
            {
                Width = dialog.ClientSize.Width - PADDING * 2,
                AutoSize = true
            };
            tempForm.Controls.Add(tempPanel);

            // 添加临时控件来计算实际高度
            int currentY = (int)(PADDING * 1.5);  // 起始位置
            foreach (string prompt in prompts)
            {
                Label label = new Label
                {
                    Text = prompt,
                    AutoSize = true,
                    Location = new Point(PADDING, currentY),
                    Font = new Font("Microsoft YaHei UI", 10F, FontStyle.Regular)
                };
                tempPanel.Controls.Add(label);

                TextBox textBox = new TextBox
                {
                    Width = tempPanel.Width - PADDING * 2,
                    Height = INPUT_HEIGHT,
                    Location = new Point(PADDING, currentY + label.Height + 5),
                    BorderStyle = BorderStyle.FixedSingle
                };
                tempPanel.Controls.Add(textBox);

                currentY += label.Height + INPUT_HEIGHT + SPACING;
            }

            // 获取实际需要的高度
            int totalContentHeight = currentY + PADDING;  // 添加底部边距
            int requiredHeight = Math.Max(totalContentHeight, MIN_CONTENT_HEIGHT);
            int contentHeight = Math.Min(requiredHeight, MAX_CONTENT_HEIGHT);

            // 设置对话框高度，保持原有的总体布局
            dialog.Height = contentHeight + PADDING * 3 + BUTTON_HEIGHT;

            // 创建实际的内容面板
            Panel contentPanel = new Panel
            {
                AutoScroll = false,
                Width = dialog.ClientSize.Width - PADDING * 2,
                Height = dialog.ClientSize.Height - PADDING * 3 - BUTTON_HEIGHT,
                Location = new Point(PADDING, PADDING),
                BackColor = SystemColors.Control
            };

            // 只有当实际内容超过最大高度时才启用滚动
            if (requiredHeight > MAX_CONTENT_HEIGHT)
            {
                contentPanel.AutoScroll = true;
                contentPanel.AutoScrollMinSize = new Size(0, requiredHeight);
            }

            dialog.Controls.Add(contentPanel);

            // 添加实际的输入控件
            currentY = (int)(PADDING * 0.5);
            bool needScroll = requiredHeight > MAX_CONTENT_HEIGHT;
            int scrollWidth = needScroll ? SystemInformation.VerticalScrollBarWidth + 10 : 0;

            foreach (string prompt in prompts)
            {
                Label label = new Label
                {
                    Text = prompt,
                    AutoSize = true,
                    Location = new Point(0, currentY),
                    Font = new Font("Microsoft YaHei UI", 10F, FontStyle.Regular)
                };
                contentPanel.Controls.Add(label);

                TextBox textBox = new TextBox
                {
                    Width = contentPanel.ClientSize.Width - scrollWidth,
                    Height = INPUT_HEIGHT,
                    Location = new Point(0, currentY + label.Height + 5),
                    BorderStyle = BorderStyle.FixedSingle,
                    Font = new Font("Microsoft YaHei UI", 10F, FontStyle.Regular)
                };
                contentPanel.Controls.Add(textBox);
                textBoxes.Add(textBox);

                currentY += label.Height + INPUT_HEIGHT + SPACING;
            }
        }

        // 添加确定按钮
        Button okButton = CreateStyledButton("确定", DialogResult.OK);
        okButton.Location = new Point(
            dialog.ClientSize.Width - BUTTON_WIDTH - PADDING,
            dialog.ClientSize.Height - PADDING - BUTTON_HEIGHT
        );

        // 处理确定按钮点击事件
        okButton.Click += (sender, e) => {
            bool hasInput = false;
            foreach (var textBox in textBoxes)
            {
                if (!string.IsNullOrEmpty(textBox.Text))
                {
                    hasInput = true;
                    break;
                }
            }

            if (hasInput)
            {
                Console.Write("[");
                for (int i = 0; i < textBoxes.Count; i++)
                {
                    string value = textBoxes[i].Text ?? "";
                    Console.Write("\"" + value.Replace("\"", "\\\"") + "\"");
                    if (i < textBoxes.Count - 1)
                    {
                        Console.Write(",");
                    }
                }
                Console.Write("]");
            }
            else
            {
                Console.Write("[]");
            }
        };

        dialog.Controls.Add(okButton);
        okButton.BringToFront();
    }

    private static void CreateConfirmDialog(Form dialog, string content)
    {
        const int MAX_CONTENT_HEIGHT = 500;
        const int MIN_CONTENT_HEIGHT = 200;
        int iconSize = 96;

        // 先计算所需的内容高度
        int requiredHeight = Math.Max(
            TextRenderer.MeasureText(content,
                new Font("Microsoft YaHei UI", 10F, FontStyle.Regular),
                new Size(dialog.ClientSize.Width - PADDING * 3 - iconSize, int.MaxValue),
                TextFormatFlags.WordBreak | TextFormatFlags.TextBoxControl
            ).Height + 20,
            MIN_CONTENT_HEIGHT
        );

        int contentHeight = Math.Min(requiredHeight, MAX_CONTENT_HEIGHT);
        dialog.Height = contentHeight + PADDING * 3 + BUTTON_HEIGHT;

        // 创建内容面板
        Panel contentPanel = new Panel
        {
            AutoScroll = false,
            Width = dialog.ClientSize.Width - PADDING * 2,
            Height = dialog.ClientSize.Height - PADDING * 3 - BUTTON_HEIGHT,
            Location = new Point(PADDING, PADDING),
            BackColor = SystemColors.Control
        };

        dialog.Controls.Add(contentPanel);

        // 添加图标
        PictureBox iconBox = new PictureBox
        {
            Width = iconSize,
            Height = iconSize,
            Location = new Point(0, 0),
            SizeMode = PictureBoxSizeMode.Zoom,
            BackColor = Color.Transparent
        };

        try
        {
            Icon sysIcon = SystemIcons.Warning;  // 改为警告图标
            Bitmap bmp = new Bitmap(iconSize, iconSize);
            using (Graphics g = Graphics.FromImage(bmp))
            {
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.SmoothingMode = SmoothingMode.AntiAlias;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                g.DrawIcon(sysIcon, new Rectangle(0, 0, iconSize, iconSize));
            }
            iconBox.Image = bmp;
        }
        catch
        {
            iconBox.Visible = false;
        }
        contentPanel.Controls.Add(iconBox);

        // 使用TextBox显示内容
        TextBox messageBox = new TextBox
        {
            Text = content,
            ReadOnly = true,
            Multiline = true,
            BorderStyle = BorderStyle.None,
            BackColor = SystemColors.Control,
            Location = new Point(iconSize + PADDING, 0),
            Width = contentPanel.ClientSize.Width - iconSize - PADDING,
            Height = contentPanel.Height,
            Font = new Font("Microsoft YaHei UI", 10F, FontStyle.Regular),
            WordWrap = true,
            TabStop = false,
            Cursor = Cursors.IBeam,
            ScrollBars = requiredHeight > MAX_CONTENT_HEIGHT ? ScrollBars.Vertical : ScrollBars.None
        };

        // 隐藏光标但允许选择
        messageBox.GotFocus += delegate(object sender, EventArgs e) {
            if (messageBox.SelectionLength == 0)
            {
                NativeMethods.HideCaret(messageBox.Handle);
            }
        };

        contentPanel.Controls.Add(messageBox);

        // 添加确定和取消按钮
        Button okButton = CreateStyledButton("确定", DialogResult.OK);
        Button cancelButton = CreateStyledButton("取消", DialogResult.Cancel);

        // 修改取消按钮样式为灰色
        cancelButton.BackColor = Color.FromArgb(153, 153, 153);
        cancelButton.MouseEnter += delegate(object sender, EventArgs e) {
            cancelButton.BackColor = Color.FromArgb(133, 133, 133);
        };
        cancelButton.MouseLeave += delegate(object sender, EventArgs e) {
            cancelButton.BackColor = Color.FromArgb(153, 153, 153);
        };

        // 调整按钮位置，靠右对齐，确认在最右边
        okButton.Location = new Point(
            dialog.ClientSize.Width - BUTTON_WIDTH - PADDING,
            dialog.ClientSize.Height - PADDING - BUTTON_HEIGHT
        );
        cancelButton.Location = new Point(
            dialog.ClientSize.Width - BUTTON_WIDTH * 2 - PADDING * 2,
            dialog.ClientSize.Height - PADDING - BUTTON_HEIGHT
        );

        // 处理按钮点击事件
        okButton.Click += (sender, e) => {
            Console.Write("true");
        };

        cancelButton.Click += (sender, e) => {
            Console.Write("false");
        };

        // 处理窗口关闭事件
        dialog.FormClosing += delegate(object sender, FormClosingEventArgs e) {
            if (dialog.DialogResult == DialogResult.None)
            {
                Console.Write("{}");
            }
        };

        dialog.Controls.Add(okButton);
        dialog.Controls.Add(cancelButton);

        // 确保按钮始终在最上层
        okButton.BringToFront();
        cancelButton.BringToFront();
    }

    private static void CreateButtonsDialog(Form dialog, string content)
    {
        const int MAX_CONTENT_HEIGHT = 500;
        const int MIN_CONTENT_HEIGHT = 200;

        string[] buttonTexts = content.Split(new[] { "|||||" }, StringSplitOptions.None);

        // 计算所需的内容高度
        int totalHeight = buttonTexts.Length * (BUTTON_HEIGHT + SPACING) - SPACING;  // 减去最后一个按钮后的间距
        int requiredHeight = Math.Max(totalHeight + PADDING * 2, MIN_CONTENT_HEIGHT);  // 添加上下内边距
        int contentHeight = Math.Min(requiredHeight, MAX_CONTENT_HEIGHT);

        // 设置对话框高度，根据按钮数量添加底部空间
        int bottomPadding = buttonTexts.Length > 1 ? Math.Min(buttonTexts.Length * 10, 50) : 0;  // 根据按钮数量增加底部空间，但不超过PADDING
        dialog.ClientSize = new Size(dialog.ClientSize.Width, contentHeight + bottomPadding);

        // 创建内容面板
        Panel contentPanel = new Panel
        {
            AutoScroll = false,
            Width = dialog.ClientSize.Width - PADDING * 2,
            Height = dialog.ClientSize.Height - PADDING * 2,
            Location = new Point(PADDING, PADDING),
            BackColor = SystemColors.Control
        };

        // 只有当实际内容超过最大高度时才启用滚动
        if (requiredHeight > MAX_CONTENT_HEIGHT)
        {
            contentPanel.AutoScroll = true;
            contentPanel.AutoScrollMinSize = new Size(0, totalHeight);
        }

        dialog.Controls.Add(contentPanel);

        // 添加按钮
        int currentY = PADDING;  // 从内边距开始
        bool needScroll = requiredHeight > MAX_CONTENT_HEIGHT;
        int scrollWidth = needScroll ? SystemInformation.VerticalScrollBarWidth + 10 : 0;

        for (int i = 0; i < buttonTexts.Length; i++)
        {
            Button button = new Button
            {
                Text = buttonTexts[i],
                Width = contentPanel.ClientSize.Width - scrollWidth,
                Height = BUTTON_HEIGHT,
                Location = new Point(0, currentY),
                Tag = i,
                FlatStyle = FlatStyle.Flat,
                BackColor = Color.FromArgb(0, 122, 204),  // 使用蓝色背景
                ForeColor = Color.White,  // 白色文字
                Font = new Font("Microsoft YaHei UI", 10F, FontStyle.Regular),
                Cursor = Cursors.Hand,
                TextAlign = ContentAlignment.MiddleCenter  // 文字居中
            };

            // 设置边框
            button.FlatAppearance.BorderSize = 0;

            // 添加圆角效果
            GraphicsPath path = new GraphicsPath();
            int radius = 8; // 圆角半径
            Rectangle rect = new Rectangle(0, 0, button.Width, button.Height);
            path.AddArc(rect.X, rect.Y, radius * 2, radius * 2, 180, 90);
            path.AddArc(rect.X + rect.Width - radius * 2, rect.Y, radius * 2, radius * 2, 270, 90);
            path.AddArc(rect.X + rect.Width - radius * 2, rect.Y + rect.Height - radius * 2, radius * 2, radius * 2, 0, 90);
            path.AddArc(rect.X, rect.Y + rect.Height - radius * 2, radius * 2, radius * 2, 90, 90);
            path.CloseFigure();
            button.Region = new Region(path);

            // 修改鼠标悬停效果的颜色
            button.MouseEnter += delegate(object sender, EventArgs e) {
                button.BackColor = Color.FromArgb(0, 102, 184);  // 深一点的蓝色
            };
            button.MouseLeave += delegate(object sender, EventArgs e) {
                button.BackColor = Color.FromArgb(0, 122, 204);  // 恢复原来的蓝色
            };

            // 修改文本绘制部分
            button.Paint += delegate(object sender, PaintEventArgs e) {
                e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
                using (GraphicsPath buttonPath = new GraphicsPath())
                {
                    Rectangle newRect = new Rectangle(0, 0, button.Width, button.Height);
                    buttonPath.AddArc(newRect.X, newRect.Y, radius * 2, radius * 2, 180, 90);
                    buttonPath.AddArc(newRect.X + newRect.Width - radius * 2, newRect.Y, radius * 2, radius * 2, 270, 90);
                    buttonPath.AddArc(newRect.X + newRect.Width - radius * 2, newRect.Y + newRect.Height - radius * 2, radius * 2, radius * 2, 0, 90);
                    buttonPath.AddArc(newRect.X, newRect.Y + newRect.Height - radius * 2, radius * 2, radius * 2, 90, 90);
                    buttonPath.CloseFigure();

                    e.Graphics.FillPath(new SolidBrush(button.BackColor), buttonPath);

                    // 绘制文本（居中对齐）
                    StringFormat sf = new StringFormat();
                    sf.Alignment = StringAlignment.Center;  // 水平居中
                    sf.LineAlignment = StringAlignment.Center;  // 垂直居中
                    e.Graphics.DrawString(button.Text, button.Font, new SolidBrush(button.ForeColor), newRect, sf);
                }
            };

            // 添加按钮点击事件
            button.Click += delegate(object sender, EventArgs e) {
                Button clickedButton = (Button)sender;
                int id = (int)clickedButton.Tag;
                string text = clickedButton.Text;
                Console.Write("{\"id\":" + id + ",\"text\":\"" + text.Replace("\"", "\\\"") + "\"}");
                dialog.DialogResult = DialogResult.OK;
            };

            contentPanel.Controls.Add(button);
            currentY += BUTTON_HEIGHT + SPACING;
        }

        // 处理窗口关闭事件
        dialog.FormClosing += delegate(object sender, FormClosingEventArgs e) {
            if (dialog.DialogResult == DialogResult.None)
            {
                Console.Write("{}");
            }
        };
    }

    private static void CreateTextAreaDialog(Form dialog, string content)
    {
        dialog.Height = 600;  // 改为600

        TextBox textArea = new TextBox
        {
            Multiline = true,
            ScrollBars = ScrollBars.Vertical,
            Width = dialog.ClientSize.Width - PADDING * 2,
            Height = dialog.ClientSize.Height - PADDING * 3 - BUTTON_HEIGHT,
            Location = new Point(PADDING, PADDING),
            ForeColor = SystemColors.WindowText,
            Text = content,  // 使用传入的content作为默认文本
            Font = new Font("Microsoft YaHei UI", 10F, FontStyle.Regular),
            BorderStyle = BorderStyle.FixedSingle
        };

        dialog.Controls.Add(textArea);

        // 添加确定按钮
        Button okButton = CreateStyledButton("确定", DialogResult.OK);
        okButton.Location = new Point(
            dialog.ClientSize.Width - BUTTON_WIDTH - PADDING,
            dialog.ClientSize.Height - PADDING - BUTTON_HEIGHT
        );

        // 处理确定按钮点击事件
        okButton.Click += delegate(object sender, EventArgs e) {
            Console.Write(textArea.Text ?? "");  // 直接输出文本，不加引号
        };

        dialog.Controls.Add(okButton);
        okButton.BringToFront();
    }

    private static string GetArgumentValue(string[] args, string key)
    {
        int index = Array.IndexOf(args, key);
        if (index >= 0 && index < args.Length - 1)
        {
            return args[index + 1];
        }
        return string.Empty;
    }

    private static void StyleButton(Button button)
    {
        button.FlatStyle = FlatStyle.Flat;
        button.FlatAppearance.BorderSize = 0;
        button.BackColor = Color.FromArgb(0, 122, 204);
        button.ForeColor = Color.White;
        button.Font = new Font("Microsoft YaHei UI", 9F, FontStyle.Regular);
        button.Cursor = Cursors.Hand;
        button.Width = BUTTON_WIDTH;
        button.Height = BUTTON_HEIGHT;

        // 圆角绘制
        GraphicsPath path = new GraphicsPath();
        int radius = 8; // 圆角半径
        Rectangle rect = new Rectangle(0, 0, button.Width, button.Height);
        path.AddArc(rect.X, rect.Y, radius * 2, radius * 2, 180, 90);
        path.AddArc(rect.X + rect.Width - radius * 2, rect.Y, radius * 2, radius * 2, 270, 90);
        path.AddArc(rect.X + rect.Width - radius * 2, rect.Y + rect.Height - radius * 2, radius * 2, radius * 2, 0, 90);
        path.AddArc(rect.X, rect.Y + rect.Height - radius * 2, radius * 2, radius * 2, 90, 90);
        path.CloseFigure();
        button.Region = new Region(path);

        // 添加鼠标悬停效果
        button.MouseEnter += delegate(object sender, EventArgs e) {
            button.BackColor = Color.FromArgb(0, 102, 184);
        };
        button.MouseLeave += delegate(object sender, EventArgs e) {
            button.BackColor = Color.FromArgb(0, 122, 204);
        };

        // 自定义绘制
        button.Paint += delegate(object sender, PaintEventArgs e) {
            e.Graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
            using (GraphicsPath buttonPath = new GraphicsPath())
            {
                Rectangle newRect = new Rectangle(0, 0, button.Width, button.Height);
                buttonPath.AddArc(newRect.X, newRect.Y, radius * 2, radius * 2, 180, 90);
                buttonPath.AddArc(newRect.X + newRect.Width - radius * 2, newRect.Y, radius * 2, radius * 2, 270, 90);
                buttonPath.AddArc(newRect.X + newRect.Width - radius * 2, newRect.Y + newRect.Height - radius * 2, radius * 2, radius * 2, 0, 90);
                buttonPath.AddArc(newRect.X, newRect.Y + newRect.Height - radius * 2, radius * 2, radius * 2, 90, 90);
                buttonPath.CloseFigure();

                e.Graphics.FillPath(new SolidBrush(button.BackColor), buttonPath);

                // 绘制文本
                StringFormat sf = new StringFormat();
                sf.Alignment = StringAlignment.Center;
                sf.LineAlignment = StringAlignment.Center;
                e.Graphics.DrawString(button.Text, button.Font, new SolidBrush(button.ForeColor), newRect, sf);
            }
        };
    }

    private static Button CreateStyledButton(string text, DialogResult dialogResult)
    {
        Button button = new Button();
        button.Text = text;
        button.DialogResult = dialogResult;
        StyleButton(button);
        return button;
    }

    public static void Main(string[] args)
    {
        if (Environment.OSVersion.Version.Major >= 6)
        {
            SetProcessDPIAware();
        }
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Show(args);
    }

    private class NativeMethods
    {
        [DllImport("user32.dll")]
        public static extern bool HideCaret(IntPtr hWnd);

        [DllImport("user32.dll")]
        public static extern IntPtr SendMessage(IntPtr hWnd, int msg, int wParam, ref RECT lParam);

        [StructLayout(LayoutKind.Sequential)]
        public struct RECT
        {
            public int Left;
            public int Top;
            public int Right;
            public int Bottom;
        }
    }

    private static void ShowHelp()
    {
        string help = @"
Windows 对话框生成工具使用说明
==========================

基本语法:
dialog.exe -type <对话框类型> [参数...]

对话框类型:
----------
1. message  - 消息对话框，显示一条消息
2. input    - 输入对话框，支持多个输入框
3. confirm  - 确认对话框，带确定和取消按钮
4. buttons  - 按钮对话框，支持多个自定义按钮
5. textarea - 文本区域对话框，用于编辑大段文本

通用参数:
--------
-type      对话框类型（必需）
          可选值：message, input, confirm, buttons, textarea

-title     对话框标题（必需）
          示例：-title ""提示""

-content   对话框内容
          - message/confirm/textarea：显示的文本内容
          - input：输入框提示文本，多个输入框用|||||分隔
          - buttons：按钮文本，多个按钮用|||||分隔

-iconpath  对话框图标路径（可选）
          示例：-iconpath ""D:\icons\app.ico""

使用示例:
--------
1. 显示消息对话框：
   dialog.exe -type message -title ""提示"" -content ""操作已完成""

2. 显示输入对话框（单个输入）：
   dialog.exe -type input -title ""输入"" -content ""请输入用户名：""

3. 显示输入对话框（多个输入）：
   dialog.exe -type input -title ""用户信息"" -content ""用户名：|||||密码：|||||邮箱：""

4. 显示确认对话框：
   dialog.exe -type confirm -title ""确认"" -content ""确定要删除这个文件吗？""

5. 显示按钮对话框：
   dialog.exe -type buttons -title ""选择操作"" -content ""保存|||||不保存|||||取消""

6. 显示文本区域对话框：
   dialog.exe -type textarea -title ""编辑文本"" -content ""在这里输入内容...""

返回值:
------
1. message对话框：
   无返回值

2. input对话框：
   返回JSON数组，包含所有输入框的值
   示例：[""user"",""123456"",""user@email.com""]
   用户取消：[]

3. confirm对话框：
   确定：true
   取消：false
   关闭窗口：{}

4. buttons对话框：
   返回JSON对象，包含按钮id和文本
   示例：{""id"":0,""text"":""保存""}
   关闭窗口：{}

5. textarea对话框：
   返回编辑后的文本内容
   取消：空字符串

注意事项:
--------
1. 包含空格的参数值需要用引号括起来
2. 多个输入框或按钮的文本用|||||（5个竖线）分隔
3. 所有对话框都支持自定义图标（使用-iconpath参数）
4. 对话框会自动适应DPI缩放
5. 所有对话框都支持文本选择和复制

更多信息:
--------
遇到问题请查看错误信息，错误信息会提供详细的原因说明。
";
        Console.WriteLine(help);
    }
}
