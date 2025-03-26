const fs	= require( 'fs'		)
const path	= require( 'path'	)
const solc	= require( 'solc'	)

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
,	{	import: _ => (
			{	contents: _.startsWith( '@openzeppelin' )
				?	fs.readFileSync(
						path.resolve( __dirname, 'node_modules', _ )
					,	'utf8'
					)
				:	sources[ _ ]
			}
		)
	}
)

const express = require( 'express' )
const app = express()

app.use(
	express.static( path.join( __dirname, 'public' ) )
)

app.use( express.json( { limit: '10mb' } ) )

app.post(
	'/solc'
,	( q, p ) => p.type( 'json' ).send( SOLC( q.body ) )
)

app.get(
	'/api/greet'
,	( q, p ) => p.json( { message: `Hello` } )
)

app.use(
	( q, p ) => p.status( 404 ).send(
		'<h1>404 Not Found</h1><p>The page you are looking for does not exist.</p>'
	)
)

app.listen( 
	3000
,	() => console.log( 'Server is running on http://localhost:3000' )
)
