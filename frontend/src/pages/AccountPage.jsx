import { useState } from "react"
import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage";

export default (props) => {

    const [login, setLogin] = useState(true);

    return <>
        {login && <LoginPage setLogin={(st) => setLogin(st)} createSession={props.createSession}/>}
        {!login && <SignUpPage setLogin={(st) => setLogin(st)}/>}
    </>
}