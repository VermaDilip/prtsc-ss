import React, { useRef, useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

const ScreenshotCapture = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false); // Loading state
  const [imageLoaded, setImageLoaded] = useState(false); // Track if an image is loaded
  const [darkMode, setDarkMode] = useState(false); // Dark mode state

  useEffect(() => {
    containerRef.current.focus();
  }, []);

  const handlePaste = (event) => {
    const items = event.clipboardData.items;
    processImage(items);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const items = event.dataTransfer.items;
    processImage(items);
  };

  const processImage = (items) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        const reader = new FileReader();

        setLoading(true);
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            setLoading(false);
            setImageLoaded(true);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const downloadPDF = () => {
    const canvas = canvasRef.current;
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 190;
    const pageHeight = pdf.internal.pageSize.height;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('screenshot.pdf');
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setImageLoaded(false);
  };

  const toggleDarkMode = () => setDarkMode((prevMode) => !prevMode);

  return (
    <div
      style={{ ...styles.container, backgroundColor: darkMode ? '#333' : '#f0f0f0' }}
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      ref={containerRef}
    >
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={{ ...styles.title, color: darkMode ? '#000' : '#000' }}>Screenshot Capture</h1>
          <button onClick={toggleDarkMode} style={styles.darkModeBtn}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
        <p style={{ ...styles.subtitle, color: darkMode ? '#555' : '#555' }}>
          Paste your screenshot (Ctrl + V) or drag & drop an image
        </p>

        <canvas ref={canvasRef} style={styles.canvas} />

        {loading && <p style={styles.loadingText}>Processing image...</p>}

        {imageLoaded && (
          <div style={styles.buttonGroup}>
            <button onClick={downloadPDF} style={styles.downloadBtn}>Download as PDF</button>
            <button onClick={clearCanvas} style={styles.clearBtn}>Clear</button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    // padding: '2px',
    transition: 'background-color 0.5s',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    width: '50%',
    // maxWidth: '600px',
    textAlign: 'center',
    position: 'relative',
    paddingtop: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  title: {
    fontSize: '1.8rem',
  },
  subtitle: {
    marginBottom: '20px',
  },
  canvas: {
    marginTop: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    display: 'block',
    margin: '0 auto',
    maxWidth: '100%',
    height: 'auto',
    boxShadow: 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
  },
  loadingText: {
    marginTop: '15px',
    fontSize: '1.2rem',
    color: '#888',
  },
  buttonGroup: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  },
  downloadBtn: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  clearBtn: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  darkModeBtn: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    padding: '5px 10px',
  },
};

export default ScreenshotCapture;