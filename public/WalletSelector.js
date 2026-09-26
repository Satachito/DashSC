import { Alert, E, AC, ACE } from './SAT/Browser.js'

import { ethers }	from 'https://cdnjs.cloudflare.com/ajax/libs/ethers/6.13.5/ethers.min.js'
//	BrowserProvider
//	getNetwork

class
WalletInfo extends HTMLElement {
	constructor( _ ) {
		super()

		this.style.display = 'block'

		//	Wallet info comes from other extensions: never inject it as HTML.
		const
		ICON		= ACE( this, 'img' )
		ICON.width	= 56
		ICON.height	= 56
		ICON.src	= _.info.icon

		const
		BODY = ACE( this, 'div' )
		BODY.style.display = 'inline-block'

		ACE( BODY, 'div' ).textContent = _.info.name

		const
		NETWORK_LINE = ACE( BODY, 'div' )
		ACE( NETWORK_LINE, 'span' ).textContent = 'Network: '
		const NETWORK	= ACE( NETWORK_LINE, 'span' )
		const ADDRESSES	= ACE( BODY, 'div' )

		const
		UpdateNetwork = () => new ethers.BrowserProvider( _.provider ).getNetwork().then(
			_ => NETWORK.textContent = _.name
		).catch( Alert )

		//	eth_accounts does not pop up a connection request.
		//	The wallet asks for permission when the signer is first requested.
		const
		UpdateAccounts = accounts => ADDRESSES.replaceChildren(
			...accounts.map( _ => { const $ = E( 'div' ); $.textContent = _; return $ } )
		)

		UpdateNetwork()
		_.provider.request( { method: 'eth_accounts' } ).then( UpdateAccounts ).catch( Alert )

		_.provider.on?.( 'chainChanged'		, UpdateNetwork		)
		_.provider.on?.( 'accountsChanged'	, UpdateAccounts	)
	}
}
customElements.define( 'wallet-info', WalletInfo )

export default class
WalletSelector extends HTMLElement {

	constructor() {
		super()

		const WALLET_INFOS	= ACE( this, 'div' )
		const WALLET_SELECT	= ACE( this, 'select' )

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
				option.textContent	= walletDetail.info.name

				this.walletDetails.push( walletDetail )
			}
		)
		dispatchEvent( new Event( 'eip6963:requestProvider' ) )

		this.Provider = () => {
			const
			walletDetail = this.walletDetails[ WALLET_SELECT.value ]
			if ( !walletDetail ) throw new Error( 'No wallet found. Please install a wallet.' )
			return walletDetail.provider
		}

		if ( !window.ethereum ) {
			setTimeout(
				() => this.walletDetails.length || alert( 'Please install a wallet' )
			,	500
			)
			return
		}

//  EIP-6963 DEBUG
		window.ethereum.on?.( 'connect'			, _ => console.log( 'Wallet connected:'		, _ ) )
		window.ethereum.on?.( 'disconnect'		, _ => console.log( 'Wallet disconnected:'	, _ ) )
		window.ethereum.on?.( 'accountsChanged'	, _ => console.log( 'Account changed:'		, _ ) )
		window.ethereum.on?.( 'chainChanged'	, _ => console.log( 'Chain changed:'		, _ ) )
	}
}
customElements.define( 'wallet-selector', WalletSelector )
