// ContextProvider.jsx
import React, { createContext, useState } from 'react';
import { addData, updateData, dltdata } from '../context/contex';

// eslint-disable-next-line react/prop-types
const ContextProvider = ({ children }) => {
  const [useradd, setUseradd] = useState('');
  const [update, setUpdate] = useState('');
  const [deletedata, setDLtdata] = useState('');

  return (
    <>
      <addData.Provider value={{ useradd, setUseradd }}>
        <updateData.Provider value={{ update, setUpdate }}>
          <dltdata.Provider value={{ deletedata, setDLtdata }}>
            {children}
          </dltdata.Provider>
        </updateData.Provider>
      </addData.Provider>
    </>
  );
};


export default ContextProvider;
