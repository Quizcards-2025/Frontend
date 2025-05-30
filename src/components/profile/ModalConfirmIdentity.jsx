import {useEffect} from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import { AlertCircle } from 'lucide-react'

const ModalConfirmIdentity = ({
                                  isOpening = false,
                                  setIsOpening = () => {
                                  },
                                  onModalOpen = () => {
                                  },
                                  onModalClose = () => {
                                  },
                                  onClickNext = () => {
                                  },
                              }) => {
    const handleCloseModalConfirmIdentity = () => {
        setIsOpening(false);
        onModalClose();
    };

    useEffect(() => {
        if (isOpening) {
            onModalOpen();
        }
    }, [isOpening]);

    return (
        <>
            <Dialog
                open={isOpening}
                onClose={handleCloseModalConfirmIdentity}
            >
                <DialogTitle className="flex items-center gap-3 !text-[1.8rem] !font-[700]">
                    <AlertCircle className="h-6 w-6 text-blue-600" />
                    Confirm your identity
                </DialogTitle>
                <DialogContent className="mt-2">
                    <p className="text-sm text-gray-500 !text-[1.2rem]">
                        To continue, please confirm that it&#39;s you.
                    </p>
                </DialogContent>
                <DialogActions>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => {
                            onClickNext();
                            handleCloseModalConfirmIdentity();
                        }}
                        className="!text-[1.1rem] !rounded-md !bg-blue-600 !px-4 !py-2 !my-2 !text-sm !font-medium !text-white !hover:bg-blue-700 !focus:outline-none !focus-visible:ring-2 !focus-visible:ring-blue-500 !focus-visible:ring-offset-2"
                        sx={{
                            textTransform: 'none',
                        }}
                    >
                        Continue identity
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ModalConfirmIdentity;