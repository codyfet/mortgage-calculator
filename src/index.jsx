import React from "react";
import ReactDOM from "react-dom";
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import {rootReducer} from "./Reducers/rootReducer";
import CalculatorPage from './Components/CalculatorPage';
import "./styles";

const store = createStore(rootReducer);

class App extends React.Component {
    render () {
        return <CalculatorPage />;
    }
}

ReactDOM.render(
    <Provider store={store} >
        <App />
    </Provider>,
    document.getElementById("root")
);