import React from "react";
import Image from "./icon/Image.jsx";


const ImagePreview =  React.memo(({img,id})=> {
    return img ? <div style={{position: "relative", width: "100px", height: "100px"}}>
            <img
                src={img || ""}
                alt="Answer Preview" style={{
                width: "100%",
                height: "100%",
                borderRadius: "8px",
                objectFit: "contain"
            }}/>
        </div> :
        <div onClick={() => document.getElementById(`imageUpload-${id}`).click()}
             style={{
                 width: "100px",
                 height: "100px",
                 backgroundColor: "white",
                 borderRadius: "8px",
                 display: "flex",
                 alignItems: "center",
                 justifyContent: "center",
                 cursor: "pointer"
             }}>
            <label htmlFor="imageUpload" style={{cursor: "pointer"}}>
                <Image/>
            </label>
        </div>
});
export default ImagePreview;