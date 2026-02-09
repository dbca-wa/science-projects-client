import {
	makeObservable,
	observable,
	action,
} from "mobx";
import { logger } from "@/shared/services/logger.service";

/**
 * Base state interface that all store states must extend.
 * Contains common properties for loading, error handling, and initialisation.
 */
export interface BaseStoreState {
	loading: boolean;
	error: string | null;
	initialised: boolean;
}

export abstract class BaseStore<T extends BaseStoreState = BaseStoreState> {
	/**
	 * Observable state object. All store state should be contained within this object.
	 */
	public state: T;

	/**
	 * @param initialState - The initial state object that extends BaseStoreState
	 */
	constructor(initialState: T) {
		this.state = initialState;

		makeObservable(this, {
			state: observable,
			setLoading: action,
			setError: action,
			clearError: action,
			setInitialised: action,
		});
	}

	/**
	 * @param isLoading - Whether the store is currently loading
	 */
	setLoading(isLoading: boolean) {
		this.state.loading = isLoading;
	}

	/**
	 * @param error - The error message, or null to clear the error
	 */
	setError(error: string | null) {
		this.state.error = error;
	}

	/**
	 * Clears any existing error message.
	 */
	clearError() {
		this.setError(null);
	}

	/**
	 * @param initialised - Whether the store has been initialised
	 */
	setInitialised(initialised: boolean) {
		this.state.initialised = initialised;
	}

	/**
	 * Executes an async operation with error handling and optional retry logic.
	 */
	protected async executeAsync<TResult>(
		operation: () => Promise<TResult>,
		operationName: string,
		options: {
			retryAttempts?: number;
			retryDelay?: number;
			silent?: boolean;
		} = {}
	): Promise<{ success: boolean; data?: TResult; error?: string }> {
		const {
			retryAttempts = 0,
			retryDelay = 1000,
			silent = false,
		} = options;

		this.clearError();
		if (!silent) this.setLoading(true);

		let lastError: Error | null = null;

		for (let attempt = 0; attempt <= retryAttempts; attempt++) {
			try {
				const data = await operation();
				if (!silent) this.setLoading(false);

				logger.debug(`Operation ${operationName} succeeded`, {
					attempt,
					data,
				});
				return { success: true, data };
			} catch (error) {
				lastError =
					error instanceof Error ? error : new Error("Unknown error");

				if (attempt < retryAttempts) {
					logger.warn(`Operation ${operationName} failed, retrying`, {
						attempt: attempt + 1,
						totalAttempts: retryAttempts + 1,
						error: lastError.message,
					});
					await new Promise((resolve) =>
						setTimeout(resolve, retryDelay)
					);
				}
			}
		}

		const errorMessage = lastError?.message || "Unknown error occurred";
		this.setError(errorMessage);
		if (!silent) this.setLoading(false);

		logger.error(
			`Operation ${operationName} failed after ${
				retryAttempts + 1
			} attempts`,
			{
				error: errorMessage,
			}
		);

		return { success: false, error: errorMessage };
	}

	/**
	 * @returns True if the store is currently loading
	 */
	get isLoading() {
		return this.state.loading;
	}

	/**
	 * @returns The current error message, or null if no error
	 */
	get error() {
		return this.state.error;
	}

	/**
	 * @returns True if the store has been initialised
	 */
	get isInitialised() {
		return this.state.initialised;
	}

	/**
	 * Resets the store to its initial state.
	 */
	abstract reset(): void;

	/**
	 * Initialises the store with any async setup logic.
	 */
	initialise?(): Promise<void>;

	/**
	 * Performs cleanup when the store is disposed.
	 */
	dispose?(): Promise<void>;
}