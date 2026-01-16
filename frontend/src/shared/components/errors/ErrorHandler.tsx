import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router";
import ErrorScreen from "./ErrorScreen";

const ErrorHandler = () => {
	const navigate = useNavigate();
	const routeError = useRouteError();

	let code = 500;
	let message = "Unknown error";
	let stack: string | undefined;
	const errObj: unknown = routeError;

	if (isRouteErrorResponse(routeError)) {
		// This is a Response from loader/action (e.g., 404, 401, 500)
		code = routeError.status;
		message = routeError.statusText || message;
	} else if (routeError instanceof Error) {
		message = routeError.message || message;
		stack = routeError.stack;
	} else if (typeof routeError === "string") {
		message = routeError;
	}

	const is404 = code === 404;

	return (
		<ErrorScreen
			code={code}
			message={
				is404 ? "The page you requested could not be found." : message
			}
			error={errObj}
			stack={stack}
			showDetails={false /* hook to your auth store if needed */}
			onReload={() => window.location.reload()}
			onBack={() => navigate(-1)}
			onHome={() => navigate("/")}
		/>
	);
};

export default ErrorHandler;
