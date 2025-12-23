# Modern React Developer Guide

## Overview

This guide demonstrates how to set up a modern full-stack React/Django app, focusing specifically on the frontend development environment.
Note: This represents a recommended approach rather than a strict requirement. It assumes developers have access to install necessary tools and are using Windows as their primary operating system.

## Stack

### Core Technology

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
-   **[Bun](https://bun.sh/)**: Fast JavaScript runtime and package manager
-   **[Docker](https://www.docker.com/)**: Containerisation for consistent environments

### Why this stack

-   **[React](https://react.dev/)**: Industry-standard framework with excellent maintainability, abundant resources, and straightforward hiring pipeline.
-   **[TypeScript](https://www.typescriptlang.org/)**: Essential for catching errors early and providing clear component contracts. JavaScript alone is no longer considered best practice for production applications.
-   **[Axios](https://axios-http.com/)**: Provides interceptors for centralised auth token handling, automatic request/response transformation, and better error handling than native fetch API for client-server communication.
-   **[TanStack Query](https://tanstack.com/query/latest)**: Eliminates boilerplate for server state management, provides intelligent caching, and handles loading/error states automatically.
-   **[MobX](https://mobx.js.org/)**: Minimal boilerplate compared to alternatives, excellent TypeScript integration, automatic reactivity without manual subscriptions, and relatively gentle learning curve.
-   **[React Hook Form](https://react-hook-form.com/)**: Best-in-class performance with minimal re-renders, intuitive API, and seamless integration with Zod for validation.
-   **[Zod](https://zod.dev/)**: Runtime type validation that integrates with TypeScript, ensuring API responses match expected types and providing clear error messages.
-   **[Tailwind CSS](https://tailwindcss.com/)**: Rapid development without context-switching to CSS files, consistent design system, and excellent tree-shaking for production builds.
-   **[React Icons](https://react-icons.github.io/react-icons/)**: Rapidly prototyping with pre-existing icons from many libraries. Provides a lot of choices, all of which work with React - out of the box.
-   **[React Helmet Async](https://www.npmjs.com/package/react-helmet-async)**: Useful for setting the page title when navigating between pages, without the need for a refresh.
-   **[Shadcn](https://ui.shadcn.com/)**: Unlike traditional component libraries, Shadcn copies source code directly into your project, enabling complete customisation while maintaining TypeScript support and Tailwind integration. This is good for reducing technical debt / maintainability and ability for new developers to jump in as it only requires knowledge of typescript and tailwind.
-   **[Vite](https://vitejs.dev/)**: Significantly faster than Webpack for both dev server startup and hot module replacement, with excellent out-of-the-box TypeScript support.
-   **[Bun](https://bun.sh/)**: Drop-in replacement for Node.js with dramatically faster package installation and script execution, reducing development friction.
-   **[Docker](https://www.docker.com/)**: Ensures consistent development and production environments, simplifies onboarding, and enables reproducible deployments.

## Architecture Overview

### Philosophy

This guide prioritises pragmatic architecture for small-to-medium scale applications, balancing modern best practices with development velocity:

-   **Separation of Concerns**: Each technology handles its specific domain
-   **Reactive Programming**: Automatic UI updates when state changes
-   **Type Safety**: End-to-end TypeScript from database to UI (catching errors at compile time)
-   **Performance**: Optimised build output and runtime efficiency
-   **Developer Experience**: Intuitive APIs, excellent tooling, and fast feedback loops
-   **Practical Scope & Maintainability**: Focused on core functionality over comprehensive test coverage or component documentation tooling

### Project Structure

This guide assumes the frontend and backend are bundled in the same repository for simplicity, with each creating its own Docker image:

```
project_root/:
├── backend
│   └──  ...                    # Django or other backend
├── frontend
│   └──  ...                    # React frontend
├── .gitignore                  # Any sensitive files or local files / docs
├── .github/workflows
│   └── main.yml                # DevOps image scans and docker build configurations
├── kustomize                   # Kubernetes deployment convenience
└── docker-compose.yml          # Optional for spinning frontend and backend up for local development
```

### Frontend Structure

The guide focuses on the frontend structure:

```
src/
├── app/                         # Application-wide concerns
│   ├── providers/               # React providers (Query, Store, Theme)
│   ├── router/                  # Routing configuration and guards
│   └── stores/                  # MobX stores
│       ├── root.store.ts        # Root store orchestration
│       ├── auth.store.ts        # Authentication state
│       ├── ui.store.ts          # UI preferences and theme
│       ├── ...                  # Any other stores related to the project
├── features/                    # Feature-based modules
│   ├── auth/                    # Authentication configuration with backend
│   ├── dashboard/               # Dashboard and overview
│   └── .../                     # Any other feature folders specific to application
├── shared/                      # Shared resources
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── layout/              # Layout components
│   │   └── common/              # Common components
│   ├── hooks/                   # Custom hooks
│   ├── services/                # API services and utilities
│   ├── types/                   # TypeScript type definitions
│   ├── utils/                   # Utility functions
│   └── constants/               # Application constants
└── lib/                         # Core library functions
    ├── api-client.ts            # Axios configuration
    ├── auth.ts                  # Authentication utilities
    ├── utils.ts                 # Core utilities
    └── validations.ts           # Zod schemas
```

### Feature Module Structure

For maintainability, major components are split into features for a domain-driven approach to development. Each feature module follows a consistent, self-contained structure:

```
src/features/[feature-name]/
├── components/                     # Feature-specific components
│   ├── forms/                      # Form components
│   ├── modals/                     # Modal components
│   ├── tables/                     # Data table components
│   └── index.ts                    # Barrel exports
├── hooks/                          # Feature-specific hooks
│   ├── use[Feature].ts             # Main feature hook
│   ├── use[Feature]Mutations.ts    # Mutation hooks
│   └── index.ts                    # Barrel exports
├── services/                       # API services
│   ├── [feature].service.ts        # Main service for feature
│   └── index.ts                    # Barrel exports
├── types/                          # TypeScript interfaces
│   ├── [feature].types.ts          # Type definitions
│   └── index.ts                    # Barrel exports
├── schemas/                        # Zod validation schemas
│   ├── [feature].schemas.ts        # Validation schemas
│   └── index.ts                    # Barrel exports
└── index.ts                        # Feature barrel export
```

## Getting Started

### Prerequisites

In order to establish a frontend we first require some development tools. Tools required for development may differ depending on operating system (OS), however, this guide assumes a Windows device with appropriate permissions for installing tools and performing development work.

### Create the App

### Install Dependencies

## Establish Structure

## Continued Development

## Setup for DevOps

### Docker

A guide for working with Docker can be found [here]().

### Deploy Application to Kubernetes
