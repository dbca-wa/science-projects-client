// Script for keeping track of the user search value, whilst allowing
// search bars to be placed anywhere on the screen and in separate components.
// exposes variables in UserSearchContext to components via the useUserSearchContext hook.


import { createContext, useState, useContext, useEffect } from 'react';
import { getUsersBasedOnSearchTerm } from '../api';
import { IUserData } from '../../types';

interface IUserSearchContext {
    searchTerm: string;
    setSearchTerm: (value: string) => void;

    filteredItems: IUserData[];
    loading: boolean;

    currentUserResultsPage: number;
    setCurrentUserResultsPage: (value: number) => void;
    totalPages: number;
    totalResults: number;

    setIsOnUserPage: (value: boolean) => void;

    onlySuperuser: boolean;
    onlyExternal: boolean;
    onlyStaff: boolean;
    setSearchFilters: (filters: {
        onlySuperuser: boolean;
        onlyExternal: boolean;
        onlyStaff: boolean;
    }) => void;

}


const UserSearchContext = createContext<IUserSearchContext>({
    searchTerm: '',
    setSearchTerm: () => {
        throw new Error('setSearchTerm function must be implemented');
    },
    filteredItems: [],
    loading: false,
    currentUserResultsPage: 1,
    setCurrentUserResultsPage: () => {
        throw new Error('setCurrentPage function must be implemented');
    },
    totalPages: 1,
    totalResults: 0,
    setIsOnUserPage: () => {
        throw new Error('setIsOnUserPage function must be implemented');
    },
    onlySuperuser: false,
    onlyExternal: false,
    onlyStaff: false,
    setSearchFilters: () => {
        throw new Error('setSearchFilters function must be implemented');
    },
});


interface IUserSearchProviderProps {
    children: React.ReactNode;
}


export const UserSearchProvider = ({ children }: IUserSearchProviderProps) => {
    const [isOnUserPage, setIsOnUserPage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filteredItems, setFilteredItems] = useState<IUserData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUserResultsPage, setCurrentUserResultsPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const [onlySuperuser, setOnlySuperuser] = useState(false);
    const [onlyExternal, setOnlyExternal] = useState(false);
    const [onlyStaff, setOnlyStaff] = useState(false);

    const setSearchFilters = (filters: {
        onlySuperuser: boolean;
        onlyExternal: boolean;
        onlyStaff: boolean;
    }) => {
        setOnlySuperuser(filters.onlySuperuser);
        setOnlyExternal(filters.onlyExternal);
        setOnlyStaff(filters.onlyStaff);
        setCurrentUserResultsPage(1);
    };


    useEffect(() => {
        if (isOnUserPage) {
            setLoading(true);
            getUsersBasedOnSearchTerm(searchTerm, currentUserResultsPage, {
                onlySuperuser,
                onlyExternal,
                onlyStaff,
            })
                .then((data) => {
                    setFilteredItems(data.users);
                    setTotalPages(data.total_pages);
                    setTotalResults(data.total_results);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching users:', error);
                    setLoading(false);
                });
        } else {
            setOnlyExternal(false);
            setOnlyStaff(false);
            setOnlySuperuser(false);
            setSearchTerm('');
        }
    }, [searchTerm, currentUserResultsPage, isOnUserPage, onlySuperuser, onlyExternal, onlyStaff]);


    const contextValue: IUserSearchContext = {
        searchTerm,
        setSearchTerm,
        filteredItems,
        loading,
        currentUserResultsPage,
        setCurrentUserResultsPage,
        totalPages,
        totalResults,
        setIsOnUserPage,
        onlySuperuser,
        onlyExternal,
        onlyStaff,
        setSearchFilters,
    };

    return (
        <UserSearchContext.Provider value={contextValue}>
            {children}
        </UserSearchContext.Provider>
    );
};

export const useUserSearchContext = () => useContext(UserSearchContext);

export default UserSearchContext;