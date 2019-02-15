import React, {
  StrictMode,
  Suspense,
  unstable_ConcurrentMode as ConcurrentMode,
} from 'react';
import ReactDOM from 'react-dom';
import { useFetch } from './usefetch';
import Loader from 'react-loader-spinner';
import JSONtree from 'react-json-tree';

const Err = ({ error }) => {
  return <span>Error: {error.message}</span>;
};

const DisplayData = () => {
  const { error, data } = useFetch(
    'https://jsonplaceholder.typicode.com/users'
  );
  if (error) return <Err error={error} />;
  if (!data) return null;
  return <JSONtree data={data} />;
};

const App = () => (
  <StrictMode>
    <ConcurrentMode>
      <Suspense
        fallback={<Loader type="Oval" color="#61dafb" height={80} width={80} />}
      >
        <DisplayData />
      </Suspense>
    </ConcurrentMode>
  </StrictMode>
);

ReactDOM.render(<App />, document.getElementById('root'));
