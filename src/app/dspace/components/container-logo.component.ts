import {Component, Input} from "angular2/core";
import {Bitstream} from "../models/bitstream.model";

/**
 * A Component to render a logo
 */
@Component({
    selector: 'container-logo',
    template: `
    <p><img class="logo img-responsive" src="{{ logo.retrieveLink }}" alt="logo"></p> <!--//TODO i18n: alt-->    
    `
})

export class ContainerLogoComponent {
    /**
     * The Bitstream representing the logo
     */
    @Input() 
    logo: Bitstream;
}