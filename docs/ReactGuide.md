# Modern React Developer Guide

## Overview

This guide demonstrates how to set up a modern full-stack React/Django app, focusing specifically on the frontend development environment. It will cover basic setup, authentication & connecting to a backend, forms, and usage of the core technology.

**What We're Building:** A Reaction Clicker game - an engaging web application where players click targets that appear randomly on screen before they disappear. This application naturally demonstrates all the technologies in our stack through real-world implementation patterns.

**Learning Approach:** We'll build the game using our modern stack, showcasing proper architecture, state management, API integration, and component patterns. This game format provides clear use cases for authentication (user accounts), forms (settings), real-time updates (game state), and backend integration (leaderboards and statistics).

Note: This represents a recommended approach rather than a strict organisational requirement. It assumes developers have access to install necessary tools and are using Windows as their primary operating system, as per DBCA standard.

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

This guide assumes the frontend and backend are bundled in the same repository (for simplicity), with each creating its own Docker image:

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
│       ├── game.store.ts        # Game state management
├── features/                    # Feature-based modules
│   ├── auth/                    # Authentication
│   ├── game/                    # Game mechanics and UI
│   ├── leaderboard/             # Leaderboard display
│   └── stats/                   # User statistics
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

Create a subfolder in src called 'shared', and another folder called 'styles', then create an index.css in that folder, liks so:

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

With TailwindCSS working, we can move onto our other major styling dependency - Shadcn.

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

Going forward we should also add the folowing above the 'resolve' and 'plugins' definitions in vite.config.ts:

```typescript
	preview: {
		host: true,
		port: 3000,
	},
	build: {
		minify: true,
		sourcemap: false,
	},
```

Similarly, in package.json, adjust the dev config under scripts as follows:

```json
    "dev": "vite --host=127.0.0.1 --port=3000",
```

This will provide some optimisation when building and launch our server on port 3000.

To install Shadcn, we will simply run the command below and select 'neutral':

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

Now adjust the components.json file to point to our new folders, as follows:

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

This ensures that when we install new components from shadcn, they are installed in the correct location. We should be good to go to test adding a component now. Run the following command and you should see your shared/components/ui folder populate with a button.tsx component.

```bash
bunx shadcn@latest add button
```

The beauty of shadcn is that you can directly edit this component's source code to your liking and the component remains reusable througout. Test it out by adding it to your main.tsx and playing with the variant/classname:

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

### State Management Setup

Before we set up routing, we need to establish our state management system using MobX. This will handle our authentication state, UI preferences, game state, and other client-side data that needs to be reactive across our application.

First, install the required dependencies:

```bash
bun add mobx mobx-react-lite
```

Now let's create our store structure:

```bash
mkdir -p src/app/stores && touch src/app/stores/root.store.tsx src/app/stores/auth.store.ts src/app/stores/ui.store.ts
```

#### Create the Auth Store

The auth store will manage user authentication state. Create src/app/stores/auth.store.ts:

```typescript
import { makeAutoObservable } from "mobx";

export interface User {
	id: string;
	email: string;
	username: string;
}

export class AuthStore {
	user: User | null = null;
	token: string | null = null;
	isLoading = false;

	constructor() {
		makeAutoObservable(this);
		// Check for existing token in localStorage on initialization
		this.loadFromStorage();
	}

	/**
	 * Check if user is authenticated
	 */
	get isAuthenticated(): boolean {
		return !!this.token && !!this.user;
	}

	/**
	 * Load auth data from localStorage
	 */
	private loadFromStorage() {
		const token = localStorage.getItem("auth_token");
		const userStr = localStorage.getItem("auth_user");

		if (token && userStr) {
			this.token = token;
			this.user = JSON.parse(userStr);
		}
	}

	/**
	 * Save auth data to localStorage
	 */
	private saveToStorage() {
		if (this.token && this.user) {
			localStorage.setItem("auth_token", this.token);
			localStorage.setItem("auth_user", JSON.stringify(this.user));
		} else {
			localStorage.removeItem("auth_token");
			localStorage.removeItem("auth_user");
		}
	}

	/**
	 * Login user
	 */
	login(user: User, token: string) {
		this.user = user;
		this.token = token;
		this.saveToStorage();
	}

	/**
	 * Logout user
	 */
	logout() {
		this.user = null;
		this.token = null;
		this.saveToStorage();
	}

	/**
	 * Set loading state
	 */
	setLoading(loading: boolean) {
		this.isLoading = loading;
	}
}
```

#### Create the UI Store

The UI store will manage client-side UI state like theme preferences. Create src/app/stores/ui.store.ts:

```typescript
import { makeAutoObservable } from "mobx";

type Theme = "light" | "dark";

export class UIStore {
	theme: Theme = "light";
	sidebarCollapsed = false;

	constructor() {
		makeAutoObservable(this);
		// Load theme from localStorage
		this.loadTheme();
	}

	/**
	 * Load theme from localStorage
	 */
	private loadTheme() {
		const savedTheme = localStorage.getItem("theme") as Theme;
		if (savedTheme) {
			this.theme = savedTheme;
			this.applyTheme();
		}
	}

	/**
	 * Toggle theme between light and dark
	 */
	toggleTheme() {
		this.theme = this.theme === "light" ? "dark" : "light";
		localStorage.setItem("theme", this.theme);
		this.applyTheme();
	}

	/**
	 * Apply theme to document
	 */
	private applyTheme() {
		if (this.theme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}

	/**
	 * Toggle sidebar collapsed state
	 */
	toggleSidebar() {
		this.sidebarCollapsed = !this.sidebarCollapsed;
	}
}
```

#### Create the Root Store and Supporting Files

The root store combines all stores and provides them via React Context. To avoid eslint issues, we will be splitting it into useStore.ts, root.store.tsx, and store-context.ts. Create the files:

```bash
touch src/app/stores/store-context.ts src/app/stores/useStore.ts root.store.tsx
```

**src/app/stores/store-context.ts:**

```typescript
import { createContext } from "react";
import { AuthStore } from "./auth.store";
import { UIStore } from "./ui.store";
import GameStore from "./game.store";

/**
 * Root store that combines all MobX stores
 */
class RootStore {
	authStore: AuthStore;
	uiStore: UIStore;
	gameStore: GameStore;

	constructor() {
		this.authStore = new AuthStore();
		this.uiStore = new UIStore();
		this.gameStore = new GameStore();
	}
}

// Create singleton instance
export const rootStore = new RootStore();

// Create React Context
export const StoreContext = createContext<RootStore>(rootStore);
```

**src/app/stores/useStore.ts:**

