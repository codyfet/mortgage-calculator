import React from "react";
import ReactDOM from "react-dom";
// import { Button } from 'semantic-ui-react';
import {CalcPage} from './CalcPage';

import "./styles";

class HelloWorld extends React.Component {
    render () {
        return <CalcPage />
    }
}

ReactDOM.render(<HelloWorld />, document.getElementById("root"));