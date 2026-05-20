import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import App from './App.jsx';
import { store } from './redux/store.js';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <ToastContainer 
          position="bottom-center" 
          autoClose={1000} 
          hideProgressBar={true}
          pauseOnHover={false}
          pauseOnFocusLoss={false}
          closeOnClick={true}
          limit={1}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