```typescript
import { useContext } from "react";
import { StoreContext } from "./store-context";

/**
 * Hook to access stores in components
 */
export const useStore = () => {
	const context = useContext(StoreContext);
	if (!context) {
		throw new Error("useStore must be used within StoreProvider");
	}
	return context;
};
```

**src/app/stores/root.store.tsx:**

```typescript
import { type ReactNode } from "react";
import { StoreContext, rootStore } from "./store-context";

/**
 * Provider component to wrap app with stores
 */
export const StoreProvider = ({ children }: { children: ReactNode }) => {
	return (
		<StoreContext.Provider value={rootStore}>
			{children}
		</StoreContext.Provider>
	);
};
```

#### Wrap Your App with the Store Provider

Update src/main.tsx to include the StoreProvider:

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./shared/styles/index.css";
import { Button } from "./shared/components/ui/button";
import { StoreProvider } from "./app/stores/root.store";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<StoreProvider>
			<p className="text-red-500">Hello</p>
			<Button className="cursor-pointer" variant={"destructive"}>
				Testing
			</Button>
		</StoreProvider>
	</StrictMode>
);
```

#### Test the Store

Let's quickly test that MobX is working. Update your main.tsx temporarily to test the theme toggle:

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { observer } from "mobx-react-lite";
import "./shared/styles/index.css";
import { Button } from "./shared/components/ui/button";
import { StoreProvider, useStore } from "./app/stores/root.store";

const TestComponent = observer(() => {
	const { uiStore } = useStore();

	return (
		<div className="p-4">
			<p className="text-red-500 mb-4">Current theme: {uiStore.theme}</p>
			<Button onClick={() => uiStore.toggleTheme()}>Toggle Theme</Button>
		</div>
	);
});

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<StoreProvider>
			<TestComponent />
		</StoreProvider>
	</StrictMode>
);
```

Click the button and you should see the theme text change between "light" and "dark", as well as the background, and if you refresh the page, the changes should persist. This confirms MobX is working!

**_Key MobX Concepts:_**

-   makeAutoObservable: Makes all properties observable and all methods actions automatically
-   observer: HOC that makes React components reactive to MobX state changes
-   useStore hook: Provides access to stores throughout your component tree

Now that we have state management set up, we can proceed with routing that will use these stores for authentication.

### Router Setup

Now that we have our state management in place, we can set up routing. The authentication guard will use the `authStore` we just created to protect routes.

But before we get to that, let's first install a routing library. There are many to choose from, but for this setup, we will go with React Router. Note that React Router has three primary "modes" for establishing routes - Declarative, Data, and Framework. We will be setting up a Data Mode Router.

Install it and prepare a routing config, routing folder, and routing guards with this command:

```bash
bun add react-router && mkdir -p src/config && touch src/config/routes.config.tsx && mkdir -p src/app/router/guards && touch src/app/router/index.tsx src/app/router/guards/auth.guard.tsx
```

Next we need to also setup some base pages to route between. Create a pages folder with the necessary files:

```bash
mkdir src/pages && touch src/pages/Login.tsx src/pages/Register.tsx src/pages/Game.tsx src/pages/Leaderboard.tsx src/pages/MyStats.tsx src/pages/Settings.tsx
```

For scaffolding these files and an improved developer experience, we recommend installing the VS Code extension 'ES7+ React/Redux/React-Native snippets' by dsznajder. Once installed you can go into the Game.tsx file and type 'rafce' and press Enter - this will create boilerplate for the file and its export.

Ensure it looks like this:

```typescript
const Game = () => {
	return <div>Game</div>;
};

export default Game;
```

Repeat the process for the other files.

**Login.tsx:**

```typescript
const Login = () => {
	return <div>Login</div>;
};

export default Login;
```

**Register.tsx:**

```typescript
const Register = () => {
	return <div>Register</div>;
};

export default Register;
```

**Leaderboard.tsx:**

```typescript
const Leaderboard = () => {
	return <div>Leaderboard</div>;
};

export default Leaderboard;
```

**MyStats.tsx:**

```typescript
const MyStats = () => {
	return <div>My Stats</div>;
};

export default MyStats;
```

**Settings.tsx:**

```typescript
const Settings = () => {
	return <div>Settings</div>;
};

export default Settings;
```

This will be the entirety of our routes for this app. Now we need to establish a Router configuration and guards.

First, let's install react-icons for our navigation icons:

```bash
bun add react-icons
```

#### Create Route Configuration

In **src/config/routes.config.tsx**, create a centralised route configuration:

```typescript
import { type ReactNode, type ComponentType } from "react";
/**
 * Visit https://react-icons.github.io/react-icons/ to search for an icon of your liking
 */
import { HiMiniSquares2X2, HiCog6Tooth } from "react-icons/hi2";
import { RiLoginBoxLine, RiUserAddLine } from "react-icons/ri";
import { IoGameController } from "react-icons/io5";
import { FaTrophy, FaChartLine } from "react-icons/fa";

// Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Game from "@/pages/Game";
import Leaderboard from "@/pages/Leaderboard";
import MyStats from "@/pages/MyStats";
import Settings from "@/pages/Settings";

/**
 * Route configuration interface
 */
export interface RouteConfig {
	name: string;
	path: string;
	icon?: ReactNode;
	component: ComponentType;
	requiresAuth: boolean;
	showInSidebar: boolean;
}

/**
 * Application routes configuration
 */
export const ROUTES_CONFIG: RouteConfig[] = [
	// Public routes
	{
		name: "Login",
		path: "/login",
		icon: <RiLoginBoxLine />,
		component: Login,
		requiresAuth: false,
		showInSidebar: false,
	},
	{
		name: "Register",
		path: "/register",
		icon: <RiUserAddLine />,
		component: Register,
		requiresAuth: false,
		showInSidebar: false,
	},

	// Protected routes
	{
		name: "Play",
		path: "/",
		icon: <IoGameController />,
		component: Game,
		requiresAuth: false, // Game is public but shows different features when logged in
		showInSidebar: true,
	},
	{
		name: "Leaderboard",
		path: "/leaderboard",
		icon: <FaTrophy />,
		component: Leaderboard,
		requiresAuth: false, // Leaderboard is public
		showInSidebar: true,
	},
	{
		name: "My Stats",
		path: "/stats",
		icon: <FaChartLine />,
		component: MyStats,
		requiresAuth: true, // Only logged in users can see their stats
		showInSidebar: true,
	},
	{
		name: "Settings",
		path: "/settings",
		icon: <HiCog6Tooth />,
		component: Settings,
		requiresAuth: true,
		showInSidebar: true,
	},
];

/**
 * Helper function to get routes to show in sidebar navigation
 */
export const getSidebarRoutes = (): RouteConfig[] => {
	return ROUTES_CONFIG.filter((route) => route.showInSidebar);
};

/**
 * Helper function to check if a route requires authentication
 */
export const isProtectedRoute = (path: string): boolean => {
	const route = ROUTES_CONFIG.find((r) => r.path === path);
	return route?.requiresAuth ?? true;
};
```

