export const VideoToggleButton = ({ hasVideo, onRemove, onUpload, childComponent }) => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "4px",
            minWidth: "140px",
            // width: "100%",
        }}>
            {hasVideo ? (
                <button
                    onClick={onRemove}
                    style={{
                        backgroundColor: "#ff6b6b",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px",
                    }}
                >
                    🗑️ Remove Video
                </button>
            ) : (
                <button
                    onClick={onUpload}
                    style={{
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px",
                    }}
                >
                    🎥 Add Video
                    {childComponent}
                </button>
            )}
        </div>
    );
};