import { useState } from 'react';
import { InvoiceProvider } from './context/InvoiceContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import InvoiceList from './components/InvoiceList';
import InvoiceDetail from './components/InvoiceDetail';
import InvoiceForm from './components/InvoiceForm';

function App() {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'detail'
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formInvoiceId, setFormInvoiceId] = useState(null);

  const handleSelectInvoice = (id) => {
    setSelectedInvoiceId(id);
    setCurrentView('detail');
    setShowForm(false);
  };

  const handleNewInvoice = () => {
    setFormInvoiceId(null);
    setShowForm(true);
  };

  const handleEditInvoice = (id) => {
    setFormInvoiceId(id);
    setShowForm(true);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedInvoiceId(null);
    setShowForm(false);
    setFormInvoiceId(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormInvoiceId(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setFormInvoiceId(null);
    setCurrentView('list');
  };

  return (
    <ThemeProvider>
      <InvoiceProvider>
        <div className="flex flex-col min-h-screen lg:flex-row">
          <Sidebar />
          <main className="flex-1 overflow-y-auto w-full px-6 py-8 md:px-12 md:py-14 lg:py-[72px] lg:px-0 lg:max-w-[730px] lg:mr-auto lg:ml-[calc(103px+max(0px,calc(50vw-365.5px)))]">
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
          </main>

          {showForm && (
            <InvoiceForm
              invoiceId={formInvoiceId}
              onClose={handleCloseForm}
              onSuccess={handleFormSuccess}
            />
          )}
        </div>
      </InvoiceProvider>
    </ThemeProvider>
  );
}

export default App;
