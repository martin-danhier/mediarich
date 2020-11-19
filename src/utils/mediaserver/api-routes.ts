import { APISpecification, HTTPStatusCodes, MIMETypes } from 'utils/api-client/types';


const mediaserverRoutes: APISpecification = {
    baseURL: 'http://localhost:8000',
    routes: {
        ping: {
            mode: 'cors',
            method: 'GET',
            url: '/api/v2/',
        },
    },
};

export default mediaserverRoutes;