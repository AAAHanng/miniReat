import * as React from './react';
import { ReactDOM } from './react-dom';

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

if (root) {
  ReactDOM.createRoot(root).render(<App />);
}
