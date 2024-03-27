import { Button, Container, Form, ListGroup, Modal, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap"
import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {faCheck, faHourglassHalf, faTrashCan} from "@fortawesome/free-solid-svg-icons"
import axios from "axios"

export default (props) => {

    const [hover, setHover] = useState(-1);
    const [delId, setDelId] = useState(-1);
    const [filter, setFilter] = useState("");

    const tooltip = (
        <Tooltip id="tooltip">
          Artificial intelligence is processing.
        </Tooltip>
      );

    const deleteTooltip = (
        <Tooltip id="tooltip">
          Click to delete.
        </Tooltip>
      );

      const deleteImage = () => {
        var sendData = JSON.stringify({
            "sessionKey": props.session,
            "imageId": props.data[delId]["id"]
        });
        axios({
            method:"POST",
            url: 'http://61.245.248.172:8080/api/file/delete',
            data:sendData,
            headers: {'Content-type': 'application/json'}
        }).then((res)=>{
            props.setImage(-1);
            setDelId(-1);
            props.setImageData(res.data);
        }).catch(error=>{
            setDelId(-1);
            if(error.response.status === 401){
                alert("Session Expired.");
            } else if(error.response.status === 403){
                alert("Permission Denied.");
            }
        });
      }
    

    const listRenderer = () => {
        const result = [];
        if(props.data.length <= 0){
            return <span className="h5">Nothing has been uploaded.</span>
        }
        for(let i = 0; i < props.data.length; i ++){
            const data = props.data[i];
            if(filter !== ""){
                if(((data["name"] !== undefined && data["name"] !== null && !data["name"].toLowerCase().includes(filter.toLowerCase())) || (data["name"] === undefined || data["name"] === null))
                    && ((data["date"] !== undefined && data["date"] !== null && !data["date"].toLowerCase().includes(filter.toLowerCase())) || (data["date"] === undefined || data["date"] === null))
                    && ((data["patient"] !== undefined && data["patient"] !== null && !data["patient"].toLowerCase().includes(filter.toLowerCase())) || (data["patient"] === undefined || data["patient"] === null))){
                        continue;
                    }
            }
            let element = <ListGroup.Item 
            key={i}
            onClick={()=>props.setImage(i)}
            onMouseEnter={()=>setHover(i)}
            onMouseLeave={()=>setHover(-1)}
            className="d-flex justify-content-between"
            variant={props.selected === i ? "primary" : (hover === i ? "secondary" : "none")}
        ><Container>
            {data["name"]}
            {data["status"] === "PROCESSING" && <OverlayTrigger placement="top" overlay={tooltip}><FontAwesomeIcon className="ms-2" icon={faHourglassHalf}/></OverlayTrigger>}
            {data["status"] === "COMPLETED" && <FontAwesomeIcon className="ms-1" icon={faCheck} style={{color: "#00f900",}} />}
        </Container>
        <OverlayTrigger placement="left" overlay={deleteTooltip}><FontAwesomeIcon onClick={()=>setDelId(i)} className="ms-1" icon={faTrashCan} /></OverlayTrigger>
        </ListGroup.Item>;
         result.push(element);
            
        }
        return result;
    }

    return <>
        <Container className="border border-white rounded d-flex justify-content-start align-items-center w-100 h-50" style={{overflow:"auto", flexDirection:"column"}}>
            <Container className="w-100">
                <span><strong>Search</strong></span>
                <Form.Control type="text" placeholder="Search by name." value={filter} onChange={(e)=>setFilter(e.target.value)}/>
            </Container>
            <ListGroup className="mt-3 mb-3 w-100">
                {listRenderer()}
            </ListGroup>
        </Container>
        <Modal show={delId >= 0 ? true : false} onHide={() => setDelId(-1)}>
            <Modal.Header closeButton>
            <Modal.Title>Image Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>You are about to delete the {props.data[delId] !== undefined ? props.data[delId]["name"] : ""} image. Are you sure?</Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={() => setDelId(-1)}>
                Close
            </Button>
            <Button variant="danger" onClick={() => {
                deleteImage();
                }}>
                Delete
            </Button>
            </Modal.Footer>
        </Modal>
    </>
}