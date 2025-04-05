import {
	JPSpinner
,	JPOverlayButton
} from './JP.js'

export class
SpinButton extends JPOverlayButton {
	constructor() {
		super()

		this.CreateOverlay = () => {
			const
			$ = new JPSpinner()
			$.style.boxSizing		= 'border-box'
			$.style.border			= '3px solid black'
			$.style.borderTop		= '3px solid transparent'
			$.style.borderRadius	= '50%'
			return $
		}
	}
}
customElements.define( 'spin-button', SpinButton, { extends: 'button' } )

