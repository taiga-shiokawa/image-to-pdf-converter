import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Upload, FileText, Camera, Image } from 'lucide-react';
import "../css/image-to-pdf-converter.css";

const ImageToPdfConverter = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSourceSelect, setShowSourceSelect] = useState(false);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowSourceSelect(false);
    }
  };

  const convertToPdf = async () => {
    if (!selectedImage) return;
    setLoading(true);

    try {
      const pdf = new jsPDF();
      
      const imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(selectedImage);
      });

      const img = await new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.src = imageData;
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      let imgWidth = img.width;
      let imgHeight = img.height;
      
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
      imgWidth *= ratio;
      imgHeight *= ratio;
      
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;
      
      pdf.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);

      const pdfOutput = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfOutput);
      
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.open(pdfUrl, '_blank');
      } else {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'converted-image.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      console.error('PDF conversion error:', error);
      alert('PDF conversion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  return (
    <div className="converter-container">
      {!showSourceSelect ? (
        <div 
          className="upload-area"
          onClick={() => isMobile() && setShowSourceSelect(true)}
        >
          <label className="upload-content">
            <Upload className="upload-icon" />
            <p className="upload-text">
              {isMobile() ? 'タップして写真を選択' : '画像をクリックまたはドラッグ＆ドロップ'}
            </p>
            {!isMobile() && (
              <input
                type="file"
                className="file-input"
                accept="image/*"
                onChange={handleImageSelect}
              />
            )}
          </label>
        </div>
      ) : (
        <div className="source-select">
          <label className="source-option">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="file-input"
              onChange={handleImageSelect}
            />
            <div className="source-button">
              <Camera className="source-icon" />
              <span>カメラで撮影</span>
            </div>
          </label>
          
          <label className="source-option">
            <input
              type="file"
              accept="image/*"
              className="file-input"
              onChange={handleImageSelect}
            />
            <div className="source-button">
              <Image className="source-icon" />
              <span>アルバムから選択</span>
            </div>
          </label>
        </div>
      )}

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
        disabled={!selectedImage || loading}
        className="convert-button"
      >
        {loading ? (
          <span className="loading-text">変換中...</span>
        ) : (
          <>
            <FileText className="convert-button-icon" />
            PDFに変換
          </>
        )}
      </button>
    </div>
  );
};

export default ImageToPdfConverter;