This configuration file:

-   Defines all routes in one place
-   Specifies which routes require authentication
-   Includes icons for sidebar navigation
-   Makes it easy to add new routes later

#### Create Authentication Guard

Next, create an authentication guard in **src/app/router/guards/auth.guard.tsx**:

```typescript
import { Navigate, useLocation } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/stores/useStore";

/**
 * Protected Route Guard
 * Redirects to login if user is not authenticated
 */
export const ProtectedRoute = observer(
	({ children }: { children: React.ReactNode }) => {
		const { authStore } = useStore();
		const location = useLocation();

		if (!authStore.isAuthenticated) {
			// Redirect to login, but save the location they were trying to access
			return <Navigate to="/login" state={{ from: location }} replace />;
		}

		return <>{children}</>;
	}
);
```

This guard will redirect unauthenticated users to the login page when they try to access protected routes. Notice how it uses the `authStore.isAuthenticated` getter we defined earlier.

#### Create the Router

Now create the main router in **src/app/router/index.tsx**:

```typescript
import { createBrowserRouter, Navigate } from "react-router";
import { ROUTES_CONFIG } from "@/config/routes.config";
import { ProtectedRoute } from "./guards/auth.guard";
import AppLayout from "@/shared/components/layout/AppLayout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

/**
 * Generate router from configuration
 */
const generateRouter = () => {
	return createBrowserRouter([
		// Auth routes (no layout)
		{
			path: "/login",
			element: <Login />,
		},
		{
			path: "/register",
			element: <Register />,
		},

		// All other routes use the layout
		{
			path: "/",
			element: <AppLayout />,
			children: ROUTES_CONFIG.filter(
				(r) => r.path !== "/login" && r.path !== "/register"
			).map((route) => {
				const element = <route.component />;

				return {
					path: route.path === "/" ? "" : route.path,
					element: route.requiresAuth ? (
						<ProtectedRoute>{element}</ProtectedRoute>
					) : (
						element
					),
				};
			}),
		},

		// Catch-all redirect
		{
			path: "*",
			element: <Navigate to="/" replace />,
		},
	]);
};

export const router = generateRouter();
```

This router:

-   Separates public routes (login, register, game, leaderboard) from protected routes (stats, settings)
-   Wraps protected routes with the authentication guard (causing redirect in attempting non-public pages when not logged in)
-   Applies a layout to authenticated pages using React Router's `Outlet` component for nested routing
-   Redirects any unknown routes to the game page

#### Create the App Layout

Before working on the router, we need to create the layout component so pages can share a structure. Create the folder and file:

```bash
mkdir -p src/shared/components/layout && touch src/shared/components/layout/AppLayout.tsx
```

Now create **src/shared/components/layout/AppLayout.tsx**:

```typescript
import { Outlet, Link, useLocation } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/stores/useStore";
import { getSidebarRoutes } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";

const AppLayout = observer(() => {
	const { authStore, uiStore } = useStore();
	const location = useLocation();
	const sidebarRoutes = getSidebarRoutes();

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
				<div className="mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<h1 className="text-xl font-bold text-gray-900 dark:text-white">
							Reaction Clicker
						</h1>
						<div className="flex items-center gap-4">
							<Button
								variant="outline"
								size="sm"
								onClick={() => uiStore.toggleTheme()}
							>
								{uiStore.theme === "light" ? "🌙" : "☀️"}
							</Button>
							{authStore.isAuthenticated ? (
								<div className="flex items-center gap-2">
									<span className="text-sm text-gray-600 dark:text-gray-300">
										{authStore.user?.username || "Guest"}
									</span>
									<Button
										variant="outline"
										size="sm"
										onClick={() => authStore.logout()}
									>
										Logout
									</Button>
								</div>
							) : (
								<Link to="/login">
									<Button variant="outline" size="sm">
										Login
									</Button>
								</Link>
							)}
						</div>
					</div>
				</div>
			</header>
			<div className="flex">
				<aside className="w-64 bg-white dark:bg-gray-800 min-h-[calc(100vh-4rem)] border-r border-gray-200 dark:border-gray-700">
					<nav className="p-4 space-y-2">
						{sidebarRoutes.map((route) => {
							const isActive = location.pathname === route.path;
							const requiresAuth = route.requiresAuth;
							const canAccess =
								!requiresAuth || authStore.isAuthenticated;

							if (!canAccess) return null;

							return (
								<Link
									key={route.path}
									to={route.path}
									className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
										isActive
											? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
											: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
									}`}
								>
									<span className="text-lg">
										{route.icon}
									</span>
									<span className="font-medium">
										{route.name}
									</span>
								</Link>
							);
						})}
					</nav>
				</aside>
				<main className="flex-1 p-8">
					<Outlet />
				</main>
			</div>
		</div>
	);
});

export default AppLayout;
```

This layout component:

-   Uses MobX stores (`observer` HOC) for reactivity with theme and auth state
-   Displays a header with theme toggle and login/logout button
-   Shows a sidebar with navigation links based on our route configuration
-   Conditionally shows routes based on authentication status
-   Highlights the active route using React Router's `useLocation` hook
-   Uses `<Outlet />` to render child routes
-   Supports dark mode through Tailwind's dark mode classes

**Note:** We could further componetise this with a separate Navbar and Sidebar component.

#### Connect the Router to Your App

Finally, update **src/main.tsx** to use the router:

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "./shared/styles/index.css";
import { StoreProvider } from "./app/stores/root.store";
import { router } from "./app/router";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<StoreProvider>
			<RouterProvider router={router} />
		</StoreProvider>
	</StrictMode>
);
```

#### Test the Router

Now run `bun run dev` and navigate to http://127.0.0.1:3000. You'll see the Game page (since it's our home route and doesn't require auth). You can navigate between Play and Leaderboard without logging in.

If you try to navigate to `/stats` or `/settings`, you'll be redirected back to `/login` because these routes require authentication.

**Testing Protected Routes:**

To temporarily test the protected routes and see how the navigation changes when logged in, update your **src/pages/Login.tsx**:

