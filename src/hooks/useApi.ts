// useApi.ts
import { useContext } from 'react';
import { ApiContext } from '../contexts/ApiContextValue';

export const useApi = () => {
  const context = useContext(ApiContext);

  if (!context) {
    throw new Error('useApi deve ser usado dentro de um ApiProvider');
  }

  return context;
};
