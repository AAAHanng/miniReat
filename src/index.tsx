import * as React from './react';
import { ReactDOM } from './react-dom';
import { Container } from './shared/types';

const App = () => {
  return (
    <h1>
      <h2>
        <h3>3333</h3>
      </h2>
    </h1>
  );
};

const root = document.querySelector('#root');

ReactDOM.createRoot(root as Container).render(<App />);

