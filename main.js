const fs	= require( 'fs'		)
const path	= require( 'path'	)
const solc	= require( 'solc'	)

const
OZ_ROOT = path.resolve( __dirname, 'node_modules', '@openzeppelin' )

//	Only files under node_modules/@openzeppelin may be read from disk.
//	Everything else must come from the sources sent by the browser.
const
Import = sources => _ => {
	if ( _.startsWith( '@openzeppelin/' ) ) {
		const
		$ = path.resolve( __dirname, 'node_modules', _ )
		if ( !$.startsWith( OZ_ROOT + path.sep ) ) return { error: `Invalid import path: ${_}` }
		try {
			return { contents: fs.readFileSync( $, 'utf8' ) }
		} catch ( e ) {
			return { error: `File not found: ${_}` }
		}
	}
	return Object.hasOwn( sources, _ ) && typeof sources[ _ ] === 'string'
	?	{ contents: sources[ _ ] }
	:	{ error: `File not found: ${_}` }
}

const
SOLC = ( { url, sources } ) => solc.compile(
	JSON.stringify(
		{	language: 'Solidity'
		,	sources: {
				[ url ]: { content: sources[ url ] }
			}
		,	settings: {
				outputSelection: {
					'*': { '*': [ 'abi', 'evm.bytecode' ] }
				}
			}
		}
	)
,	{	import: Import( sources ) }
)

const
IsValidRequest = _ => (
	_
&&	typeof _.url === 'string'
&&	_.sources
&&	typeof _.sources === 'object'
&&	Object.hasOwn( _.sources, _.url )
&&	typeof _.sources[ _.url ] === 'string'
)

const express = require( 'express' )
const app = express()

app.use(
	express.static( path.join( __dirname, 'public' ) )
)

app.use( express.json( { limit: '10mb' } ) )

app.post(
	'/solc'
,	( q, p ) => IsValidRequest( q.body )
	?	p.type( 'json' ).send( SOLC( q.body ) )
	:	p.status( 400 ).json( { error: 'Request must be { url, sources } and sources[ url ] must be a string' } )
)

app.use(
	( q, p ) => p.status( 404 ).send(
		'<h1>404 Not Found</h1><p>The page you are looking for does not exist.</p>'
	)
)

//	Listen on localhost only by default: /solc is unauthenticated.
const HOST = process.env.HOST ?? '127.0.0.1'
const PORT = Number( process.env.PORT ?? 3000 )

app.listen(
	PORT
,	HOST
,	() => console.log( `Server is running on http://${HOST}:${PORT}` )
)
