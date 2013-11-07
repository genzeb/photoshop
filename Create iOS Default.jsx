// Photoshop Script to Create iPhone Icons from iTunesArtwork
//
// WARNING!!! In the rare case that there are name collisions, this script will
// overwrite (delete perminently) files in the same folder in which the selected
// iTunesArtwork file is located. Therefore, to be safe, before running the
// script, it's best to make sure the selected iTuensArtwork file is the only
// file in its containing folder.
//
// Copyright (c) 2010 Matt Di Pasquale
// Added tweaks Copyright (c) 2012 by Josh Jones http://www.appsbynight.com
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
// Prerequisite:
// First, create at least a 1024x1024 px PNG file according to:
// http://developer.apple.com/library/ios/#documentation/iphone/conceptual/iphoneosprogrammingguide/BuildTimeConfiguration/BuildTimeConfiguration.html
//
// Install - Save Create Icons.jsx to:
//   Win: C:\Program Files\Adobe\Adobe Utilities\ExtendScript Toolkit CS5\SDK
//   Mac: /Applications/Utilities/Adobe Utilities/ExtendScript Toolkit CS5/SDK
// * Restart Photoshop
//
// Update:
// * Just modify & save, no need to resart Photoshop once it's installed.
//
// Run:
// * With Photoshop open, select File > Scripts > Create Icons
// * When prompted select the prepared iTunesArtwork file for your app.
// * The different version of the icons will get saved to the same folder that
//   the iTunesArtwork file is in.
//
// Adobe Photoshop JavaScript Reference
// http://www.adobe.com/devnet/photoshop/scripting.html


// Turn debugger on. 0 is off.
// $.level = 1;

try
{
  // Prompt user to select iTunesArtwork file. Clicking "Cancel" returns null.
  var iTunesArtwork = File.openDialog("iOS Launch Image Generator - Select a sqaure PNG file that is 2048x2048.", "*.png", false);

  if (iTunesArtwork !== null) 
  { 
    var doc = open(iTunesArtwork, OpenDocumentType.PNG);
    
    if (doc == null)
    {
      throw "Something is wrong with the file.  Make sure it's a valid PNG file.";
    }

    var startState = doc.activeHistoryState;       // save for undo
    var initialPrefs = app.preferences.rulerUnits; // will restore at end
    app.preferences.rulerUnits = Units.PIXELS;     // use pixels

    if (doc.width != doc.height)
    {
        throw "Image is not square";
    }
    else if ((doc.width < 1024) && (doc.height < 1024))
    {
        throw "Image is too small!  Image must be at least 1024x1024 pixels.";
    }
    else if (doc.width < 1024)
    {
        throw "Image width is too small!  Image width must be at least 1024 pixels.";
    }
    else if (doc.height < 1024)
    {
        throw "Image height is too small!  Image height must be at least 1024 pixels.";
    }
    
    // Folder selection dialog
    var destFolder = Folder.selectDialog( "Choose an output folder");

    if (destFolder == null)
    {
      // User canceled, just exit
      throw "";
    }

    // Save icons in PNG using Save for Web.
    var sfw = new ExportOptionsSaveForWeb();
    sfw.format = SaveDocumentType.PNG;
    sfw.PNG8 = false; // use PNG-24
    sfw.transparency = true;
    doc.info = null;  // delete metadata
    
    var icons = [      
      {"name": "Default-568h@2x", "width":640, "height":1136},
      
      {"name": "Default-iPad-1536x2048", "width":768, "height":1024},
      {"name": "Default-iPad-1536x2048@2x", "width":1536, "height":2048},

      {"name": "Default-iPad-2048-1536", "width":1024, "height":768},
      {"name": "Default-iPad-2048-1536@2x", "width":2048, "height":1536},

      {"name": "Default-iPhone-640x920", "width":320, "height":460},
      {"name": "Default-iPhone-640x920@2x", "width":640, "height":920},

      {"name": "Default-iPhone-640x1096", "width":320, "height":548},
      {"name": "Default-iPhone-640x1096@2x", "width":640, "height":1096},

      {"name": "Default-iPhone-640x1136", "width":640, "height":1136},
      {"name": "Default", "width":320, "height":480},
      {"name": "Default~iphone", "width":640, "height":960},
      {"name": "DefaultImageiPad-Landscape@2x~ipad", "width":2048, "height":1496},
      {"name": "DefaultImageiPad-Landscape~ipad", "width":1024, "height":748},
      {"name": "DefaultImageiPad", "width":768, "height":1004},
      {"name": "DefaultImageiPad~ipad", "width":1536, "height":2008},
      
      {"name": "DefaultSquare", "width":512, "height":512},
      {"name": "DefaultSquare@2x", "width":1024, "height":1024}
    ];  

    var icon;
    for (i = 0; i < icons.length; i++) 
    {
      icon = icons[i];

      size = icon.width > icon.height ? icon.width : icon.height;

      doc.resizeImage(size, size, // width, height
                      null, ResampleMethod.BICUBICSHARPER);

      left = (size - icon.width)/2;
      top = (size - icon.height)/2;
      right = left + icon.width;
      bottom = top + icon.height;

      doc.crop(new Array(left,top,right,bottom));

      var destFileName = icon.name + ".png";

      doc.exportDocument(new File(destFolder + "/" + destFileName), ExportType.SAVEFORWEB, sfw);

      doc.activeHistoryState = startState; // undo resize
    }

    alert("iOS Launch Images created!");
  }
}
catch (exception)
{
  // Show degbug message and then quit
	if ((exception != null) && (exception != ""))
    alert(exception);
 }
finally
{
    if (doc != null)
        doc.close(SaveOptions.DONOTSAVECHANGES);
  
    app.preferences.rulerUnits = initialPrefs; // restore prefs
}