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
                // console.log("Protected Page: Loaded, not logged in, userdata none!")
                navigate("/login")
                return;
            }
            else {
                // console.log("Protected Page: Legit User, showing content")
                // console.log(userData)
                setShowContent(true);
            }
        }
        else {
            // console.log("Protected Page: User Loading...")
        }
    }, [userLoading])


    return (
        <>
            {showContent ? children : null}
        </>
    )
};