import {
    Button,
    Dialog, DialogActions,
    DialogContent, DialogContentText,
    DialogTitle,
} from "@mui/material";

const ModalConfirmLogoutAll = ({
                                   isOpening = false,
                                   setIsOpening = () => {
                                   },
                                   onUserCancel = () => {
                                   },
                                   onModalClose = () => {
                                   },
                                   onUserAgree = () => {
                                   },
                               }) => {
    const handleCloseLogoutAll = () => {
        setIsOpening(false);
        onModalClose();
    };

    const handleUserCancel = () => {
        onUserCancel();
        handleCloseLogoutAll();
    };

    const handleLogoutAll = () => {
        onUserAgree((r) => {
            handleCloseLogoutAll();
        }, (e) => {
            console.error(e);
        });
    };

    return (
        <Dialog
            open={isOpening}
            onClose={handleCloseLogoutAll}
            slotProps={{
                paper: {
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        // console.log(password);
                        handleLogoutAll();
                    },
                },
            }}
        >
            <DialogTitle id="responsive-dialog-title"
                         className="!text-[1.8rem] !font-[700]"
            >
                Warning
            </DialogTitle>
            <DialogContent>
                <DialogContentText className="!text-[1.2rem]">
                    Are you sure you want to logout from all devices? You’ll need to log in again.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    handleUserCancel();
                }}
                        sx={{
                            textTransform: 'none',
                        }}
                        className="!text-[1.2rem]"
                >
                    Cancel
                </Button>
                <Button type="submit"
                        sx={{
                            textTransform: 'none',
                        }}
                        className="!text-[1.2rem] !text-red-700"
                >
                    Logout All
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalConfirmLogoutAll;