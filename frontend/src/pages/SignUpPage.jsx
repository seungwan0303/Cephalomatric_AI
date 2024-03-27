import axios from "axios";
import { useState } from "react";
import { Button, Card, Container, Form, Modal } from "react-bootstrap";

export default (props) => {

    const [ID, setID] = useState("");
    const [PW, setPW] = useState("");
    const [name, setName] = useState("");
    const [show, setShow] = useState(false);
    const [buttonHover, setButtonHover] = useState(false);
    const [registerHover, setRegisterHover] = useState(false);

    const onRegister = (e) => {
        var sendData = JSON.stringify({
            "userId": ID,
            "userPw": PW,
            "name": name
        });
        axios({
            method:"POST",
            url: 'http://61.245.248.172:8080/api/auth/signup',
            data:sendData,
            headers: {'Content-type': 'application/json'}
        }).then((res)=>{
            props.setLogin(true);
        }).catch(error=>{
            setShow(true);
        });
    }

    return <>
        <Container className="d-flex justify-content-center align-items-center" style={{height:"100vh"}}>
            <Container
                style={{width:"35%"}}>
                <Card className="bg-dark text-white border border-white">
                    <Card.Header className="border-white">
                        <h4>Sign Up</h4>
                    </Card.Header>
                    <Card.Body>
                        <Container
                        className="p-2 d-flex justify-content-start align-items-start"
                        style={{flexDirection:"column"}}>
                            <p>ID : </p>
                            <Form.Control
                                className="mb-3"
                                type="text"
                                value={ID}
                                onChange={(e) => setID(e.target.value)}/>
                            <p>Password : </p>
                            <Form.Control
                                className="mb-3"
                                type="password"
                                value={PW}
                                onChange={(e) => setPW(e.target.value)}/>
                            <p>Name : </p>
                                <Form.Control
                                    className="mb-3"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}/>
                            <Container className="d-flex justify-content-center mb-3 mt-3">
                                <Button
                                    className={(buttonHover ? "bg-white text-black" : "bg-secondary text-white") + " w-50 border border-white"}
                                    onMouseEnter={()=>setButtonHover(true)}
                                    onMouseLeave={()=>setButtonHover(false)}
                                    onClick={onRegister}>Sign Up</Button>
                            </Container>
                            <Container className="d-flex justify-content-center">
                                <p
                                    className={registerHover ? "text-decoration-underline" : ""}
                                    style={{cursor:"pointer"}}
                                    onMouseEnter={()=>setRegisterHover(true)}
                                    onMouseLeave={()=>setRegisterHover(false)}
                                    onClick={()=>props.setLogin(true)}>I Have Account!</p>
                            </Container>
                        </Container>
                    </Card.Body>
                </Card>
            </Container>
        </Container>
        <Modal show={show} onHide={()=>setShow(false)} >
          <Modal.Header closeButton>
            <Modal.Title>
              Warning
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            This ID cannot be used because it is already in use. Please enter a different ID.
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={()=>setShow(false)}>Close</Button>
          </Modal.Footer>
        </Modal>
    </>;
}