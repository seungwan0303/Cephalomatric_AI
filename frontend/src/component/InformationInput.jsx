import { faCheck, faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import {useEffect, useState} from "react";
import { Button, Container, Form } from "react-bootstrap";

export default (props) => {

    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [patient, setPatient] = useState("");

    const [nameEnable, setNameEnable] = useState(true);
    const [dateEnable, setDateEnable] = useState(true);
    const [patientEnable, setPatientEnable] = useState(true);

    const [downloadReady, setDownloadReady] = useState(false);

    useEffect(()=>{
        const data = props.data[props.selected];
        if(data === undefined) {
            setNameEnable(false);
            setDateEnable(false);
            setPatientEnable(false);
            return;
        }
        setNameEnable(true);
        setDateEnable(true);
        setPatientEnable(true);
        setName(data["name"] === undefined ? "" : data["name"]);
        setDate(data["createAt"] === undefined || data["createAt"] === null ? "" : data["createAt"]);
        setPatient(data["patient"] === undefined || data["patient"] === null ? "" : data["patient"]);
    }, [props.selected]);

    const modifyImageData = () => {
        const data = props.data[props.selected];
        if(data === undefined) return;
        var sendData = JSON.stringify({
            "sessionKey": props.session,
            "id": data["id"],
            "name": name,
            "patient": patient,
            "date": date
        });
        axios({
            method:"POST",
            url: 'http://61.245.248.172:8080/api/file/modify',
            data:sendData,
            headers: {'Content-type': 'application/json'}
        }).then((_)=>{
            alert("The information has been reflected.");
            if(props.session === undefined) return;
              var sendData = JSON.stringify({
                  "sessionKey":props.session
              });
              axios({
                  method:"POST",
                  url: 'http://61.245.248.172:8080/api/file/list',
                  data:sendData,
                  headers: {'Content-type': 'application/json'}
              }).then((r)=>{
                  props.setImageData(r.data);
              });
              
        }).catch(_=>{
            alert("Internal Server Error.")
        });
    }

    const onRawDownload = (_) => {
        //TODO - Edit Require
        const data = props.data[props.selected];
        const url = props.selected < 0 ? "" : "http://61.245.248.172:8080/api/files/"+props.session+"/"+data["systemPath"];
        const image = new Image();
        image.crossOrigin = 'Anonymous'
        image.src = url;
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);
            const dataurl = canvas.toDataURL("images/png");
            const link = document.createElement("a");
            link.href = dataurl;
            let filename = data["name"];
            if (data["patient"] !== undefined && data["patient"] !== null){
                filename = filename + "_" + data["patient"];
            }
            if (data["createAt"] !== undefined && data["createAt"] !== null){
                filename = filename + "_" + data["createAt"];
            }
            filename = filename + ".png";
            link.download = filename;
            link.click();
        }
    }

    const onProcessedDownload = () => {
        const imageURL = props.selected < 0 ? "" : "http://61.245.248.172:8080/api/files/"+props.session+"/"+props.data[props.selected]["systemPath"];
        if(imageURL === "") return;
        const context = props.downloadCanvas.current.getContext("2d");
        const img = new Image ();
        img.crossOrigin = 'Anonymous';
        img.src = imageURL;
        img.onload = function ()
        {
            props.downloadCanvas.current.width = img.width;
            props.downloadCanvas.current.height = img.height;
            context.drawImage (img,0, 0)
            var sendData = JSON.stringify({
                "sessionKey": props.session,
                "imageId": props.data[props.selected]["id"]
            });
            axios({
                method:"POST",
                url: 'http://61.245.248.172:8080/api/file/points',
                data:sendData,
                headers: {'Content-type': 'application/json'}
            }).then((res)=>{
                let serverPoint = res.data;
                context.font = `28px Verdana`;
                let scale= 1;

                for(const point of serverPoint["user"]){
                    context.beginPath();
                    context.globalCompositeOperation = "source-over";
                    context.arc(point["x"], point["y"], 8 , 0, 2 * Math.PI, false);
                    context.fillStyle = "orange";
                    context.fill();
                    context.closePath();

                }
                for(const line of serverPoint["lines"]){
                    const startName = getPointByName(line["start"], serverPoint);
                    const endName = getPointByName(line["end"], serverPoint);
                    const distance = getRealDistance({
                        "x" : startName["x"] / scale,
                        "y" : startName["y"] / scale
                    }, {
                        "x" : endName["x"] / scale,
                        "y" : endName["y"] / scale
                    }) + " mm";
                    if(startName === null) continue;
                    if(endName === null) continue;
                    const color = line["color"];
                    context.beginPath();
                    context.moveTo(startName["x"], startName["y"]);
                    context.lineTo(endName["x"], endName["y"]);
                    context.strokeStyle = color;
                    context.lineWidth = 8;
                    context.stroke();
                    context.closePath();
                    //center location
                    if (distance !== "0.00 mm"){
                        const textX = startName["x"] + (endName["x"] - startName["x"])/2;
                        const textY = startName["y"] + (endName["y"] - startName["y"])/2;
                        context.beginPath();
                        context.lineWidth = 3;
                        context.fillStyle = line["color"];
                        context.fillText(distance, textX, textY-20)
                        context.closePath();
                    }
                }
                for(const angle of serverPoint["angles"]){
                    context.beginPath();
                    context.globalCompositeOperation = "source-over";
                    const center = {
                        "x" : angle["center"]["x"] * scale,
                        "y" : angle["center"]["y"] * scale
                    }
                    const p1 = {
                        "x" : angle["p1"]["x"] * scale,
                        "y" : angle["p1"]["y"] * scale
                    }
                    const degree = angle["angle"]
                    const rel_x = p1["x"] - center["x"];
                    const rel_y = p1["y"] - center["y"];
                    const radius = Math.sqrt(Math.pow(rel_x, 2) + Math.pow(rel_y, 2));
                    const startAngle = Math.asin(rel_y / radius) - (Math.PI / 2);
                    const endAngle = startAngle + (degree * Math.PI / 180);
                    context.lineWidth = 8
                    context.arc(center["x"], center["y"], radius, startAngle, endAngle, false);
                    context.strokeStyle = "red";
                    context.stroke();
                    context.closePath();

                    const centerAngle = startAngle + (degree/2 * Math.PI / 180);
                    const angleTextX = center["x"] + radius * Math.cos(centerAngle);
                    const angleTextY = center["y"] + radius * Math.sin(centerAngle);
                    context.beginPath();
                    context.lineWidth = 3;
                    context.fillStyle = "red";
                    context.fillText(degree + "°", angleTextX+20, angleTextY-30)
                    context.strokeStyle = "red";
                    context.strokeText(degree + "°", angleTextX+20, angleTextY-30)
                    context.closePath();

                }
                for(const point of serverPoint["predicted"]){
                    context.beginPath();
                    context.globalCompositeOperation = "source-over";
                    context.arc(point["x"]*scale, point["y"]*scale, 8, 0, 2 * Math.PI, false);
                    context.fillStyle = "red";
                    context.fill();
                    context.closePath();
                    context.beginPath();
                    context.lineWidth = 3;
                    if(point["name"] !== undefined && point["name"] !== null){
                        context.fillStyle = "red";
                        context.fillText(point["name"], (point["x"]*scale)+20, (point["y"]*scale)-30);
                        context.strokeStyle = "red";
                        context.strokeText(point["name"], (point["x"]*scale)+20, (point["y"]*scale)-30)
                    }
                    context.closePath();
                }
                for(const point of serverPoint["normal"]){
                    context.beginPath();
                    context.globalCompositeOperation = "source-over";
                    context.arc(point["x"]*scale, point["y"]*scale, 8, 0, 2 * Math.PI, false);
                    context.fillStyle = "blue";
                    context.fill();
                    context.closePath();
                    context.beginPath();
                    context.lineWidth = 3;
                    if(point["name"] !== undefined && point["name"] !== null){
                        context.fillStyle = "blue";
                        context.fillText(point["name"], (point["x"]*scale)+20, (point["y"]*scale)-30);
                        context.strokeStyle = "blue";
                        context.strokeText(point["name"], (point["x"]*scale)+20, (point["y"]*scale)-30)
                    }
                    context.closePath();
                }
                setDownloadReady(true);
            }).catch(_=>{});
        }
    }

    const getRealDistance = (point1, point2) => {
        const dx = Math.pow(point1["x"] - point2["x"], 2);
        const dy = Math.pow(point1["y"] - point2["y"], 2);
        return (Math.sqrt(dx+dy) * props.pixelDistance * 10).toFixed(2);
    }

    useEffect(()=>{
        if(downloadReady){
            const data = props.data[props.selected];
            let canvas = props.downloadCanvas.current
            let url = canvas.toDataURL("image/png");
            let link = document.createElement('a');
            link.href = url;
            let filename = data["name"];
            if (data["patient"] !== undefined && data["patient"] !== null){
                filename = filename + "_" + data["patient"];
            }
            if (data["createAt"] !== undefined && data["createAt"] !== null){
                filename = filename + "_" + data["createAt"];
            }
            filename = filename + "_proc.png";
            link.download = filename;
            link.click();
            setDownloadReady(false);
        }
    }, [downloadReady]);

    const getPointByName = (name, serverPoint) => {
        if(serverPoint !== undefined && serverPoint !== null){
            let scale = 1;
            for(const p of serverPoint["predicted"]){
                if(p["name"] === name){
                    return {
                        "x": p["x"] * scale,
                        "y": p["y"] * scale,
                        "name": p["name"]
                    };
                }
            }
            for(const p of serverPoint["normal"]){
                if(p["name"] === name){
                    return {
                        "x": p["x"] * scale,
                        "y": p["y"] * scale,
                        "name": p["name"]
                    };
                }
            }
        }
        return null;
    }

    return <>
    <Container 
        className="border border-white rounded d-flex justify-content-start align-items-start w-100 h-50 mt-3"
        style={{flexDirection:"column", overflow:"auto"}}>

        <span className="h6 mt-3 mb-3">Photo Name : </span>
        <Form.Control disabled={!nameEnable} type="text" value={name} onChange={(e) => setName(e.target.value)}/>
        
        <span className="h6 mt-3 mb-3">Patient : </span>
        <Form.Control disabled={!patientEnable} type="text" value={patient} onChange={(e) => setPatient(e.target.value)}/>

        <span className="h6 mt-3 mb-3">Uploaded At : </span>
        <Form.Control disabled={!dateEnable} type="text" value={date} onChange={(e) => setDate(e.target.value)}/>

        <Container className="d-flex justify-content-around align-items-start w-100 mt-3 mb-3 mt-auto">
            <Button className="bg-secondary border-white" onClick={onRawDownload}> Raw <FontAwesomeIcon icon={faDownload} style={{color: "#ffffff"}}/></Button>
            <Button className="bg-secondary border-white" onClick={onProcessedDownload}> Processed <FontAwesomeIcon icon={faDownload} style={{color: "#ffffff"}}/></Button>
            <Button className="bg-success border-white " onClick={modifyImageData}> Done <FontAwesomeIcon icon={faCheck} style={{color: "#ffffff"}}/></Button>
        </Container>
    </Container>
    </>;
}