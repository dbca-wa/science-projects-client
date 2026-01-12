export interface ICommentReaction {
	pk?: number;
	user: number;
	// user: IUserData;
	comment?: number | null;
	direct_message?: number | null;
	reaction:
		| "thumbup"
		| "thumbdown"
		| "heart"
		| "brokenheart"
		| "hundred"
		| "confused"
		| "funny"
		| "surprised";
}
