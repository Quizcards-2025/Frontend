import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel, FormGroup,
    FormLabel,
    Radio,
    RadioGroup,
    TextField
} from "@mui/material";
import Cancel from "../../components/icon/Import.jsx";
import ReactQuill from "react-quill";
import {value} from "lodash/seq.js";
import {convertHtmlToText} from "src/utils/HtmlAndFileUtils.jsx";


const ImportTextComp = ({
                            onClick = () => {
                            },
                            onCancel = () => {
                            },
                            onSave = () => {
                            },
                            onTextChange = () => {
                            },
                            ...props
                        }) => {
    const [text, setText] = useState("");
    const [termSeparator, setTermSeparator] = useState("\t"); // Default: Tab
    const [cardSeparator, setCardSeparator] = useState("\n"); // Default: New Line
    const [termSepaInput, setTermSepaInput] = useState(""); // Custom input for term separator
    const [cardSepaInput, setCardSepaInput] = useState(""); // Custom input for card separator

    const [isTermSepaEditing, setIsTermSepaEditing] = useState(false);
    const [isCardSepaEditing, setIsCardSepaEditing] = useState(false);

    const [useMotipQA, setUseMotipQA] = useState(false);

    const [hasImage, setHasImage] = useState(false);

    const handleOnCancel = (event) => {
        event.preventDefault();
        onCancel();
    };

    const handleOnSave = (event) => {
        event.preventDefault();
        onSave();
    };

    const handleTextChange = (content) => {
        setText(content);
        onTextChange(convertHtmlToText(content), useMotipQA, termSeparator, cardSeparator, hasImage);
    };

    const handleTermSeparatorChange = (event) => {
        const value = event.target.value.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
        setTermSeparator(value);
        onTextChange(convertHtmlToText(text), useMotipQA, value, cardSeparator, hasImage);
    };

    const handleCardSeparatorChange = (event) => {
        const value = event.target.value.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
        setCardSeparator(value);
        onTextChange(convertHtmlToText(text), useMotipQA, termSeparator, value, hasImage);
    };

    const handleTermSepaInputChange = (event) => {
        const value = event.target.value.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
        setTermSepaInput(event.target.value);
        setTermSeparator(value);
        onTextChange(convertHtmlToText(text), useMotipQA, value, cardSeparator, hasImage);
    };

    const handleCardSepaInputChange = (event) => {
        const value = event.target.value.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
        setCardSepaInput(event.target.value);
        setCardSeparator(value);
        onTextChange(convertHtmlToText(text), useMotipQA, termSeparator, value, hasImage);
    };

    const handleUseMotipQAChange = (newValue) => {
        setUseMotipQA(newValue);
        onTextChange(convertHtmlToText(text), newValue, termSeparator, cardSeparator, hasImage);
    }

    const handleHasImageChange = (newValue) => {
        setHasImage(newValue);
        onTextChange(convertHtmlToText(text), useMotipQA, termSeparator, cardSeparator, newValue);
    };

    // Parse text to card pairs for preview
    const getCardPairs = () => {
        // Lấy ký hiệu phân tách, nếu rỗng thì mặc định
        const cardSep = cardSepaInput || '\n\n';
        const termSep = termSepaInput || '\n';
        // Chuyển ký hiệu '\n' thành ký tự xuống dòng thực tế
        const cardSeparator = cardSep.replace(/\\n/g, '\n');
        const termSeparator = termSep.replace(/\\n/g, '\n');
        // Tách các card
        let rawCards = text.split(cardSeparator).map(s => s.trim()).filter(Boolean);
        // Tách từng card thành [question, answer]
        let pairs = rawCards.map(card => {
            const idx = card.lastIndexOf(termSeparator);
            if (idx === -1) return [card, ''];
            return [card.slice(0, idx).trim(), card.slice(idx + termSeparator.length).trim()];
        });
        return pairs;
    };
    const cardPairs = text.trim() !== '' ? getCardPairs() : [];

    return (
        <Box sx={{ width: '100%', maxWidth: 950, margin: '0 auto', background: '#f7f7fb', borderRadius: '20px', p: { xs: 2, sm: 4 }, boxShadow: '0 4px 24px rgba(80, 80, 160, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Cancel onClick={handleOnCancel} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: '2rem', marginBottom: 8 }}>Import flashcards</div>
            <div style={{ fontWeight: 500, fontSize: '1rem', marginBottom: 12 }}>Import with plain text:</div>
            <textarea
                value={text}
                onChange={e => { setText(e.target.value); onTextChange(e.target.value, useMotipQA, termSeparator, cardSeparator, hasImage); }}
                placeholder="What is architectural style?\nA. Architectural style is a description of component types ..."
                style={{
                    width: '100%',
                    minHeight: 350,
                    borderRadius: 16,
                    padding: 20,
                    fontSize: '1.1rem',
                    border: 'none',
                    background: '#fff',
                    boxShadow: '0 2px 8px rgba(80,80,160,0.06)',
                    marginBottom: 18,
                    resize: 'vertical',
                }}
            />
            <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 6 }}>Between question and definition</div>
                    <input
                        value={termSepaInput}
                        onChange={handleTermSepaInputChange}
                        placeholder={"Split sign (e.g: ` )"}
                        style={{
                            width: '100%',
                            borderRadius: 10,
                            padding: '12px 14px',
                            fontSize: 16,
                            border: '1px solid #e0e0e0',
                            background: '#fff',
                        }}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 6 }}>Between cards</div>
                    <input
                        value={cardSepaInput}
                        onChange={handleCardSepaInputChange}
                        placeholder={"Split sign (e.g: \\n )"}
                        style={{
                            width: '100%',
                            borderRadius: 10,
                            padding: '12px 14px',
                            fontSize: 16,
                            border: '1px solid #e0e0e0',
                            background: '#fff',
                        }}
                    />
                </div>
            </div>
            <div style={{ display: 'flex', gap: 18, marginTop: 32, marginBottom: 8 }}>
                <button
                    onClick={handleOnCancel}
                    style={{
                        flex: 1,
                        border: '2px solid #2d4bff',
                        color: '#2d4bff',
                        background: '#fff',
                        borderRadius: 12,
                        fontWeight: 700,
                        fontSize: 18,
                        height: 48,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                    }}
                >
                    Cancel importing
                </button>
                <button
                    onClick={handleOnSave}
                    style={{
                        flex: 1,
                        border: 'none',
                        color: '#fff',
                        background: '#2d4bff',
                        borderRadius: 12,
                        fontWeight: 700,
                        fontSize: 18,
                        height: 48,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                    }}
                >
                    Continue
                </button>
            </div>
        </Box>
    );
};

export default ImportTextComp;