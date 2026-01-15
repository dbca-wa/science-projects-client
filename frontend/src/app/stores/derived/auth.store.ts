import type { IUserData } from "@/shared/types/user.types";
import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";
import { logger } from "@/shared/services/logger.service";
import {
	makeObservable,
	observable,
	computed,
	action,
	runInAction,
} from "mobx";
import Cookie from "js-cookie";

interface AuthStoreState extends BaseStoreState {
	isAuthenticated: boolean;
}

export class AuthStore extends BaseStore<AuthStoreState> {
	user: IUserData | null = null;
	private onUnauthorised = this.handleUnauthorised.bind(this);

	constructor() {
		super({
			isAuthenticated: false,
			loading: false,
			error: null,
			initialised: false,
		});

		// methods specific to AuthStore
		// BaseStore already declared its own observables
		makeObservable(this, {
			// Observable properties (new to AuthStore)
			user: observable,

			// Computed properties (new to AuthStore)
			isAuthenticated: computed,
			isSuperuser: computed,

			// Actions (new to AuthStore)
			setUser: action,
			initialise: action,
			login: action,
			logout: action,
			handleUnauthorised: action,
			reset: action,
			dispose: action,
		});

		if (typeof window !== "undefined") {
			window.addEventListener("auth:unauthorized", this.onUnauthorised);
		}
	}

	get isAuthenticated() {
		return this.state.isAuthenticated;
	}

	get isSuperuser() {
		return !!this.user?.is_superuser;
	}

	setUser(user: IUserData | null) {
		runInAction(() => {
			this.user = user;
			// If we have a user, we're authenticated
			// If we don't have a user but have a CSRF token, we might still be authenticated
			const hasCsrf = !!Cookie.get("spmscsrf");
			this.state.isAuthenticated = !!user || hasCsrf;
		});
	}

	async initialise() {
		// Note: sessionid cookie is HttpOnly and cannot be read by JavaScript
		// We can only check for the CSRF token, which is readable
		// The actual session validation will happen when we try to fetch user data
		const hasCsrf = !!Cookie.get("spmscsrf");
		
		logger.info("Auth store initializing", {
			hasCsrf,
			csrfCookie: Cookie.get("spmscsrf"),
			note: "sessionid is HttpOnly and cannot be read by JS",
		});
		
		runInAction(() => {
			// If we have a CSRF token, assume we might be authenticated
			// The actual auth check will happen when components try to fetch user data
			this.state.isAuthenticated = hasCsrf;
			this.state.initialised = true;
		});
		
		logger.info("Auth store initialized", {
			isAuthenticated: this.state.isAuthenticated,
			initialised: this.state.initialised,
		});
	}

	login() {
		runInAction(() => {
			this.state.isAuthenticated = true;
		});
		logger.info("User flagged as logged in (cookies present)");
	}

	logout() {
		runInAction(() => {
			this.state.isAuthenticated = false;
			this.user = null;
		});
		Cookie.remove("sessionid");
		Cookie.remove("spmscsrf");
		Cookie.remove("csrf");
		logger.info("User logged out");
	}

	handleUnauthorised() {
		this.logout();
	}

	reset() {
		runInAction(() => {
			this.state.isAuthenticated = false;
			this.user = null;
			this.state.loading = false;
			this.state.error = null;
			this.state.initialised = false;
		});
		logger.info("Auth store reset");
	}

	async dispose() {
		if (typeof window !== "undefined") {
			window.removeEventListener(
				"auth:unauthorized",
				this.onUnauthorised
			);
		}
		this.reset();
	}
}
