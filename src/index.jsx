import React from "react";
import ReactDOM from "react-dom";
import {CalculatorPage} from './Components/CalculatorPage';

import "./styles";

class App extends React.Component {
    render () {
        return <CalculatorPage />
    }
}

ReactDOM.render(<App />, document.getElementById("root"));