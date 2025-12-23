# SPMS Maintainer Guide

## Overview

This guide will break down key information about SPMS, including local setup and continued development.

### About

The Science Project Management System (SPMS) was originally conceived nearly two decades ago to consolidate the department's annual project work and generate yearly reports. Since then, there have been many updates and the previous version was a Django-only (v1) app which was significantly slower. This version represents a complete rewrite from scratch, designed in the interests of security, speed, modernity, and maintainability while retaining the core interface familiar to department scientists.

SPMS is critical for producing the department's annual report—a comprehensive document created from entries provided by science staff throughout the year, with a focus on the June-July reporting period. This report is printed and delivered to key government stakeholders, playing a pivotal role in securing funding for the department’s scientific research and operational expansion.

### Key Features

-   **Custom Rich Text Editors**: Developed specifically for this system, allowing scientists to efficiently record and edit data (replacing the third-party SaaS solution TinyMCE).
-   **PDF Generation**: Seamlessly collects and formats saved data into an Annual Report or Project Document (replacing a previously unmaintainable LaTeX system).
-   **Role-Based Workflow**: Custom-built workflow that delegates approvals across teams, business areas, and directorates (coded from scratch, replacing an out-of-the-box Django library).
-   **Emails and Comments**: Integrated communication system tied to document actions such as approvals, recalls, and feedback requests.
-   **Staff Profiles**: Integrated functionality from a decommissioned site, now using data from SPMS to provide public-facing staff profiles.
-   **Library Publications:** Scientists may demonstrate their publications on their staff profile via our token-based connection to the library system.

### Primary Tech Stack

This project uses the following core technology:

-   **Frontend**: Vanilla React 19 (Typescript + SWC)
-   **Backend**: Django (Python)
-   **Server-Client Communication**: Axios / Tanstack Query
-   **PDF Generation**: PrinceXML / Django Templates
-   **Emails**: React Email / Django Templates / Mailchimp
-   **Rich Text Editor**: Lexical
-   **Client State Management**: MobX
-   **UI**: TailwindCSS, Shadcn - primarily on staff profiles

## Local Development

This is where you’ll spend most of your time — whether you’re adding new features, making adjustments, or fixing bugs and design issues you spot along the way. To get started, you’ll need to set up a few things.

### Installs

-   [Git Bash](http://git-scm.com/download/win)
-   [Python](https://www.python.org/downloads/)
-   [Poetry](https://python-poetry.org/docs/#installing-with-the-official-installer)
-   [Node](https://nodejs.org/en/download)
-   [Bun](https://bun.com)
-   [PostgreSQL](https://www.postgresql.org/download/windows/)
-   [PrinceXML](https://www.princexml.com/download/)

#### Additional Recommended Software

-   [Google Chrome](https://www.google.com/intl/en_au/chrome/)
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/)
-   [Github Desktop](https://desktop.github.com/download/)
-   [Visual Studio Code](https://code.visualstudio.com)

#### Frontend

This project follows best practices for React, detailed in the department's [developer guidance repository](https://github.com/dbca-wa/developer-guidance/blob/main/React.md). This includes:

-   **[React](https://react.dev/)**: Component framework with concurrent features
-   **[TypeScript](https://www.typescriptlang.org/)**: Type safety and developer experience
-   **[Axios](https://axios-http.com/)**: HTTP client for API requests
-   **[TanStack Query](https://tanstack.com/query/latest)**: Server state management and caching
-   **[MobX](https://mobx.js.org/)**: Client state management and reactivity
-   **[React Hook Form](https://react-hook-form.com/)**: Performant form handling with minimal re-renders
-   **[Zod](https://zod.dev/)**: Schema validation and type inference
-   **[Tailwind CSS v4+](https://tailwindcss.com/)**: Utility-first styling framework
-   **[React Icons](https://react-icons.github.io/react-icons/)**: Icons
-   **[React Helmet Async](https://www.npmjs.com/package/react-helmet-async)**: Metadata and page titles
-   **[Shadcn](https://ui.shadcn.com/)**: Customisable component library built on Radix UI
-   **[Vite](https://vitejs.dev/)**: Fast build tool and development server

These are all installed locally based on package.json using the following command from the frontend directory:

-   **[Bun](https://bun.sh/)**: Fast JavaScript runtime and package manager
-   **[Docker](https://www.docker.com/)**: Containerisation for consistent environments

Docker is required for deploying the application to the Kubernetes cluster, and a Dockerfile is already prepared and tied to the .github/workflows folder. Bun allows for faster builds and is also a package manger.

```bash
bun install
```

This will create a node_modules folder in the frontend directory. You can then test that the frontend runs by running the following command and visiting 127.0.0.1:3000:

```bash
bun run dev
```

#### Backend

This project utilises the following core backend dependencies:

-

### Deployment
