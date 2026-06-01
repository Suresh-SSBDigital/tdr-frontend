# Dashboard Module Structure

This module keeps all dashboard-related code in one place so it is easy to understand and maintain.

## Folders

- `layout/` - dashboard shell layout (fixed sidebar + topbar)
- `pages/` - route-level pages for each dashboard section
- `components/` - dashboard UI building blocks and wrappers
- `helpers/` - reusable helper utilities and style constants

## Import Style

Use barrel exports to keep imports short and consistent:

- `import { DashboardLayout, DashboardPage } from './modules/dashboard'`
- `import { PageHeader, TDRTable } from '../components'`
- `import { downloadTdrCsv } from '../helpers'`
