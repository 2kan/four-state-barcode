const fs = require( "fs" );
const path = require( "path" );
const PNGImage = require( "pngjs-image" );

const img = PNGImage.readImageSync( path.join( __dirname, "barcode.png" ) );

// Assume there will always be 10 pixels of padding around the image
const barColor = img.getPixel( 11, Math.round( img.getHeight() / 2 ) );

// Save the color matches to a file for debugging
OutputColorMatches( img );

// Get bar data and decode it
const barData = GetBarData( img );
const decoded = DecodeBarData( barData );

console.log( barData );
console.log( decoded );

function DecodeBarData( a_barData )
{
    // Decode from C encoding
    const encodeMap = require( "./encoding.json" ).C;
    var decoded = "";

    for ( var i = 0; i < a_barData.length; i += 3 )
    {
        const bar = a_barData.slice( i, i + 3 );

        // This feels messy
        for ( var char in encodeMap )
        {
            if ( encodeMap.hasOwnProperty( char ) )
                if ( bar == encodeMap[ char ] )
                    decoded += char, encodeMap[ char ];
        }
    }

    return decoded;
}

function GetBarData( a_image )
{
    var y = Math.round( a_image.getHeight() / 2 );
    var barEnded = true;

    var smallestTop = Number.MAX_SAFE_INTEGER;
    var smallestBottom = Number.MAX_SAFE_INTEGER;
    var tallestTop = 0;
    var tallestBottom = 0;

    var bars = [];

    // Get the stroke height of the top and bottom bars
    for ( var x = 0; x < a_image.getWidth(); ++x )
    {
        var color = a_image.getPixel( x, y );
        if ( color == barColor && barEnded )
        {
            var bar = DiscoverBar( a_image, x, y );
            bars.push( bar );

            // Update bar size constraints since we don't know the dimensions
            // of the bars in the image yet
            if ( bar.top <= smallestTop )
                smallestTop = bar.top;
            else
                tallestTop = bar.top;
            if ( bar.bottom <= smallestBottom )
                smallestBottom = bar.bottom;
            else
                tallestBottom = bar.bottom;

            barEnded = false;
        }

        if ( color != barColor )
            barEnded = true;
    }


    var barData = "";

    // Determine the value of each bar
    for ( var i = 0; i < bars.length; ++i )
    {
        // See spec.txt for explanation of this

        if ( bars[ i ].top == tallestTop && bars[ i ].bottom == tallestBottom )
            barData += 0;

        if ( bars[ i ].top == tallestTop && bars[ i ].bottom == smallestBottom )
            barData += 1;

        if ( bars[ i ].top == smallestTop && bars[ i ].bottom == tallestBottom )
            barData += 2;

        if ( bars[ i ].top == smallestTop && bars[ i ].bottom == smallestBottom )
            barData += 3;
    }

    //console.log( smallestTop, smallestBottom, tallestTop, tallestBottom );
    return barData;
}

function DiscoverBar( a_image, a_x, a_baseY )
{
    var top = 0;
    var bottom = 0;

    // Using the half-way point, determine the size of the upward stroke
    for ( var y = a_baseY - 1; y > 0; --y )
        if ( a_image.getPixel( a_x, y ) == barColor )
            ++top;

    // Then the downward stroke
    for ( var y = a_baseY; y < a_image.getHeight(); ++y )
        if ( a_image.getPixel( a_x, y ) == barColor )
            ++bottom;

    return { top: top, bottom: bottom };
}

//
// Outputs a text file deliniating pixels matching the detected color
function OutputColorMatches( a_image )
{
    var output = "";

    for ( var i = 0; i <= a_image.getWidth() * a_image.getHeight(); ++i )
    {
        output += ( a_image.getAtIndex( i ) == barColor ) ? 1 : 0;

        if ( i % a_image.getWidth() == 0 && i != 0 )
            output += "\r\n";
    }

    fs.writeFileSync( "color-matches.txt", output, "utf8" );
}