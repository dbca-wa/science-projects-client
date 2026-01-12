import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";
import { logger } from "@/shared/services/logger.service";
import { runInAction } from "mobx";
import Cookie from "js-cookie";

interface AuthStoreState extends BaseStoreState {
	isAuthenticated: boolean;
	redirectPath: string | null;
	isNavigating: boolean;
}

export class AuthStore extends BaseStore<AuthStoreState> {
	private navigate?: (
		path: string,
		options?: Record<string, unknown>
	) => void;

	constructor() {
		super({
			isAuthenticated: false,
			redirectPath: null,
			isNavigating: false,
			loading: false,
			error: null,
			initialised: false,
		});

		// Listen for unauthorized events from API client
		if (typeof window !== "undefined") {
			window.addEventListener(
				"auth:unauthorized",
				this.handleUnauthorised.bind(this)
			);
		}
	}

	setNavigate(
		navigate: (path: string, options?: Record<string, unknown>) => void
	): void {
		this.navigate = navigate;
		logger.debug("Navigation handler set for auth store", undefined);
	}

	get isAuthenticated(): boolean {
		return this.state.isAuthenticated;
	}

	get redirectPath(): string | null {
		return this.state.redirectPath;
	}

	get isNavigating(): boolean {
		return this.state.isNavigating;
	}

	async initialise(): Promise<void> {
		// Check if user has valid session cookie
		const hasSession = !!Cookie.get("sessionid");
		const hasCsrf = !!Cookie.get("spmscsrf");

		runInAction(() => {
			this.state.isAuthenticated = hasSession && hasCsrf;
			this.state.initialised = true;
		});

		logger.debug("AuthStore initialised", {
			isAuthenticated: this.state.isAuthenticated,
		});
	}

	login(): void {
		runInAction(() => {
			this.state.isAuthenticated = true;
		});
		logger.info("User logged in", undefined);
	}

	logout(): void {
		runInAction(() => {
			this.state.isAuthenticated = false;
		});

		// Clear cookies
		Cookie.remove("sessionid");
		Cookie.remove("spmscsrf");
		Cookie.remove("csrf");

		logger.info("User logged out", undefined);
		this.navigateAfterLogout();
	}

	setRedirectPath(path: string | null): void {
		runInAction(() => {
			this.state.redirectPath = path;
		});
		logger.debug("Redirect path set", { path });
	}

	clearRedirectPath(): void {
		runInAction(() => {
			this.state.redirectPath = null;
		});
		logger.debug("Redirect path cleared", undefined);
	}

	navigateAfterLogin(): void {
		runInAction(() => {
			this.state.isNavigating = true;
		});

		const targetPath = this.state.redirectPath || "/";

		if (this.navigate) {
			this.navigate(targetPath, { replace: true });
			logger.info("Navigated after login", { targetPath });
		}

		runInAction(() => {
			this.state.redirectPath = null;
			this.state.isNavigating = false;
		});
	}

	navigateAfterLogout(): void {
		runInAction(() => {
			this.state.isNavigating = true;
		});

		if (this.navigate) {
			this.navigate("/auth/login", { replace: true });
			logger.info("Navigated after logout", undefined);
		}

		runInAction(() => {
			this.state.redirectPath = null;
			this.state.isNavigating = false;
		});
	}

	handleUnauthorised(): void {
		logger.warn(
			"Handling unauthorised access - redirecting to login",
			undefined
		);

		// Store current path for redirect after login
		if (typeof window !== "undefined") {
			const currentPath = window.location.pathname;
			if (currentPath !== "/auth/login") {
				this.setRedirectPath(currentPath);
			}
		}

		this.logout();
	}

	reset(): void {
		runInAction(() => {
			this.state.isAuthenticated = false;
			this.state.redirectPath = null;
			this.state.isNavigating = false;
			this.state.loading = false;
			this.state.error = null;
			this.state.initialised = false;
		});

		logger.info("Auth store reset", undefined);
	}

	async dispose(): Promise<void> {
		// Remove event listener
		if (typeof window !== "undefined") {
			window.removeEventListener(
				"auth:unauthorized",
				this.handleUnauthorised.bind(this)
			);
		}
		this.reset();
		logger.info("Auth store disposed", undefined);
	}
}
