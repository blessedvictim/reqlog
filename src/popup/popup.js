import React, {useState, useEffect} from 'react';
import ReactDOM from "react-dom";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import SaveIcon from '@material-ui/icons/Save';
import PouchDB from 'pouchdb';

function handleResponse(message) {
    console.log(`Message from the background script:  ${message.response}`);
}

function handleError(error) {
    console.log(`Error: ${error}`);
}

function App() {
    const [count, setCount] = useState(0);

    // Аналогично componentDidMount и componentDidUpdate:
    useEffect(() => {
        // Обновляем заголовок документа с помощью API браузера
        document.title = `Вы нажали ${count} раз`;
    });

    return (
        <Box width={500}>
            <Container component="main">
                <form noValidate autoComplete="off">
                    <TextField variant="filled" margin="normal" label="Log requests from "/>
                    <TextField variant="filled" margin="normal" label="to ..."/>
                    <Button
                        variant="contained"
                        color="primary"
                        size="normal"
                        startIcon={<SaveIcon/>}
                        onClick={() => {
                            setCount(count + 1)
                            console.log("LAL")
                            chrome.runtime.sendMessage({greeting: "Greeting from the content script"})
                        }}
                    >
                        Save
                    </Button>
                </form>
            </Container>
        </Box>
    );
}

ReactDOM.render(<App/>, document.getElementById("root"));