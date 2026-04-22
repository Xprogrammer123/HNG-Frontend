import { useState } from 'react';
import { InvoiceProvider } from './context/InvoiceContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import InvoiceList from './components/InvoiceList';
import InvoiceDetail from './components/InvoiceDetail';
import InvoiceForm from './components/InvoiceForm';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('list');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  const handleSelectInvoice = (id) => {
    setSelectedInvoiceId(id);
    setCurrentView('detail');
  };

  const handleNewInvoice = () => {
    setSelectedInvoiceId(null);
    setCurrentView('form');
  };

  const handleEditInvoice = (id) => {
    setSelectedInvoiceId(id);
    setCurrentView('form');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedInvoiceId(null);
  };

  return (
    <ThemeProvider>
      <InvoiceProvider>
        <div className="app">
          <Sidebar />
          <main className="main-content">
            {currentView === 'list' && (
              <InvoiceList
                onSelectInvoice={handleSelectInvoice}
                onNewInvoice={handleNewInvoice}
              />
            )}
            {currentView === 'detail' && (
              <InvoiceDetail
                invoiceId={selectedInvoiceId}
                onBack={handleBackToList}
                onEdit={handleEditInvoice}
              />
            )}
            {currentView === 'form' && (
              <InvoiceForm
                invoiceId={selectedInvoiceId}
                onBack={handleBackToList}
                onSuccess={handleBackToList}
              />
            )}
          </main>
        </div>
      </InvoiceProvider>
    </ThemeProvider>
  );
}

export default App;
