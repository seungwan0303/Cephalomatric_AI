import {Button, Form, Modal} from "react-bootstrap"
import {useEffect, useRef, useState} from "react"
import {Container} from "react-bootstrap"
import axios from "axios";


export default (props) => {

    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const wideCanvasRef = useRef(null);
    const processor = useRef(null);
    const [loadedProcessorImage, setLoadedProcessorImage] = useState(null);
    const [wideCanvasReloadFlag, setWideCanvasReloadFlag] = useState(true);
    const [wideCanvasImage, setWideCanvasImage] = useState(null);
    const [edit, setEdit] = useState(false);
    const [alert, setAlert] = useState(false);
    const [show, setShow] = useState(false);
    const [showNaming, setShowNaming] = useState(false);
    const [drawingX, setDrawingX] = useState(-1);
    const [drawingY, setDrawingY] = useState(-1);
    const [drawingName, setDrawingName] = useState("U1");
    const [points, setPoints] = useState([]);
    const [serverPoint, setServerPoint] = useState();
    const [canvasX, setCanvasX] = useState(0);
    const [canvasHeight, setCanvasHeight] = useState(0);
    const [canvasWidth, setCanvasWidth] = useState(0);
    const [canvasRemoveMode, setCanvasRemoveMode] = useState(false);
    const [drawtimer, setDrawTimer] = useState(-1);
    const [filterCheck, setFilterCheck] = useState({
        "USER": true,
        "PREDICTED": true,
        "U1NA": true,
        "L1NB": true,
        "U1L1": true
    });

    const [windowWidth, setWindowWidth] = useState(0);
    const [windowHeight, setWindowHeight] = useState(0);

    const [isImageLoaded, setImageLoaded] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertContent, setAlertContent] = useState("");

    const [isInCanvas, setInCanvas] = useState(false);
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);
    const [canvasMouseX, setCanvasMouseX] = useState(0);
    const [canvasMouseY, setCanvasMouseY] = useState(0);
    const [previousSelect, setPreviousSelect] = useState(-1);
    const mouseMove = (e) => {
        let rect = canvasRef.current.getBoundingClientRect();
        const inX = rect.x < e.clientX && e.clientX < rect.x + rect.width;
        const inY = rect.y < e.clientY && e.clientY < rect.y + rect.height;
        if (inX && inY && e.ctrlKey) {
            setInCanvas(true);
            setMouseX(e.clientX);
            setMouseY(e.clientY);
            setCanvasMouseX(e.clientX - rect.x);
            setCanvasMouseY(e.clientY - rect.y);
        } else {
            setInCanvas(false);
        }
    }

    useEffect(() => {
        if (wideCanvasRef === null) return;
        if (imgRef.current.naturalHeight === 0) return;
        if (props.img === "") return;
        let scale = (imgRef.current.height / imgRef.current.naturalHeight);

        let startX = canvasMouseX - (wideCanvasRef.current.width / 2);
        let startY = canvasMouseY - (wideCanvasRef.current.height / 2);
        startX /= scale;
        startY /= scale;
        if (startX < 0) startX = 0;
        if (startY < 0) startY = 0;
        let endX = startX + (wideCanvasRef.current.width / scale);
        let endY = startY + (wideCanvasRef.current.height / scale);
        if (endX > imgRef.current.naturalWidth) {
            endX = imgRef.current.naturalWidth;
            startX = endX - (wideCanvasRef.current.width / scale);
        }
        if (endY > imgRef.current.naturalHeight) {
            endY = imgRef.current.naturalHeight;
            startY = endY - (wideCanvasRef.current.height / scale);
        }

        let pointerX = wideCanvasRef.current.width / 2;
        let pointerY = wideCanvasRef.current.height / 2;
        const pointerSize = 10;

        if (startX === 0) {
            pointerX = canvasMouseX;
        }
        if (startY === 0) {
            pointerY = canvasMouseY;
        }
        if (endX === imgRef.current.naturalWidth) {
            let mousePercent = (imgRef.current.width - canvasMouseX) / (wideCanvasRef.current.width / 2);
            mousePercent %= 1;
            if (mousePercent < 0) mousePercent = 0;
            pointerX = wideCanvasRef.current.width + (wideCanvasRef.current.width / 2 * -mousePercent);
        }
        if (endY === imgRef.current.naturalHeight) {
            let mousePercent = (imgRef.current.height - canvasMouseY) / (wideCanvasRef.current.height / 2);
            if (mousePercent < 0) mousePercent = 0;
            pointerY = wideCanvasRef.current.height + (wideCanvasRef.current.height / 2 * -mousePercent);
        }

        const context = wideCanvasRef.current.getContext("2d");
        if (wideCanvasReloadFlag || wideCanvasImage === null) {
            const img = new Image();
            img.src = processor.current.toDataURL();
            img.onload = () => {
                context.drawImage(img, startX, startY, endX - startX, endY - startY, 0, 0, wideCanvasRef.current.width, wideCanvasRef.current.height);
                context.beginPath();
                context.rect(pointerX - pointerSize, pointerY - 1, pointerSize * 2, 2);
                context.fillStyle = "black"
                context.strokeStyle = "dimgray"
                context.fill();
                context.stroke();
                context.closePath();
                context.beginPath();
                context.rect(pointerX - 1, pointerY - pointerSize, 2, pointerSize * 2);
                context.fillStyle = "black"
                context.strokeStyle = "dimgray"
                context.fill();
                context.stroke();
                context.closePath();
            }
            setWideCanvasImage(img);
            setWideCanvasReloadFlag(false);
        } else {
            context.drawImage(wideCanvasImage, startX, startY, endX - startX, endY - startY, 0, 0, wideCanvasRef.current.width, wideCanvasRef.current.height);
            context.beginPath();
            context.rect(pointerX - pointerSize, pointerY - 1, pointerSize * 2, 2);
            context.fillStyle = "black";
            context.strokeStyle = "dimgray";
            context.fill();
            context.stroke();
            context.closePath();
            context.beginPath();
            context.rect(pointerX - 1, pointerY - pointerSize, 2, pointerSize * 2);
            context.fillStyle = "black";
            context.strokeStyle = "dimgray";
            context.fill();
            context.stroke();
            context.closePath();
        }
    }, [canvasMouseX, canvasMouseY]);

    useEffect(() => {
        setWideCanvasReloadFlag(true);
    }, [loadedProcessorImage]);

    useEffect(() => {
        window.addEventListener("mousemove", mouseMove);
        return () => window.removeEventListener("mousemove", mouseMove);
    }, []);
    const resizeWindow = () => {
        setWindowWidth(window.innerWidth);
        setWindowHeight(window.innerHeight);
    }
    const resizeCanvas = () => {
        if (!isImageLoaded) return;
        setEdit(false);
        if (props.img === "") {
            setCanvasHeight(imgRef.current.height);
            setCanvasWidth(imgRef.current.width);
            setCanvasX(0);
        } else {
            let scale = (imgRef.current.height / imgRef.current.naturalHeight);
            let imageWidth = imgRef.current.naturalWidth * scale;
            let imageStartX = (imgRef.current.width - imageWidth) / 2;
            setCanvasWidth(imageWidth);
            setCanvasHeight(imgRef.current.height);
            setCanvasX(imageStartX);
        }
        if (drawtimer !== -1) {
            clearTimeout(drawtimer);
            setDrawTimer(-1);
        }
        clearPointAtCanvas();
        setDrawTimer(setTimeout(drawPointAtCanvas, 250));
    }

    useEffect(() => {
        window.addEventListener("resize", resizeWindow);
        return () => {
            window.removeEventListener("resize", resizeWindow);
        };
    }, []);
    useEffect(resizeCanvas, [windowWidth, windowHeight]);
    useEffect(() => {
        if (!isImageLoaded) return;
        resizeCanvas();
        drawPointAtProcessorCanvas();
    }, [isImageLoaded]);
    useEffect(() => {
        setImageLoaded(false)
    }, [props.img]);
    useEffect(() => {
        if (edit) {
            if (props.selected < 0) {
                setAlertTitle("Unavaliable function!")
                setAlertContent("Image is not selected.");
                setAlert(true);
                setEdit(false);
                return;
            }
            const data = props.data[props.selected];
            if (data === undefined || data === null) {
                setAlertTitle("Unavaliable function!")
                setAlertContent("Image is not selected.");
                setAlert(true);
                setEdit(false);
                return;
            }
            if (data["status"] === "PROCESSING") {
                setAlertTitle("Unavaliable function!")
                setAlertContent("Image is processing! Edit mode is available after processing.");
                setAlert(true);
                setEdit(false);
            }
        }
    }, [edit]);

    useEffect(() => {
        //Preview Canvas
        if (drawtimer !== -1) {
            clearTimeout(drawtimer);
            setDrawTimer(-1);
        }
        clearPointAtCanvas();
        if (edit) {
            drawPointAtCanvas();
            drawPointAtProcessorCanvas();
        } else {
            setDrawTimer(setTimeout(() => {
                drawPointAtCanvas();
            }, 250));
        }
    }, [points, filterCheck, props.pixelDistance]);

    useEffect(() => {
        if (edit) return;
        loadProcessorCanvas();
    }, [filterCheck]);

    const drawPointAtProcessorCanvas = () => {
        if (processor === null) return;
        if (props.img === "") return;
        if (imgRef === null) return;
        if (imgRef.current.naturalWidth === 0) return;
        processor.current.width = imgRef.current.naturalWidth;
        processor.current.height = imgRef.current.naturalHeight;
        if (edit || (loadedProcessorImage === null || loadedProcessorImage.src !== props.img)) {
            loadProcessorCanvas();
        }
    }

    const filterChecking = (filter) => {
        const filtertype = ["USER", "PREDICTED", "U1NA", "L1NB", "U1L1"];
        if (filter === undefined || filter === null || filter === "") {
            for (let i = 2; i < filtertype.length; i++) {
                if (!filterCheck[filtertype[i]])
                    return false;
            }
            return true;
        }
        let filters = filter.split(",");
        for (let i = 0; i < filters.length; i++) {
            let v = filterCheck[filters[i]];
            if (v === null || v === undefined) {
                for (let i = 0; i < filtertype.length; i++) {
                    if (!filterCheck[filtertype[i]]) {
                        v = false;
                        break;
                    }
                }
                v = true;
            }
            if (v) return true;
        }
        return false;
    }

    const loadProcessorCanvas = () => {
        const context = processor.current.getContext("2d");
        const img = new Image();
        img.crossOrigin = 'Anonymous'
        img.src = props.img;
        img.onload = () => {
            let scale = (imgRef.current.height / imgRef.current.naturalHeight);
            context.drawImage(img, 0, 0);
            context.font = `40px Verdana`
            if (serverPoint !== undefined && serverPoint !== null) {
                for (const line of serverPoint["lines"]) {
                    if (filterChecking(line["type"])) {
                        const startName = getPointByName(line["start"], serverPoint);
                        const endName = getPointByName(line["end"], serverPoint);

                        const distance = getRealDistance({
                            "x": startName["x"] / scale,
                            "y": startName["y"] / scale
                        }, {
                            "x": endName["x"] / scale,
                            "y": endName["y"] / scale
                        }) + " mm";
                        if (startName === null) continue;
                        if (endName === null) continue;
                        const color = line["color"];
                        context.beginPath();
                        context.moveTo(startName["x"] / scale, startName["y"] / scale);
                        context.lineTo(endName["x"] / scale, endName["y"] / scale);
                        context.strokeStyle = color;
                        context.lineWidth = 8;
                        context.stroke();
                        context.closePath();
                        //center location
                        if (distance !== "0.00 mm" && line["display"]) {
                            const textX = startName["x"] / scale + (endName["x"] / scale - startName["x"] / scale) / 2;
                            const textY = startName["y"] / scale + (endName["y"] / scale - startName["y"] / scale) / 2;
                            context.beginPath();
                            context.lineWidth = 3;
                            context.strokeStyle = line["color"];
                            context.fillStyle = line["color"];
                            context.fillText(distance, textX, textY + 20);
                            context.strokeText(distance, textX, textY + 20);
                            context.closePath();
                        }
                    }
                }
                for (const angle of serverPoint["angles"]) {
                    if (filterChecking(angle["type"])) {
                        context.beginPath();
                        context.globalCompositeOperation = "source-over";
                        const center = {
                            "x": angle["center"]["x"] * 1,
                            "y": angle["center"]["y"] * 1
                        }
                        const p1 = {
                            "x": angle["p1"]["x"] * 1,
                            "y": angle["p1"]["y"] * 1
                        }
                        const degree = angle["angle"]
                        const rel_x = p1["x"] - center["x"];
                        const rel_y = p1["y"] - center["y"];
                        const radius = Math.sqrt(Math.pow(rel_x, 2) + Math.pow(rel_y, 2));
                        // const startAngle = Math.asin(rel_y / radius);
                        // const endAngle = startAngle + (degree * Math.PI / 180);
                        const endAngle = Math.asin(rel_y / radius);
                        const startAngle = endAngle - (degree * Math.PI / 180);
                        context.lineWidth = 8
                        context.arc(center["x"], center["y"], radius, startAngle, endAngle, false);
                        context.strokeStyle = "red";
                        context.stroke();
                        context.closePath();

                        const centerAngle = startAngle + (degree / 2 * Math.PI / 180);
                        const angleTextX = center["x"] + radius * Math.cos(centerAngle);
                        const angleTextY = center["y"] + radius * Math.sin(centerAngle);
                        context.beginPath();
                        context.lineWidth = 3;
                        context.fillStyle = "red";
                        context.fillText((Math.round(degree * 100) / 100) + "°", angleTextX + 20, angleTextY - 30)
                        context.strokeStyle = "red";
                        context.strokeText((Math.round(degree * 100) / 100) + "°", angleTextX + 20, angleTextY - 30)
                        context.closePath();
                    }
                }
                if (filterCheck["PREDICTED"]) {
                    for (const point of serverPoint["predicted"]) {
                        if (filterChecking(point["type"])) {
                            context.beginPath();
                            context.globalCompositeOperation = "source-over";
                            context.arc(point["x"] * 1, point["y"] * 1, 8, 0, 2 * Math.PI, false);
                            context.fillStyle = "red";
                            context.fill();
                            context.closePath();
                            context.beginPath();
                            context.lineWidth = 3;
                            if (point["name"] !== undefined && point["name"] !== null) {
                                context.fillStyle = "red";
                                context.fillText(point["name"], (point["x"] * 1) + 20, (point["y"] * 1) - 30);
                                context.strokeStyle = "red";
                                context.strokeText(point["name"], (point["x"] * 1) + 20, (point["y"] * 1) - 30)
                            }
                            context.closePath();
                        }
                    }
                }
                if (filterCheck["NORMAL"]) {
                    for (const point of serverPoint["normal"]) {
                        if (filterChecking(point["type"])) {
                            context.beginPath();
                            context.globalCompositeOperation = "source-over";
                            context.arc(point["x"] * 1, point["y"] * 1, 8, 0, 2 * Math.PI, false);
                            context.fillStyle = "blue";
                            context.fill();
                            context.closePath();
                            context.beginPath();
                            context.lineWidth = 3;
                            if (point["name"] !== undefined && point["name"] !== null) {
                                context.fillStyle = "blue";
                                context.fillText(point["name"], (point["x"] * 1) + 20, (point["y"] * 1) - 30);
                                context.strokeStyle = "blue";
                                context.strokeText(point["name"], (point["x"] * 1) + 20, (point["y"] * 1) - 30)
                            }
                            context.closePath();
                        }
                    }
                }
            }
            if (filterCheck["USER"]) {
                for (const point of points) {
                    if (filterChecking(point["type"])) {
                        context.beginPath();
                        context.globalCompositeOperation = "source-over";
                        context.arc(point["x"] / scale, point["y"] / scale, 8, 0, 2 * Math.PI, false);
                        context.fillStyle = "orange";
                        context.fill();
                        context.closePath();
                        context.beginPath();
                        context.lineWidth = 3;
                        if (point["name"] !== undefined && point["name"] !== null) {
                            context.fillStyle = "orange";
                            context.fillText(point["name"], (point["x"] / scale) + 20, (point["y"] / scale) - 30);
                            context.strokeStyle = "orange";
                            context.strokeText(point["name"], (point["x"] / scale) + 20, (point["y"] / scale) - 30)
                        }
                        context.closePath();
                    }
                }
            }
        }
        setLoadedProcessorImage(img);
    }

    const drawPointAtCanvas = () => {
        const context = canvasRef.current.getContext("2d");
        context.font = `10px Verdana`;
        if (filterCheck["USER"]) {
            for (const point of points) {
                if (filterChecking(point["type"])) {
                    context.beginPath();
                    context.globalCompositeOperation = "source-over";
                    context.arc(point["x"], point["y"], 2, 0, 2 * Math.PI, false);
                    context.fillStyle = "orange";
                    context.fill();
                    context.closePath();
                    context.beginPath();
                    context.lineWidth = 1;
                    if (point["name"] !== undefined && point["name"] !== null) {
                        context.fillStyle = "orange";
                        context.fillText(point["name"], (point["x"]) + 5, (point["y"]) - 10);
                        context.strokeStyle = "orange";
                        context.strokeText(point["name"], (point["x"]) + 5, (point["y"]) - 10)
                    }
                    context.closePath();
                }
            }
        }
        if (serverPoint !== undefined && serverPoint !== null) {
            let scale = (imgRef.current.height / imgRef.current.naturalHeight);
            for (const line of serverPoint["lines"]) {
                if (filterChecking(line["type"])) {
                    const startName = getPointByName(line["start"]);
                    const endName = getPointByName(line["end"]);
                    const distance = getRealDistance({
                        "x": startName["x"] / scale,
                        "y": startName["y"] / scale
                    }, {
                        "x": endName["x"] / scale,
                        "y": endName["y"] / scale
                    }) + " mm";
                    if (startName === null) continue;
                    if (endName === null) continue;
                    const color = line["color"];
                    context.beginPath();
                    context.moveTo(startName["x"], startName["y"]);
                    context.lineTo(endName["x"], endName["y"]);
                    context.strokeStyle = color;
                    context.lineWidth = 1.5;
                    context.stroke();
                    context.closePath();

                    //center location
                    if (distance !== "0.00 mm" && line["display"]) {
                        const textX = startName["x"] + (endName["x"] - startName["x"]) / 2;
                        const textY = startName["y"] + (endName["y"] - startName["y"]) / 2;
                        context.beginPath();
                        context.lineWidth = 1;
                        context.fillStyle = line["color"];
                        context.fillText(distance, textX, textY - 5)
                        context.closePath();
                    }
                }
            }
            for (const angle of serverPoint["angles"]) {
                if (filterChecking(angle["type"])) {
                    context.beginPath();
                    context.globalCompositeOperation = "source-over";
                    const center = {
                        "x": angle["center"]["x"] * scale,
                        "y": angle["center"]["y"] * scale
                    }
                    const p1 = {
                        "x": angle["p1"]["x"] * scale,
                        "y": angle["p1"]["y"] * scale
                    }
                    const degree = angle["angle"]
                    const rel_x = p1["x"] - center["x"];
                    const rel_y = p1["y"] - center["y"];
                    const radius = Math.sqrt(Math.pow(rel_x, 2) + Math.pow(rel_y, 2));
                    // const startAngle = Math.asin(rel_y / radius);
                    // const endAngle = startAngle + (degree * Math.PI / 180);
                    const endAngle = Math.asin(rel_y / radius);
                    const startAngle = endAngle - (degree * Math.PI / 180);
                    context.lineWidth = 1.5
                    context.arc(center["x"], center["y"], radius, startAngle, endAngle, false);
                    context.strokeStyle = "red";
                    context.stroke();
                    context.closePath();

                    const centerAngle = startAngle + (degree / 2 * Math.PI / 180);
                    const angleTextX = center["x"] + radius * Math.cos(centerAngle);
                    const angleTextY = center["y"] + radius * Math.sin(centerAngle);
                    context.beginPath();
                    context.lineWidth = 1;
                    context.fillStyle = "red";
                    context.fillText((Math.round(degree * 100) / 100) + "°", angleTextX + 5, angleTextY + 5)
                    context.strokeStyle = "red";
                    context.strokeText((Math.round(degree * 100) / 100) + "°", angleTextX + 5, angleTextY + 5)
                    context.closePath();
                }
            }
            if (filterCheck["PREDICTED"]) {
                for (const point of serverPoint["predicted"]) {
                    if (filterChecking(point["type"])) {
                        context.beginPath();
                        context.globalCompositeOperation = "source-over";
                        context.arc(point["x"] * scale, point["y"] * scale, 2, 0, 2 * Math.PI, false);
                        context.fillStyle = "red";
                        context.fill();
                        context.closePath();
                        context.beginPath();
                        context.lineWidth = 1;
                        if (point["name"] !== undefined && point["name"] !== null) {
                            context.fillStyle = "red";
                            context.fillText(point["name"], (point["x"] * scale) + 5, (point["y"] * scale) - 10);
                            context.strokeStyle = "red";
                            context.strokeText(point["name"], (point["x"] * scale) + 5, (point["y"] * scale) - 10)
                        }
                        context.closePath();
                    }
                }
            }
            if (filterCheck["NORMAL"]) {
                for (const point of serverPoint["normal"]) {
                    if (filterChecking(point["type"])) {
                        context.beginPath();
                        context.globalCompositeOperation = "source-over";
                        context.arc(point["x"] * scale, point["y"] * scale, 2, 0, 2 * Math.PI, false);
                        context.fillStyle = "blue";
                        context.fill();
                        context.closePath();
                        context.beginPath();
                        context.lineWidth = 1;
                        if (point["name"] !== undefined && point["name"] !== null) {
                            context.fillStyle = "blue";
                            context.fillText(point["name"], (point["x"] * scale) + 5, (point["y"] * scale) - 10);
                            context.strokeStyle = "blue";
                            context.strokeText(point["name"], (point["x"] * scale) + 5, (point["y"] * scale) - 10)
                        }
                        context.closePath();
                    }
                }
            }

        }
    }

    useEffect(() => {
        setPoints([]);
        setServerPoint(undefined);
    }, [props.selected])

    const clearPointAtCanvas = () => {
        const context = canvasRef.current.getContext("2d");
        context.beginPath();
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        context.closePath();
    }

    const getPointByName = (name) => {
        if (serverPoint !== undefined && serverPoint !== null) {
            let scale = (imgRef.current.height / imgRef.current.naturalHeight);
            for (const p of serverPoint["predicted"]) {
                if (p["name"] === name) {
                    return {
                        "x": p["x"] * scale,
                        "y": p["y"] * scale,
                        "name": p["name"]
                    };
                }
            }
            for (const p of serverPoint["normal"]) {
                if (p["name"] === name) {
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

    const getRealDistance = (point1, point2) => {
        const dx = Math.pow(point1["x"] - point2["x"], 2);
        const dy = Math.pow(point1["y"] - point2["y"], 2);
        return (Math.sqrt(dx + dy) * props.pixelDistance * 10).toFixed(2);
    }

    useEffect(() => {
        if (props.img === "") return;

        var sendData = JSON.stringify({
            "sessionKey": props.session,
            "imageId": props.data[props.selected]["id"]
        });
        axios({
            method: "POST",
            url: 'http://61.245.248.172:8080/api/file/points',
            data: sendData,
            headers: {'Content-type': 'application/json'}
        }).then((res) => {
            setServerPoint(res.data);
        }).catch(_ => {
        });
    }, [props.selected]);

    useEffect(() => {
        if (serverPoint === undefined) return;
        if (serverPoint === null) return;
        if (!isImageLoaded) return;
        const point = [];
        for (let p of serverPoint["user"]) {
            let scale = (imgRef.current.height / imgRef.current.naturalHeight);
            point.push({
                "x": p["x"] * scale,
                "y": p["y"] * scale,
                "name": p["name"],
                "type": p["type"]
            });
        }
        
        setPoints(point);
    }, [serverPoint, isImageLoaded]);


    const [pointEditFlag, setPointEditFlag] = useState(false);

    const savePoints = () => {
        if (!pointEditFlag) return;
        if (props.selected === -1) return;
        if (serverPoint === undefined) return;
        if (serverPoint === null) return;
        setPointEditFlag(false);
        const userPointScaled = [];
        let scale = (imgRef.current.height / imgRef.current.naturalHeight);
        for (let p of points) {
            userPointScaled.push({
                "x": p["x"] / scale,
                "y": p["y"] / scale,
                "name": p["name"],
                "type": p["type"]
            });
        }
        var sendData = JSON.stringify({
            "sessionKey": props.session,
            "imageId": props.data[props.selected]["id"],
            "predicted": serverPoint["predicted"],
            "normal": serverPoint["normal"],
            "user": userPointScaled,
            "lines": serverPoint["lines"],
            "angles": serverPoint["angles"]
        });
        axios({
            method: "POST",
            url: 'http://61.245.248.172:8080/api/file/pointedit',
            data: sendData,
            headers: {'Content-type': 'application/json'}
        })
        .catch(_ => {
            props.setSession(undefined);
            alert("Session Expired.");
        });
    }

    const drawPoint = (e, x, y) => {
        if(!e.altKey){
            setDrawingX(x);
            setDrawingY(y);
            setShowNaming(true);
        } else {
            setPointEditFlag(true);
            setPoints([...points, {"x": x, "y": y, "name": ""}]);
        }
    }

    const drawNamedPoint = (x, y, name) => {
        let type = {
            "N":"U1NA,L1NB",
            "POINT_A":"U1NA",
            "POINT_B":"L1NB",
            "L1":"U1L1,L1NB",
            "U1":"U1L1,U1NA",
            "U1_C":"U1L1,U1NA",
            "L1_C":"U1L1,L1NB"
        }
        setPointEditFlag(true);
        setPoints([...points, {"x": x, "y": y, "name": name,"type":type[name]}])
    }

    const removePoint = (x, y) => {
        if (!canvasRemoveMode) return;
        let minPoint;
        let minDistance = 10000;
        for (const point of points) {
            const distance = Math.sqrt(Math.pow(x - point["x"], 2) + Math.pow(y - point["y"], 2));
            if (minDistance > distance) {
                minPoint = point;
                minDistance = distance;
            }
        }
        if (minDistance <= 15) {
            points.splice(points.indexOf(minPoint), 1);
            setPointEditFlag(true);
            setPoints([...points]);
        }
    }

    useEffect(savePoints, [points]);

    const changeFilterCheck = (type: String, checked: Boolean) => {
        setFilterCheck({
            ...filterCheck,
            [type]: checked
        });
    }

    const filterRenderer = () => {
        const filternames = ['USER', 'PREDICTED', 'U1NA', 'L1NB', 'U1L1'];
        const filternameCheck = [];
        const filtername2Check = [];
        for (let i = 0; i < 2; i++) {
            filternameCheck.push(<Form.Check className="m-1" key={i} label={filternames[i]}
                                    checked={filterCheck[filternames[i]]}
                                    onChange={(e) => changeFilterCheck(filternames[i], e.target.checked)}/>);
        }
        for (let i = 2; i < 5; i ++){
            filtername2Check.push(<Form.Check className="m-1" key={i} label={filternames[i]}
            checked={filterCheck[filternames[i]]}
            onChange={(e) => changeFilterCheck(filternames[i], e.target.checked)}/>);
        }
        const result = [];
        result.push(<Container className="d-flex border border-1 border-white rounded me-3">{filternameCheck}</Container>)
        result.push(<Container className="d-flex border border-1 border-white rounded me-3">{filtername2Check}</Container>)
        return result;
    }

    const filterAllCheck = (_) => {
        setFilterCheck({
            "USER": true,
            "PREDICTED": true,
            "U1NA": true,
            "L1NB": true,
            "U1L1": true,
            "L1CHIN": true
        });
    }


    return <>
        <canvas
            ref={wideCanvasRef}
            className="position-absolute w-25 h-25 border border-white z-3"
            style={isInCanvas ? {top: (mouseY + 10) + "px", left: (mouseX + 10) + "px"} : {
                top: (mouseY + 10) + "px",
                left: (mouseX + 10) + "px",
                display: "none"
            }}>

        </canvas>
        <canvas ref={processor} style={{display: "none"}}/>
        <Container className="d-flex justify-content-around align-item-center h-100 flex-column" style={{width: "73%"}}>

            <Container className="d-flex justify-content-between align-items-center">
                <Form.Check checked={edit} label="Edit" onChange={(e) => setEdit(e.target.checked)}/>
                <div className="d-flex align-items-center overflow-auto">
                    {filterRenderer()}
                    <Button className="me-2" size="sm" onClick={filterAllCheck}>All</Button>
                </div>
            </Container>
            <Container className="w-100 position-relative" style={{height: "80%"}}>
                <img ref={imgRef} src={props.img} onLoad={() => setImageLoaded(true)}
                     className="w-100 h-100 position-absolute" style={{top: "0px", left: "0px", objectFit: "contain"}}
                     alt="Image not selected."/>
                <canvas
                    ref={canvasRef}
                    className="border border-white position-absolute"
                    width={canvasWidth + "px"}
                    height={canvasHeight + "px"}
                    style={{top: "0px", left: canvasX + "px", cursor: "crosshair"}}
                    onClick={edit ? () => {
                    } : () => setShow(true)}
                    onMouseDown={edit ? (e) => {
                        if (e.button === 0) {
                            drawPoint(e, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                        } else if (e.button === 2) {
                            setCanvasRemoveMode(true);
                        }
                    } : () => {
                    }}
                    onMouseUp={edit ? (e) => {
                        if (e.button === 2) {
                            setCanvasRemoveMode(false);
                        }
                    } : () => {
                    }}
                    onMouseMove={edit && canvasRemoveMode ? (e) => {
                        removePoint(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                    } : (_) => {
                    }}
                />
            </Container>
        </Container>

        <Modal show={show} onHide={() => setShow(false)} className="modal-xl mh-100">
            <Modal.Header closeButton/>
            <Modal.Body className="d-flex justify-content-center align-item-center mh-100">
                <img
                    width="100%"
                    alt="Image not selected."
                    src={props.img}
                    style={{cursor: "crosshair", objectFit: "contain"}}
                    onClick={() => setShow(true)}>
                </img>
            </Modal.Body>
        </Modal>

        <Modal show={alert} onHide={() => setAlert(false)}>
            <Modal.Header closeButton>
                <Modal.Title>{alertTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {alertContent}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setAlert(false)}>Close</Button>
            </Modal.Footer>
        </Modal>
        <Modal show={showNaming}>
            <Modal.Header>
                <Modal.Title>Select point name</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Select value={drawingName} size="sm" onChange={(e) => setDrawingName(e.target.value)}>
                    <option value="U1">U1</option>
                    <option value="U1_C">U1_C</option>
                    <option value="L1">L1</option>
                    <option value="L1_C">L1_C</option>
                    <option value="N">N</option>
                    <option value="POINT_A">Point_A</option>
                    <option value="POINT_B">Point_B</option>
                </Form.Select>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={()=>{
                    drawNamedPoint(drawingX, drawingY, drawingName);
                    setShowNaming(false);
                    setDrawingX(-1);
                    setDrawingY(-1);
                    setDrawingName("U1");
                }}>Submit</Button>
            </Modal.Footer>
        </Modal>
    </>
}