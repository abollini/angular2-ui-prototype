import {Component, Input} from 'angular2/core';

/**
 * Context aware component for displaying information/functionality of
 * the current context. Can be either a community, colleciton, or an item.
 */
@Component({
    selector: 'context',
    template: `
    			<div class="panel panel-default">
				  	<div class="panel-heading">
				    	<h3 class="panel-title">{{context.name}}</h3>
				  	</div>
				  	<div class="panel-body" *ngIf="context.type == 'dashboard'">
				    	{{context}}
				  	</div>
				  	<div class="panel-body" *ngIf="context.type == 'community'">
				    	{{context}}
				  	</div>
				  	<div class="panel-body" *ngIf="context.type == 'collection'">
				    	{{context}}
				  	</div>
				  	<div class="panel-body" *ngIf="context.type == 'item' && context.second">
                        <ul>
                            <li *ngFor="#bitstream of context.bitstreams">
                                <!-- TODO: make a link to download the items bitstream -->
                                <span>{{bitstream.name}}</span>
                            </li>
                        </ul>
				  	</div>
				</div>
    		  `
})
export class ContextComponent {

    /**
     * An input variable that is passed into the component [context].
     * Represents the current context.
     *
     * TODO: replace Object with inheritance model e.g. dspaceObject
     */
	@Input() context: Object;

}