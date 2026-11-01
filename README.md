# HR 灵动助手 (HR Helper)

> 专为 HR、活动策划与团队管理者设计的企业级名单抽奖与智能分组工具。纯前端驱动，数据本地持久化，隐私零外泄，支持一键自动化 CI/CD 部署上线。

---

## 🌟 核心特性

- 🎯 **名单高效管理**：支持 CSV/Excel 复制粘贴批量导入、手动快速录入，内置部门与工号标签，支持一键清空与重置预设。
- 🎁 **大屏互动抽奖**：支持单人/多人连抽、奖项切换、抽签音效与 Canvas 绚丽礼花动效；支持“不重复中奖”过滤机制。
- 👥 **智能团队分组**：支持“固定组数”或“每组人数”两种模式，具备乱序打乱、部门打散（均衡分配）及个性化组名预设。
- 📊 **导出与记录追踪**：抽奖结果与分组方案支持一键导出为 CSV 报表与 Markdown 格式。
- 🔒 **纯前端 & 隐私安全**：无需后端数据库，名单与抽奖记录仅保存在浏览器本地（`localStorage`），绝不上传服务器。

---

## 🛠️ 技术栈

- **框架**：[React 19](https://react.dev/)
- **构建工具**：[Vite 6](https://vitejs.dev/)
- **开发语言**：[TypeScript 5](https://www.typescriptlang.org/)
- **样式方案**：[Tailwind CSS v4](https://tailwindcss.com/)
- **图标库**：[Lucide React](https://lucide.dev/)
- **CI/CD**：GitHub Actions + GitHub Pages

---

## 🚀 本地开发与运行指南

### 1. 环境准备
确保本机已安装 [Node.js](https://nodejs.org/)（建议版本 `>= 18.0.0`，推荐使用 LTS 20 或 22 版本）。

### 2. 安装依赖
克隆项目后，在根目录执行：
```bash
npm install
```

### 3. 启动本地开发服务
```bash
npm run dev
```
启动成功后，在浏览器访问控制台提示的地址（默认 `http://localhost:3000`）。

### 4. 代码检查与打包构建
```bash
# 执行 TypeScript 类型检查
npm run lint

# 执行生产环境优化打包
npm run build

# 本地预览生产构建产物
npm run preview
```
打包成功后，静态文件将输出至 `dist/` 目录。

---

## 🌐 自动化部署上线 (GitHub Actions)

项目已配置完整的 GitHub Actions 工作流（[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)），每次推送到 `main` 分支时将自动完成依赖安装、类型检查、构建并发布至 **GitHub Pages**。

### 开启 GitHub Pages 步骤：
1. 将代码推送至 GitHub 仓库：
   ```bash
   git add .
   git commit -m "feat: complete project configuration and CI/CD workflow"
   git push origin main
   ```
2. 打开 GitHub 仓库页面，点击顶部的 **Settings** 选项卡。
3. 在左侧菜单点击 **Pages**。
4. 在 **Build and deployment** 下的 **Source** 下拉菜单中，选择 **GitHub Actions**。
5. 提交代码至 `main` 分支或在 Actions 页面点击 **Run workflow** 手动触发，构建完成后即可在仓库主页或 Pages 设置中看到正式上线的访问链接（例如：`https://<你的用户名>.github.io/hr-helper/`）。

> **💡 提示**：项目 `vite.config.ts` 已配置 `base: './'`，无论部署在 GitHub Pages 仓库子路径、自定义域名，还是部署在 Vercel / Cloudflare Pages / Netlify，静态资源均可无缝加载，无需额外修改配置。

---

## 📁 目录结构说明

```plaintext
hr-helper/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions 自动化部署工作流
├── src/
│   ├── components/           # 页面组件
│   │   ├── Navbar.tsx        # 顶部导航与全局主题/音效切换
│   │   ├── RosterManager.tsx # 花名册名单管理与 CSV 导入
│   │   ├── LotteryDraw.tsx   # 大屏抽奖核心组件
│   │   └── TeamGrouping.tsx  # 智能分组组件
│   ├── data/
│   │   └── presets.ts        # 预设名单数据与内置奖项模版
│   ├── types/
│   │   └── index.ts          # 全局 TypeScript 接口定义
│   ├── utils/
│   │   ├── audio.ts          # Web Audio 音效合成器
│   │   ├── confetti.ts       # Canvas 礼花爆破特效
│   │   ├── exporter.ts       # CSV 与 Markdown 数据导出工具
│   │   └── grouping.ts       # 洗牌算法与分组逻辑
│   ├── App.tsx               # 根组件
│   ├── main.tsx              # 应用入口
│   └── index.css             # Tailwind CSS v4 样式定义
├── .gitignore                # Git 忽略文件配置
├── index.html                # HTML 模版
├── package.json              # 项目依赖与执行脚本
├── tsconfig.json             # TypeScript 编译器配置
└── vite.config.ts            # Vite 构建配置
```

---

## 🛡️ 忽略文件与隐私安全规范 (`.gitignore`)

项目严格遵守工程规范，已预先排除了：
- `node_modules/`（第三方依赖套件）
- `dist/`（构建打包输出）
- `.env*`（本地环境变量与私密凭证，保留 `.env.example` 作为范例）
- `.idea/`、`.vscode/` 等编辑器本地缓存
- `.DS_Store`、`Thumbs.db` 等操作系统垃圾文件
- 运行日志与调试文件（`*.log`）

