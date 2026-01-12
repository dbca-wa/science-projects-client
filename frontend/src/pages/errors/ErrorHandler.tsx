import { useRouteError } from "react-router";
import NotFound from "./NotFound";
import OtherError from "./OtherError";

const ErrorHandler = () => {
	const error = useRouteError() as {
		status?: number;
		message?: string;
		stack: string;
	};

	if (error?.status === 404) {
		return <NotFound />;
	} else {
		return (
			<OtherError
				code={error?.status || 500}
				message={error?.message || "Unknown error"}
				stack={error?.stack}
			/>
		);
	}
};

export default ErrorHandler;
