import {Box} from "@mui/material";


const MyFolder = ({onClick}) => {
    return (
        <Box bgcolor="white"
             display="flex"
             flexDirection="row"
             alignItems="center"
             justifyContent="center"
             borderRadius="15px"
             borderTop="2px solid"
             borderRight="2px solid"
             borderLeft="2px solid"
             borderBottom="4px solid"
             borderColor="#e0e0fe"
             width="fit-content"
             height="50px"
             padding="10px"
             gap={2}
             color="#0c0f6e"
             sx={{cursor:"pointer"}}
             onClick={onClick}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"
                 className="icon icon-tabler icons-tabler-filled icon-tabler-folder">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path
                    d="M9 3a1 1 0 0 1 .608 .206l.1 .087l2.706 2.707h6.586a3 3 0 0 1 2.995 2.824l.005 .176v8a3 3 0 0 1 -2.824 2.995l-.176 .005h-14a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-11a3 3 0 0 1 2.824 -2.995l.176 -.005h4z"/>
            </svg>
            My folder
        </Box>
    )
}
export default MyFolder;