import { jsPDF } from 'jspdf';
import { Upload, FileText } from 'lucide-react';
import "../css/image-to-pdf-converter.css";
import { useState } from 'react';

const ImageToPdfConverter = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const convertToPdf = async () => {
    if (!selectedImage) return;

    const pdf = new jsPDF();
    
    const reader = new FileReader();
    reader.readAsDataURL(selectedImage);
    
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      
      img.onload = () => {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        let imgWidth = img.width;
        let imgHeight = img.height;
        
        if (imgWidth > pageWidth || imgHeight > pageHeight) {
          const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
          imgWidth *= ratio;
          imgHeight *= ratio;
        }
        
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;
        
        pdf.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
        pdf.save('converted-image.pdf');
      };
    };
  };

  return (
    <div className="converter-container">
      <div className="upload-area">
        <label className="upload-content">
          <Upload className="upload-icon" />
          <p className="upload-text">画像をクリックまたはドラッグ＆ドロップしてください</p>
          <input
            type="file"
            className="file-input"
            accept="image/*"
            onChange={handleImageSelect}
          />
        </label>
      </div>

      {previewUrl && (
        <div className="preview-container">
          <img
            src={previewUrl}
            alt="Preview"
            className="preview-image"
          />
        </div>
      )}

      <button
        onClick={convertToPdf}
        disabled={!selectedImage}
        className="convert-button"
      >
        <FileText className="convert-button-icon" />
        PDFに変換
      </button>
    </div>
  );
};

export default ImageToPdfConverter;