import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Toast } from "../../utilities/notification";
import { getPosts } from "../../Reducers/postsSlice";
import { addNewPost } from "../../Reducers/addNewPostSlice";
import useDecodedSession from "../../Hooks/useDecodedSession";
import { Toaster } from "react-hot-toast";

const PostForm = ({ close, postsPerPage }) => {
    const successToast = new Toast("Post uploaded ✅");
    const errorToast = new Toast(
        "No file selected ❗️"
    );

    const actualUser = useDecodedSession();
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({});
    const [users, setUsers] = useState(null)
    console.log(users)
    const dispatch = useDispatch();

    const getAllusers = async () => {
        try {
            const data = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/users`)
            const response = await data.json()
            setUsers(response)
        } catch (error) {
            console.log(error)
        }
    }

    const onChangeHandlerFile = (e) => {
        setFile(e.target.files[0]);
    };
    const uploadFile = async (file) => {
        const fileData = new FormData();
        fileData.append("img", file);
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/posts/uploadImg`, {
                method: "POST",
                body: fileData,
            });
            return await response.json();
        } catch (error) {
            console.error("Uploading error", error);
        }
    };

    const submitPost = async (e) => {
        e.preventDefault();

        if (file) {
            try {
                const uploadedFile = await uploadFile(file);
                const postFormData = {
                    ...formData,
                    img: uploadedFile.img,
                };
                dispatch(addNewPost(postFormData)).then(() => {
                    successToast.success()
                    dispatch(
                        getPosts({
                            page: 1,
                            pageSize: postsPerPage,
                        })
                    );
                });
            } catch (error) {
                console.error("Failed to post", error);
            }
        } else {
            console.error("Please select at least one file");
            errorToast.error();
        }
    };
    useEffect(() => {
        getAllusers()
    }, [])

    return (
        <>
            <div>
                <Toaster position="top-center" reverseOrder={false} />
            </div>
            <div className="p-4">
                <form onSubmit={submitPost} encType="multipart/form-data">
                    <div className="d-flex justify-content-center items-align-center gap-2">
                        <input
                            type="text"
                            name="title"
                            placeholder="Title"
                            className="p-2 text-dark mb-2"
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    title: e.target.value,
                                })
                            }
                        />
                        <select
                            name="rate"
                            placeholder="Rating"
                            className="p-2 text-dark mb-2"
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    rate: Number(e.target.value),
                                })
                            }
                        >
                            <option>Rating</option>
                            <option value="1">"⭐️"</option>
                            <option value="2">"⭐️⭐️"</option>
                            <option value="3">"⭐️⭐️⭐️"</option>
                            <option value="4">"⭐️⭐️⭐️⭐️"</option>
                            <option value="5">"⭐️⭐️⭐️⭐️⭐️"</option>
                        </select>
                    </div>
                    <div>
                        {actualUser && actualUser?.role === "user" ? (
                            <select
                                name="author"
                                placeholder="author"
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        author: e.target.value,
                                    })
                                }
                            >
                                <option>Select author</option>
                                <option value={actualUser?.id}>{actualUser?.firstname}</option>
                            </select>
                        ) : (
                            <select
                                name="author"
                                placeholder="author"
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        author: e.target.value,
                                    })
                                }
                            >
                                <option>Select author</option>
                                {users && users.users.map((option) => {
                                    return (
                                        <option key={option._id} value={option._id}>{option.firstname} {option.lastname}</option>
                                    )
                                })}
                            </select>
                        )}
                    </div>
                    <div>
                        <textarea
                            placeholder="Write your post here"
                            className="p-2 text-dark mb-2"
                            rows={8}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    content: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div>
                        <input
                            name="img"
                            type="file"
                            className="p-2 text-dark mb-2"
                            onChange={onChangeHandlerFile}
                        />
                    </div>
                    <div className="mt-8">
                        <button
                            onClick={() => close()}
                            type="submit"
                            className="bg-primary"
                        >
                            Save & Upload
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default PostForm;
