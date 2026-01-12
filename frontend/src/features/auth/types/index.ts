export interface IUsernameLoginVariables {
	username: string;
	password: string;
}

export interface IUsernameLoginSuccess {
	ok: string;
}

export interface IUsernameLoginError {
	error: string;
	message: string;
}
