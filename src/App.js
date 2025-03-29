import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const originalImageRef = useRef(null);
  const coloredImageRef = useRef(null);

  // List of available images
  const images = [
    'unicorn4.jpg',
    'unicorn_and_rainbow.webp',
    'eckersley_unicorn.jpg',
    'kawaii-art-cute-unicorn-sq-tatyana-deniz.jpg'
  ];

  const loadImage = (imagePath) => {
    setIsLoading(true);
    setError(null);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const originalImage = new Image();
    const coloredImage = new Image();

    originalImage.onload = () => {
      // Calculate dimensions to fit within max size while maintaining aspect ratio
      const maxWidth = 800;
      const maxHeight = 600;
      let width = originalImage.width;
      let height = originalImage.height;

      if (width > maxWidth) {
        height = (maxWidth * height) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (maxHeight * width) / height;
        height = maxHeight;
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;
      
      // Draw the original image at the calculated size
      ctx.drawImage(originalImage, 0, 0, width, height);
      
      // Convert to grayscale
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }
      ctx.putImageData(imageData, 0, 0);

      // Store the images with their dimensions
      originalImageRef.current = {
        image: originalImage,
        width,
        height
      };
      coloredImageRef.current = {
        image: coloredImage,
        width,
        height
      };
      
      setIsLoading(false);
    };

    originalImage.onerror = () => {
      setError('Failed to load image. Please try again.');
      setIsLoading(false);
    };

    originalImage.src = imagePath;
    coloredImage.src = imagePath;
  };

  const getRandomImage = () => {
    const randomImage = images[Math.floor(Math.random() * images.length)];
    return `/assets/${randomImage}`;
  };

  useEffect(() => {
    loadImage(getRandomImage());
  }, []);

  const handleNewImage = () => {
    loadImage(getRandomImage());
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCursorPosition({ x, y });

    if (isDrawing && coloredImageRef.current) {
      const ctx = canvas.getContext('2d');
      const { image, width, height } = coloredImageRef.current;
      
      // Calculate the brush size based on the canvas size
      const brushSize = Math.min(width, height) * 0.05;
      
      // Calculate the source coordinates in the original image
      const sourceX = (x / width) * image.width;
      const sourceY = (y / height) * image.height;
      const sourceSize = (brushSize / width) * image.width;
      
      // Draw the colored portion
      ctx.drawImage(
        image,
        sourceX - sourceSize/2,
        sourceY - sourceSize/2,
        sourceSize,
        sourceSize,
        x - brushSize/2,
        y - brushSize/2,
        brushSize,
        brushSize
      );
    }
  };

  const handleMouseDown = () => {
    setIsDrawing(true);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <div className="App">
      <div className="app-content">
        <h1 className="app-title">Magical Unicorn Coloring</h1>
        <p className="app-instructions">Click and drag your mouse to reveal the colors!</p>
        <button className="new-image-button" onClick={handleNewImage}>
          Try Another Unicorn! 🦄
        </button>
        <div className="canvas-container">
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>Loading magical unicorn...</p>
            </div>
          )}
          {error && (
            <div className="error-message">
              {error}
              <button onClick={handleNewImage}>Try Again</button>
            </div>
          )}
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          <div
            className="cursor-indicator"
            style={{
              left: cursorPosition.x - 10,
              top: cursorPosition.y - 10,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
