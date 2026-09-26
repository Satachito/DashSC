import {
	Alert
,	E
,	Rs
}	from './SAT/Browser.js'

import { ethers } from 'https://cdnjs.cloudflare.com/ajax/libs/ethers/6.13.5/ethers.min.js'

const
Signer = async () => await new ethers.BrowserProvider( WALLET_S.Provider() ).getSigner()

////////////////////////////////////////////////////////////////	ARGUMENTS
//	Converts the text of an input field into a value ethers can encode for `type`.
//	Arrays and tuples are written as JSON, e.g. [1,2,3] or ["0xabc…",true].
const
ParseArg = ( type, text ) => {
	if ( type.endsWith( ']' ) || type.startsWith( 'tuple' ) ) {
		try {
			return JSON.parse( text )
		} catch ( e ) {
			throw new Error( `Argument for ${type} must be JSON: ${text}` )
		}
	}
	if ( type === 'bool' ) {
		const $ = text.trim().toLowerCase()
		if ( $ === 'true'	) return true
		if ( $ === 'false'	) return false
		throw new Error( `Argument for bool must be true or false: ${text}` )
	}
	return text
}

//	Constructor arguments are written either as a JSON array ( ["abc", 1, [2,3]] )
//	or, for simple values, comma separated ( abc, 1 ).
const
ParseArgs = ( inputs, text ) => {
	if ( !text.trim() ) return []
	if ( text.trim().startsWith( '[' ) ) {
		try {
			const $ = JSON.parse( text )
			if ( Array.isArray( $ ) ) return $
		} catch ( e ) {}
	}
	return text.split( ',' ).map(
		( _, i ) => inputs[ i ] ? ParseArg( inputs[ i ].type, _.trim() ) : _.trim()
	)
}

const
Format = _ => typeof _ === 'bigint'
?	_.toString()
:	typeof _ === 'object' && _ !== null
	?	JSON.stringify( _, ( k, v ) => typeof v === 'bigint' ? v.toString() : v )
	:	String( _ )

////////////////////////////////////////////////////////////////
const
Element = ( tag, text ) => {
	const $ = E( tag )
	$.textContent = text
	return $
}
const Span	= _ => Element( 'span'	, _ )
const H5	= _ => Element( 'h5'	, _ )
const H6	= _ => Element( 'h6'	, _ )

class
SCFunction extends HTMLElement {
	constructor( fragment, Contract ) {
		super()
		this.style.display = 'block'

		const { name, inputs, outputs, stateMutability } = fragment
		const isReadOnly = stateMutability === 'pure' || stateMutability === 'view'

		const
		InputW400px = disabled => {
			const $ = E( 'input' )
			$.style.width = '400px'
			$.disabled = disabled
			return $
		}

		const
		valueSection = stateMutability === 'payable'
		?	[ InputW400px( false ), Span( ':value(Wei)' ), E( 'br' ) ]
		:	[]

		const
		inputSection = inputs.map(
			( { name, type } ) => [
				InputW400px( false )
			,	Span( `:${name}(${type})` )
			,	E( 'br' )
			]
		)

		const
		outputSection = outputs.map(
			( { name, type } ) => [
				InputW400px( true )
			,	Span( `:${name}(${type})` )
			,	E( 'br' )
			]
		)

		//	A customized built-in must get `is` at creation time; setAttribute( 'is' ) does not upgrade it.
		const
		execButton = document.createElement( 'button', { is: 'spin-button' } )
		execButton.textContent = 'exec'

		const
		infoSpan = E( 'span' )

		Rs(	this
		,	E( 'br' )
		,	H5( name )	, H6( `(${stateMutability}):` )	, E( 'br' )
		,	...valueSection
		,	...( inputSection.flat() )
		,	execButton
		,	E( 'br' )
		,	...( outputSection.flat() )
		,	E( 'br' )
		,	infoSpan
		)

		//	Use the full signature so overloaded functions resolve correctly.
		const signature = ethers.FunctionFragment.from( fragment ).format()

		execButton.CreatePromise = async () => {
			try {
				infoSpan.textContent = ''
				outputSection.forEach( _ => _[ 0 ].value = '' )

				const
				args = inputSection.map( ( _, i ) => ParseArg( inputs[ i ].type, _[ 0 ].value ) )

				valueSection.length && valueSection[ 0 ].value.trim() && args.push(
					{ value: valueSection[ 0 ].value.trim() }
				)

				const
				method = ( await Contract() ).getFunction( signature )

				if ( isReadOnly ) {
					const
					result = await method.staticCall( ...args )
					const
					values = outputs.length === 1 ? [ result ] : [ ...result ]
					outputSection.length
					?	outputSection.forEach( ( _, i ) => _[ 0 ].value = Format( values[ i ] ) )
					:	infoSpan.textContent = Format( result )
				} else {
					const
					tx = await method.send( ...args )
					infoSpan.textContent = `Sent: ${tx.hash}`
					const
					receipt = await tx.wait()
					console.log( receipt )
					infoSpan.textContent = `${receipt.status ? 'Success' : 'Failed'}: ${receipt.hash}`
				}
			} catch ( e ) {
				infoSpan.textContent = e.shortMessage ?? e.message ?? e
				e.code === 'ACTION_REJECTED' || Alert( e )
			}
		}
	}
}
customElements.define( 'sc-function', SCFunction )

