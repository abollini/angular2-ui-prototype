﻿import {EventEmitter, Injectable} from 'angular2/core';
import {Observable, Observer} from 'rxjs/Rx';

import {DSpaceService} from './dspace.service';
import {DSpaceStore} from './dspace.store';
import {DSpaceKeys} from './dspace.keys';

/**
 * Injectable service to provide navigation and context. Provides
 * session caching to eliminate requesting content already received.
 *
 * TODO: Create caching service which leverages local storage.
 *
 * The idea is to cache the directory and store in localStorage to
 * have immediate response when navigating and visiting context which has
 * been visited before. Would require synchronization to keep up to date.
 * Could also leverage webworkers to populate cache of unvisited context.
 */
@Injectable()
export class DSpaceDirectory {

    /**
     * Object to represent visited portions of the index hierarchy.
     */
    private store: {
        directory: {
            context: Object,
            observer: Observer<Object>,
            loading: boolean,
            ready: boolean,
            complete: boolean
        }
    };

    /**
     * An Observable to perform binding to the components.
     */
    directory: Observable<Object>;

    /**
     * 
     * @param dspaceService 
     *      DSpaceService is a singleton service to interact with the dspace REST API.
     * @param dspaceStore 
     *      DSpaceStore is a singleton service to cache context which have already been requested.
     * @param dspaceKeys 
     *      DSpaceKeys is a singleton service with constants.
     */
    constructor(private dspaceService: DSpaceService,
                private dspaceStore: DSpaceStore,
                private dspaceKeys: DSpaceKeys) {
        this.store = {
            directory: {
                context: new Array<Object>(),
                observer: null,
                loading: false,
                ready: false,
                complete: false
            }
        };
        this.directory = new Observable<Object>(observer => this.store.directory.observer = observer).share();        
    }

    /**
     * Method to perform initial loading of the directory.
     * Calls prepare with the top community results.
     */
    loadDirectory() {
        if (this.store.directory.ready) {
            this.directory = Observable.create(observer => {
                this.store.directory.observer = observer;
                this.store.directory.observer.next(this.store.directory.context);
            });
        }
        else {
            if (!this.store.directory.loading) {
                this.store.directory.loading = true;
                this.dspaceService.fetchTopCommunities(11,0).subscribe(topCommunities => {
                    this.store.directory.context = this.prepare(null, topCommunities);
                    this.store.directory.observer.next(this.store.directory.context);
                    this.store.directory.complete = topCommunities.lenght != 11;
                },
                error => {
                    console.error('Error: ' + JSON.stringify(error, null, 4));
                },
                () => {
                    this.store.directory.ready = true;
                    this.store.directory.loading = false;
                    console.log('finished fetching top communities, complete '+this.store.directory.complete);
                });
            }
        }
    }

    /**
     * Method to load hierarchy navigation relations.
     * Calls prepare with the context received.
     *
     * @param type
     *      string: community, collection, or item
     * @param context
     *      current context in which needing to load navigation relations.
     */
    loadNav(type, context) {
        if (context.ready) {
            console.log(context.name + ' already ready')
        }
        else {
            this.dspaceService['fetch' + this.dspaceKeys[type].COMPONENT](context.id).subscribe(nav => {
                context[this.dspaceKeys[type].DSPACE] = this.prepare(context, nav);
                context.ready = true;
            },
            error => {
                console.error('Error: ' + JSON.stringify(error, null, 4));
            },
            () => {
                console.log('finished fetching ' + this.dspaceKeys[type].DSPACE + ' of ' + context.name);
            });
        }
    }

    /**
     * Method to load context details.
     * Calls prepare with the context received.
     *
     * @param type
     *      string: community, collection, or item
     * @param id
     *      current context id which needing to load context details.
     */
    loadObj(type, id) {
        // needed to be used within scope of promise
        let directory = this;
        return new Promise(function (resolve, reject) {
            let obj;
            if ((obj = directory.dspaceStore.get(directory.dspaceKeys[type].PLURAL, id))) {
                resolve(obj);
            }
            else {
                directory.dspaceService['fetch' + directory.dspaceKeys[type].METHOD](id).subscribe(obj => {
                    obj = directory.prepare(null, obj);
                    obj.ready = true;
                    directory.dspaceStore.add(directory.dspaceKeys[type].PLURAL, obj);
                    resolve(obj);
                },
                error => {
                    console.error('Error: ' + JSON.stringify(error, null, 4));
                },
                () => {
                    console.log('finished fetching ' + type + ' ' + id);
                });
            }
        });
    }

    /**
     * Method to determine how to process.
     * Recursively calls prepare on arrays of the given object.
     *
     * @param context
     *      current context in which needing to process relations.
     * @param obj
     *     The context list: items, collections, subcommunities or the context itself
     * 
     * TODO: refactor method name to something more meaningful
     */
    prepare(context, obj) {
        if (Array.isArray(obj)) 
            return this.process(context, obj);
        else {
            this.enhance(obj);
            if (obj.type == 'item')
                return obj;
            else if (obj.type == 'collection')
                this.prepare(context, obj.items);
            else if (obj.type == 'community') {
                this.prepare(context, obj.collections);
                this.prepare(context, obj.subcommunities);
            }
            else console.log('Object has no type!');
            return obj;
        }
    }

    /**
     * Method to make relationships with provided context and 
     * place expanded property and toggle methods on a given context 
     * if not an item.
     * Sets the parent community or collection if applicable.
     * 
     * @param context
     *      current context in which needing to process relations.
     * @param list
     *     The context list: items, collections, subcommunities or the context itself
     * 
     */
    process(context, list) {
        // needed to be used within scope of forEach
        let directory = this;
        list.forEach(current => {
            if (context) {
                if (current.type == 'item')
                    current.parentCollection = context;
                else
                    current.parentCommunity = context;
            }
            directory.enhance(current);
            if (current.type != 'item') {
                current.expanded = false;
                current.toggle = function () {
                    this.expanded = !this.expanded;
                    if (this.expanded) {
                        if (this.type == 'collection')
                            directory.loadNav('item', this);
                        else {
                            directory.loadNav('community', this);
                            directory.loadNav('collection', this);
                        }
                    }
                }
            }
        });
        return list;
    }

    /**
     * Adds properties to the object.
     *
     * @param context
     *      current context.
     */
    enhance(context) {
        context.ready = false;
        context.component = this.dspaceKeys[context.type].COMPONENT;
    }
    
}
