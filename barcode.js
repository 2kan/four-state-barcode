const path = require( "path" );
const PNGImage = require( "pngjs-image" );

const _start = "13";
const _end = "13";

const padChar = "3";

const ENCODING = {
	C: "C",
	N: "N"
};
const FORMATS = {
	NULL: "00",
	STANDARD: "11",
	CUSTOMER2: "59",
	CUSTOMER3: "62"
};
//const FORMATLENGTH


const encodeMap = require( "./encoding.json" );
const colors = require( "./colors.json" );

const barSpec = {
	"0": { top: 2.1, bottom: 2.1 },
	"1": { top: 2.1, bottom: 0.5 },
	"2": { top: 0.5, bottom: 2.1 },
	"3": { top: 0.5, bottom: 0.5 }
}

const encoded = Encode( ENCODING.C, "I'm fairly certain this isnt copyrighted by Australia Post" );
console.log( encoded );

Write( encoded, undefined, colors.PURPLE );
//console.log( Encode( ENCODING.C, "purple is a fruit" ) );

function CreateAusPostBarcode( a_formatType, a_format, a_DPID, a_customerInfo )
{
	var encoded = "10"; // Add start bars
	encoded += Encode( ENCODING.N, a_format, 4 ); // Add FCC
	encoded += Encode( ENCODING.N, a_DPID, 16 ); // Add sorting code

	if ( a_format != FORMATS.CUSTOMER2 && a_format != FORMATS.CUSTOMER3 )
	{
		encoded += GenerateReedSolomon();
	}

	encoded += "10"; // Add end bars

	return encoded;
}

function GenerateReedSolomon()
{

}

//
// Encodes and returns a given string to a specified encoding.
// Optionally pads the string to a specified length.
function Encode( a_encoding, a_input, a_padToLength )
{
	var encoded = "";
	if ( a_padToLength == undefined )
		a_padToLength = a_input.length;

	for ( var i = 0; i < a_padToLength; ++i )
	{
		if ( a_input[ i ] )
		{
			// Add encoded data from map
			// If there's no mapping for the input character, use a 0 instead
			if ( encodeMap[ a_encoding ][ a_input[ i ] ] == undefined )
				encoded += encodeMap[ a_encoding ][ "0" ];
			else
				encoded += encodeMap[ a_encoding ][ a_input[ i ] ];
		}
		else
			encoded += padChar;
	}

	return encoded;
}

// 
// Takes a given string and saves it's barcode as an image file.
// Optionally saves to a specified path.
// Optionally saves as a specified color
// If specified, a_outputPath can either be an object of {red, green, blue, alpha}
// 	or the word "RAINBOW" (when I get around to adding that)
function Write( a_encoded, a_outputPath, a_color )
{
	const scale = 10;
	const width = 0.3;
	const pad = 7;

	var image = PNGImage.createImage(
		a_encoded.length * pad + a_encoded.length * width * scale + pad * 2,
		( barSpec[ 0 ].top + barSpec[ 0 ].bottom ) * scale + pad * 2
	);

	/*console.log(
		a_encoded,
		a_encoded.length,
		image.getWidth(),
		image.getHeight()
	);*/

	var x = 10;
	var y = Math.floor( image.getHeight() / 2 );

	// Set default color
	var color = { red: 0, green: 0, blue: 0, alpha: 255 };
	if ( a_color ) // Set custom color if specified
		color = a_color;

	for ( var i = 0; i < a_encoded.length; ++i )
	{
		DrawRect(
			image,
			x,
			y - ( barSpec[ a_encoded[ i ] ].top * scale ),
			x + ( width * scale ),
			y + ( barSpec[ a_encoded[ i ] ].bottom * scale ),
			color
		);

		x += pad + width * scale;
	}

	if ( a_outputPath == undefined )
		a_outputPath = path.join( __dirname, "barcode.png" );

	image.writeImage( a_outputPath );
}

//
// Draws a rectangle with the specified (x1,y1) and (x2,y2) points on
// a given PNGImage with a specified color
function DrawRect( a_image, a_startX, a_startY, a_endX, a_endY, a_color )
{
	for ( var x = a_startX; x < a_endX; ++x )
		for ( var y = a_startY; y < a_endY; ++y )
			a_image.setAt( x, y, a_color );
}


// Reed solomon error correction code (WIP)
var mult = [ [], [] ];
var gen = [ 48, 17, 29, 30, 1 ];
function RSInit()
{
	var primpoly = 67;
	var test = 64;

	for ( var i = 0; i < 64; ++i )
	{
		mult[ 0 ].push( 0 );
		mult[ 1 ].push( i );
	}

	var next;
	var prev = 1;
	for ( var i = 1; i < 64; ++i )
	{
		next = prev << 1;
		if ( next & test )
			next ^= primpoly;

		for ( var k = 0; k < 64; ++k )
		{
			mult[ next ][ k ] = mult[ prev ][ k ] << 1;
			if ( mult[ next ][ k ] & test )
				mult[ next ][ k ] ^= primpoly;
		}

		prev = next;
	}
}

function RSEncode( a_infosym, a_infosymbols )
{
	var temp = [];

	var paritystring = [];

	var k = a_infosym;
	var n = k + 4;

	var i = 0;
	for ( i = 0; i < 4; ++i )
	{
		temp[ i ] = 0;
		for ( i = 4; i < n; ++i )
			temp[ i ] = a_infosymbols[ i - 4 ];
	}
}