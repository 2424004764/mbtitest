# MBTI 16 Personalities Test · 免费在线 MBTI 人格测试

免费、无注册、隐私优先的 MBTI 风格十六型人格测试与人格测评平台。部署于 Cloudflare Pages（纯静态 + 两个轻量边缘函数）。

## 功能

### 核心 MBTI 测试

- **双版本测试**：93 题完整版（约 12 分钟）+ 28 题速测（约 3 分钟，题目为完整版子集）
- **五维度计分**：E/I、S/N、T/F、J/P + 自信/敏感（-A/-T）身份维度，结果形如 `INTJ-A`
- **边缘类型提示**：某维度倾向接近 50/50 时，结果页提示"你也可能是…"并给出翻转后的第二类型
- **认知功能栈**：16 型详情页与结果页展示 Ni/Ne/Ti… 四层功能顺序与解析
- **作答明细回看**：测完可展开查看每道题的作答、对应维度与倾向方向（仅本地保存）
- **维度趋势图**：多次测试后，结果页绘制四个维度倾向的历史折线图
- **多风格分享卡片**：深邃 / 素笺 / 浓墨三种竖版（3:4）Canvas 卡片 + 结果链接 + 原生分享
- **匿名类型统计**（可选）：结果页展示本站测试者的 16 型分布条形图；"匿名计入统计"按钮完全自愿，仅上传四字母类型码
- **中英双语**：根据访客 IP 所在国家自动切换（中国大陆 → 中文，其他 → 英文），顶栏可手动切换；`?lang=zh|en` 可强制指定
- **键盘作答**：1–7 选择程度、← → 切换题目、Enter 下一题
- **断点续测 + 历史记录**：进度与历史仅存于浏览器 localStorage

### 人格配对实验室（/compatibility）

- 任选两种类型查看星级配对分析：共同点 / 差异点 / 组别互动 / 相处建议（双语）
- 打分规则：四字母全反（对偶互补）5 星、中间字母相同（沟通一致）4.5 星、其余按差异递减
- **双人 PK**：生成邀请链接发给朋友，对方测完 MBTI 后在结果页一键跳回配对对比

### 更多测评（/quiz/:id，复用同一作答框架）

- **九型人格**（36 题 · 约 6 分钟）：九型得分排序 + 主型解析 + 翼型提示
- **大五人格**（30 题 · 约 5 分钟）：五维度连续光谱 + 高/中/低分段解读
- **爱的语言**（30 题 · 约 5 分钟）：五种爱语得分 + 主爱语解析与相处建议

### 16 型图鉴与知识库

- **图鉴**：四种组别、每种类型独立详情页（概述/优劣势/职业/亲密关系/-A-T 变体/认知功能栈/名人示例/成长建议）
- **知识库**（/blog）：MBTI 是什么、MBTI 科学吗、人格会变吗——双语科普文章
- 明暗双主题（跟随系统 + 手动切换）、PC/移动端自适应、SEO 与 OG 分享图、PWA manifest

### 隐私

- 无后端数据库，答案不上传；进度/历史/作答明细仅存 localStorage
- 边缘函数仅两个：`/api/geo` 返回访客国家码用于语言选择；`/api/stats` 匿名类型计数（**完全 opt-in**，不点击不上传任何数据，KV 未绑定时自动隐藏）

## 技术栈

Vite · React 19 · TypeScript · Tailwind CSS v4 · react-router-dom · motion · lucide-react
Cloudflare Pages Functions（`functions/api/geo.js`、`functions/api/stats.js`，统计使用 KV）

## 开发

```bash
npm install
npm run dev              # 纯前端开发（无 /api/*，语言回退浏览器设置）
npm run build            # 类型检查 + 生产构建 + 预渲染 28 页 → dist/
npm run pages:dev        # 构建后用 wrangler 本地模拟 Pages（含边缘函数与 KV）→ http://localhost:8788
```

## 部署到 Cloudflare Pages

1. 推送仓库到 GitHub/GitLab
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → 连接仓库
3. 构建配置：Framework preset `Vite`，Build command `npm run build`，Output directory `dist`
4. 部署完成后即获得 `*.pages.dev` 域名；`functions/` 目录会被自动识别为边缘函数

或使用 CLI：`npm run pages:deploy`（需先 `npx wrangler login`）。

**启用匿名统计（可选）**：在 Dashboard → Settings → Bindings 添加 KV 绑定，**变量名必须是 `TYPE_STATS`**：

```bash
npx wrangler kv namespace create TYPE_STATS   # 或直接在 Dashboard 创建
# Dashboard → Workers & Pages → mbtitest → Settings → Bindings → Add
#   类型选 KV namespace，变量名 TYPE_STATS，选中刚创建的 namespace
```

不绑定时 `/api/stats` 返回 `{ok:false}`，前端统计面板自动隐藏，其余功能不受影响（本地 `pages:dev` 即此状态）。
注意：本项目**不要**在 wrangler.toml 中声明 Pages 绑定——一旦声明，部署时会以文件为准并覆盖 Dashboard 里的手动配置（占位 id 会导致部署失败）。

**线上地址**：https://mbtitest.fologde.com （自定义域名，同时保留 https://mbtitest-epk.pages.dev）

### 更换域名时

域名出现在三处：`public/robots.txt`、`scripts/prerender.mjs` 的 `SITE`、`src/lib/site.ts` 的 `SITE_URL`（`index.html` 的 og:image 由构建生成）。全部替换后重新部署即可。

## 语言自动检测逻辑（优先级从高到低）

1. URL 参数 `?lang=zh|en`
2. localStorage 中用户手动切换的偏好
3. `/api/geo` 边缘函数返回的 IP 国家码（Cookie 缓存 30 天）——中国大陆为 CN → 中文
4. Cloudflare `/cdn-cgi/trace`（同域兜底）
5. 浏览器语言 → 默认英文

## 内容版权

93 道 MBTI 题目、36 道九型题目、30 道大五题目、30 道爱语题目、16 型人格解析、名人归类与博客文章均为本项目原创编写（中英双语），基于 MBTI / 大五 / 九型 / 爱的五种语言的流行框架。名人均为社区推测归类，仅供参考。
本测试仅供自我探索与娱乐参考，不构成心理诊断。

## 目录结构

```
functions/api/geo.js        边缘函数：访客国家码（种 cf_country cookie）
functions/api/stats.js      边缘函数：匿名类型统计（KV 绑定 TYPE_STATS，在 Dashboard 配置）
public/                     _redirects _headers robots.txt manifest favicon og.png icons/
scripts/prerender.mjs       构建后预渲染 28 页（含 quiz/blog/compatibility）+ sitemap + OG 图
src/
  data/       questions.zh/en.ts、types.part1/2.zh/en.json、extras.zh/en.json（名人+成长建议）
              dimensions.ts、schema.ts、cognitive.ts（功能栈）、compatibility.ts（配对引擎）
              blog.ts（3 篇双语文章）、quizzes/（enneagram/bigfive/lovelang × zh/en）
  i18n/       ui.ts（双语文案）、index.tsx（语言检测链）
  pages/      Home Test Result Types TypeDetail Compatibility Quiz QuizResult Blog BlogPost About NotFound
  components/ Header Footer LikertScale DimensionBar TypeCard ProgressBar Seo Logo
              CognitiveStack TrendChart StatsPanel ReviewPanel QuestionHint
  quizzes/    通用测评框架（注册表 + 计分）
  hooks/      useTheme useBank（题库/类型/附加数据/quiz 按语言懒加载）
  lib/        scoring（含边缘类型） storage（进度/历史/统计缓存/quiz） share（三风格卡片）
```
