import { useState } from 'react';
import { ConfigProvider } from 'antd';
import UploadJson from './components/UploadJson';
import UploadExcel from './components/UploadExcel';
import LogTable from './components/LogTable';
import DownloadJSONtranslated from './components/DownloadJSONtranslated';
import type { ChangeRecord } from './utils/types';
import './App.css';

function App() {
  const [changes, setChanges] = useState<ChangeRecord[]>([]);

  const handleChangesDetected = (newChanges: ChangeRecord[]) => {
    setChanges(newChanges);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
            🌍 i18n Translation Tool
          </h1>
          
          <div className="space-y-4">
            {/* Upload Section - 2 cards trên 1 dòng */}
            <div className="flex gap-x-3 border-amber-600 border-2">
              <UploadJson />
              <UploadExcel onChangesDetected={handleChangesDetected} />
            </div>

            {/* Download Section */}
            <div className='mt-4'>
            <DownloadJSONtranslated />

            </div>
         
            {/* Changes Table - riêng 1 dòng */}
            <LogTable changes={changes} />
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
