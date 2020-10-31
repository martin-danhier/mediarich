import { APISpecification } from "utils/api-client/types";


const mediaserverRoutes: APISpecification = {
    baseURL: '<TODO>',
    routes: {
        ping: {
            method: 'GET',
            url: '/api/v2/',
        },
    },
};

export default mediaserverRoutes;