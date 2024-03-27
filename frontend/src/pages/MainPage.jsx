import {useEffect, useRef, useState} from "react";
import {Button, Container, Form, Modal} from "react-bootstrap";
import ImageViewer from "../component/ImageViewer";
import Menu from "../component/Menu";
import axios from "axios";
import NavigationBar from "../component/NavigationBar";
import {MutableRefObject} from "react";

export default (props) => {
    const [imageData, setImageData] = useState([]);
    const [timerFlag, setTimerFlag] = useState(false);
    const [select, setSelect] = useState(-1);
    const [pixelDistance, setPixelDistance] = useState(0.0);

    const [distanceModal, setDistanceModal] = useState(false);

    const downloadCanvas: MutableRefObject<HTMLCanvasElement> = useRef()

    const selectImageUrl = (number) => {
      setSelect(number);
    }

    const openDistanceModal = (open) => {
        setDistanceModal(open);
    }

    const refreshImageData = (datas) => {
      setImageData(datas);
    }
    
    const postImageList = () => {
      if(props.session === undefined) return;
      var sendData = JSON.stringify({
          "sessionKey":props.session
      });
      axios({
          method:"POST",
          url: 'http://61.245.248.172:8080/api/file/list',
          data:sendData,
          headers: {'Content-type': 'application/json'}
      }).then((res)=>{
          setImageData(res.data);
      }).catch((error)=>{
        props.setSession(undefined);
        alert("Session Expired.");
      });
    }

    const getDistanceByPixelFromServer = () => {
        const sendData = JSON.stringify({
            "sessionKey": props.session
        });
        axios({
            method:"POST",
            url:"http://61.245.248.172:8080/api/auth/getscale",
            data:sendData,
            headers:{"Content-type":"application/json"}
        }).then((res)=>{
            if(res.data !== ""){
                setPixelDistance(parseFloat(res.data));
            }
        }).catch((error)=>{
            props.setSession(undefined);
            alert("Session Expired.");
        });
    }

    const setDistanceByPixelToServer = (distance) => {
        const sendData = JSON.stringify({
            "sessionKey": props.session,
            "scale": distance
        });
        axios({
            method:"POST",
            url:"http://61.245.248.172:8080/api/auth/scale",
            data:sendData,
            headers:{"Content-type":"application/json"}
        }).then((_)=>{
            getDistanceByPixelFromServer();
        }).catch((_)=>{
            props.setSession(undefined);
            alert("Session Expired.");
        });
    }

    useEffect(()=> {
      postImageList();
      if(props.session !== undefined){
        setTimerFlag(!timerFlag);
        getDistanceByPixelFromServer();
      }
    }, [props.session]);

    useEffect(()=>{
      const timer = setInterval(() => {
        postImageList();
        setTimerFlag(!timerFlag);
      }, 2000);
      return () => clearInterval(timer);
    }, [timerFlag]);

    return <>
    <canvas ref={downloadCanvas} style={{display: "none"}}/>
    <NavigationBar session={props.session} setSession={props.setSession} setImageData={refreshImageData} setDistanceModal={openDistanceModal}/>
    <Container className="mw-100 d-flex mt-5 justify-content-center align-items-center" style={{height:"78.5vh"}}>
      <ImageViewer img={select < 0 ? "" : "http://61.245.248.172:8080/api/files/"+props.session+"/"+imageData[select]["systemPath"]} setSession={props.setSession} session={props.session} selected={select} data={imageData} pixelDistance={pixelDistance}/>
      <Menu downloadCanvas={downloadCanvas} setImageData={refreshImageData} data={imageData} setImage={selectImageUrl} selected={select} session={props.session} pixelDistance={pixelDistance}/>
    </Container>
    <Modal show={distanceModal} onHide={()=>setDistanceModal(false)}>
        <Modal.Header closeButton>
            <h3>Distance By Pixel</h3>
        </Modal.Header>
        <Modal.Body>
            Enter distance by pixel(centimeters/CM)
            <Form.Control type="number" step="0.01" value={pixelDistance} onChange={(e)=>setPixelDistance(e.target.value)}/>
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={()=>{
                setDistanceByPixelToServer(pixelDistance);
                setDistanceModal(false);
            }}>Submit</Button>
        </Modal.Footer>
    </Modal>
    </>;
}