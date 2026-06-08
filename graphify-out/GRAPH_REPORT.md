# Graph Report - .  (2026-06-08)

## Corpus Check
- 114 files · ~63,574 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 722 nodes · 1259 edges · 52 communities (41 shown, 11 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 63 edges (avg confidence: 0.82)
- Token cost: 143,864 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Attendance App Core|Attendance App Core]]
- [[_COMMUNITY_Attendance App Core (mirror)|Attendance App Core (mirror)]]
- [[_COMMUNITY_Deploy & App Overview|Deploy & App Overview]]
- [[_COMMUNITY_Event Attendance Features|Event Attendance Features]]
- [[_COMMUNITY_Book Reader UI|Book Reader UI]]
- [[_COMMUNITY_KPU Document Generators|KPU Document Generators]]
- [[_COMMUNITY_Project Dependencies|Project Dependencies]]
- [[_COMMUNITY_KPU Planning App UI|KPU Planning App UI]]
- [[_COMMUNITY_Auth & PWA Install|Auth & PWA Install]]
- [[_COMMUNITY_Pustaka AI Assistant|Pustaka AI Assistant]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Themes & iOS Install|Themes & iOS Install]]
- [[_COMMUNITY_Library Pages|Library Pages]]
- [[_COMMUNITY_Catalog Admin CRUD|Catalog Admin CRUD]]
- [[_COMMUNITY_QRIS Payments|QRIS Payments]]
- [[_COMMUNITY_WhatsApp Sharing|WhatsApp Sharing]]
- [[_COMMUNITY_PWA Manifest|PWA Manifest]]
- [[_COMMUNITY_Voting Guide & App Icons|Voting Guide & App Icons]]
- [[_COMMUNITY_Reader Leaderboard|Reader Leaderboard]]
- [[_COMMUNITY_PWA Manifest (variant)|PWA Manifest (variant)]]
- [[_COMMUNITY_App State & Persistence|App State & Persistence]]
- [[_COMMUNITY_KPU AI Document Engine|KPU AI Document Engine]]
- [[_COMMUNITY_Upload Storage (IndexedDB)|Upload Storage (IndexedDB)]]
- [[_COMMUNITY_PWA Manifest (variant)|PWA Manifest (variant)]]
- [[_COMMUNITY_Graphify Build & Report|Graphify Build & Report]]
- [[_COMMUNITY_Pustaka AI Edge Function|Pustaka AI Edge Function]]
- [[_COMMUNITY_Graphify Watch & Update|Graphify Watch & Update]]
- [[_COMMUNITY_TS Node Config|TS Node Config]]
- [[_COMMUNITY_QR Scanner|QR Scanner]]
- [[_COMMUNITY_Graphify Query & MCP|Graphify Query & MCP]]
- [[_COMMUNITY_Graphify Extraction Pipeline|Graphify Extraction Pipeline]]
- [[_COMMUNITY_QR Scanner (mirror)|QR Scanner (mirror)]]
- [[_COMMUNITY_Graphify Exports|Graphify Exports]]
- [[_COMMUNITY_Edge Function CORS|Edge Function CORS]]
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
- [[_COMMUNITY_Service Worker (mirror)|Service Worker (mirror)]]
- [[_COMMUNITY_Service Worker (mirror)|Service Worker (mirror)]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]

