import React, { useState, useRef } from 'react';
import { Download } from 'lucide-react';

export default function LeafletTileGenerator() {
  const [image, setImage] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tiles, setTiles] = useState([]);
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setTiles([]);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const generateTiles = async () => {
    if (!image) return;

    setGenerating(true);
    setProgress(0);
    const generatedTiles = [];

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const tileSize = 256;

    // Calculate zoom levels needed
    const imageSize = Math.max(image.width, image.height);
    const maxZoom = Math.ceil(Math.log2(imageSize / tileSize));

    // Generate tiles for each zoom level
    for (let zoom = 0; zoom <= maxZoom; zoom++) {
      const scale = Math.pow(2, zoom);
      const tilesPerSide = scale;
      const scaledSize = tileSize * tilesPerSide;

      for (let y = 0; y < tilesPerSide; y++) {
        for (let x = 0; x < tilesPerSide; x++) {
          canvas.width = tileSize;
          canvas.height = tileSize;

          // Clear canvas
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, tileSize, tileSize);

          // Calculate source coordinates
          const sx = (x * image.width) / tilesPerSide;
          const sy = (y * image.height) / tilesPerSide;
          const sw = image.width / tilesPerSide;
          const sh = image.height / tilesPerSide;

          // Draw the tile
          ctx.drawImage(image, sx, sy, sw, sh, 0, 0, tileSize, tileSize);

          // Convert to blob
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
          
          generatedTiles.push({
            zoom,
            x,
            y,
            blob,
            url: URL.createObjectURL(blob)
          });

          const totalTiles = Math.pow(4, maxZoom + 1) / 3;
          const currentTile = generatedTiles.length;
          setProgress(Math.round((currentTile / totalTiles) * 100));
        }
      }
    }

    setTiles(generatedTiles);
    setGenerating(false);
  };

  const downloadTiles = () => {
    tiles.forEach(tile => {
      const a = document.createElement('a');
      a.href = tile.url;
      a.download = `tile_${tile.zoom}_${tile.x}_${tile.y}.png`;
      a.click();
    });
  };

  const downloadAsZip = async () => {
    // Create a structure for download instructions
    const structure = {};
    tiles.forEach(tile => {
      if (!structure[tile.zoom]) structure[tile.zoom] = [];
      structure[tile.zoom].push({ x: tile.x, y: tile.y });
    });

    const instructions = `Tiles Generated: ${tiles.length}

Folder Structure:
${Object.keys(structure).map(zoom => `
zoom${zoom}/
${structure[zoom].map(t => `  ${t.x}/
    ${t.y}.png`).join('\n')}`).join('\n')}

Leaflet Configuration:
L.tileLayer('tiles/{z}/{x}/{y}.png', {
  minZoom: 0,
  maxZoom: ${Math.max(...tiles.map(t => t.zoom))},
  noWrap: true,
  bounds: [[0, 0], [${image.height}, ${image.width}]]
}).addTo(map);`;

    const blob = new Blob([instructions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tile_structure.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Leaflet Tile Generator</h1>
          <p className="text-gray-600 mb-6">Generate tiles for your 4096x4096 image to use with Leaflet maps</p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload your 4096x4096 PNG image
            </label>
            <input
              type="file"
              accept="image/png"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          {image && (
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">
                  Image size: {image.width} x {image.height}
                </p>
                <p className="text-sm text-gray-600">
                  Estimated tiles: {Math.pow(4, Math.ceil(Math.log2(Math.max(image.width, image.height) / 256)) + 1) / 3 | 0}
                </p>
              </div>

              <button
                onClick={generateTiles}
                disabled={generating}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {generating ? `Generating... ${progress}%` : 'Generate Tiles'}
              </button>
            </div>
          )}

          {generating && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {tiles.length > 0 && !generating && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold">✓ Generated {tiles.length} tiles successfully!</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={downloadTiles}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download All Tiles
                </button>
                <button
                  onClick={downloadAsZip}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Download Structure Info
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h3 className="font-semibold text-gray-800 mb-2">Tile Preview</h3>
                <div className="grid grid-cols-8 gap-1 max-h-96 overflow-auto">
                  {tiles.slice(0, 64).map((tile, idx) => (
                    <img
                      key={idx}
                      src={tile.url}
                      alt={`Tile ${tile.zoom}-${tile.x}-${tile.y}`}
                      className="w-full h-auto border border-gray-200"
                      title={`Z${tile.zoom} X${tile.x} Y${tile.y}`}
                    />
                  ))}
                </div>
                {tiles.length > 64 && (
                  <p className="text-sm text-gray-500 mt-2">Showing first 64 tiles</p>
                )}
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}