////////////////////////////////////////////////////////////////
class
SmartContract extends HTMLElement {

	constructor( [ name, abi, bin, args = '', address = '' ] ) {
		super()

		this.style.display = 'block'

		//	No values are interpolated here: they are set below via textContent / value.
		this.innerHTML = `
			<h3></h3>
			<br>ABI:<br>
			<textarea readonly class=w100></textarea>
			<br>BIN:<br>
			<textarea readonly class=w100></textarea>
			<div class=sVH></div>
			<div class=flex>
				<input placeholder=arguments	class=fg1>
				<div class=sHQ></div>
				<button is=spin-button>DEPLOY→</button>
				<div class=sHQ></div>
				<input placeholder=address		class=fg1>
			</div>
			<hr>
			<div class=sVH></div>
			<details open>
				<summary><h4>FUNCTIONS:</h4></summary>
				<div></div>
			</details>
			<hr>
		`

		const [ ABI, BIN ] = this.querySelectorAll( 'textarea' )
		const ARGS		= this.querySelector( 'input[ placeholder=arguments ]'	)
		const ADDRESS	= this.querySelector( 'input[ placeholder=address ]'	)
		const DEPLOY	= this.querySelector( 'button'							)
		const FUNCTIONS	= this.querySelector( 'details' ).querySelector( 'div' )

		this.querySelector( 'h3' ).textContent = name
		ABI		.value = abi
		BIN		.value = bin
		ARGS	.value = args
		ADDRESS	.value = address

		const
		abiJSON = JSON.parse( abi )

		const
		constructorInputs = abiJSON.find( _ => _.type === 'constructor' )?.inputs ?? []
		ARGS.title = constructorInputs.length
		?	`constructor( ${ constructorInputs.map( _ => `${_.type} ${_.name}` ).join( ', ' ) } )\nJSON array or comma separated`
		:	'constructor()'

		Rs(	FUNCTIONS
		,	...abiJSON.filter(
				_ => _.type === 'function'
			).map(
				_ => new SCFunction(
					_
				,	async () => new ethers.Contract( ADDRESS.value, abi, await Signer() )
				)
			)
		)

		DEPLOY.CreatePromise = async () => {
			try {
				const
				contract = await new ethers.ContractFactory( abi, bin, await Signer() ).deploy(
					...ParseArgs( constructorInputs, ARGS.value )
				)
				await contract.waitForDeployment()
				ADDRESS.value = await contract.getAddress()
			} catch ( e ) {
				e.code === 'ACTION_REJECTED' || Alert( e )
			}
		}

		this.Context = () => [
			name
		,	abi
		,	bin
		,	ARGS	.value
		,	ADDRESS	.value
		]
	}
}
customElements.define( 'smart-contract', SmartContract )

////////////////////////////////////////////////////////////////
export default class
SOL_Source extends HTMLElement {

	constructor( [ path, [ _source, _contracts ] ] = [ '', [ '', [] ] ] ) {
		super()

		//	No values are interpolated here: they are set below via value.
		this.innerHTML = `
			<details open>
				<summary><input style="font-size: 20px; font-weight: bold"></summary>
				<textarea rows=10 class=w100></textarea>
				<div class=sVQ></div>
				<button is=spin-button class=w100>COMPILE↓</button>
				<br>
				<p style="margin-left: 1rem"></p>
			</details>
		`
		const PATH		= this.querySelector( 'input'		)
		const COMPILE	= this.querySelector( 'button'		)
		const SOURCE	= this.querySelector( 'textarea'	)
		const CONTRACTS	= this.querySelector( 'p'			)

		PATH	.value = path
		SOURCE	.value = _source

		Rs( CONTRACTS, ..._contracts.map( _ => new SmartContract( _ ) ) )

		COMPILE.CreatePromise = async () => {
			try {
				const
				_ = await fetch(
					'solc'
				,	{	method	: 'POST'
					,	headers	: {
							'Content-Type': 'application/json'
						}
					,	body	: JSON.stringify(
							{	url		: PATH.value
							,	sources	: Object.fromEntries(
									Array.from( Q_SOURCES.children ).map( _ => _.Source() )
								)
							}
						)
					}
				)

				if ( !_.ok ) {
					console.error( _ )
					alert( `${_.status}: ${_.statusText}` )
					return
				}

				const
				json = await _.json()

				const
				errors = ( json.errors ?? [] ).filter( _ => _.severity === 'error' )
				;( json.errors ?? [] ).filter( _ => _.severity !== 'error' ).forEach( _ => console.warn( _.formattedMessage ) )

				if ( errors.length ) {
					console.error( errors )
					alert( errors.map( _ => _.formattedMessage ).join( '\n' ) )
					return
				}

				Rs(	CONTRACTS
				,	...Object.entries( json.contracts?.[ PATH.value ] ?? {} ).map(
						_ => new SmartContract( [ _[ 0 ], JSON.stringify( _[ 1 ].abi ), _[ 1 ].evm.bytecode.object ] )
					)
				)
			} catch ( e ) {
				Alert( e )
			}
		}

		this.Context = () => [
			PATH.value
		,	[	SOURCE.value
			,	Array.from( CONTRACTS.children ).map( _ => _.Context() )
			]
		]

		this.Source = () => [
			PATH.value
		,	SOURCE.value
		]
	}
}
customElements.define( 'sol-source', SOL_Source )
