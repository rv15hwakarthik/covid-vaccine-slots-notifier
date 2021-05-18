import './App.css';
import Header from '../src/components/Header';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Notifier from '../src/components/Notifier';
import Footer from '../src/components/Footer';

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <div>
          <Route exact path="/">
            <Notifier />
          </Route>
          <Route path="/donate">
            this is the donations page
          </Route>
        </div>
        <Footer />
      </Router>
    </div>
  );
}

export default App;


