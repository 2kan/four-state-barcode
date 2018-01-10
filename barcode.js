const path = require( "path" );
const PNGImage = require( "pngjs-image" );

const _start = "13";
const _end = "13";

const padChar = "3";

const ENCODING = {
	C: "C",
	N: "N"
};
const encodeMap = require( "./encoding.json" );

const barSpec = {
	"0": { top: 2.1, bottom: 2.1 },
	"1": { top: 2.1, bottom: 0.5 },
	"2": { top: 0.5, bottom: 2.1 },
	"3": { top: 0.5, bottom: 0.5 }
}

var image = PNGImage.createImage( 500, 100 );


//Write( "012231032132013213210321021303" );
//console.log( CEncode( "ABC" ) );

Write( Encode( ENCODING.N, "0123" ) );

function Encode( a_encoding, a_input, a_padToLength )
{
	var encoded = "";
	if ( a_padToLength == undefined )
		a_padToLength = a_input.length;

	for ( var i = 0; i < a_padToLength; ++i )
	{
		console.log( "encoding " + a_input[ i ] );
		if ( a_input[ i ] )
		{
			encoded += encodeMap[ a_encoding ][ a_input[ i ] ];
		}
		else
		{
			encoded += padChar;
		}

		console.log( encoded );
	}

	return encoded;
}

function Write( a_encoded )
{
	var x = 10;
	var y = Math.floor( image.getHeight() / 2 );

	const scale = 10;
	const width = 3;

	const color = { red: 0, green: 0, blue: 0, alpha: 255 };

	for ( var i = 0; i < a_encoded.length; ++i )
	{
		DrawRect(
			image,
			x,
			y - ( barSpec[ a_encoded[ i ] ].top * scale ),
			x + width,
			y + ( barSpec[ a_encoded[ i ] ].bottom * scale ),
			color
		);

		x += 10;
	}

	image.writeImage( path.join( __dirname, "blep.png" ) );
}

function DrawRect( a_image, a_startX, a_startY, a_endX, a_endY, a_color )
{
	for ( var x = a_startX; x < a_endX; ++x )
	{
		for ( var y = a_startY; y < a_endY; ++y )
		{
			a_image.setAt( x, y, a_color );
		}
	}
}