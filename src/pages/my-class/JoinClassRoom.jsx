import React, { useState, useEffect } from 'react'
import { IoFolderOutline } from 'react-icons/io5'
import { BiSolidFolder } from 'react-icons/bi'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from "../../apis/api";
import { useParams, Link } from 'react-router-dom';

export default function JoinClassRoom() {
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [classInfo, setClassInfo] = useState(null);
    const { id: classId } = useParams();

    // Hàm gọi API để lấy thông tin class
    const fetchClassInfo = async () => {
        try {
            const response = await api.get(`/v1/my-class/${classId}`);
            setClassInfo(response.data);
        } catch (error) {
            console.error("Error fetching class info:", error);
        }
    };

    // Hàm gọi API để lấy danh sách folder của class
    const fetchFolders = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/v1/my-class/${classId}/folders`);
            console.log(response)
            setFolders(response.data || []);
        } catch (error) {
            console.error("Error fetching folders:", error);
            toast.error('Failed to fetch folders', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        } finally {
            setLoading(false);
        }
    };

    // Gọi API khi component mount
    useEffect(() => {
        fetchClassInfo();
        fetchFolders();
    }, [classId]);

    return (
        <div className="min-h-screen bg-[#ededff]">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            {/* Header */}
            <div className=" shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <BiSolidFolder className="text-[#4f46e5] text-3xl" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{classInfo?.title || 'Classroom folder'}</h1>
                                <p className="text-sm text-gray-500">{folders.length} folders</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4f46e5]"></div>
                    </div>
                ) : folders.length === 0 ? (
                    <div className="text-center py-12">
                        <IoFolderOutline className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No folders</h3>
                        <p className="mt-1 text-sm text-gray-500">No folders available in this class.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {folders.map((folder) => (
                            <Link
                                key={folder.folderId}
                                to={`/user/folder/${folder.folderId}`}
                                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden no-underline"
                            >
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <BiSolidFolder className="text-[#4f46e5] text-2xl mr-3" />
                                        <h3 className="text-lg font-medium text-gray-900">{folder.title}</h3>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{folder.description}</p>
                                    <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e0e0fe] text-[#4f46e5]">
                      {folder.items} items
                    </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}