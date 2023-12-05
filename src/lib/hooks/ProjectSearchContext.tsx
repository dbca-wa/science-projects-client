// Script for keeping track of the project search value, whilst allowing
// search bars to be placed anywhere on the screen and in separate components.
// exposes variables in ProjectSearchContext to components via the useProjectSearchContext hook.

import { createContext, useState, useContext, useEffect } from 'react';
import { getProjectsBasedOnSearchTerm } from '../api';
import { IProjectData } from '../../types';

interface IProjectSearchContext {
    searchTerm: string;
    setSearchTerm: (value: string) => void;

    filteredItems: IProjectData[];
    loading: boolean;

    currentProjectResultsPage: number;
    setCurrentProjectResultsPage: (value: number) => void;
    totalPages: number;
    totalResults: number;

    isOnProjectsPage: boolean;
    setIsOnProjectsPage: (value: boolean) => void;

    onlyActive: boolean;
    onlyInactive: boolean;
    filterBA: string;
    filterProjectKind: string;
    filterProjectStatus: string;
    filterYear: number;
    setSearchFilters: (filters: {
        onlyActive: boolean;
        onlyInactive: boolean;
        filterBA: string;
        filterProjectKind: string;
        filterProjectStatus: string;
        filterYear: number;
    }) => void;

}

const ProjectSearchContext = createContext<IProjectSearchContext>({
    searchTerm: '',
    setSearchTerm: () => {
        throw new Error('setSearchTerm function must be implemented');
    },
    filteredItems: [],
    loading: false,
    currentProjectResultsPage: 1,
    setCurrentProjectResultsPage: () => {
        throw new Error('setCurrentPage function must be implemented');
    },
    totalPages: 1,
    totalResults: 0,
    isOnProjectsPage: false,
    setIsOnProjectsPage: () => {
        throw new Error('setIsOnProjectsPage function must be implemented');
    },
    onlyActive: false,
    onlyInactive: false,
    filterBA: '',
    filterProjectKind: '',
    filterProjectStatus: '',
    filterYear: 0,
    setSearchFilters: () => {
        throw new Error('setSearchFilters function must be implemented');
    },
});


interface IProjectSearchProviderProps {
    children: React.ReactNode;
}


export const ProjectSearchProvider = ({ children }: IProjectSearchProviderProps) => {
    const [isOnProjectsPage, setIsOnProjectsPage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filteredItems, setFilteredItems] = useState<IProjectData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentProjectResultsPage, setCurrentProjectResultsPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [onlyActive, setOnlyActive] = useState(false);
    const [onlyInactive, setOnlyInactive] = useState(false);
    const [filterBA, setFilterBA] = useState('');
    const [filterProjectKind, setFilterProjectKind] = useState('');
    const [filterProjectStatus, setFilterProjectStatus] = useState('');
    const [filterYear, setFilterYear] = useState(0);

    const setSearchFilters = (filters: {
        onlyActive: boolean;
        onlyInactive: boolean;
        filterBA: string;
        filterProjectKind: string;
        filterProjectStatus: string;
        filterYear: number;
    }) => {
        setOnlyActive(filters.onlyActive);
        setOnlyInactive(filters.onlyInactive);
        setFilterBA(filters.filterBA);
        setFilterProjectStatus(filters.filterProjectStatus);
        setFilterProjectKind(filters.filterProjectKind);
        setFilterYear(filters.filterYear);
        setCurrentProjectResultsPage(1); // Set the current page to 1 when filters change
    };


    useEffect(() => {
        if (isOnProjectsPage) {
            setLoading(true);
            getProjectsBasedOnSearchTerm(searchTerm, currentProjectResultsPage, {
                onlyActive,
                onlyInactive,
                filterBA,
                filterProjectKind,
                filterProjectStatus,
                filterYear,
            })
                .then((data) => {
                    setFilteredItems(data.projects);
                    setTotalResults(data.total_results);
                    setTotalPages(data.total_pages);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching users:', error);
                    setLoading(false);
                });
        } else {
            setFilterBA("All")
            setFilterProjectStatus("All")
            setFilterProjectKind("All")

        }
    }, [searchTerm, currentProjectResultsPage, isOnProjectsPage, onlyActive, onlyInactive, filterBA, filterYear, filterProjectStatus, filterProjectKind]);


    const contextValue: IProjectSearchContext = {
        searchTerm,
        setSearchTerm,
        filteredItems,
        loading,
        currentProjectResultsPage,
        setCurrentProjectResultsPage,
        totalPages,
        totalResults,
        isOnProjectsPage,
        setIsOnProjectsPage,
        onlyActive,
        onlyInactive,
        filterBA,
        filterProjectKind,
        filterProjectStatus,
        filterYear,
        setSearchFilters,
    };


    return (
        <ProjectSearchContext.Provider value={contextValue}>
            {children}
        </ProjectSearchContext.Provider>
    );
};

export const useProjectSearchContext = () => useContext(ProjectSearchContext);

export default ProjectSearchContext;