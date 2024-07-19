import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const PhotoUpload = ({ onPhotoChange }) => {
  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length) {
      const resizedImage = await resizeFile(acceptedFiles[0]);
      onPhotoChange(resizedImage);
    }
  }, [onPhotoChange]);

  const resizeFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = async () => {
          const size = Math.min(img.width, img.height);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          canvas.width = size;
          canvas.height = size;

          const offsetX = (img.width - size) / 2;
          const offsetY = (img.height - size) / 2;

          ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);

          const maxFileSize = 1 * 1024 * 1024; // 1MB
          let quality = 0.9;
          let blob = await compressImage(canvas, quality);

          while (blob.size > maxFileSize && quality > 0.1) {
            quality -= 0.1;
            blob = await compressImage(canvas, quality);
          }

          const jpgFile = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg', lastModified: Date.now() });
          resolve(jpgFile);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const compressImage = (canvas, quality) => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', quality);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
  });

  return (
    <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
      <input {...getInputProps()} />
      <input
        type="file"
        accept="image/*"
        capture="camera"
        onChange={(e) => onDrop(e.target.files)}
        style={{ display: 'none' }}
      />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag & drop a photo here, or click to select a photo</p>
      )}
    </div>
  );
};

export default PhotoUpload;
