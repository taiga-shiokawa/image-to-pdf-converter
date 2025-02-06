import ImageToPdfConverter from "./components/ImageToPdfConverter";
import "./css/common.css";

function App() {
  return (
    <div className="app-container">
      <h1 className="app-title">画像 PDF 変換ツール</h1>
      <ImageToPdfConverter />
    </div>
  );
}

export default App;
