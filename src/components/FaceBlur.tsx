import { useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { canvasRGB } from 'stackblur-canvas';
const FaceBlur = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    };
    loadModels();
  }, []);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'blurred-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      const detections = await faceapi.detectAllFaces(
        image,
        new faceapi.SsdMobilenetv1Options({ minConfidence: 0.2 })
      );
      console.log(detections);
      detections.forEach(({ box }) => {
        const x = Math.max(0, Math.floor(box.x));
        const y = Math.max(0, Math.floor(box.y));
        const width = Math.min(canvas.width - x, Math.ceil(box.width));
        const height = Math.min(canvas.height - y, Math.ceil(box.height));
        const blurRadius = Math.max(5, Math.round(Math.min(width, height) / 6));
        canvasRGB(canvas, x, y, width, height, blurRadius);
      });
    };
  };
  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <h1>Face Blur App</h1>
        <input
          type="file"
          accept=".jpg, .jpeg, .png"
          onChange={handleImageUpload}
        />
        <button onClick={handleDownload}>Download Image</button>
        <br />
        <canvas
          ref={canvasRef}
          style={{
            marginTop: '20px',
            border: '1px solid #ccc',
            maxWidth: '100%',
          }}
        ></canvas>
      </div>
    </>
  );
};

export default FaceBlur;