```typescript
import { useStore } from "@/app/stores/useStore";
import { useNavigate } from "react-router";
import { Button } from "@/shared/components/ui/button";

const Login = () => {
	const { authStore } = useStore();
	const navigate = useNavigate();

	const handleTestLogin = () => {
		authStore.login(
			{
				id: "1",
				email: "test@example.com",
				username: "TestPlayer",
			},
			"fake-token-123"
		);
		navigate("/");
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
			<div className="max-w-md w-full space-y-6 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
				<div className="text-center">
					<h2 className="text-3xl font-bold text-gray-900 dark:text-white">
						Login
					</h2>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
						Temporary test login for development
					</p>
				</div>
				<Button onClick={handleTestLogin} className="w-full" size="lg">
					Test Login
				</Button>
			</div>
		</div>
	);
};

export default Login;
```

#### Add Page Titles

You may notice that the title of the tab is simply "Vite + React" with the default Vite icon and doesn't update as we move between pages. This is because we have not yet configured React Helmet Async for dynamic page titles. For the purposes of this tutorial, we will keep the default Vite icon, but you can adjust your favicon by changing the path (and type) of your image via this line in your index.html:

```html
<link rel="icon" type="image/svg+xml" href="/vite.svg" />
```

As for titles, begin by installing React Helmet Async:

```bash
bun add react-helmet-async
```

Next, wrap the Router with the HelmetProvider component and remove StrictMode component. Update **src/main.tsx**:

```typescript
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "./shared/styles/index.css";
import { StoreProvider } from "./app/stores/root.store";
import { router } from "./app/router";
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")!).render(
	<StoreProvider>
		<HelmetProvider>
			<RouterProvider router={router} />
		</HelmetProvider>
	</StoreProvider>
);
```

To avoid repeating page names and metadata, it's a good practice to create a reusable component that uses the route configuration. Create **src/shared/components/layout/PageHead.tsx**:

```bash
	touch src/shared/components/layout/PageHead.tsx
```

```typescript
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router";
import { ROUTES_CONFIG } from "@/config/routes.config";

interface PageHeadProps {
	title?: string;
	description?: string;
}

export const PageHead = ({ title, description }: PageHeadProps) => {
	const location = useLocation();

	// Find route config for current page if title not provided
	const route = ROUTES_CONFIG.find((r) => r.path === location.pathname);
	const pageTitle = title || route?.name || "Reaction Clicker";
	const appName = "Reaction Clicker";
	const fullTitle =
		pageTitle === appName ? appName : `${pageTitle} | ${appName}`;

	return (
		<Helmet>
			<title>{fullTitle}</title>
			{description && <meta name="description" content={description} />}
		</Helmet>
	);
};
```

Now update your pages to use this component. For example, **src/pages/Game.tsx**:

```typescript
import { PageHead } from "@/shared/components/layout/PageHead";

const Game = () => {
	return (
		<>
			<PageHead />
			<p>Game</p>
		</>
	);
};

export default Game;
```

The `PageHead` component automatically pulls the page name from `ROUTES_CONFIG` based on the current route, so you don't need to manually specify the title unless you want to override it. For pages with custom titles, you can pass them explicitly:

```typescript
<PageHead title="Custom Title" description="Custom description for SEO" />
```

Repeat this pattern for all your pages (Leaderboard, MyStats, Settings). The Login and Register pages can also use `PageHead` since they're in the routes config.

Now when you navigate between pages, you'll see the browser tab title update automatically to match each page (e.g., "Play | Reaction Clicker", "Leaderboard | Reaction Clicker", etc.).

**Testing the Complete Setup:**

Now when you visit the app:

1. You'll land on the Game page with the title "Play | Reaction Clicker"
2. The layout includes a header with theme toggle and a sidebar with navigation
3. Notice the sidebar only shows "Play" and "Leaderboard" (public routes)
4. Click the "Login" button in the header to see the login page (no layout)
5. Click "Test Login" and you'll be redirected back to the game
6. Now the sidebar shows all routes including "My Stats" and "Settings"
7. The header displays your username and a "Logout" button
8. Try the theme toggle button (moon/sun icon) - the theme persists across page refreshes
9. Navigate between pages and watch the tab title update automatically
10. Click "Logout" and the sidebar updates to hide protected routes

**Note**: This router setup provides a solid foundation. As you progress through this guide, you'll add real authentication with API calls, proper form handling with React Hook Form and Zod, and backend integration with TanStack Query. The `PageHead` component can be extended to include other metadata like OpenGraph tags, Twitter cards, and canonical URLs for production applications.

## Building the Game

Now that we have our web app foundation in place (styling, state management, and routing), we can start building the actual game. We'll create the game mechanics, UI components, and eventually connect it to a backend for persistence and leaderboards.

### Game Requirements

Our Reaction Clicker game will have the following features:

**Core Gameplay:**

-   Timer starts at 5 seconds
-   Targets appear randomly on the screen / game area
-   Players must click targets
-   Each successful click awards points and 1 second to timer by default
-   Each unsuccessful click reduces timer 2 seconds by default
-   Faster clicks = more points (bonus multiplier)

**Game State:**

-   Idle (waiting to start)
-   Playing (active gameplay)
-   Paused (temporary stop)
-   Game Over (results screen and retry)

**Difficulty:**

-   Easy: Larger targerts, reward +2 secs to timer, penalty -1 secs to timer
-   Normal: Standard targets, reward +1 secs to timer, penalty -2 secs to timer
-   Hard: Tiny targets, reward +0.5secs to timer, penalty -3 secs to timer

### Game Store

First, let's create a MobX store to manage game state. Create the game store:

```bash
touch src/app/stores/game.store.ts
```

**src/app/stores/game.store.ts:**

