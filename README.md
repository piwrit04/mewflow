<div align="center">

# 🐱 喵序 MewFlow

**让每一单，都井井有喵。**

面向个人与独立创作者的轻量可爱订单管理小管家 —— 代练（游戏代打）订单管理工具。

</div>

## ✨ 功能特性

- 📋 **订单管理**：普通单 / 托管单分表管理，支持筛选、搜索、分页
- ⚡ **一键推进**：待处理 → 进行中 → 已完成，状态流转一目了然
- 🧮 **智能结算**：闲鱼单自动扣 1.6% 提现费、外包转单自动按 80% 拆算打手支出、微信直款 0% 手续费，实时预览实收净额
- 🔄 **批量操作**：批量标记进行中 / 完成、批量删除、批量导出 CSV
- 💾 **数据备份**：一键导出 / 导入 JSON 全量备份（支持增量合并与完全覆盖）
- 🔍 **搜索**：单号（`#NTE...`）、客户昵称、手机号、项目、备注均可搜
- 📊 **工作台**：待处理 / 进行中 / 今日完成 / 总单量统计卡片 + 近期订单速览
- 🎨 **猫咪风 UI**：粉白配色、圆润卡片、轻盈动效，尊重系统「减少动态效果」设置

## 🛠 技术栈

| 领域 | 选型 |
|---|---|
| 框架 | React 19 + TypeScript（strict 模式） |
| 构建 | Vite 6 |
| 样式 | Tailwind CSS v4 |
| 动画 | motion (framer-motion 后继) |
| 存储 | Dexie 4（IndexedDB，纯本地，**无后端**） |
| 图标 | lucide-react |
| 彩蛋 | canvas-confetti |

## 🚀 本地运行

```bash
npm install
npm run dev        # http://localhost:3000
```

生产构建：

```bash
npm run build      # 产物输出到 dist/
npm run preview    # 本地预览构建产物
```

> 💡 Windows 用户也可直接双击 `启动喵序.bat` 一键启动（自动检测 Node.js、安装依赖并打开浏览器）。

## 🗂 项目结构

```
src/
├── components/        # UI 组件（orders / dashboard / ui / layout / brand / login）
├── repositories/      # 数据层（Dexie 封装，UI 不直接触碰 IndexedDB）
├── services/          # 纯逻辑（结算计算、格式化）
├── data/              # 静态数据（项目分类）
└── lib/               # 工具函数
```

## 📄 说明

- 所有数据存储在浏览器本地（IndexedDB），不会上传到任何服务器
- 登录为演示用途：输入任意账号密码即可体验
- 首次打开会自动写入 45 条示例订单；「测试数据」按钮可随时重载
