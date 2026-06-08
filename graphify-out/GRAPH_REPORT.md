# Graph Report - .  (2026-06-08)

## Corpus Check
- 103 files · ~53,183 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 604 nodes · 1048 edges · 51 communities (37 shown, 14 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Attendance App Core|Attendance App Core]]
- [[_COMMUNITY_App Shell & State|App Shell & State]]
- [[_COMMUNITY_Deploy & App Overview|Deploy & App Overview]]
- [[_COMMUNITY_KPU Document Generators|KPU Document Generators]]
- [[_COMMUNITY_Project Dependencies|Project Dependencies]]
- [[_COMMUNITY_KPU Planning App UI|KPU Planning App UI]]
- [[_COMMUNITY_Pustaka AI Assistant|Pustaka AI Assistant]]
- [[_COMMUNITY_Book Catalog UI|Book Catalog UI]]
- [[_COMMUNITY_Themes & iOS Install|Themes & iOS Install]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Catalog Admin CRUD|Catalog Admin CRUD]]
- [[_COMMUNITY_KPU Planning Concepts|KPU Planning Concepts]]
- [[_COMMUNITY_WhatsApp Sharing|WhatsApp Sharing]]
- [[_COMMUNITY_PWA Manifest|PWA Manifest]]
- [[_COMMUNITY_Reader Leaderboard|Reader Leaderboard]]
- [[_COMMUNITY_Library Pages|Library Pages]]
- [[_COMMUNITY_Voting Guide & App Icons|Voting Guide & App Icons]]
- [[_COMMUNITY_KPU AI Document Engine|KPU AI Document Engine]]
- [[_COMMUNITY_Upload Storage (IndexedDB)|Upload Storage (IndexedDB)]]
- [[_COMMUNITY_PWA Manifest (variant)|PWA Manifest (variant)]]
- [[_COMMUNITY_Graphify Build & Report|Graphify Build & Report]]
- [[_COMMUNITY_Pustaka AI Edge Function|Pustaka AI Edge Function]]
- [[_COMMUNITY_Graphify Watch & Update|Graphify Watch & Update]]
- [[_COMMUNITY_PDF & Text Reader|PDF & Text Reader]]
- [[_COMMUNITY_TS Node Config|TS Node Config]]
- [[_COMMUNITY_QR Scanner|QR Scanner]]
- [[_COMMUNITY_Graphify Query & MCP|Graphify Query & MCP]]
- [[_COMMUNITY_Graphify Extraction Pipeline|Graphify Extraction Pipeline]]
- [[_COMMUNITY_Graphify Exports|Graphify Exports]]
- [[_COMMUNITY_Edge Function (chat)|Edge Function (chat)]]
- [[_COMMUNITY_Graphify Core Concepts|Graphify Core Concepts]]
- [[_COMMUNITY_Graphify Clone & Merge|Graphify Clone & Merge]]
- [[_COMMUNITY_Graphify Ingest & Transcribe|Graphify Ingest & Transcribe]]
- [[_COMMUNITY_Premium Pricing Function|Premium Pricing Function]]
- [[_COMMUNITY_Claude Hooks Config|Claude Hooks Config]]
- [[_COMMUNITY_Edge Function Base|Edge Function Base]]
- [[_COMMUNITY_Vite Env Types|Vite Env Types]]
- [[_COMMUNITY_Service Worker|Service Worker]]
- [[_COMMUNITY_Graphify GraphMLSVG|Graphify GraphML/SVG]]
- [[_COMMUNITY_Graphify Audit & Deep Mode|Graphify Audit & Deep Mode]]
- [[_COMMUNITY_Service Worker (variant)|Service Worker (variant)]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]