```typescript
import { makeAutoObservable } from "mobx";

export type GameState = "idle" | "playing" | "paused" | "gameOver";
export type Difficulty = "easy" | "normal" | "hard";

export interface Target {
	id: string;
	x: number;
	y: number;
	createdAt: number;
}

export interface GameStats {
	score: number;
	hits: number;
	misses: number;
	accuracy: number;
	highestCombo: number;
}

export default class GameStore {
	gameState: GameState = "idle"; // Default to idle
	difficulty: Difficulty = "normal"; // Default to normal
	score = 0;
	timeRemainingMs = 5000; // Store in milliseconds internally
	targets: Target[] = [];
	currentCombo = 0;
	highestCombo = 0;
	hits = 0;
	misses = 0;
	boardDimensions = { width: 0, height: 0 };

	private difficultySettings = {
		// size of target, time reward if succeed, time penalty if fail
		easy: { targetSize: 80, reward: 2000, penalty: 1000 },
		normal: { targetSize: 60, reward: 1000, penalty: 2000 },
		hard: { targetSize: 40, reward: 500, penalty: 3000 },
	};

	constructor() {
		makeAutoObservable(this);
	}

	// Get current difficulty settings based on current set difficulty
	get settings() {
		return this.difficultySettings[this.difficulty];
	}

	// Calculate accuracy percentage
	get accuracy() {
		const total = this.hits + this.misses;
		return total === 0 ? 0 : Math.round((this.hits / total) * 100);
	}

	setBoardDimensions = (width: number, height: number) => {
		this.boardDimensions = { width, height };
	};

	// DRY Principle - helper function to prevent repetition between startGame and resetGame function
	softReset = (state: GameState) => {
		this.gameState = state;
		this.score = 0;
		this.timeRemainingMs = 5000;
		this.targets = [];
		this.currentCombo = 0;
		this.highestCombo = 0;
		this.hits = 0;
		this.misses = 0;
	};

	// New Target
	spawnTarget = () => {
		// Fallback to window size if dimensions aren't set yet,
		// but usually, we'll have these from the component
		const { width, height } = this.boardDimensions;

		// Use a default or window size if dimensions are 0 (prevents targets stuck at 0,0)
		const boardW = width || window.innerWidth;
		const boardH = height || window.innerHeight;

		const targetSize = this.settings.targetSize;
		const padding = 20;

		const maxX = boardW - targetSize - padding;
		const maxY = boardH - targetSize - padding;

		const x = Math.max(padding, Math.floor(Math.random() * maxX));
		const y = Math.max(padding, Math.floor(Math.random() * maxY));

		const target: Target = {
			id: `target-${Date.now()}-${Math.random()}`,
			x,
			y,
			createdAt: Date.now(),
		};

		this.targets = [target];
	};

	// Start Game
	startGame = () => {
		this.softReset("playing");
		this.spawnTarget();
	};

	// Pause Game
	pauseGame = () => {
		// Should only be pausable from play state
		if (this.gameState === "playing") {
			this.gameState = "paused";
		}
	};

	// Resume Game
	resumeGame = () => {
		// Should only be resumable from pause state
		if (this.gameState === "paused") {
			this.gameState = "playing";
		}
	};

	// End Game
	endGame = () => {
		this.gameState = "gameOver";
		this.targets = []; // Clear targets
	};

	// Reset Game
	resetGame = () => {
		this.softReset("idle");
	};

	// Set Difficulty
	setDifficulty = (difficulty: Difficulty) => {
		this.difficulty = difficulty;
	};

	// Remove Target via id
	removeTarget = (id: string) => {
		this.targets = this.targets.filter((t) => t.id !== id);
	};

	// Handle Target Hit
	hitTarget = (targetId: string, reactionTime: number) => {
		this.removeTarget(targetId);
		this.hits++;
		this.currentCombo++;

		// Check high combo
		if (this.currentCombo > this.highestCombo) {
			this.highestCombo = this.currentCombo;
		}

		// Calculate score based on reaction time and combo
		const baseScore = 10;
		const timeBonus = Math.max(0, 50 - reactionTime / 10);
		const comboMultipler = 1 + this.currentCombo * 0.1;
		const points = Math.round((baseScore + timeBonus) * comboMultipler);

		// Handle rewards
		this.score += points;
		this.timeRemainingMs += this.settings.reward;

		// Spawn next target immediately
		if (this.gameState === "playing") {
			this.spawnTarget();
		}
	};

	// DRY principle to prevent repeating in below functions
	timeCheck = () => {
		if (this.timeRemainingMs <= 0) {
			this.endGame();
		}
	};

	missTarget = (targetId: string) => {
		this.removeTarget(targetId);
		this.misses++;
		this.currentCombo = 0; // reset
		// Handle timer penalty
		this.timeRemainingMs -= this.settings.penalty;
		this.timeCheck();

		// Spawn next target immediately if game still playing
		if (this.gameState === "playing") {
			this.spawnTarget();
		}
	};

	// Timer
	tick = () => {
		if (this.gameState === "playing" && this.timeRemainingMs > 0) {
			this.timeRemainingMs -= 100;
			this.timeCheck();
		}
	};
}
```

Now update the root store to include the game store:

**src/app/stores/root.store.tsx:**

```typescript
import { createContext, useContext, type ReactNode } from "react";
import { AuthStore } from "./auth.store";
import { UIStore } from "./ui.store";
import { GameStore } from "./game.store";

class RootStore {
	authStore: AuthStore;
	uiStore: UIStore;
	gameStore: GameStore;

	constructor() {
		this.authStore = new AuthStore();
		this.uiStore = new UIStore();
		this.gameStore = new GameStore();
	}
}

const rootStore = new RootStore();
const StoreContext = createContext<RootStore>(rootStore);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
	return (
		<StoreContext.Provider value={rootStore}>
			{children}
		</StoreContext.Provider>
	);
};

export const useStore = () => {
	const context = useContext(StoreContext);
	if (!context) {
		throw new Error("useStore must be used within StoreProvider");
	}
	return context;
};
```

This game store manages all the game state including:

-   Current game state (idle, playing, paused, gameOver)
-   Difficulty settings
-   Score tracking
-   Target management
-   Combo system
-   Statistics calculation

In the next section, we'll build the game UI components and implement the game loop.

### Game Hooks

First, let's create custom hooks to manage the game loop and target spawing logic. This will involve creating our first feature for organisation

```bash
mkdir -p src/features/game/hooks && touch src/features/game/hooks/useGameLoop.ts
```

**src/features/game/hooks/useGameLoop.ts:**

```typescript
import { useEffect, useRef } from "react";
import { useStore } from "@/app/stores/useStore";

/**
 * Custom hook to manage the game timer
 * Ticks 10 times per second when game is in playing state
 */
export const useGameLoop = () => {
	const { gameStore } = useStore();
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		// Only run timer when game is playing
		if (gameStore.gameState === "playing") {
			intervalRef.current = setInterval(() => {
				gameStore.tick();
			}, 100); // Tick ten times every second
		}

		// Cleanup interval when game state changes or component unmounts
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [gameStore, gameStore.gameState]);
};
```

You may notice an error for ReturnType type - adjust your tsconfig.app.json so that this typescript issue is resolved:

```typescript
		// ... existing settings remain the same, simply add "node" to the array for types
		"types": ["vite/client", "node"],
```

### Game Components

With our store and loop in place, we just need to create the components that will use them. We will need the following components:

-   GameBoard.tsx (play area where the targets will spawn)
-   Target.tsx. (instances that spawn in the play area)
-   GameHUD.tsx
-   GameOverModal.tsx
-   DifficultySelector.tsx

Run this command to create them:

```bash
mkdir -p src/features/game/components && touch src/features/game/components/Target.tsx src/features/game/components/GameBoard.tsx src/features/game/components/GameHUD.tsx src/features/game/components/GameOverModal.tsx src/features/game/components/DifficultySelector.tsx
```

