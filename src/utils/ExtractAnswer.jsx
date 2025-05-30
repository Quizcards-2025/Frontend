import React from 'react';

export function extractAnswer(input) {
    // Regex tương đương với ^(\\p{Nd}+[-.)]|\\p{L}+[-.)]).*
    const answerPattern = /^(?:\d+[-.、。)]|[\p{L}][-.)、。])\s*/u;

    // Bước 1: Xóa phần đáp án ở đầu (nếu có)
    let cleanedInput = input.replace(answerPattern, "");

    // Bước 2: Xóa dòng trống ở đầu và cuối
    cleanedInput = cleanedInput
        .replace(/^\s*\n+/g, "") // Xóa dòng trống ở đầu
        .replace(/\n+\s*$/g, ""); // Xóa dòng trống ở cuối

    return cleanedInput;
}