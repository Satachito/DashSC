import { Alert, AC, ACE } from './JP.js'

import { ethers }	from 'https://cdnjs.cloudflare.com/ajax/libs/ethers/6.13.5/ethers.min.js'
//	BrowserProvider
//	getNetwork

class
WalletInfo extends HTMLElement {
	constructor( _ ) {
		super()

		this.style.display = 'block'

		this.innerHTML = `
			<img width=56 height=56 src=${_.info.icon}></img>
			<div style="display: inline-block">
				<div>${_.info.name}</div>
				<div><span>Network: </span><span></span></div>
				<div></div>
			</div>
		`
		const NETWORK	= this.children[ 1 ].children[ 1 ].children[ 1 ]
		const ADDRESSES	= this.children[ 1 ].children[ 2 ]

		new ethers.BrowserProvider( _.provider ).getNetwork().then(
			_ => NETWORK.textContent = _.name
		).catch( Alert )

		_.provider.request( { method: 'eth_requestAccounts' } ).then(
			_ => _.forEach( _ => ACE( ADDRESSES, 'div' ).innerText = _ )
		).catch( Alert )
	}
}
customElements.define( 'wallet-info', WalletInfo )

export default class
WalletSelector extends HTMLElement {

	constructor() {
		super()

		if ( !ethereum ) alert( 'Please install a wallet' )

		this.innerHTML = '<div></div><select></select>'
		const WALLET_INFOS	= this.children[ 0 ]
		const WALLET_SELECT	= this.children[ 1 ]

		this.walletDetails = []
		addEventListener(
			'eip6963:announceProvider'
		,   ev => {
				const
				walletDetail = ev.detail
				AC( WALLET_INFOS, new WalletInfo( walletDetail ) )

				const
				option				= ACE( WALLET_SELECT, 'option' )
				option.value		= this.walletDetails.length
				option.innerText	= walletDetail.info.name

				this.walletDetails.push( walletDetail )
			}
		)
		dispatchEvent( new Event( 'eip6963:requestProvider' ) )

		this.Provider = () => this.walletDetails[ WALLET_SELECT.value ].provider

//  EIP-6963 DEBUG
		ethereum.on( 'connect'			, _ => console.log( 'Wallet connected:'		, _ ) )
		ethereum.on( 'disconnect'		, _ => console.log( 'Wallet disconnected:'	, _ ) )
		ethereum.on( 'accountsChanged'	, _ => console.log( 'Account changed:'		, _ ) )
		ethereum.on( 'chainChanged'		, _ => console.log( 'Chain changed:'		, _ ) )
	}
}

customElements.define( 'wallet-selector', WalletSelector )

