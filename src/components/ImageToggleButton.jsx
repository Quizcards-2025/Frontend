import React from 'react';

const ImageToggleButton = React.memo(({ hasImage, onRemove, onUpload, styles, childComponent }) => {
    return (
        hasImage ? (
            <button
                onClick={onRemove}
                style={{
                    fontFamily: 'Wix Madefor Text',
                    padding: "5px 10px",
                    color: "white",
                    backgroundColor: "red",
                    border: "none",
                    borderRadius: "15px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    ...styles
                }}>
                Remove
                {childComponent}
            </button>
        ) : (
            <button
                onClick={onUpload}
                style={{
                    fontFamily: 'Wix Madefor Text',
                    padding: "5px 10px",
                    backgroundColor: "#dbbef4",
                    border: "none",
                    borderRadius: "15px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    ...styles
                }}>
                Upload
                {childComponent}
            </button>
        )
    );
});

export default ImageToggleButton;
