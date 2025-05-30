import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import React, { useState, useEffect } from 'react';
import { BiSearch } from 'react-icons/bi';
import { IoAddOutline, IoSearchOutline, IoShareOutline, IoTrashOutline, IoPeopleOutline } from "react-icons/io5";
import { SiGoogleclassroom } from "react-icons/si";
import { useForm } from 'react-hook-form';
import api from "../../apis/api";
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function MyClassList() {
    const [showModal, setShowModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [joinRequests, setJoinRequests] = useState([]);
    const [shareLink, setShareLink] = useState('');
    const [myClasses, setMyClasses] = useState([]);
    const [joinedClasses, setJoinedClasses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [joinClassId, setJoinClassId] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [classToDelete, setClassToDelete] = useState(null);
    const [showRejectConfirmModal, setShowRejectConfirmModal] = useState(false);
    const [requestToReject, setRequestToReject] = useState(null);
    const [pendingRejectRequest, setPendingRejectRequest] = useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    // Gọi API khi component mount
    useEffect(() => {
        fetchData();
    }, []);

    // Hàm lấy dữ liệu từ API
    const fetchData = async (query = '') => {
        try {
            setIsLoading(true);
            const response = await api.get("/v1/my-class/classes", {
                params: { query }
            });

            // Lấy thông tin join requests cho mỗi lớp học
            const classesWithRequests = await Promise.all(
                response.data.myClasses.map(async (myClass) => {
                    try {
                        const requestsResponse = await api.get(`/v1/share-requests/my-class/${myClass.myClassId}`);
                        return {
                            ...myClass,
                            joinRequests: requestsResponse.data.filter(request => request.status === 'PENDING').length
                        };
                    } catch (error) {
                        console.error(`Error fetching requests for class ${myClass.myClassId}:`, error);
                        return {
                            ...myClass,
                            joinRequests: 0
                        };
                    }
                })
            );

            setMyClasses(classesWithRequests);
            setJoinedClasses(response.data.joinedClasses);
            setError(null);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError('Failed to fetch data');
            toast.error('Failed to fetch data');
        } finally {
            setIsLoading(false);
        }
    };

    // Gọi API khi component mount hoặc searchTerm thay đổi
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchData(searchTerm);
        }, 500); // Debounce 500ms

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const onSubmit = async (data) => {
        console.log("Form Data:", data);
        try {
            const res = await api.post("/v1/my-class", data);
            reset(); // Reset form sau khi submit
            fetchData(); // Gọi lại API để cập nhật danh sách
            setShowModal(false); // Đóng modal sau khi thêm thành công
        } catch (error) {
            console.error("Error submitting data:", error);
        }
    };

    // Hàm xử lý khi nhấn nút chia sẻ
    const handleShareClass = async (classId, classCode) => {
        try {
            setSelectedClass(classId);
            setShareLink(classCode);
            // Get share requests from API
            const response = await api.get(`/v1/share-requests/my-class/${classId}`);
            setJoinRequests(response.data);
            setShowShareModal(true);
        } catch (error) {
            console.error(`Error sharing class ${classId}:`, error);
            toast.error('Failed to share class', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            const response = await api.put(`/v1/share-requests/${requestId}/process`, null, {
                params: {
                    status: 'APPROVED'
                }
            });
            toast.success('Request accepted successfully');
            // Refresh the share requests list
            if (selectedClass) {
                handleShareClass(selectedClass);
            }
        } catch (error) {
            console.error('Error accepting request:', error);
            toast.error(error.response?.data || 'Failed to accept request');
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            const response = await api.put(`/v1/share-requests/${requestId}/process`, null, {
                params: {
                    status: 'REJECTED'
                }
            });
            toast.success('Request rejected successfully');
            // Refresh the share requests list
            if (selectedClass) {
                handleShareClass(selectedClass);
            }
            setPendingRejectRequest(null);
        } catch (error) {
            console.error('Error rejecting request:', error);
            toast.error(error.response?.data || 'Failed to reject request');
        }
    };

    const handleRejectClick = (requestId) => {
        if (pendingRejectRequest === requestId) {
            // Second click - proceed with rejection
            handleRejectRequest(requestId);
        } else {
            // First click - show warning
            setPendingRejectRequest(requestId);
            toast.warning('Click the Reject button again to confirm rejection', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
    };

    const confirmReject = (requestId) => {
        setRequestToReject(requestId);
        setShowRejectConfirmModal(true);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink);
        toast.success('Link copied to clipboard!');
    };

    const handleJoinClass = async () => {
        if (!joinClassId.trim()) {
            toast.error('Please enter a class code');
            return;
        }

        try {
            setIsLoading(true);
            await api.post(`/v1/share-requests/${joinClassId}`);
            toast.success('Join request sent successfully');
            setJoinClassId('');
            // Refresh the joined classes list
            fetchData();
        } catch (error) {
            console.error('Error joining class:', error);
            toast.error(error.response?.data?.message || 'Failed to send join request');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClass = async (classId) => {
        try {
            await api.delete(`/v1/my-class/${classId}`);
            toast.success('Class deleted successfully');
            fetchData(); // Refresh the list
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error deleting class:', error);
            toast.error('Failed to delete class');
        }
    };

    const confirmDelete = (classId, title) => {
        setClassToDelete({ id: classId, title });
        setShowDeleteModal(true);
    };

    return (
        <main className="flex-1 px-6 py-4">
            {/* Search Bar */}
            <div className="relative max-w-5xl mx-auto mb-6">
                <input
                    type="text"
                    placeholder="Search your classes"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-4 pr-10 py-3 rounded-lg bg-white focus:outline-none"
                />
                <button className="absolute right-3 border-none transform -translate-y-1/2 top-1/2 bg-transparent">
                    <BiSearch size={20} color='blue' />
                </button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="text-center text-red-500 py-4">
                    {error}
                </div>
            )}

            {/* My Classes Section */}
            {!isLoading && !error && (
                <div className="max-w-5xl mx-auto mb-12">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">My classes</h2>
                        <button
                            className="bg-[#0e22e9] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#0a1bb3] transition-colors border-0"
                            onClick={() => setShowModal(true)}
                        >
                            <IoAddOutline size={20} />
                            <span>Add new Class</span>
                        </button>
                    </div>

                    {/* Class Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myClasses.length === 0 ? (
                            <div className="col-span-full text-center py-8">
                                <p className="text-gray-500">No classes found</p>
                            </div>
                        ) : (
                            myClasses.map((myClass) => (
                                <Link
                                    key={myClass.myClassId}
                                    to={`/user/my-class/${myClass.myClassId}/room`}
                                    className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden no-underline"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <SiGoogleclassroom className="text-[#4f46e5] text-2xl mr-3" />
                                                <h3 className="text-lg font-medium text-gray-900">{myClass.title}</h3>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleShareClass(myClass.myClassId, myClass.classCode);
                                                        }}
                                                        className="group relative inline-flex items-center justify-center p-1.5 rounded-full hover:bg-gray-50 transition-colors duration-200 focus:outline-none border-0"
                                                        title="User Join Request"
                                                    >
                                                        <IoPeopleOutline className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                                                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                                            User Join Request
                                                        </span>
                                                    </button>
                                                    {myClass.joinRequests > 0 && (
                                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                                            {myClass.joinRequests > 99 ? '99+' : myClass.joinRequests}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        confirmDelete(myClass.myClassId, myClass.title);
                                                    }}
                                                    className="group relative inline-flex items-center justify-center p-1.5 rounded-full hover:bg-gray-50 transition-colors duration-200 focus:outline-none border-0"
                                                    title="Delete class"
                                                >
                                                    <IoTrashOutline className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                                                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                                        Delete class
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{myClass.description}</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm bg-[#e0e0fe] px-3 py-1 rounded-full text-[#4f46e5]">
                                                    {myClass.members?.length || 0} members
                                                </span>
                                                <span className="text-sm bg-[#e0e0fe] px-3 py-1 rounded-full text-[#4f46e5]">
                                                    {myClass.folders?.length || 0} folders
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Join Classes Section */}
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Join classes</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={joinClassId}
                                onChange={(e) => setJoinClassId(e.target.value)}
                                placeholder="Enter class code"
                                className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Button
                                variant="primary"
                                onClick={handleJoinClass}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Joining...' : 'Join Class'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Join Class Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {joinedClasses.length === 0 ? (
                        <div className="col-span-full text-center py-8">
                            <p className="text-gray-500">No joined classes found</p>
                        </div>
                    ) : (
                        joinedClasses.map((joinedClass) => (
                            <Link
                                key={joinedClass.myClassId}
                                to={`/user/join-class/${joinedClass.myClassId}/room`}
                                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden no-underline"
                            >
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <SiGoogleclassroom className="text-[#4f46e5] text-2xl mr-3" />
                                        <h3 className="text-lg font-medium text-gray-900">{joinedClass.title}</h3>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{joinedClass.description}</p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm bg-[#e0e0fe] px-3 py-1 rounded-full text-[#4f46e5]">
                                                {joinedClass.members?.length || 0} members
                                            </span>
                                            <span className="text-sm bg-[#e0e0fe] px-3 py-1 rounded-full text-[#4f46e5]">
                                                {joinedClass.folders?.length || 0} folders
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontWeight: "700" }}>Create My class</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-2'>
                        <input className='w-full outline-none p-2 ' placeholder='Tiêu đề' {...register("title", { required: "Tiêu đề không được để trống!" })} />
                        <input className='w-full outline-none p-2 ' placeholder='Mô tả' {...register("description", { required: "Mô tả không được để trống!" })} />
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" type='submit'>
                                Add
                            </Button>
                        </Modal.Footer>
                    </form>
                </Modal.Body>
            </Modal>
            <Modal show={showShareModal} onHide={() => setShowShareModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontWeight: "700" }}>Share Class</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-4">
                        <h3 className="text-lg font-medium mb-2">Share Code</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={shareLink}
                                readOnly
                                className="flex-1 p-2 border rounded"
                                placeholder="Class Code"
                            />
                            <Button variant="primary" onClick={copyToClipboard}>
                                Copy
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Share this code with others to let them join your class</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-2">Join Requests</h3>
                        {joinRequests.length === 0 ? (
                            <p className="text-gray-500">No pending requests</p>
                        ) : (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                {joinRequests.map((request) => (
                                    <div key={request.requestId} className="flex items-center justify-between p-3 border rounded">
                                        <div>
                                            <p className="font-medium">{request.requester.firstName} {request.requester.lastName}</p>
                                            <p className="text-sm text-gray-500">{request.requester.email}</p>
                                            <p className="text-xs text-gray-400">Status: {request.status}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {request.status === 'PENDING' && (
                                                <>
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => handleAcceptRequest(request.requestId)}
                                                    >
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleRejectClick(request.requestId)}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Modal.Body>
            </Modal>
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontWeight: "700" }}>Delete Class</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete the class "{classToDelete?.title}"? This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={() => handleDeleteClass(classToDelete?.id)}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showRejectConfirmModal} onHide={() => setShowRejectConfirmModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontWeight: "700" }}>Reject Request</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to reject this join request? This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRejectConfirmModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={() => handleRejectRequest(requestToReject)}>
                        Reject
                    </Button>
                </Modal.Footer>
            </Modal>
            <ToastContainer />
        </main>
    );
}