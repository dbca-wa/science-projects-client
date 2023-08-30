// Route for handling errors - used in Router to determine/display what error is produced on page.

import { useRouteError } from 'react-router-dom';
import { ProtectedPage } from '../components/Wrappers/ProtectedPage';
import { OtherError } from './OtherError';
import { NotFound } from './NotFound';

export const ErrorHandler = () => {
    const error = useRouteError() as { status?: number; message?: string, stack: string };

    if (error?.status === 404) {
        return (
            <ProtectedPage>
                <NotFound />
            </ProtectedPage>
        );
    } else {
        return (
            <ProtectedPage>
                <OtherError code={error?.status || 500} message={error?.message || "Unknown error"} stack={error?.stack} />
            </ProtectedPage>
        );
    }
};