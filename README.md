<p align="center">
  <p align="center">
    <img src="./packages/www/public/icon.png" alt="Icon" width="128" />
  </p>
  <h1 align="center"><b>ClarityFile · <ruby>明档<rt>Míng Dàng</rt></ruby></b></h1>
  <p align="center">
    一款专为学术团队和多项目、多比赛参与者设计的本地化智能文档版本与事务关联中心。
    <br />
    <pre align="center">🧪 Working in Progress</pre>
    <p align="center">
      <b>Download for </b>
      <a href="/releases">macOS</a>&nbsp;·&nbsp;
      <a href="/releases">Windows</a>&nbsp;·&nbsp;
      <i><span>PWA (Comming Soon)</span></i>
    </p>
    <br />
  </p>
</p>

## Motivation 动机

1.  **文档版本管理混乱：** 针对不同比赛、不同赛级、通用需求产生的多版本PPT、商业计划书、项目说明书等文件，难以清晰追踪、查找和管理。
2.  **文件命名与存放无序：** 文件夹和文件命名混乱，导致查找困难，新文件不知如何归档。
3.  **信息孤岛：** 比赛通知、项目核心成果（专利、红头文件）、成员信息、经费报销等相关信息与核心文档割裂，难以统一管理和关联查阅。
4.  **多项目管理挑战：** 难以有效区分和管理多个核心项目及 Side-project 的各类资料。
5.  **流程追踪困难：** 如经费报销流程难以有效追踪。
6.  **效率低下与文件丢失风险：** 上述问题导致工作效率低下，并存在文件误删或找不到的风险。

## Design 设计

1.  **以“项目”为组织核心：** 所有信息和文件都围绕项目进行组织和关联。
2.  **“逻辑文档”与“物理版本”分离：** 清晰管理一个抽象文档概念下的多个具体文件版本。
3.  **元数据驱动：** 通过丰富的元数据（项目、比赛、赛段、版本标签、类型等）精确描述和区分每一个文件和信息条目。
4.  **强制智能命名与结构化存放：** 应用根据元数据自动生成规范的文件名和清晰的本地文件夹结构，用户无需手动组织。
5.  **文件物理层与业务逻辑层分离：** 作为所有受管物理文件统一注册中心。
6.  **信息强关联：** 打破信息孤岛，将文档、比赛、成果、资产、经费等信息相互关联。
7.  **本地化优先：** 数据存储在本地，用户对自己的数据有完全控制权，兼容现有云同步备份方案。

## ToDo List

- [ ] 双向同步：ClarityFile <-> System Local Storage

## Monorepo 设计

项目使用了 monorepo 的架构，我们将代码都拆分并分别放到了 `packages/` 目录下。

- `desktop`: ClarityFile 的核心桌面应用代码。
- `www`: ClarityFile 的官方网站，用于展示项目、提供下载等。
- `shadcn`: shadcn/ui 的本地化版本，用于统一 UI 组件库。同时为各类子项目提供统一的 UI 组件。

> 值得一提的是，在从 single repo 迁移到 monorepo 的过程中，碰到了好一些坑，主要集中在配置上的一些问题

具体体现在 TailwindCSS 的配置上，由于 monorepo 的存在，导致了 TailwindCSS 的配置需要进行一定的修改，才能保证各个子项目都能正确地应用 TailwindCSS。具体配置可以去查看 `shadcn/global.css`，我使用 `@source` 进行了特别的配置。(Learn from using heroui in Tailwind v4)

## Author

ClarityFile © Wibus, Released under AGPLv3. Created on Jun 18, 2025

> [Personal Website](http://wibus.ren/) · [Blog](https://blog.wibus.ren/) · GitHub [@wibus-wee](https://github.com/wibus-wee/) · Telegram [@wibus✪](https://t.me/wibus_wee)
