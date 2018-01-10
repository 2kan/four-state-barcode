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
const FORMATLENGTH

const encodeMap = require( "./encoding.json" );

const barSpec = {
	"0": { top: 2.1, bottom: 2.1 },
	"1": { top: 2.1, bottom: 0.5 },
	"2": { top: 0.5, bottom: 2.1 },
	"3": { top: 0.5, bottom: 0.5 }
}


Write( Encode( ENCODING.C, "purple i" ) );

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
			encoded += encodeMap[ a_encoding ][ a_input[ i ] ];
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

	var color = { red: 0, green: 0, blue: 0, alpha: 255 };
	if ( a_color )
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