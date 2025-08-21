import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: 'Lato', 'Inter', 'Roboto', Arial, sans-serif;
    background: linear-gradient(360deg, #000000ff 70%, #000000ff 100%);
    color: #fff;
    box-sizing: border-box;
  }

  * {
    box-sizing: inherit;
  }

  ::selection {
    background: #14213844;
  }

  /* Scrollbar estilizada */
  ::-webkit-scrollbar {
    width: 8px;
    background: #19253aff;
  }
  ::-webkit-scrollbar-thumb {
    background: #222b3a;
    border-radius: 8px;
  }
`; 