## God Nodes (most connected - your core abstractions)
1. `Book` - 18 edges
2. `compilerOptions` - 17 edges
3. `useApp()` - 15 edges
4. `useCatalog()` - 15 edges
5. `E-Pustaka Pemilu` - 14 edges
6. `isOnline()` - 12 edges
7. `ttdBlok()` - 11 edges
8. `useAuth()` - 11 edges
9. `isSupabaseEnabled` - 11 edges
10. `ContentType` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Incremental Update (--update)` --shares_data_with--> `Extraction Cache`  [INFERRED]
  /home/user/ReNamer-Pro/.claude/skills/graphify/references/update.md → /home/user/ReNamer-Pro/.claude/skills/graphify/SKILL.md
- `App Icon 192px (Open Book + Checked Ballot Box)` --conceptually_related_to--> `Panduan Mencoblos yang Benar (Correct Voting Guide)`  [INFERRED]
  /home/user/ReNamer-Pro/public/icons/icon-192.png → /home/user/ReNamer-Pro/public/ebooks/panduan-mencoblos.pdf
- `Perencanaan KPU Icon (Document Stack + Check Seal + Spark)` --conceptually_related_to--> `Pemilu (General Election)`  [INFERRED]
  /home/user/ReNamer-Pro/public/perencanaan-kpu/icons/icon.svg → /home/user/ReNamer-Pro/public/ebooks/panduan-mencoblos.pdf
- `lpjHtml()` --calls--> `esc2()`  [INFERRED]
  public/event-attendance/app.js → public/perencanaan-kpu/generators.js
- `QrisCheckout()` --calls--> `formatRupiah()`  [EXTRACTED]
  src/components/QrisCheckout.tsx → src/data/books.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **graphify Build Pipeline (detect, extract, build/cluster, label, export)** — graphify_skill_detect_files, graphify_skill_ast_extraction, graphify_skill_semantic_extraction, graphify_skill_build_cluster_analyze, graphify_skill_label_communities [EXTRACTED 1.00]
- **graphify Export Targets (HTML, Obsidian, Neo4j, SVG, GraphML, Wiki, MCP)** — graphify_skill_html_viz, graphify_skill_obsidian_vault, exports_neo4j_export, exports_svg_export, exports_graphml_export, exports_wiki_export, exports_mcp_server [EXTRACTED 0.95]
- **graphify Query Suite (query, path, explain, save-result)** — query_query_command, query_path_command, query_explain_command, query_save_result, query_query_expansion [EXTRACTED 1.00]
- **CI/CD Build and Deploy Pipeline** — ci_workflow, deploy_workflow, deploy_github_pages, readme_vite [INFERRED 0.75]
- **QRIS Payment Flow (Midtrans)** — setup_backend_create_payment, setup_backend_payment_status, setup_backend_payment_webhook, setup_backend_midtrans, setup_backend_orders_table [EXTRACTED 0.85]
- **Pustaka AI Claude Proxy Pipeline** — readme_pustaka_ai, setup_backend_pustaka_ai_ts, setup_backend_pustaka_ai_function, setup_backend_anthropic_api_key, readme_claude_llm [INFERRED 0.85]
- **Planning App Module Stack** — perencanaan_kpu_index_data_js, perencanaan_kpu_index_templates_js, perencanaan_kpu_index_generators_js, perencanaan_kpu_index_ai_js, perencanaan_kpu_index_app_js [EXTRACTED 0.75]
- **Voting Process Concepts** — panduan_mencoblos_dpt, panduan_mencoblos_tps, panduan_mencoblos_surat_suara, panduan_mencoblos_mencoblos [INFERRED 0.85]
- **Election App Icon Family** — icons_icon_192, icons_maskable_512, public_vite_svg [INFERRED 0.85]

## Communities (51 total, 14 thin omitted)

### Community 0 - "Attendance App Core"
Cohesion: 0.06
Nodes (57): addPhotos(), apiGet(), apiPost(), compressImage(), createEvent(), deleteEvent(), deletePdfBlob(), deletePhotos() (+49 more)

### Community 1 - "App Shell & State"
Cohesion: 0.07
Nodes (43): BeforeInstallPromptEvent, Navbar(), Phase, QrisCheckout(), AppContext, AppProvider(), AppState, loadLocal() (+35 more)

### Community 2 - "Deploy & App Overview"
Cohesion: 0.07
Nodes (41): CI build job, CI Workflow, GitHub Pages, Deploy to GitHub Pages Workflow, index.html App Shell, src/main.tsx Entry, Toko (Bookstore), Claude (Anthropic) LLM (+33 more)

### Community 3 - "KPU Document Generators"
Cohesion: 0.17
Nodes (24): addDays(), check(), docJadwal(), docKAK(), docKAKPengadaan(), docKAKSwakelola(), docKontrakSwakelola(), docMatriksRisiko() (+16 more)

### Community 4 - "Project Dependencies"
Cohesion: 0.07
Nodes (27): dependencies, @capacitor/android, @capacitor/core, react, react-dom, react-pdf, react-router-dom, @supabase/supabase-js (+19 more)

### Community 5 - "KPU Planning App UI"
Cohesion: 0.16
Nodes (21): drawQR(), esc(), load(), loadQR(), navButtons(), render(), renderArsip(), renderBAS() (+13 more)

### Community 6 - "Pustaka AI Assistant"
Cohesion: 0.17
Nodes (13): aiEnabled, AiError, aiErrorMessage(), AiResult, askBook(), askPustaka(), callAi(), ChatTurn (+5 more)

### Community 7 - "Book Catalog UI"
Cohesion: 0.18
Nodes (9): coverCache, heights, CatalogContext, CatalogState, AI_PROMPT_BOOK, BOOKS, fetchCatalog(), Book (+1 more)

### Community 8 - "Themes & iOS Install"
Cohesion: 0.16
Nodes (7): booksByTheme(), getTheme(), Theme, themeCount(), THEMES, Home(), ThemeDetail()

### Community 9 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 10 - "Catalog Admin CRUD"
Cohesion: 0.18
Nodes (11): CATEGORIES, signIn(), BookEditInput, BookRow, createBook(), deleteBook(), NewBookInput, updateBook() (+3 more)

### Community 11 - "KPU Planning Concepts"
Cohesion: 0.17
Nodes (17): ai.js AI Client, app.js Wizard/State, Planning App Shell (index.html), data.js Knowledge Base, generators.js, Planning Service Worker (offline cache), templates.js Blueprints, AI Mode (Claude) — Copilot & Document Generation (+9 more)

### Community 12 - "WhatsApp Sharing"
Cohesion: 0.28
Nodes (9): Footer(), ShareWhatsAppButton(), WhatsAppChannel(), WhatsAppFab(), bookUrl(), shareBookText(), waChannelLink(), waChatLink() (+1 more)

### Community 13 - "PWA Manifest"
Cohesion: 0.13
Nodes (14): background_color, categories, description, display, icons, id, lang, name (+6 more)

### Community 14 - "Reader Leaderboard"
Cohesion: 0.21
Nodes (12): Badge, BADGES, computeReaderStats(), isFinished(), LEVELS, LevelTier, pagesReadFor(), rankBooks() (+4 more)

### Community 15 - "Library Pages"
Cohesion: 0.23
Nodes (12): BookCard(), useApp(), useCatalog(), formatRupiah(), getBook(), BookDetail(), Leaderboard(), Library() (+4 more)

### Community 16 - "Voting Guide & App Icons"
Cohesion: 0.20
Nodes (14): App Icon 192px (Open Book + Checked Ballot Box), Perencanaan KPU Icon (Document Stack + Check Seal + Spark), Maskable App Icon 512px (Open Book + Checked Ballot Box), Bab 1 - Sebelum ke TPS (Before Going to Polling Station), Bab 2 - Di Bilik Suara (In the Voting Booth), DPT (Daftar Pemilih Tetap / Permanent Voter List), e-KTP (Electronic ID Card), E-Pustaka Pemilu (Election E-Library) (+6 more)

### Community 17 - "KPU AI Document Engine"
Cohesion: 0.33
Nodes (11): approvalSummary(), basRingkas(), blueprintFor(), callClaude(), copilot(), generateDocument(), getConfig(), isEnabled() (+3 more)

### Community 18 - "Upload Storage (IndexedDB)"
Cohesion: 0.36
Nodes (8): addUpload(), deleteUpload(), getUpload(), listUploads(), openDB(), request(), uploadCover(), UploadRecord

### Community 19 - "PWA Manifest (variant)"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, lang, name, scope, short_name (+2 more)

### Community 20 - "Graphify Build & Report"
Cohesion: 0.22
Nodes (10): Wiki Export, Build, Cluster, Analyze Step, Community Detection, God Nodes, GRAPH_REPORT.md, Label Communities Step, Suggested Questions, Surprising Connections (+2 more)

### Community 21 - "Pustaka AI Edge Function"
Cohesion: 0.33
Nodes (8): BookLite, cors, handleBook(), handleChat(), handleSearch(), json(), textOf(), Turn

### Community 22 - "Graphify Watch & Update"
Cohesion: 0.28
Nodes (9): Watch Debounce, Watch Folder Auto-Rebuild, graphify.watch Module, AST Structural Extraction, Post-Commit Auto-Rebuild Hook, build_merge Function, Code-Only Skip Semantic Extraction, Graph Diff (+1 more)

### Community 23 - "PDF & Text Reader"
Cohesion: 0.25
Nodes (5): THEMES, loadPrefs(), TextReader(), THEMES, ReaderTheme

### Community 24 - "TS Node Config"
Cohesion: 0.22
Nodes (8): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, strict, include

### Community 25 - "QR Scanner"
Cohesion: 0.43
Nodes (4): loadScript(), render(), startScan(), stopScan()

### Community 26 - "Graphify Query & MCP"
Cohesion: 0.33
Nodes (7): MCP stdio Server, graphify.serve Module, BFS Traversal, DFS Traversal, graphify query Command, Constrained Query Expansion, save-result Feedback Loop

### Community 27 - "Graphify Extraction Pipeline"
Cohesion: 0.29
Nodes (7): Cumulative Cost Tracker, Detect Files Step, Extraction Cache, general-purpose Subagent Type, Hyperedges, Semantic Extraction, Parallel Subagent Dispatch

### Community 28 - "Graphify Exports"
Cohesion: 0.40
Nodes (6): Neo4j Cypher Export, graph.json, Interactive HTML Visualization, Obsidian Vault Export, graphify explain Command, graphify path Command

### Community 29 - "Edge Function (chat)"
Cohesion: 0.33
Nodes (3): ALLOWED, cors, Turn

### Community 30 - "Graphify Core Concepts"
Cohesion: 0.40
Nodes (5): graphify Tool, /graphify Trigger, Token Reduction Benchmark, Knowledge Graph, Native CLAUDE.md Integration

### Community 31 - "Graphify Clone & Merge"
Cohesion: 0.40
Nodes (5): graphify clone, graphify extract CLI, graphify merge-graphs Cross-Repo Merge, Fast Path Existing Graph, Gemini Backend

### Community 32 - "Graphify Ingest & Transcribe"
Cohesion: 0.50
Nodes (4): graphify add URL Ingestion, graphify.ingest Module, graphify.transcribe Module, Video/Audio Transcription

## Knowledge Gaps
- **157 isolated node(s):** `PreToolUse`, `name`, `private`, `version`, `description` (+152 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lpjHtml()` connect `Attendance App Core` to `KPU Document Generators`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `esc2()` connect `KPU Document Generators` to `Attendance App Core`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `Book` connect `Book Catalog UI` to `Pustaka AI Assistant`, `Themes & iOS Install`, `Catalog Admin CRUD`, `Reader Leaderboard`, `Upload Storage (IndexedDB)`, `PDF & Text Reader`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `E-Pustaka Pemilu` (e.g. with `Deploy to GitHub Pages Workflow` and `index.html App Shell`) actually correct?**
  _`E-Pustaka Pemilu` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `PreToolUse`, `name`, `private` to the rest of the system?**
  _163 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Attendance App Core` be split into smaller, more focused modules?**
  _Cohesion score 0.05669710806697108 - nodes in this community are weakly interconnected._
- **Should `App Shell & State` be split into smaller, more focused modules?**
  _Cohesion score 0.06704260651629072 - nodes in this community are weakly interconnected._