Note that with MobX each component will need to be wrapped with the observer function to 'watch' the store for changes and access global functions.

All components will need to access the store to:

-   Target: grab the size it should be as well as to access the hitTarget function.
-   GameBoard: determine the area that targets can spawn, set that area on resize, handle misses, draw targets, and show pause screen on pause game state
-   GameHUD: display score, time remaining, combos, accuracy, display button for pausing and resuming based on current game state
-   DifficultySelector: display mapped difficulties and set difficulty globally - impacts other components
-   GameOverModal: access game state, display score, hits, misses, accuracy and highest combo, as well as set the state by accessing start game and reset game functions

You can find the code for these components below:

**src/features/game/components/Target.tsx:**

```typescript
import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/stores/useStore";
import type { Target as TargetType } from "@/app/stores/game.store";

interface TargetProps {
	target: TargetType;
}

export const Target = observer(({ target }: TargetProps) => {
	const { gameStore } = useStore();
	const [isClicked, setIsClicked] = useState(false);

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (isClicked) return;
		setIsClicked(true);

		const reactionTime = Date.now() - target.createdAt;
		gameStore.hitTarget(target.id, reactionTime);
	};

	const size = gameStore.settings.targetSize;

	return (
		<button
			onClick={handleClick}
			disabled={isClicked}
			style={{
				position: "absolute",
				left: `${target.x}px`,
				top: `${target.y}px`,
				width: `${size}px`,
				height: `${size}px`,
			}}
			className={`
				rounded-full bg-red-500 hover:bg-red-600 
				transition-colors
				flex items-center justify-center
				text-white font-bold shadow-lg
				${!isClicked && "hover:scale-110 active:scale-95 cursor-pointer"}
				${isClicked ? "pointer-events-none opacity-0 scale-0" : ""}
			`}
		>
			<span className="text-2xl">🎯</span>
		</button>
	);
});
```

**src/features/game/components/GameBoard.tsx:**

```typescript
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/stores/useStore";
import { Target } from "./Target";
import { useGameLoop } from "../hooks/useGameLoop";
import { useEffect, useRef } from "react";

export const GameBoard = observer(() => {
	const { gameStore } = useStore();
	const boardRef = useRef<HTMLDivElement>(null);

	// Heartbeat for the timer
	useGameLoop();

	useEffect(() => {
		const updateDimensions = () => {
			if (boardRef.current) {
				// This gives us the exact usable pixel area of the div
				gameStore.setBoardDimensions(
					boardRef.current.clientWidth,
					boardRef.current.clientHeight
				);
			}
		};

		updateDimensions();
		window.addEventListener("resize", updateDimensions);
		return () => window.removeEventListener("resize", updateDimensions);
	}, [gameStore]);

	const handleBoardClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget && gameStore.gameState === "playing") {
			if (gameStore.targets.length > 0) {
				const targetId = gameStore.targets[0].id;
				gameStore.missTarget(targetId);
			}
		}
	};

	return (
		<div
			ref={boardRef}
			onClick={handleBoardClick}
			className="relative w-full h-[calc(100vh-20rem)] bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-700 cursor-crosshair"
		>
			{gameStore.targets.map((target) => (
				<Target key={target.id} target={target} />
			))}

			{gameStore.gameState === "paused" && (
				<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm pointer-events-none">
					<div className="text-white text-4xl font-bold">PAUSED</div>
				</div>
			)}
		</div>
	);
});
```

**src/features/game/components/GameHUD.tsx:**

```typescript
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/stores/useStore";
import { Button } from "@/shared/components/ui/button";

export const GameHUD = observer(() => {
	const { gameStore } = useStore();

	return (
		<div className="flex justify-between items-center mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
			<div className="flex gap-6">
				<div>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Score
					</p>
					<p className="text-2xl font-bold text-gray-900 dark:text-white">
						{gameStore.score}
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Time
					</p>
					<p className="text-2xl font-bold text-gray-900 dark:text-white">
						{(gameStore.timeRemainingMs / 1000).toFixed(1)}s
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Combo
					</p>
					<p className="text-2xl font-bold text-orange-500">
						{gameStore.currentCombo}x
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Accuracy
					</p>
					<p className="text-2xl font-bold text-blue-500">
						{gameStore.accuracy}%
					</p>
				</div>
			</div>
			<div className="flex gap-2">
				{gameStore.gameState === "playing" && (
					<Button
						onClick={() => gameStore.pauseGame()}
						variant="outline"
					>
						⏸️ Pause
					</Button>
				)}
				{gameStore.gameState === "paused" && (
					<Button onClick={() => gameStore.resumeGame()}>
						▶️ Resume
					</Button>
				)}
			</div>
		</div>
	);
});
```

**src/features/game/components/DifficultySelector.tsx:**

```typescript
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/stores/useStore";
import type { Difficulty } from "@/app/stores/game.store";

export const DifficultySelector = observer(() => {
	const { gameStore } = useStore();

	const difficulties: {
		value: Difficulty;
		label: string;
		description: string;
	}[] = [
		{
			value: "easy",
			label: "Easy",
			description: "Larger targets, +2s reward, -1s penalty",
		},
		{
			value: "normal",
			label: "Normal",
			description: "Standard targets, +1s reward, -2s penalty",
		},
		{
			value: "hard",
			label: "Hard",
			description: "Tiny targets, +0.5s reward, -3s penalty",
		},
	];

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
				Select Difficulty
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{difficulties.map((diff) => (
					<button
						key={diff.value}
						onClick={() => gameStore.setDifficulty(diff.value)}
						className={`
							p-4 rounded-lg border-2 transition-all text-left
							${
								gameStore.difficulty === diff.value
									? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
									: "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
							}
						`}
					>
						<p className="font-bold text-gray-900 dark:text-white mb-1">
							{diff.label}
						</p>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{diff.description}
						</p>
					</button>
				))}
			</div>
		</div>
	);
});
```

**src/features/game/components/GameOverModal.tsx:**

