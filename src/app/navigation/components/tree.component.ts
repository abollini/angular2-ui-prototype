﻿import {Component, Input} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';

import {ListComponent} from './list.component';
@Component({
    selector: 'tree',
    directives: [ROUTER_DIRECTIVES, TreeComponent, ListComponent],
    template: `
    			<ul class="list-group">
                    <li *ngFor="#directory of directories" class="list-group-item">
                        
                        <span *ngIf="directory.type == 'community' && !directory.expanded" (click)="directory.toggle()" class="glyphicon glyphicon-plus clickable"></span>
                        
                        <span *ngIf="directory.type == 'community' && directory.expanded" (click)="directory.toggle()" class="glyphicon glyphicon-minus clickable"></span>
                        
                        <span *ngIf="directory.type == 'collection' && !directory.expanded" (click)="directory.toggle()" class="glyphicon glyphicon-folder-close clickable"></span>

                        <span *ngIf="directory.type == 'collection' && directory.expanded" (click)="directory.toggle()" class="glyphicon glyphicon-folder-open clickable"></span>

                        <!-- Router link -->
                        <a [routerLink]="[directory.component, {id:directory.id}]">{{ directory.name }} {{ directory.id }}</a>
                        
                        <span *ngIf="directory.type == 'community'" class="badge">{{ directory.countItems }}</span>
                        
                        <span *ngIf="directory.type == 'collection'" class="badge">{{ directory.numberItems }}</span>

                        <div *ngIf="directory.expanded && directory.type == 'community'">                            
                            <tree [directories]="directory.subcommunities.concat(directory.collections)"></tree>
                        </div>

                        <div *ngIf="directory.expanded && directory.type == 'collection' && directory.items.length > 0">
                            <list [items]="directory.items"></list>
                        </div>
                        
                    </li>
                </ul>
    		  `
})
export class TreeComponent {

	@Input() directories: Array<Object>;

    constructor() { }

}
