import React, { useState, useRef } from 'react';
import './ChatScreen.css';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

const ChatScreen = ({ pdfName, contextData }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [pdfError, setPdfError] = useState('');
  const [pagesToRender, setPagesToRender] = useState([]);
  const pdfContainerRef = useRef(null);

  const pdfFileUrl = `https://php-file-viewer-1.onrender.com/uploads/${encodeURIComponent(pdfName)}`;

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPagesToRender(Array.from({ length: numPages }, (_, i) => i + 1));
    setPdfError('');
  };

  const onDocumentLoadError = (err) => {
    setPdfError('❌ Failed to load PDF. Please check the server or path.');
  };

  const scrollToPdfPage = (pageNum) => {
    const pageEl = document.getElementById(`page_${pageNum}`);
    const viewerEl = document.querySelector('.pdf-viewer-scroll');
    if (pageEl && viewerEl) {
      viewerEl.scrollTo({
        top: pageEl.offsetTop - 20,
        behavior: 'smooth'
      });
    } 
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { type: 'user', text: input };
    setMessages((prev) => {
      const updated = [...prev, userMessage];
      return updated;
    });
    setInput('');

    try {
      const res = await axios.post('https://php-file-viewer-1.onrender.com/chat.php', {
        question: input,
        file: pdfName
      });
console.log(res)

      const aiMessage = {
        type: 'ai',
        text: typeof res.data.answer === 'string' ? res.data.answer : '',
        citations: Array.isArray(res.data.citations) ? res.data.citations : [],
      };

      setMessages((prev) => {
        const updated = [...prev, aiMessage];
        return updated;
      });
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { type: 'ai', text: '❌ Error fetching response. Please try again.' },
      ]);
    }
  };

  const parseCitationsInText = (text) => {
    if (typeof text !== 'string') return null;

    const parts = [];
    const regex = /\[Page (\d+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const page = parseInt(match[1], 10);
      const matchStart = match.index;
      const matchEnd = regex.lastIndex;

      if (lastIndex < matchStart) {
        parts.push(text.slice(lastIndex, matchStart));
      }

      parts.push(
        <span
          key={`page-${page}-${matchStart}`}
          className="citation-link"
          onClick={() => scrollToPdfPage(page)}
        >
          {match[0]}
        </span>
      );

      lastIndex = matchEnd;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div className="chat-screen">
      <div className="chat-panel">
        <div className="toolbar">
          <span className="pdf-icon">📄</span>
          <span className="pdf-name">{pdfName}</span>
        </div>

        <div className="messages">
          <div className="message-bubble user-msg">Your document is ready!</div>
          <div className="message-bubble user-msg">Try asking:</div>
          <div className="message-bubble user-msg">"Summarize this document"</div>
          <div className="message-bubble ai-msg">This is a resume file uploaded.</div>

          {messages.map((msg, i) => {
            return (
              <div
                key={i}
                className={`message-bubble ${msg.type === 'user' ? 'user-msg' : 'ai-msg'}`}
              >
                {parseCitationsInText(msg.text || '')}
                {msg.citations?.length > 0 && (
                  <div className="citations">
                    {msg.citations.map((c, index) => (
                      <span
                        key={index}
                        className="citation-link"
                        onClick={() => scrollToPdfPage(c.page)}
                      >
                        Page {c.page}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="input-area">
          <input
            type="text"
            placeholder="Ask about the document..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>

      <div className="pdf-panel">
        {pdfError ? (
          <div className="error">{pdfError}</div>
        ) : (
          <div className="pdf-viewer-scroll" ref={pdfContainerRef}>
            <Document
              file={pdfFileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
            >
              {pagesToRender.map((pageNum) => (
                <div key={pageNum} id={`page_${pageNum}`} className="pdf-page-container">
                  <Page
                    pageNumber={pageNum}
                    width={600}
                    renderTextLayer
                    renderAnnotationLayer
                  />
                  <div className="page-label">Page {pageNum}</div>
                </div>
              ))}
            </Document>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatScreen;