```typescript
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/stores/useStore";
import { Button } from "@/shared/components/ui/button";

export const GameOverModal = observer(() => {
	const { gameStore } = useStore();

	if (gameStore.gameState !== "gameOver") return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
			<div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
				<h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
					Game Over!
				</h2>

				<div className="space-y-4 mb-6">
					<div className="flex justify-between items-center">
						<span className="text-gray-600 dark:text-gray-400">
							Final Score:
						</span>
						<span className="text-2xl font-bold text-gray-900 dark:text-white">
							{gameStore.score}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-gray-600 dark:text-gray-400">
							Hits:
						</span>
						<span className="text-lg font-semibold text-green-500">
							{gameStore.hits}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-gray-600 dark:text-gray-400">
							Misses:
						</span>
						<span className="text-lg font-semibold text-red-500">
							{gameStore.misses}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-gray-600 dark:text-gray-400">
							Accuracy:
						</span>
						<span className="text-lg font-semibold text-blue-500">
							{gameStore.accuracy}%
						</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-gray-600 dark:text-gray-400">
							Highest Combo:
						</span>
						<span className="text-lg font-semibold text-orange-500">
							{gameStore.highestCombo}x
						</span>
					</div>
				</div>

				<div className="flex gap-3">
					<Button
						onClick={() => gameStore.startGame()}
						className="flex-1"
						size="lg"
					>
						Play Again
					</Button>
					<Button
						onClick={() => gameStore.resetGame()}
						variant="outline"
						className="flex-1"
						size="lg"
					>
						Main Menu
					</Button>
				</div>
			</div>
		</div>
	);
});
```

## Settings Page and Validation

Now that we have our game working, let's build a proper Settings page to demonstrate form handling with React Hook Form and validation with Zod. This will teach you patterns you'll reuse for authentication forms later.

### Install Dependencies

First, install React Hook Form and Zod:

```bash
bun add react-hook-form zod @hookform/resolvers
```

-   **react-hook-form:** Performant forms with minimal re-renders
-   **zod:** TypeScript-first schema validation
-   **@hookform/resolvers:** Connects Zod validation to React Hook Form

### Create Settings Schema

Create a Zod schema to define and validate the settings form structure:

```bash
mkdir -p src/features/settings/schemas && touch src/features/settings/schemas/settings.schema.ts
```

**src/features/settings/schemas/settings.schema.ts:**

```typescript
import { z } from "zod";

/**
 * Settings form validation schema
 */
export const settingsSchema = z.object({
	// User preferences
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(20, "Username must be less than 20 characters")
		.regex(
			/^[a-zA-Z0-9_-]+$/,
			"Username can only contain letters, numbers, underscores, and hyphens"
		),

	email: z
		.string()
		.email("Invalid email address")
		.min(1, "Email is required"),

	// Game preferences
	defaultDifficulty: z.enum(["easy", "normal", "hard"], {
		message: "Please select a difficulty",
	}),

	soundEnabled: z.boolean(),

	// UI preferences
	theme: z.enum(["light", "dark"], {
		message: "Please select a theme",
	}),
});

/**
 * TypeScript type inferred from schema
 */
export type SettingsFormData = z.infer<typeof settingsSchema>;
```

This schema:

-   Validates username length and allowed characters
-   Ensures email is properly formatted
-   Restricts difficulty and theme to specific values
-   Provides clear error messages

### Create Settings Type

```bash
mkdir -p src/features/settings/types && touch src/features/settings/types/settings.types.ts
```

**src/features/settings/types/settings.types.ts:**

```typescript
import type { Difficulty } from "@/app/stores/game.store";

export interface UserSettings {
	username: string;
	email: string;
	defaultDifficulty: Difficulty;
	soundEnabled: boolean;
	theme: "light" | "dark";
}
```

### Update UIStore for Settings

We need to persist some settings. Update the UI store to handle game preferences:
**src/app/stores/ui.store.ts:**

```typescript
import { makeAutoObservable } from "mobx";

type Theme = "light" | "dark";

export class UIStore {
	theme: Theme = "light";
	sidebarCollapsed = false;
	soundEnabled = true;

	constructor() {
		makeAutoObservable(this);
		// Load theme from localStorage
		this.loadTheme();
		// Load sound preference from localStorage
		this.loadSoundPreference();
	}

	/**
	 * Load from localStorage
	 */
	private loadTheme = () => {
		const savedTheme = localStorage.getItem("theme") as Theme;
		if (savedTheme) {
			this.theme = savedTheme;
			this.applyTheme();
		}
	};

	private loadSoundPreference = () => {
		const savedSound = localStorage.getItem("soundEnabled");
		if (savedSound !== null) {
			this.soundEnabled = savedSound === "true";
		}
	};

	/**
	 * Toggle theme between light and dark
	 */
	toggleTheme = () => {
		this.theme = this.theme === "light" ? "dark" : "light";
		localStorage.setItem("theme", this.theme);
		this.applyTheme();
	};

	/**
	 * Apply theme to document
	 */
	private applyTheme = () => {
		if (this.theme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	};

	/**
	 * Toggle sidebar collapsed state
	 */
	toggleSidebar = () => {
		this.sidebarCollapsed = !this.sidebarCollapsed;
	};

	// Direct setters
	setSoundEnabled = (enabled: boolean) => {
		this.soundEnabled = enabled;
		localStorage.setItem("soundEnabled", String(enabled));
	};

	setTheme = (theme: Theme) => {
		this.theme = theme;
		localStorage.setItem("theme", this.theme);
		this.applyTheme();
	};
}
```

### Update GameStore for Default Difficulty

**src/app/stores/game.store.ts** -- Add this near the top of the file:

```typescript
	...

	constructor() {
		makeAutoObservable(this);
		this.loadDefaultDifficulty();
	}

	private loadDefaultDifficulty = () => {
		const savedDifficulty = localStorage.getItem(
			"defaultDifficulty"
		) as Difficulty;
		if (savedDifficulty) {
			this.difficulty = savedDifficulty;
		}
	};
	...

	// Adjust the set difficulty method

	// Set Difficulty
	setDifficulty = (difficulty: Difficulty, saveAsDefault = false) => {
		this.difficulty = difficulty;
		if (saveAsDefault) {
			localStorage.setItem("defaultDifficulty", difficulty);
		}
	};
```

### Create Settings Form Component

Now, let's build the form component itself.

```bash
mkdir -p src/features/settings/components && touch src/features/settings/components/SettingsForm.tsx
```

We will also need some help from shadcn:

```bash
bunx shadcn@latest add input label sonner
```

Once we have installed those, add the Toaster to the app by updaing main.tsx:

```typescript
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "./shared/styles/index.css";
import { StoreProvider } from "./app/stores/root.store";
import { router } from "./app/router";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
	<StoreProvider>
		<HelmetProvider>
			<RouterProvider router={router} />
			<Toaster position="top-right" richColors />
		</HelmetProvider>
	</StoreProvider>
);
```

Next we will need to adjust the authStore so that we dont directly modify the store, but instead use a store method - this is to prevent MobX from complaining in strict mode:

**src/app/stores/auth.store.ts:**

```typescript
	...
	// Add this method
	updateUser(username: string, email: string) {
		if (this.user) {
			this.user = {
				...this.user,
				username,
				email,
			};
			this.saveToStorage();
		}
	}
```

