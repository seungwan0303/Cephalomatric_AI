import axios from "axios";
import { useState } from "react";
import { Button, Card, Container, Form, Modal } from "react-bootstrap";
import logo from '../logo.png';

export default (props) => {

    const [ID, setID] = useState("");
    const [PW, setPW] = useState("");
    const [buttonHover, setButtonHover] = useState(false);
    const [registerHover, setRegisterHover] = useState(false);
    const [show, setShow] = useState(false);

    const onLogin = (e) => {
        var sendData = JSON.stringify({
            "userId": ID,
            "userPw": PW
        });
        axios({
            method:"POST",
            url: 'http://61.245.248.172:8080/api/auth/signin',
            data:sendData,
            headers: {'Content-type': 'application/json'}
        }).then((res)=>{
            console.log(res.data);
            props.createSession(res.data);
        }).catch(error=>{
            setShow(true);
        });
    }

    return <>
        <Container className="d-flex justify-content-center align-items-center" style={{height:"100vh", flexDirection:"column"}}>
            <Container className="w-50 p-3 rounded d-flex justify-content-center align-items-center m-5">
                <img src={logo} style={{width:"20%"}} className="me-5"></img>
                <h1><strong>Cephalometric AI</strong></h1>
            </Container>
            <Container
                style={{width:"35%"}}>
                <Card className="bg-dark text-white border border-white">
                    <Card.Header className="border-white">
                        <h4><strong>Sign In</strong></h4>
                    </Card.Header>
                    <Card.Body>
                        <Container 
                        className="p-2 d-flex justify-content-start align-items-start"
                        style={{flexDirection:"column"}}>
                            <p><strong>ID : </strong></p>
                            <Form.Control 
                                className="mb-3" 
                                type="text"
                                value={ID}
                                onChange={(e) => setID(e.target.value)}/>
                            <p><strong>Password : </strong></p>
                            <Form.Control 
                                className="mb-3" 
                                type="password"
                                value={PW}
                                onChange={(e) => setPW(e.target.value)}
                                onKeyUp={(e) => {
                                    if(e.key === 'Enter'){
                                        onLogin(e);
                                    }
                                }}/>
                            <Container className="d-flex justify-content-center mb-3 mt-3">
                                <Button 
                                    className={(buttonHover ? "bg-white text-black" : "bg-secondary text-white") + " w-50 border border-white"}
                                    onMouseEnter={()=>setButtonHover(true)}
                                    onMouseLeave={()=>setButtonHover(false)}
                                    onClick={onLogin}><strong>Sign In</strong></Button>
                            </Container>
                            <Container className="d-flex justify-content-center">
                                <p 
                                    className={registerHover ? "text-decoration-underline" : ""}
                                    style={{cursor:"pointer"}}
                                    onMouseEnter={()=>setRegisterHover(true)}
                                    onMouseLeave={()=>setRegisterHover(false)}
                                    onClick={()=>props.setLogin(false)}>Register</p>
                            </Container>
                        </Container>
                    </Card.Body>
                </Card>
            </Container>
        </Container>
        <Modal show={show} onHide={()=>setShow(false)} >
          <Modal.Header closeButton>
            <Modal.Title>
              Error
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            The ID or password is incorrect.
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={()=>setShow(false)}>Close</Button>
          </Modal.Footer>
        </Modal>
    </>;
}