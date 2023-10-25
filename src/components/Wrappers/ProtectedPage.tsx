// An auth wrapper for displaying content only to users who are logged in

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../lib/hooks/useUser";
import { IUserData } from "../../types";

interface IProtectedPageProps {
    children: React.ReactNode;
}

export const ProtectedPage = ({ children }: IProtectedPageProps) => {
    const { isLoggedIn, userData, userLoading } = useUser();
    const navigate = useNavigate();
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (!userLoading) {
            if (!isLoggedIn || userData?.pk === undefined) {
                // console.log("Talking to: ",
                //     "https://scienceprojects-test-api.dbca.wa.gov.au/api/v1/"
                //     // process.env.PRODUCTION_API_URL
                // );
                console.log("No user. Navigating to login.")
                console.log("NE:", process.env.NODE_ENV)
                console.log("RAE:", process.env.REACT_APP_ENV)
                navigate("/login")
            }
            else {
                setShowContent(true);
            }
        }
    }, [userLoading])


    return (
        <>
            {showContent ? children : null}
        </>
    )
};