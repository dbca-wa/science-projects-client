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

#### Create the Root Store

The root store combines all stores and provides them via React Context. Create src/app/stores/root.store.tsx:

```typescript
import { createContext, useContext, type ReactNode } from "react";
import { AuthStore } from "./auth.store";
import { UIStore } from "./ui.store";

/**
 * Root store that combines all MobX stores
 */
class RootStore {
	authStore: AuthStore;
	uiStore: UIStore;

	constructor() {
		this.authStore = new AuthStore();
		this.uiStore = new UIStore();
	}
}

// Create singleton instance
const rootStore = new RootStore();

// Create React Context
const StoreContext = createContext<RootStore>(rootStore);

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
import { useStore } from "@/app/stores/root.store";

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
-   Wraps protected routes with the authentication guard
-   Applies a layout to authenticated pages using React Router's `Outlet` component for nested routing
-   Redirects any unknown routes to the game page

#### Create the App Layout

Before the router works, we need to create the layout component. Create the folder and file:

```bash
mkdir -p src/shared/components/layout && touch src/shared/components/layout/AppLayout.tsx
```

Now create **src/shared/components/layout/AppLayout.tsx**:

```typescript
import { Outlet, Link, useLocation } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/stores/root.store";
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
import { useStore } from "@/app/stores/root.store";
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

Now when you visit the app:

1. You'll land on the Game page
2. Notice the sidebar only shows "Play" and "Leaderboard"
3. Click the "Login" button in the header
4. Click "Test Login"
5. You'll be redirected back to the game, but now the sidebar shows all routes including "My Stats" and "Settings"
6. The header now shows your username and a "Logout" button
7. Try the theme toggle button (moon/sun icon)
8. Click "Logout" and watch the sidebar update to hide protected routes

**Note**: This router setup is a foundational example. As you progress through this guide, you'll add real authentication with API calls, proper form handling, and more sophisticated features. For now, this gives us a solid routing foundation to build upon.
