export const
Alert = e => (
	console.error( e )
,	alert( e )
)

export const E		= _ => document.createElement( _ )

export const Rs		= ( $, ..._ ) => $.replaceChildren( ..._ )
export const As		= ( $, ..._ ) => $.append( ..._ )
export const AC		= ( $, _ ) => $.appendChild( _ )
export const ACE	= ( $, _ ) => AC( $, E( _ ) )
export const On		= ( $, _ ) => $ && _( $ )

export const
Export = ( _, path, type ) => {
	const
	a = E( 'a' )
	a.href = URL.createObjectURL( 
		new Blob( [ _ ], { type } )
	)
	a.download = path
	a.click()
	URL.revokeObjectURL( a.href )
}

let
FILE_PATH = ''

export const
Load = () => window.showOpenFilePicker().then(
	_ => (
		FILE_PATH = _[ 0 ].name
	,	_[ 0 ].getFile().then( _ => _.text() )
	)
).catch(
	e => e.name === 'AbortError' ? console.log( e ) : Alert( e )
)

export const
Save = ( text, types = [] ) => window.showSaveFilePicker(
	{	suggestedName:	FILE_PATH
	,	types
	}
).then(
	_ => _.createWritable().then(
		$ => $.write( text ).then(
			_ => $.close()
		)
	)
).catch(
	e => e.name === 'AbortError' ? console.log( e ) : Alert( e )
)

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export class
FileImporter extends HTMLElement {
	constructor() {
		super()
		this.innerHTML = `<button>Choose file</button><input type=file style="display: none">`
		const
		fileSelector = this.querySelector( 'input' )
		fileSelector.onchange = () => {
			const
			file = fileSelector.files[ 0 ]
			if ( ! file ) return
			this.querySelector( 'button' ).textContent = file.name
			const
			$ = new FileReader()
			$.onload = () => this.Callback( $.result )
			$.onerror = console.error
			$.readAsText( file )
		}
		this.querySelector( 'button' ).onclick = () => fileSelector.click()
	}
}
customElements.define( 'file-importer', FileImporter )

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	URLが存在しない場合 fetch 自体が TypeError( 'TypeError', 'Failed to fetch' ) を throw してくる
export const
FetchJSON = ( _, options = {} ) => fetch( _, options ).then(
	_ => {
		if ( !_.ok ) throw _
		return _.json()
	}
)
export const
FetchText = ( _, options = {} ) => fetch( _, options ).then(
	_ => {
		if ( !_.ok ) throw _
		return _.text()
	}
)
export const
FetchBLOB = ( _, options = {} ) => fetch( _, options ).then(
	_ => {
		if ( !_.ok ) throw _
		return _.blob()
	}
)
export const
FetchArrayBuffer = ( _, options = {} ) => fetch( _, options ).then(
	_ => {
		if ( !_.ok ) throw _
		return _.arrayBuffer()
	}
)

export const
FetchImageURL = ( _, options = {} ) => fetchBLOB( _, options ).then(
	_ => URL.createObjectURL( _ )
)

export const
FetchDOM = ( _, options = {} ) => fetchText( _, options ).then(
	_ => DOMParser().parseFromString( _, "text/html" )
)

export const
FetchAlert = _ => (
	( _ instanceof Error	) && alert( _ )
,	( _ instanceof Response	) && alert( `${ _.status }: ${ _.statusText }` )
)

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export class
JPSpinner extends HTMLElement {
	constructor() {
		super()

		this.attachShadow( { mode: 'open' } ).innerHTML = `
			<style>
				:host {
				;	display		: inline-block
				;	animation	: spin 2s linear infinite
				;	overflow	: hidden
				}
				@keyframes spin {
					from	{ transform: rotate( 0deg	) }
					to		{ transform: rotate( 360deg	) }
				}
			</style>
			<slot></slot>
		`
	}
}
customElements.define( 'jp-spinner', JPSpinner )

export class
JPButton extends HTMLButtonElement {
	constructor() {
		super()

		this.onclick = ev => (
			this.disabled = true
		,	this.CreatePromise( ev ).finally(
				() => this.disabled = false
			)
		)
	}
}
customElements.define( 'jp-button', JPButton, { extends: 'button' } )

export class
JPSpinButton extends HTMLButtonElement {

	constructor() {
		super()

		this.style.display			= 'inline-flex'
		this.style.alignItems		= 'center'
		this.style.justifyContent	= 'center'
		this.style.position			= 'relative'

		this.onclick = () => On(
			this.CreateSpinner()
		,	spinner => (
				this.disabled = true
			,	spinner.style.position		= 'absolute'
			,	spinner.style.height		= '100%'
			,	spinner.style.aspectRatio	= '1 / 1'
			,	this.appendChild( spinner )
			,	this.CreatePromise().finally(
					() => (
						this.removeChild( spinner )
					,	this.disabled = false
					)
				)
			)
		)
	}
}
customElements.define( 'jp-spin-button', JPSpinButton, { extends: 'button' } )
/*	JPSpinButton EXAMPLE
class
SpinButton extends JPSpinButton {
	constructor() {
		super()

		this.CreateSpinner = () => {
			const
			$ = new JPSpinner()
			$.style.boxSizing		= 'border-box'
			$.style.border			= '5px solid black'
			$.style.borderTop		= '5px solid transparent'
			$.style.borderRadius	= '50%'
			return $
		}
	}
}
customElements.define( 'spin-button', SpinButton, { extends: 'button' } )
*/
