import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Upload, FileText } from 'lucide-react';
import "../css/image-to-pdf-converter.css";

const ImageToPdfConverter = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // モバイル対応のPDF生成&ダウンロード処理
  const convertToPdf = async () => {
    if (!selectedImage) return;
    setLoading(true);

    try {
      const pdf = new jsPDF();
      
      // Base64形式で画像を読み込む
      const reader = new FileReader();
      
      const imageData = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(selectedImage);
      });

      const img = await new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.src = imageData;
      });

      // PDF用のサイズ計算
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
      
      // PDFに画像を追加
      pdf.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);

      // モバイル対応のダウンロード処理
      const pdfOutput = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfOutput);
      
      // ダウンロードリンクを作成
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfUrl;
      downloadLink.download = 'converted-image.pdf';
      
      // iOS Safariの場合は新しいタブでPDFを開く
      if (navigator.userAgent.match(/(iPhone|iPad)/i)) {
        window.open(pdfUrl, '_blank');
      } else {
        // その他のデバイスはダウンロードを試みる
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      
      // 生成したURLを解放
      URL.revokeObjectURL(pdfUrl);
      
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDFの生成中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="converter-container">
      <div className="upload-area">
        <label className="upload-content">
          <Upload className="upload-icon" />
          <p className="upload-text">
            {isMobile() ? '写真を選択または撮影' : '画像をクリックまたはドラッグ＆ドロップ'}
          </p>
          <input
            type="file"
            className="file-input"
            accept="image/*"
            capture="environment"
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

// モバイル判定用のユーティリティ関数
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export default ImageToPdfConverter;