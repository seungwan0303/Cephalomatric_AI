import axios from 'axios';
import { useState } from 'react'
import {Container, Navbar, Nav, Modal, Form, Button} from 'react-bootstrap'

export default (props) => {

  const [show, setShow] = useState(false);
  const [folderEnable, setFolderEnable] = useState(false);
  const [fileList, setFileList] = useState([]);

  const onSaveFiles = (e) => {
      const uploadFiles = Array.prototype.slice.call(e.target.files);
      const files = [];
      uploadFiles.forEach((uploadFile) => {
        files.push(uploadFile);
      });
      setFileList(files);
  };

  const onLogout = (e) => {
    if(props.session === undefined) return;
    var sendData = JSON.stringify({
        "sessionKey":props.session
    });
    
    axios({
        method:"POST",
        url: 'http://61.245.248.172:8080/api/auth/logout',
        data:sendData,
        headers: {'Content-type': 'application/json'}
    }).then((res)=>{
        props.setSession(undefined);
    });
  }

  const onUpload = () => {
    if(props.session === undefined) return;
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('sessionDTO',props.session);
    setFileList([]);
    axios.post('http://61.245.248.172:8080/api/file/upload', formData)
    .then((res)=> {
      props.setImageData(res.data);
      setShow(false);
    })
  }

    return <>
    <Navbar expand="lg" bg="dark" data-bs-theme="dark">
      <Container>
        <Navbar.Brand href="#home">CEPHALOMETRIC</Navbar.Brand>
        <Nav className="me-auto">
        <Nav.Link onClick={()=>{
            setShow(true);
            setFolderEnable(false);
            }}>Import file</Nav.Link>
          <Nav.Link onClick={()=>{
            setShow(true);
            setFolderEnable(true);
            }}>Import folder</Nav.Link>
          <Nav.Link onClick={()=>props.setDistanceModal(true)}>
              Distance by pixel
          </Nav.Link>
        </Nav>
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            <span 
              className='text-white text-decoration-underline'
              style={{cursor:"pointer"}}
              onClick={onLogout}>Logout</span>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    <Modal show={show} onHide={()=>setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="h5">Importing Image {folderEnable ? "Folder" : "File"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control directory={folderEnable ? "" : false} webkitdirectory={folderEnable ? "" : false} type="file" onChange={onSaveFiles}/>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=>setShow(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={()=>onUpload()}>
            Import
          </Button>
        </Modal.Footer>
      </Modal>
    </>
}