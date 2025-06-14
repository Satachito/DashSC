import {
	Spinner
,	OverlayButton
} from './SAT/Components.js'

export class
SpinButton extends OverlayButton {
	constructor() {
		super()

		this.CreateOverlay = async () => {
			const
			$ = new Spinner()
			$.style.height          = '100%'
			$.style.aspectRatio     = '1 / 1'
			$.style.boxSizing		= 'border-box'
			$.style.border			= '3px solid black'
			$.style.borderTop		= '3px solid transparent'
			$.style.borderRadius	= '50%'
			return $
		}
	}
}
customElements.define( 'spin-button', SpinButton, { extends: 'button' } )