## God Nodes (most connected - your core abstractions)
1. `Book` - 18 edges
2. `compilerOptions` - 17 edges
3. `useApp()` - 15 edges
4. `useCatalog()` - 15 edges
5. `E-Pustaka Pemilu` - 14 edges
6. `isOnline()` - 12 edges
7. `isOnline()` - 12 edges
8. `ttdBlok()` - 11 edges
9. `useAuth()` - 11 edges
10. `isSupabaseEnabled` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Smart Attendance Event (PWA) [public copy]` --semantically_similar_to--> `Smart Attendance Event (PWA)`  [INFERRED] [semantically similar]
  public/event-attendance/README.md → event-attendance/README.md
- `Dashboard Panitia (Admin) [public copy]` --semantically_similar_to--> `Dashboard Panitia (Admin)`  [INFERRED] [semantically similar]
  public/event-attendance/admin.html → event-attendance/admin.html
- `Check-in / Check-out Scanner [public copy]` --semantically_similar_to--> `Check-in / Check-out Scanner`  [INFERRED] [semantically similar]
  public/event-attendance/checkin.html → event-attendance/checkin.html
- `Participant Landing / RSVP / Ticket [public copy]` --semantically_similar_to--> `Participant Landing / RSVP / Ticket`  [INFERRED] [semantically similar]
  public/event-attendance/index.html → event-attendance/index.html
- `Persistensi Lokal (localStorage)` --semantically_similar_to--> `user_state Table`  [INFERRED] [semantically similar]
  README.md → SETUP-BACKEND.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **QRIS Payment Flow (Midtrans)** — setup_backend_create_payment, setup_backend_payment_status, setup_backend_payment_webhook, setup_backend_midtrans, setup_backend_orders_table [EXTRACTED 0.85]
- **Pustaka AI Claude Proxy Pipeline** — readme_pustaka_ai, setup_backend_pustaka_ai_ts, setup_backend_pustaka_ai_function, setup_backend_anthropic_api_key, readme_claude_llm [INFERRED 0.85]
- **CI/CD Build and Deploy Pipeline** — ci_workflow, deploy_workflow, deploy_github_pages, readme_vite [INFERRED 0.75]
- **QR Attendance Lifecycle (RSVP, Ticket, Scan, Rekap)** — event_attendance_index_rsvp_form, event_attendance_index_qr_ticket, event_attendance_checkin_scan_action, event_attendance_admin_export [INFERRED 0.85]
- **Planning App Module Stack** — perencanaan_kpu_index_data_js, perencanaan_kpu_index_templates_js, perencanaan_kpu_index_generators_js, perencanaan_kpu_index_ai_js, perencanaan_kpu_index_app_js [EXTRACTED 0.75]
- **SAE Shared Client API across pages** — event_attendance_admin_sae_app_api, event_attendance_admin_saeqr_api, event_attendance_index_participant_landing, event_attendance_checkin_scanner [INFERRED 0.85]
- **graphify Build Pipeline (detect, extract, build/cluster, label, export)** — graphify_skill_detect_files, graphify_skill_ast_extraction, graphify_skill_semantic_extraction, graphify_skill_build_cluster_analyze, graphify_skill_label_communities [EXTRACTED 1.00]
- **graphify Query Suite (query, path, explain, save-result)** — query_query_command, query_path_command, query_explain_command, query_save_result, query_query_expansion [EXTRACTED 1.00]
- **graphify Export Targets (HTML, Obsidian, Neo4j, SVG, GraphML, Wiki, MCP)** — graphify_skill_html_viz, graphify_skill_obsidian_vault, exports_neo4j_export, exports_svg_export, exports_graphml_export, exports_wiki_export, exports_mcp_server [EXTRACTED 0.95]
- **Voting Process Concepts** — panduan_mencoblos_dpt, panduan_mencoblos_tps, panduan_mencoblos_surat_suara, panduan_mencoblos_mencoblos [INFERRED 0.85]
- **Election App Icon Family** — icons_icon_192, icons_maskable_512, public_vite_svg [INFERRED 0.85]

## Communities (52 total, 11 thin omitted)

### Community 0 - "Attendance App Core"
Cohesion: 0.06
Nodes (57): addPhotos(), apiGet(), apiPost(), compressImage(), createEvent(), deleteEvent(), deletePdfBlob(), deletePhotos() (+49 more)

### Community 1 - "Attendance App Core (mirror)"
Cohesion: 0.06
Nodes (57): addPhotos(), apiGet(), apiPost(), compressImage(), createEvent(), deleteEvent(), deletePdfBlob(), deletePhotos() (+49 more)

### Community 2 - "Deploy & App Overview"
Cohesion: 0.07
Nodes (41): CI build job, CI Workflow, GitHub Pages, Deploy to GitHub Pages Workflow, index.html App Shell, src/main.tsx Entry, Toko (Bookstore), Claude (Anthropic) LLM (+33 more)

### Community 3 - "Event Attendance Features"
Cohesion: 0.07
Nodes (41): Create Event with PDF Auto-fill, Dashboard Panitia (Admin), Export (CSV / Excel / PDF), LPJ Accountability Document Generation, Photo Documentation, SAE App API (app.js), SAEQR API (qr.js), Scan Action (checkin/checkout/done) (+33 more)

### Community 4 - "Book Reader UI"
Cohesion: 0.12
Nodes (14): coverCache, heights, THEMES, CatalogContext, CatalogState, AI_PROMPT_BOOK, BOOKS, CATEGORIES (+6 more)

### Community 5 - "KPU Document Generators"
Cohesion: 0.17
Nodes (24): addDays(), check(), docJadwal(), docKAK(), docKAKPengadaan(), docKAKSwakelola(), docKontrakSwakelola(), docMatriksRisiko() (+16 more)

### Community 6 - "Project Dependencies"
Cohesion: 0.07
Nodes (27): dependencies, @capacitor/android, @capacitor/core, react, react-dom, react-pdf, react-router-dom, @supabase/supabase-js (+19 more)

### Community 7 - "KPU Planning App UI"
Cohesion: 0.16
Nodes (21): drawQR(), esc(), load(), loadQR(), navButtons(), render(), renderArsip(), renderBAS() (+13 more)

### Community 8 - "Auth & PWA Install"
Cohesion: 0.15
Nodes (17): BeforeInstallPromptEvent, Navbar(), AuthContext, AuthState, useAuth(), displayName(), getSession(), isValidPhone() (+9 more)

### Community 9 - "Pustaka AI Assistant"
Cohesion: 0.17
Nodes (13): aiEnabled, AiError, aiErrorMessage(), AiResult, askBook(), askPustaka(), callAi(), ChatTurn (+5 more)

### Community 10 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 11 - "Themes & iOS Install"
Cohesion: 0.17
Nodes (6): booksByTheme(), getTheme(), Theme, themeCount(), THEMES, ThemeDetail()

### Community 12 - "Library Pages"
Cohesion: 0.18
Nodes (15): useApp(), useCatalog(), getBook(), isPaymentEnabled, BookDetail(), Home(), Leaderboard(), Library() (+7 more)

### Community 13 - "Catalog Admin CRUD"
Cohesion: 0.18
Nodes (11): signIn(), BookEditInput, BookRow, createBook(), deleteBook(), fetchCatalog(), NewBookInput, updateBook() (+3 more)

### Community 14 - "QRIS Payments"
Cohesion: 0.23
Nodes (13): BookCard(), Phase, QrisCheckout(), formatRupiah(), anon, authToken(), callFn(), createPremiumCharge() (+5 more)

### Community 15 - "WhatsApp Sharing"
Cohesion: 0.28
Nodes (9): Footer(), ShareWhatsAppButton(), WhatsAppChannel(), WhatsAppFab(), bookUrl(), shareBookText(), waChannelLink(), waChatLink() (+1 more)

### Community 16 - "PWA Manifest"
Cohesion: 0.13
Nodes (14): background_color, categories, description, display, icons, id, lang, name (+6 more)

### Community 17 - "Voting Guide & App Icons"
Cohesion: 0.18
Nodes (15): App Icon 192px (Open Book + Checked Ballot Box), Smart Attendance Event Icon (QR Code + Green Check Badge), Perencanaan KPU Icon (Document Stack + Check Seal + Spark), Maskable App Icon 512px (Open Book + Checked Ballot Box), Bab 1 - Sebelum ke TPS (Before Going to Polling Station), Bab 2 - Di Bilik Suara (In the Voting Booth), DPT (Daftar Pemilih Tetap / Permanent Voter List), e-KTP (Electronic ID Card) (+7 more)

### Community 18 - "Reader Leaderboard"
Cohesion: 0.21
Nodes (12): Badge, BADGES, computeReaderStats(), isFinished(), LEVELS, LevelTier, pagesReadFor(), rankBooks() (+4 more)

### Community 19 - "PWA Manifest (variant)"
Cohesion: 0.13
Nodes (14): background_color, categories, description, display, icons, id, lang, name (+6 more)

### Community 20 - "App State & Persistence"
Cohesion: 0.22
Nodes (11): AppContext, AppProvider(), AppState, loadLocal(), AuthProvider(), CatalogProvider(), AppPersisted, EMPTY_STATE (+3 more)

### Community 21 - "KPU AI Document Engine"
Cohesion: 0.33
Nodes (11): approvalSummary(), basRingkas(), blueprintFor(), callClaude(), copilot(), generateDocument(), getConfig(), isEnabled() (+3 more)

### Community 22 - "Upload Storage (IndexedDB)"
Cohesion: 0.36
Nodes (8): addUpload(), deleteUpload(), getUpload(), listUploads(), openDB(), request(), uploadCover(), UploadRecord

### Community 23 - "PWA Manifest (variant)"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, lang, name, scope, short_name (+2 more)

### Community 24 - "Graphify Build & Report"
Cohesion: 0.22
Nodes (10): Wiki Export, Build, Cluster, Analyze Step, Community Detection, God Nodes, GRAPH_REPORT.md, Label Communities Step, Suggested Questions, Surprising Connections (+2 more)

### Community 25 - "Pustaka AI Edge Function"
Cohesion: 0.33
Nodes (8): BookLite, cors, handleBook(), handleChat(), handleSearch(), json(), textOf(), Turn

### Community 26 - "Graphify Watch & Update"
Cohesion: 0.28
Nodes (9): Watch Debounce, Watch Folder Auto-Rebuild, graphify.watch Module, AST Structural Extraction, Post-Commit Auto-Rebuild Hook, build_merge Function, Code-Only Skip Semantic Extraction, Graph Diff (+1 more)

### Community 27 - "TS Node Config"
Cohesion: 0.22
Nodes (8): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, strict, include

### Community 28 - "QR Scanner"
Cohesion: 0.43
Nodes (4): loadScript(), render(), startScan(), stopScan()

### Community 29 - "Graphify Query & MCP"
Cohesion: 0.33
Nodes (7): MCP stdio Server, graphify.serve Module, BFS Traversal, DFS Traversal, graphify query Command, Constrained Query Expansion, save-result Feedback Loop

### Community 30 - "Graphify Extraction Pipeline"
Cohesion: 0.29
Nodes (7): Cumulative Cost Tracker, Detect Files Step, Extraction Cache, general-purpose Subagent Type, Hyperedges, Semantic Extraction, Parallel Subagent Dispatch

### Community 31 - "QR Scanner (mirror)"
Cohesion: 0.43
Nodes (4): loadScript(), render(), startScan(), stopScan()

### Community 32 - "Graphify Exports"
Cohesion: 0.40
Nodes (6): Neo4j Cypher Export, graph.json, Interactive HTML Visualization, Obsidian Vault Export, graphify explain Command, graphify path Command

### Community 33 - "Edge Function CORS"
Cohesion: 0.33
Nodes (3): ALLOWED, cors, Turn

### Community 34 - "Graphify Core Concepts"
Cohesion: 0.40
Nodes (5): graphify Tool, /graphify Trigger, Token Reduction Benchmark, Knowledge Graph, Native CLAUDE.md Integration

### Community 35 - "Graphify Clone & Merge"
Cohesion: 0.40
Nodes (5): graphify clone, graphify extract CLI, graphify merge-graphs Cross-Repo Merge, Fast Path Existing Graph, Gemini Backend

### Community 36 - "Graphify Ingest & Transcribe"
Cohesion: 0.50
Nodes (4): graphify add URL Ingestion, graphify.ingest Module, graphify.transcribe Module, Video/Audio Transcription

## Ambiguous Edges - Review These
- `LPJ Accountability Document Generation` → `7-Stage Planning Flow`  [AMBIGUOUS]
  event-attendance/admin.html · relation: conceptually_related_to

## Knowledge Gaps
- **174 isolated node(s):** `PreToolUse`, `name`, `short_name`, `description`, `id` (+169 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `LPJ Accountability Document Generation` and `7-Stage Planning Flow`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `esc2()` connect `KPU Document Generators` to `Attendance App Core`, `Attendance App Core (mirror)`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `lpjHtml()` connect `Attendance App Core` to `KPU Document Generators`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `lpjHtml()` connect `Attendance App Core (mirror)` to `KPU Document Generators`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `E-Pustaka Pemilu` (e.g. with `Deploy to GitHub Pages Workflow` and `index.html App Shell`) actually correct?**
  _`E-Pustaka Pemilu` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `PreToolUse`, `name`, `short_name` to the rest of the system?**
  _180 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Attendance App Core` be split into smaller, more focused modules?**
  _Cohesion score 0.05669710806697108 - nodes in this community are weakly interconnected._