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
