import type { IUserMe } from "@/shared/types/user.types";
import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";
import { logger } from "@/shared/services/logger.service";
import {
	makeObservable,
	observable,
	computed,
	action,
} from "mobx";
import Cookie from "js-cookie";

interface AuthStoreState extends BaseStoreState {
	isAuthenticated: boolean;
}

// Note: Potentially give access to rootstore to impact other stores
export class AuthStore extends BaseStore<AuthStoreState> {
	user: IUserMe | null = null;
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
			isSuperuser: computed,
			setUser: action,
			initialise: action,
			login: action,
			logout: action,
			handleUnauthorised: action,
			reset: action,
			dispose: action,
		});

		if (typeof window !== "undefined") {
			window.addEventListener("auth:unauthorised", this.onUnauthorised);
		}
	}

	/**
	 * @returns True if user is authenticate. Simple.
	 */
	get isAuthenticated() {
		return this.state.isAuthenticated;
	}

	/**
	 * @returns True if authenticated user is a superuser. Computed.
	 */
	get isSuperuser() {
		return !!this.user?.is_superuser;
	}

	/**
	 * Sets the current user and updates authentication state.
	 */
	setUser(user: IUserMe | null) {
		this.user = user;
		const hasCsrf = !!Cookie.get("spmscsrf");
		this.state.isAuthenticated = !!user || hasCsrf;
	}

	/**
	 * Initialises auth store by checking for existing session cookies.
	 * Note: sessionid cookie is HttpOnly and cannot be read by JavaScript.
	 * We check for the CSRF token to infer authentication state.
	 */
	async initialise() {
		const hasCsrf = !!Cookie.get("spmscsrf");
		
		logger.info("Auth store initializing", {
			hasCsrf,
			csrfCookie: Cookie.get("spmscsrf"),
			note: "sessionid is HttpOnly and cannot be read by JS",
		});
		
		// If we have a CSRF token, assume we might be authenticated
		// The actual auth check will happen when components try to fetch user data
		this.state.isAuthenticated = hasCsrf;
		this.state.initialised = true;
		
		logger.info("Auth store initialized", {
			isAuthenticated: this.state.isAuthenticated,
			initialised: this.state.initialised,
		});
	}

	/**
	 * Marks user as logged in.
	 */
	login() {
		this.state.isAuthenticated = true;
		logger.info("User flagged as logged in (cookies present)");
	}

	/**
	 * Logs out user and clears all session cookies.
	 */
	logout() {
		this.state.isAuthenticated = false;
		this.user = null;
		Cookie.remove("sessionid");
		Cookie.remove("spmscsrf");
		Cookie.remove("csrf");
		logger.info("User logged out");
	}

	/**
	 * Handles unauthorised event by logging out user.
	 */
	handleUnauthorised() {
		this.logout();
	}

	/**
	 * Resets store to initial state.
	 */
	reset() {
		this.state.isAuthenticated = false;
		this.user = null;
		this.state.loading = false;
		this.state.error = null;
		this.state.initialised = false;
		logger.info("Auth store reset");
	}

	/**
	 * Performs cleanup when store is disposed.
	 */
	async dispose() {
		if (typeof window !== "undefined") {
			window.removeEventListener(
				"auth:unauthorised",
				this.onUnauthorised
			);
		}
		this.reset();
	}
}