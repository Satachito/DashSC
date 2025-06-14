import {
	Alert
,	E
,	Rs
}	from './SAT/Browser.js'

import { ethers } from 'https://cdnjs.cloudflare.com/ajax/libs/ethers/6.13.5/ethers.min.js'

const
Signer = async () => await new ethers.BrowserProvider( WALLET_S.Provider() ).getSigner()

////////////////////////////////////////////////////////////////
const
Element = ( tag, html ) => {
	const $ = E( tag )
	$.innerHTML = html
	return $
}
const Div	= _ => Element( 'div'	, _ )
const Span	= _ => Element( 'span'	, _ )
const H3	= _ => Element( 'h3'	, _ )
const H4	= _ => Element( 'h4'	, _ )
const H5	= _ => Element( 'h5'	, _ )
const H6	= _ => Element( 'h6'	, _ )

class
SCFunction extends HTMLElement {
	constructor( { name, inputs, outputs, stateMutability, type }, Contract ) {
		super()
		this.style.display = 'block'

		const
		InputW400px = disabled => {
			const $ = E( 'input' )
			$.style.width = '400px'
			$.disabled = disabled
			return $
		}

		const
		inputSection = stateMutability === 'payable'
		?	[ [ InputW400px(), Span( ':Wei' ), E( 'br' ) ] ]
		:	inputs.map(
				( { internalType, name, type } ) => [
					InputW400px( false )
				,	Span( `:${name}(${type})` )
				,	E( 'br' )
				]
			)
		;

		const
		outputSection = outputs.map(
			( { internalType, name, type } ) => [
				InputW400px( true )
			,	Span( `:${name}(${type})` )
			,	E( 'br' )
			]
		)

		const
		execButton = document.createElement( 'button' )
		execButton.setAttribute( 'is', 'spin-button' )
		execButton.textContent = 'exec'

		const
		infoSpan = E( 'span' )

		Rs(	this
		,	E( 'br' )
		,	H5( `${name}` )	, H6( `(${type}):` )	, E( 'br' )
		,	...( inputSection.flat( 2 ) )
		,	execButton
		,	E( 'br' )
		,	...( outputSection.flat( 2 ) )
		,	E( 'br' )
		,	infoSpan
		)

		execButton.CreatePromise = async () => {
			try {
				infoSpan.textContent = ''

				const
				_ = await ( await Contract() )[ name ].call(
					null
				,	...(
						stateMutability === 'payable'
						?	[ { value: inputSection[ 0 ][ 0 ].value } ]
						:	inputSection.map( _ => _[ 0 ].value )
					)
				)

				outputSection.length 
				?	outputSection[ 0 ][ 0 ].value = _
				:	alert( _ )

				stateMutability === 'pure' || stateMutability === 'view' || (
					_.wait().then( _ => ( console.log( _ ), infoSpan.textContent = _.hash ) )	//	_.status ? true : false
				)
/*
				const
				_ = ( await Contract() )[ name ].call(
					null
				,	...(
						stateMutability === 'payable'
						?	[ { value: inputSection[ 0 ][ 0 ].value } ]
						:	inputSection.map( _ => _[ 0 ].value )
					)
				)

				const
				$ = await (
					( stateMutability === 'pure' || stateMutability === 'view' )
					?	_
					:	_.then( _ => _.wait() ).then( _ => ( console.log( _ ), _.hash ) )	//	_.status ? true : false
				)

				outputSection.length 
				?	outputSection[ 0 ][ 0 ].value = $
				:	alert( $ )
*/
			} catch ( e ) {
				infoSpan.textContent = e
				Alert( e )
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

		this.innerHTML = `
			<h3>${name}</h3>
			<br>ABI:<br>
			<textarea readonly class=w100>${abi}</textarea>
			<br>BIN:<br>
			<textarea readonly class=w100>${bin}</textarea>
			<div class=sVH></div>
			<div class=flex>
				<input value="${args}"		placeholder=arguments	class=fg1>
				<div class=sHQ></div>
				<button is=spin-button>DEPLOY→</button>
				<div class=sHQ></div>
				<input value="${address}"	placeholder=address		class=fg1>
			</div>
			<hr>
			<div class=sVH></div>
			<details open>
				<summary><h4>FUNCTIONS:</h4></summary>
				<div></div>
			</details>
			<hr>
		`

		const ARGS		= this.querySelector( 'input[ placeholder=arguments ]'	)
		const ADDRESS	= this.querySelector( 'input[ placeholder=address ]'	)
		const DEPLOY	= this.querySelector( 'button'							)
		const FUNCTIONS	= this.querySelector( 'details' ).querySelector( 'div' )

		Rs(	FUNCTIONS
		,	...JSON.parse( abi ).filter(
				_ => _.type = 'function' && _.name && _.stateMutability
			).map(
				_ => new SCFunction(
					_
				,	async () => new ethers.Contract( ADDRESS.value, abi, await Signer() )
				)
			)
		)

		DEPLOY.CreatePromise = async () => new ethers.ContractFactory( abi, bin, await Signer() ).deploy(
			...( ARGS.value ? ARGS.value.split( ',' ) : [] )
		).then(
			contract => contract.waitForDeployment().then(
				async _ => ADDRESS.value = await contract.getAddress()
			)
		).catch(
			e => e.code == 'ACTION_REJECTED' || Alert( e )
		)

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

		this.innerHTML = `
			<details open>
				<summary><input value=${path} style="font-size: 20px; font-weight: bold"></summary>
				<textarea rows=10 class=w100>${_source}</textarea>
				<div class=sVQ></div>
				<button spin-button class=w100>COMPILE↓</button>
				<br>
				<p style="margin-left: 1rem"></p>
			</details>
		`
		const PATH		= this.querySelector( 'input'		)
		const COMPILE	= this.querySelector( 'button'		)
		const SOURCE	= this.querySelector( 'textarea'	)
		const CONTRACTS	= this.querySelector( 'p'			)

		Rs( CONTRACTS, ..._contracts.map( _ => new SmartContract( _ ) ) )
//
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
					alert( _.statusText )
					return
				}

				const
				json = await _.json()

				On(	json.errors
				,	_ => (
						console.error( _ )
					,	alert( JSON.stringify( _[ 0 ] ) )
					)
				)

				On(	json.contracts
				,	_ => Rs(
						CONTRACTS
					,	...Object.entries( _[ PATH.value ] ).map(
							_ => new SmartContract( [ _[ 0 ], JSON.stringify( _[ 1 ].abi ), _[ 1 ].evm.bytecode.object ] )
						)
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