And now we make the component SettingsForm.tsx:

**src/features/settings/components/SettingsForm.tsx:**

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/stores/useStore";
import {
	settingsSchema,
	type SettingsFormData,
} from "../schemas/settings.schema";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { toast } from "sonner";

export const SettingsForm = observer(() => {
	const { authStore, uiStore, gameStore } = useStore();

	// Initialise form with default values from stores
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<SettingsFormData>({
		resolver: zodResolver(settingsSchema),
		defaultValues: {
			username: authStore.user?.username || "",
			email: authStore.user?.email || "",
			defaultDifficulty: gameStore.difficulty,
			soundEnabled: uiStore.soundEnabled,
			theme: uiStore.theme,
		},
	});

	const onSubmit = async (data: SettingsFormData) => {
		try {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Update stores with new values using actions
			authStore.updateUser(data.username, data.email);
			gameStore.setDifficulty(data.defaultDifficulty, true);
			uiStore.setSoundEnabled(data.soundEnabled);
			uiStore.setTheme(data.theme);

			toast.success("Settings saved successfully!");
		} catch (error) {
			toast.error("Failed to save settings");
			console.error(error);
		}
	};

	const handleReset = () => {
		reset({
			username: authStore.user?.username || "",
			email: authStore.user?.email || "",
			defaultDifficulty: gameStore.difficulty,
			soundEnabled: uiStore.soundEnabled,
			theme: uiStore.theme,
		});
		toast.info("Form reset to current values");
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			{/* User Information Section */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
					User Information
				</h2>

				<div className="space-y-2">
					<Label htmlFor="username">Username</Label>
					<Input
						id="username"
						{...register("username")}
						placeholder="Enter your username"
						className={errors.username ? "border-red-500" : ""}
					/>
					{errors.username && (
						<p className="text-sm text-red-500">
							{errors.username.message}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						{...register("email")}
						placeholder="Enter your email"
						className={errors.email ? "border-red-500" : ""}
					/>
					{errors.email && (
						<p className="text-sm text-red-500">
							{errors.email.message}
						</p>
					)}
				</div>
			</div>

			{/* Game Preferences Section */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
					Game Preferences
				</h2>

				<div className="space-y-2">
					<Label htmlFor="defaultDifficulty">
						Default Difficulty
					</Label>
					<select
						id="defaultDifficulty"
						{...register("defaultDifficulty")}
						className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					>
						<option value="easy">Easy</option>
						<option value="normal">Normal</option>
						<option value="hard">Hard</option>
					</select>
					{errors.defaultDifficulty && (
						<p className="text-sm text-red-500">
							{errors.defaultDifficulty.message}
						</p>
					)}
				</div>

				<div className="flex items-center space-x-2">
					<input
						type="checkbox"
						id="soundEnabled"
						{...register("soundEnabled")}
						className="h-4 w-4 rounded border-gray-300"
					/>
					<Label htmlFor="soundEnabled" className="cursor-pointer">
						Enable sound effects
					</Label>
				</div>
			</div>

			{/* UI Preferences Section */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
					Appearance
				</h2>

				<div className="space-y-2">
					<Label>Theme</Label>
					<div className="flex gap-4">
						<label className="flex items-center space-x-2 cursor-pointer">
							<input
								type="radio"
								{...register("theme")}
								value="light"
								className="h-4 w-4"
							/>
							<span className="text-sm">☀️ Light</span>
						</label>
						<label className="flex items-center space-x-2 cursor-pointer">
							<input
								type="radio"
								{...register("theme")}
								value="dark"
								className="h-4 w-4"
							/>
							<span className="text-sm">🌙 Dark</span>
						</label>
					</div>
					{errors.theme && (
						<p className="text-sm text-red-500">
							{errors.theme.message}
						</p>
					)}
				</div>
			</div>

			{/* Form Actions */}
			<div className="flex gap-3 pt-4">
				<Button
					type="submit"
					disabled={isSubmitting}
					className="flex-1"
				>
					{isSubmitting ? "Saving..." : "Save Settings"}
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={handleReset}
					disabled={isSubmitting}
				>
					Reset
				</Button>
			</div>
		</form>
	);
});
```

### Update Settings Page

Finally, update the Settings page to use the form.

**src/psges/Settings.tsx:**

```typescript
import { observer } from "mobx-react-lite";
import { PageHead } from "@/shared/components/layout/PageHead";
import { SettingsForm } from "@/features/settings/components/SettingsForm";

const Settings = observer(() => {
	return (
		<>
			<PageHead />
			<div className="">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
					Settings
				</h1>
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
					<SettingsForm />
				</div>
			</div>
		</>
	);
});

export default Settings;
```

### Test the Settings Page

Now you can test the Settings page:

1. Login (use the test login button)
2. Navigate to Settings from the sidebar
3. Try submitting the form with invalid data:
    - Username with special characters (should show error)
    - Invalid email format (should show error)
    - Leave fields empty (should show validation errors)
4. Fill in valid data and click "Save Settings"
5. You should see a success toast notification
6. Changes are persisted to localStorage
7. Refresh the page - your settings should be preserved
8. You can double-check persistence by nagivating to play - you can see that whatever you set as difficulty will be auto-selected

**Key Concepts Demonstrated**
**React Hook Form:**

-   useForm hook with TypeScript types
-   register function to connect inputs to form state
-   handleSubmit for form submission
-   formState for tracking errors and submission state
-   reset function to restore form values

**Zod Validation:**

-   Schema definition with constraints
-   Custom error messages
-   Type inference with z.infer
-   Integration with React Hook Form via zodResolver

**Form Patterns:**

-   Controlled vs uncontrolled inputs
-   Error display
-   Loading states during submission
-   Form reset functionality
-   Toast notifications for user feedback

You now have a fully functional settings form! These same patterns will be used for the login and register forms when we add real authentication.

## Backend Setup with Axios & Tanstack Query

Now that we have our frontend working with local state, it's time to connect to a backend. We'll configure Axios as our HTTP client with proper error handling, authentication token management, and request/response interceptors.

### Install Dependencies

Now that we have our frontend working with local state, it's time to connect to a backend. We'll configure Axios as our HTTP client and TanStack Query for server state management, caching, and intelligent data fetching.

### Install Dependencies

First, install Axios for HTTP requests and TanStack Query for server state management:

```bash
bun add axios @tanstack/react-query
bun add -D @tanstack/react-query-devtools
```

-   **axios**: HTTP client for making API requests
-   **@tanstack/react-query**: Server state management and caching
-   **@tanstack/react-query-devtools**: Development tools for debugging queries
