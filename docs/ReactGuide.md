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
├── pages/                       # Pages built from components to route between
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

Once you have the prerequisite tools, you may begin to create the app. We will start with a basic vite typescript app, restructure it, and install dependencies as we go.

First step is to create the base app:

```bash
bun create vite frontend --template react-ts
```

Select default options. This will provide typescript support and provide a base scaffolding for your app.
If you didn't select the default of starting now, you can check out the app with the following commands:

```bash
cd frontend && bun run dev
```

Your frontend should now be structured similarly to this:

```
frontend/
├── node_modules/                   # Dependencies (should be gitignored)
├── public/
├── src/
|   ├── assets/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .gitignore
├── bun.lock
├── eslint.config.js
├── index.html
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── .gitignore
```

You should see a working app now when you visit localhost:5173. However, we should remove all unecessary components and install dependencies as we restructure for scalability and maintainability.

### Styling Setup

Delete the following files and folders:

-   App.css
-   App.tsx
-   index.css
-   assets folder

Create a subfolder in src called 'shared', and another folder called 'styles', then create an index.css in that folder.

```bash
mkdir -p src/shared/styles && touch src/shared/styles/index.css
```

In main.tsx, remove the App import and replace the app tag with a simple paragraph tag. Then adjust the import of styles to the shared directory. Your main.tsx should look like this:

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./shared/styles/index.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<p>Hello</p>
	</StrictMode>
);
```

#### Install Tailwind

Now is the perfect time to install Tailwindcss v4 and checkout the ease of styling.

```bash
bun add tailwindcss @tailwindcss/vite
```

Next, adjust your vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
});
```

In your index.css:

```css
@import "tailwindcss";
```

Once you hit save, you will notice that a CSS reset occurred - the padding around the hello p tag disappeared; this means Tailwind is working! Go ahead and doublecheck by adjusting the p tag in your main.tsx to have a classname like follows (should be a medium red):

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./shared/styles/index.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<p className="text-red-500">Hello</p>
	</StrictMode>
);
```

**Note**: For a better development experience, we recommend using VS Code and installing "Tailwind CSS Intellisense" by Tailwind Labs - this will allow autocomplete when typing classes in the className as well as visual indicators for colours.

#### Install Shadcn

With tailwindcss confirmed to be working, we can move onto our other major styling dependency - Shadcn.

But first, we must adjust our tsconfig files to have an import alias, like so (just adjust/add what is missing).

tsconfig.json:

```json
{
	"files": [],
	"references": [
		{
			"path": "./tsconfig.app.json"
		},
		{
			"path": "./tsconfig.node.json"
		}
	],
	"compilerOptions": {
		// "baseUrl": ".", # Will be deprecated in typescript 7
		"paths": {
			"@/*": ["./src/*"]
		}
	}
}
```

tsconfig.app.json:

```json
{
	"compilerOptions": {
		// ...
		// "baseUrl": ".", # Will be deprecated in typescript 7
		"paths": {
			"@/*": ["./src/*"]
		}
		// ...
	}
}
```

Next we need to run the following and update vite config to prevent errors when resolving paths:

```bash
bun add -D @types/node
```

Ensure your vite config looks like this:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
```

To install, we will simply run the command below and select 'neutral':

```bash
bunx shadcn@latest init
```

Once we install, you will notice a few things:

-   a components.json file now exists at frontend root
-   index.css has updated to be quite comprehensive
-   a lib/utils.ts file now exists

We are not quite done. To ensure that shadcn works with our intended structure, we need to create some folders and adjust some settings.

Run the following command:

```bash
mv src/lib src/shared/ && mkdir -p src/shared/components/ui && mkdir -p src/shared/hooks
```

Now adjust the components.json file as follows:

```json
{
	"$schema": "https://ui.shadcn.com/schema.json",
	"style": "new-york",
	"rsc": false,
	"tsx": true,
	"tailwind": {
		"config": "",
		"css": "src/shared/styles/index.css",
		"baseColor": "neutral",
		"cssVariables": true,
		"prefix": ""
	},
	"iconLibrary": "lucide",
	"aliases": {
		"components": "@/shared/components",
		"utils": "@/shared/lib/utils",
		"ui": "@/shared/components/ui",
		"lib": "@/shared/lib",
		"hooks": "@/shared/hooks"
	},
	"registries": {}
}
```

We should be good to go to test adding a component now. Run the following command and you should see your shared/components/ui folder populate with a button.tsx component.

```bash
bunx shadcn@latest add button
```

The beauty of shadcn is that you can directly edit this component source code to your liking and the component remains reusable througout. Test it out by adding it to your main.tsx and playing with the variant/classname:

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./shared/styles/index.css";
import { Button } from "./shared/components/ui/button";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<p className="text-red-500">Hello</p>
		<Button className="cursor-pointer" variant={"destructive"}>
			Testing
		</Button>
	</StrictMode>
);
```

If you have made it this far, congratulations, the styling setup is complete.

### Router Setup

Now we need to get routing going. To do this, we should first install a routing library. There are many to choose from, but for this setup, we will go with React Router. Note that React Router has three primary "modes" for establishing routes - Declarative, Data, and Framework. We will be setting up a Data Mode Router.

Install it and prepare a routing config, routing folder, and routing guards with this command:

```bash
bun add react-router && mkdir -p src/config && touch src/config/routes.config.tsx && mkdir -p src/app/router/guards && touch src/app/router/index.tsx src/app/router/guards/auth.guard.ts
```

Next we need to also setup some base pages to route between. Create a pages folder with a Login.tsx file, a Register.tsx file and a Dashboard.tsx file.

```bash
mkdir src/pages && touch src/pages/Login.tsx src/pages/Register.tsx src/pages/Dashboard.tsx
```

For scaffolding these files and an improved developer experience, we recommend installing the VS Code extension 'ES7+ React/Reduc/React-Native snippets'by dsznajder. Once installed you can go into the Dashboard.tsx file and type 'rafce' and press Enter - this will create boilerplate for the file and its export.

Ensure it looks like this:

```typescript
const Dashboard = () => {
	return (
		<div>
			<p>Dashboard</p>
		</div>
	);
};

export default Dashboard;
```

Repeat the process for the other two files.

Login.tsx:

```typescript
const Login = () => {
	return (
		<div>
			<p>Login</p>
		</div>
	);
};

export default Login;
```

Register.tsx

```typescript
const Register = () => {
	return (
		<div>
			<p>Register</p>
		</div>
	);
};

export default Register;
```

Now we need to establish a Router Provider to replace our hello p tag so we can dynamically swap components based on the route.

In src/config/routes.config.tsx:

```typescript

```

In src/app/router/index.tsx establish the following:

```typescript

```

**Note**: This is a basic setup that you should use as a reference and add additional things to it as you go such as error pages, loading indicators etc.

### State Management Setup

Now we can install a state management library. As with routing, there are many options to choose from. We will be using

## Continued Development

## Setup for DevOps

### Docker

A guide for working with Docker can be found [here]().

### Deploy Application to Kubernetes
