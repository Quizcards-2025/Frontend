import {Box, Button} from "@mui/material";
import {useState} from "react";

const Pagination = ({
                        data, itemsPerPage, renderItem,
                        onPageChange = () => {
                        }
                    }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    // Dữ liệu hiện tại sau khi phân trang
    const paginatedData = data.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Chuyển trang
    const handlePageClick = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            if (onPageChange) onPageChange(page); // Gọi callback nếu cần
        }
    };

    return (
        <div>
            <Box mt={2} display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={2}>
                {paginatedData.map(renderItem)}
            </Box>
            {/* Điều khiển phân trang */}
            <Box mt={2} display="flex" justifyContent="center" alignItems="center" gap={1}>
                {/* Nút Previous */}
                <Button
                    variant="outlined"
                    onClick={() => handlePageClick(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>

                {/* Các nút số trang */}
                {Array.from({length: totalPages}, (_, idx) => (
                    <Button
                        key={idx}
                        variant={currentPage === idx + 1 ? "contained" : "outlined"}
                        onClick={() => handlePageClick(idx + 1)}
                    >
                        {idx + 1}
                    </Button>
                ))}

                {/* Nút Next */}
                <Button
                    variant="outlined"
                    onClick={() => handlePageClick(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </Box>
        </div>
    );
};

export default Pagination;