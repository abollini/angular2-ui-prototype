﻿import {Injectable} from 'angular2/core';

import {HttpService} from '../utilities/http.service';
import {RequestOptions, Request, RequestMethod, URLSearchParams} from 'angular2/http';

/**
 * Injectable service to provide an interface with the DSpace REST API 
 * through the utility http service. The responses here are returned as
 * Observables and the content is mapped to a JSON object.
 *
 * It important to note that the methods in this service are referenced
 * with bracket notation combining fetch with a constant.
 * Such as: dspaceService['fetch' + dspaceKeys[type].METHOD]
 *
 * TODO: map the JSON content to an inheritence model
 */
@Injectable()
export class DSpaceService {

    /**
     * The DSpace REST API endpoint root
     */
    private REST: string;

    /**
     * The DSpace REST API URL
     */
    private url: string;

    /**
     * @param httpService 
     *      HttpService is a singleton service to provide basic xhr requests.
     */
    constructor(private httpService: HttpService) {
        this.REST = '/rest';
        this.url = 'http://localhost:5050';
    }

    /**
     * Method to perform a generic fetch with the provided path. 
     *
     * @param path
     *      A path to a DSpace REST endpoint
     */
    fetch(path) {
        return this.httpService.get({
            url: this.url + path + '?expand=parentCommunity,parentCollection'
        });
    }

    /**
     * Method to fetch top communities for navigation purposes.
     */
    fetchTopCommunities(limit, offset) {
        var params = new URLSearchParams();
        params.append("limit", limit);
        params.append("offset", offset);
        return this.httpService.get({
            url: this.url + this.REST + '/communities/top-communities',
            search: params
        });
    }

    /**
     * Method to fetch subcommunities for navigation purposes.
     *
     * @param communityId
     *      The community id of which its subcommunities are to be fetched.
     */
    fetchCommunities(communityId) {
        return this.httpService.get({
            url: this.url + this.REST + '/communities/' + communityId + '/communities'
        });
    }

    /**
     * Method to fetch collections of a community for navigation purposes.
     *
     * @param communityId
     *      The community id of which its collections are to be fetched.
     */
    fetchCollections(communityId) {
        return this.httpService.get({
            url: this.url + this.REST + '/communities/' + communityId + '/collections'
        });
    }

    /**
     * Method to fetch items of a collection for navigation purposes. 
     *
     * @param collectionId
     *      The collection id of which its items are to be fetched.
     */
    fetchItems(collectionId) {
        return this.httpService.get({
            url: this.url + this.REST + '/collections/' + collectionId + '/items'
        });
    }

    /**
     * Method to fetch details of a community. 
     *
     * @param id
     *      Community id of which to fetch its relationships and other details.
     */
    fetchCommunity(id) {
        return this.httpService.get({
            url: this.url + this.REST + '/communities/' + id + '?expand=collections,subCommunities,parentCommunity,logo'
        });
    }

    /**
     * Method to fetch details of a collection. 
     *
     * @param id
     *      Collection id of which to fetch its relationships and other details.
     */
    fetchCollection(id) {
        return this.httpService.get({
            url: this.url + this.REST + '/collections/' + id + '?expand=items,parentCommunity,logo'
        });
    }

    /**
     * Method to fetch details of an item. 
     *
     * @param id
     *      Item id of which to fetch its relationships and other details.
     */
    fetchItem(id) {
        return this.httpService.get({
            url: this.url + this.REST + '/items/' + id + '?expand=metadata,bitstreams,parentCollection'
        });
    }

    /**
     * Method to login and recieve a token. 
     *
     * @param email
     *      DSpace user email/login
     * @param password
     *      DSpace user password
     */
    login(email, password) {
        this.httpService.post({
            url: this.url + this.REST + '/login',
            data: {
                email: email,
                password: password
            }
        }); 
    }

}
