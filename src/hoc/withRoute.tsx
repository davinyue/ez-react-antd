import {
    useParams,
    useNavigate,
    useLocation,
    useSearchParams
} from 'react-router';
import React from 'react';

export default function withRoute(SourceComponent: React.ComponentType<any>) {
    return function WithRouteComponent(props: any) {
        let navigate = useNavigate();
        let location = useLocation();
        let params = useParams();
        let [searchParams, setSearchParams] = useSearchParams();
        return <SourceComponent {...props} navigate={navigate} location={location}
            params={params} searchParams={searchParams} setSearchParams={setSearchParams} />;
    };
}
