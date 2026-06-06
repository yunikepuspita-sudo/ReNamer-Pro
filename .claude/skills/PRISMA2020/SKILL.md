---
name: PRISMA2020
description: Generate PRISMA 2020-compliant flow diagrams for systematic reviews and meta-analyses using the PRISMA2020 R package (PRISMA_flowdiagram). Use when the user wants to create, edit, or save a PRISMA flow diagram, fill in the PRISMA CSV template, count records through identification/screening/included stages, or produce interactive (HTML) or static (PNG/PDF/SVG) review flowcharts.
---

# PRISMA2020 Flow Diagram

Produce flow diagrams that conform to the **PRISMA 2020** reporting standard for
systematic reviews and meta-analyses, using the
[`PRISMA2020`](https://github.com/prisma-flowdiagram/PRISMA2020) R package by
Haddaway, McGuinness, Pritchard et al.

The diagram tracks studies through four stages — **Identification → Screening →
Eligibility → Included** — across up to three arms: *Previous* studies, *new
studies via databases & registers*, and *new studies via other methods*.

## When to use this skill

- The user wants to build/edit a PRISMA 2020 flow diagram for a literature review.
- They have record counts (identified, duplicates removed, screened, excluded,
  reports sought/assessed, included) to lay out.
- They want to fill the PRISMA CSV template, or save the diagram as HTML / PNG /
  PDF / SVG / PS / WEBP.

If the user only wants a quick point-and-click result and has no R environment,
point them to the **Shiny web app**: https://estech.shinyapps.io/prisma_flowdiagram/

## Workflow

1. **Gather the counts.** Ask the user for the numbers at each stage (see the
   "Data fields" section). For any arm they aren't using (Previous and/or Other),
   note it so it can be toggled off.
2. **Fill the CSV template.** Copy `assets/PRISMA.csv` and edit the `n` column
   with the user's numbers. Keep the structure/column headers intact. For boxes
   that list exclusion reasons (e.g. `dbr_excluded`, `other_excluded`) or
   specific databases/registers, use the `Reason1, xxx; Reason2, yyy` format in
   the `n` column.
3. **Generate the diagram** with `PRISMA_data()` + `PRISMA_flowdiagram()`.
4. **Save** with `PRISMA_save()` in the requested format.

## Installing the package

```r
# From CRAN:
install.packages("PRISMA2020")

# Or the development version:
# install.packages("remotes")
remotes::install_github("prisma-flowdiagram/PRISMA2020")
```

A Docker image is also available (runs the bundled Shiny app on port 3838):

```bash
git clone https://github.com/prisma-flowdiagram/PRISMA2020.git
cd PRISMA2020
docker build . -t prisma-shiny:1
docker run -it --rm -p 3838:3838 prisma-shiny:1   # then open http://localhost:3838/app
```

## Minimal R usage

```r
library(PRISMA2020)

# 1. Load the filled-in template (use the bundled one as a starting point)
csvFile <- system.file("extdata", "PRISMA.csv", package = "PRISMA2020")
data    <- read.csv(csvFile)            # or read.csv("my_filled_template.csv")

# 2. Parse it
data <- PRISMA_data(data)

# 3. Build the flow diagram
plot <- PRISMA_flowdiagram(
  data,
  fontsize    = 12,
  interactive = TRUE,   # FALSE = static
  previous    = FALSE,  # show the "Previous studies" arm?
  other       = TRUE    # show the "Other methods" arm?
)

# 4. Save it (filetype inferred from extension if NA)
PRISMA_save(plot, filename = "prisma.html", filetype = "html", overwrite = TRUE)
# Static export examples:
# PRISMA_save(plot, filename = "prisma.png", overwrite = TRUE)
# PRISMA_save(plot, filename = "prisma.pdf", overwrite = TRUE)
```

## Key `PRISMA_flowdiagram()` arguments

| Argument | Default | Purpose |
|---|---|---|
| `data` | — | Output of `PRISMA_data()` |
| `interactive` | `FALSE` | `TRUE` → clickable HTML with hyperlinks + tooltips |
| `previous` | `TRUE` | Include the "Previous studies" arm |
| `other` | `TRUE` | Include the "Other methods" arm (websites, organisations, citation searching) |
| `detail_databases` | — | Break out per-database record counts |
| `detail_registers` | — | Break out per-register record counts |
| `meta_analysis` | — | Add a "total studies in meta-analysis" box |
| `side_boxes` | `TRUE` | Show the left/right grey side boxes |
| `font` / `fontsize` | `Helvetica` / `12` | Box text font and size |
| `title_colour`, `greybox_colour`, `main_colour`, `arrow_colour` | — | Theme colours |
| `arrow_head`, `arrow_tail` | — | Connector line shapes |

`PRISMA_save()` supports `filetype` = `html`, `pdf`, `png`, `svg`, `ps`, `webp`
(plus `width`, `height`, `overwrite`, `css`). When `filetype = NA` it is inferred
from the filename extension.

## Data fields (the CSV `n` column)

The template (`assets/PRISMA.csv`) has one row per box. Fill the `n` column for:

- **Previous arm:** `previous_studies`, `previous_reports`
- **Databases/registers (new):** `database_results`, `register_results`
  (optionally `database_specific_results`, `register_specific_results`),
  `duplicates`, `excluded_automatic`, `excluded_other`, `records_screened`,
  `records_excluded`, `dbr_sought_reports`, `dbr_notretrieved_reports`,
  `dbr_assessed`, `dbr_excluded` (with reasons), `new_studies`, `new_reports`
- **Other methods arm:** `website_results`, `organisation_results`,
  `citations_results`, `other_sought_reports`, `other_notretrieved_reports`,
  `other_assessed`, `other_excluded` (with reasons)
- **Totals:** `total_studies`, `total_reports`, and (if meta-analysis)
  `total_studies_ma`, `total_reports_ma`

For exclusion-reason and per-source boxes, the `n` cell takes a `;`-separated list:
`Reason1, 12; Reason2, 5; Reason3, 3`.

## Resources

- `assets/PRISMA.csv` — the official editable template. Copy it, edit the `n`
  column, and feed it to `read.csv()` → `PRISMA_data()`.

## Citation

Haddaway, N. R., Page, M. J., Pritchard, C. C., & McGuinness, L. A. (2022).
PRISMA2020: An R package and Shiny app for producing PRISMA 2020-compliant flow
diagrams. *Campbell Systematic Reviews*, 18, e1230.
https://doi.org/10.1002/cl2.1230
